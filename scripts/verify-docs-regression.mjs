import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const workflowPath = ".github/workflows/docs.yml";
const candidatePrefix = "release-candidate/";
const shaPattern = /^[0-9a-f]{40}$/;
const zeroSha = "0".repeat(40);
export const candidateBranch = (base, head) =>
  `${candidatePrefix}${base}/${head}`;
const isCommitSha = (value) =>
  typeof value === "string" && shaPattern.test(value) && value !== zeroSha;
const validationJob = "Targeted validation";
const proofSteps = [
  "Assert exact candidate checkout",
  "Run targeted checks",
  "Assert tracked files unchanged",
];

const successful = (entry) =>
  entry?.status === "completed" && entry.conclusion === "success";
const positiveInteger = (value) => Number.isSafeInteger(value) && value > 0;

function arrayField(response, key) {
  const values = response?.[key];
  if (!Array.isArray(values))
    throw new Error(`GitHub returned no ${key} array.`);
  return values;
}

function qualifyingRun(run, repository, repositoryId, expectedBaseSha) {
  const sameRepository = (entry) =>
    entry?.id === repositoryId &&
    entry.full_name?.toLowerCase() === repository.toLowerCase();
  return (
    (run.event === "push" || run.event === "workflow_dispatch") &&
    isCommitSha(run.head_sha) &&
    run.head_branch === candidateBranch(expectedBaseSha, run.head_sha) &&
    [
      workflowPath,
      `${workflowPath}@${run.head_branch}`,
      `${workflowPath}@refs/heads/${run.head_branch}`,
    ].includes(run.path) &&
    sameRepository(run.repository) &&
    sameRepository(run.head_repository) &&
    positiveInteger(run.id) &&
    positiveInteger(run.run_attempt)
  );
}

async function completedValidationJob(request, root, run) {
  // Use the reported attempt, never mix separately rerun jobs.
  const jobsPath = `${root}/actions/runs/${run.id}/attempts/${run.run_attempt}/jobs`;
  const jobs = arrayField(await request(jobsPath, { per_page: 100 }), "jobs");
  const validation = jobs.find((job) => job.name === validationJob);
  if (
    successful(validation) &&
    validation.run_id === run.id &&
    validation.head_sha === run.head_sha &&
    proofSteps.every((name) =>
      validation.steps?.some((step) => step.name === name && successful(step)),
    )
  ) {
    return {
      runId: run.id,
      runAttempt: run.run_attempt,
      testedSha: run.head_sha,
    };
  }
}

export async function verifiedCandidateRun({
  request,
  repository,
  repositoryId,
  branch,
  sha,
  expectedBaseSha,
}) {
  if (!isCommitSha(expectedBaseSha))
    throw new Error("An exact nonzero baseline commit SHA is required.");
  if (!isCommitSha(sha) || branch !== candidateBranch(expectedBaseSha, sha))
    throw new Error(
      "Candidate branch must bind the expected baseline and exact head.",
    );
  const root = `/repos/${repository}`;
  const runs = arrayField(
    await request(`${root}/actions/workflows/docs.yml/runs`, {
      branch,
      head_sha: sha,
      per_page: 100,
    }),
    "workflow_runs",
  );
  const run = runs.find(
    (entry) =>
      entry.head_branch === branch &&
      entry.head_sha === sha &&
      qualifyingRun(entry, repository, repositoryId, expectedBaseSha),
  );
  if (!run || run.status !== "completed") return;
  const link = `https://github.com/${repository}/actions/runs/${run.id}`;
  if (!successful(run))
    throw new Error(
      `Candidate Documentation run finished as ${run.conclusion}: ${link}.`,
    );
  const proof = await completedValidationJob(request, root, run);
  if (!proof)
    throw new Error(
      `Candidate run lacks successful ${validationJob} proof: ${link}.`,
    );
  return proof;
}

export async function findRegressionProof({
  request,
  repository,
  repositoryId,
  targetSha,
  targetTree,
  expectedBaseSha,
}) {
  if (!isCommitSha(expectedBaseSha))
    throw new Error("An exact nonzero baseline commit SHA is required.");
  if (
    !/^[\w.-]+\/[\w.-]+$/.test(repository) ||
    !positiveInteger(repositoryId) ||
    !isCommitSha(targetSha) ||
    !shaPattern.test(targetTree)
  ) {
    throw new Error(
      "An exact target commit, Git tree, and repository identity are required.",
    );
  }

  const root = `/repos/${repository}`;
  const runsPath = `${root}/actions/workflows/docs.yml/runs`;

  const inspected = new Set();
  const trees = new Map();
  const query = { status: "success", per_page: 100 };
  async function inspect(runs) {
    for (const run of runs) {
      if (
        !successful(run) ||
        !qualifyingRun(run, repository, repositoryId, expectedBaseSha)
      )
        continue;
      const key = `${run.id}:${run.run_attempt}`;
      if (inspected.has(key)) continue;
      inspected.add(key);

      if (run.head_sha !== targetSha) {
        // REST history includes tree_id in head_commit. Use it only to
        // discard nonmatches; the immutable Git commit API confirms positives.
        const reportedTree = run.head_commit?.tree_id;
        if (shaPattern.test(reportedTree) && reportedTree !== targetTree)
          continue;
        if (!trees.has(run.head_sha)) {
          const commit = await request(
            `${root}/git/commits/${run.head_sha}`,
            {},
          );
          if (
            commit?.sha !== run.head_sha ||
            !shaPattern.test(commit.tree?.sha)
          ) {
            throw new Error("GitHub returned an invalid candidate Git commit.");
          }
          trees.set(run.head_sha, commit.tree.sha);
        }
        if (trees.get(run.head_sha) !== targetTree) continue;
      }

      // The run's aggregate result alone is not sufficient: a job can be skipped.
      // Bind evidence to the reported attempt instead of mixing separately rerun jobs.
      const proof = await completedValidationJob(request, root, run);
      if (proof) return proof;
    }
    return undefined;
  }

  const exactRuns = arrayField(
    await request(runsPath, { ...query, head_sha: targetSha }),
    "workflow_runs",
  );
  const exactProof = await inspect(
    exactRuns.filter((run) => run.head_sha === targetSha),
  );
  if (exactProof) return exactProof;

  // Merge/squash/rebase can change commit IDs. Bound fallback to recent
  // successful runs; the exact-SHA path is independent of this history window.
  const recentRuns = arrayField(
    await request(runsPath, query),
    "workflow_runs",
  );
  const treeProof = await inspect(recentRuns);
  if (treeProof) return treeProof;

  throw new Error(
    `No verified targeted validation for master ${targetSha} (tree ${targetTree}, baseline ${expectedBaseSha}). ` +
      "Check the pre-merge release-candidate/<base-sha>/<head-sha> evidence and retry the original master push using its unchanged baseline. " +
      "If it was never verified, prepare a reviewed candidate from current master; do not substitute an unrelated baseline. " +
      "No Pages artifact was accepted; see docs/CONTRIBUTING-CI.md.",
  );
}

function createGitHubRequest(apiUrl, token) {
  if (!token || !apiUrl)
    throw new Error("GitHub Actions read token and API URL are required.");
  return async (resource, query) => {
    const url = new URL(apiUrl.replace(/\/$/, "") + resource);
    url.search = new URLSearchParams(query).toString();
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      throw new Error(
        `GitHub Actions proof request failed: ${resource} (HTTP ${response.status}).`,
      );
    }
    return response.json();
  };
}

async function main() {
  const env = process.env;
  const git = (value) =>
    execFileSync("git", ["rev-parse", value], { encoding: "utf8" }).trim();
  const targetSha = git("HEAD");
  if (
    env.GITHUB_EVENT_NAME !== "push" ||
    env.GITHUB_REF !== "refs/heads/master" ||
    targetSha !== env.GITHUB_SHA
  ) {
    throw new Error(
      "Docs proof must run on the immutable master push checkout.",
    );
  }
  const request = createGitHubRequest(env.GITHUB_API_URL, env.GH_TOKEN);
  const proof = await findRegressionProof({
    request,
    repository: env.GITHUB_REPOSITORY,
    repositoryId: Number(env.GITHUB_REPOSITORY_ID),
    targetSha,
    targetTree: git("HEAD^{tree}"),
    expectedBaseSha: env.MTONE_BASE_SHA,
  });
  process.stdout.write(
    `Verified Documentation run ${proof.runId} attempt ${proof.runAttempt}, candidate ${proof.testedSha}, master ${targetSha}.\n`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
