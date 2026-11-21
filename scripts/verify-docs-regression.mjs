import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const workflowPath = ".github/workflows/docs.yml";
const candidatePrefix = "release-candidate/";
const shaPattern = /^[0-9a-f]{40}$/;
const proofSteps = [
  "Assert exact candidate checkout",
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

export async function findRegressionProof({
  request,
  repository,
  repositoryId,
  targetSha,
  targetTree,
}) {
  if (
    !/^[\w.-]+\/[\w.-]+$/.test(repository) ||
    !positiveInteger(repositoryId) ||
    !shaPattern.test(targetSha) ||
    !shaPattern.test(targetTree)
  ) {
    throw new Error(
      "An exact target commit, Git tree, and repository identity are required.",
    );
  }

  const root = `/repos/${repository}`;
  const runsPath = `${root}/actions/workflows/docs.yml/runs`;
  const sameRepository = (entry) =>
    entry?.id === repositoryId &&
    entry.full_name?.toLowerCase() === repository.toLowerCase();
  const qualifyingRun = (run) =>
    successful(run) &&
    (run.event === "push" || run.event === "workflow_dispatch") &&
    typeof run.head_branch === "string" &&
    run.head_branch.startsWith(candidatePrefix) &&
    run.head_branch.length > candidatePrefix.length &&
    [
      workflowPath,
      `${workflowPath}@${run.head_branch}`,
      `${workflowPath}@refs/heads/${run.head_branch}`,
    ].includes(run.path) &&
    sameRepository(run.repository) &&
    sameRepository(run.head_repository) &&
    shaPattern.test(run.head_sha) &&
    positiveInteger(run.id) &&
    positiveInteger(run.run_attempt);

  const inspected = new Set();
  const trees = new Map();
  const query = { status: "success", per_page: 100 };
  async function inspect(runs) {
    for (const run of runs) {
      if (!qualifyingRun(run)) continue;
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
      const jobsPath = `${root}/actions/runs/${run.id}/attempts/${run.run_attempt}/jobs`;
      const jobs = arrayField(
        await request(jobsPath, { per_page: 100 }),
        "jobs",
      );
      const full = jobs.find((job) => job.name === "Full regression");
      if (
        successful(full) &&
        full.run_id === run.id &&
        full.head_sha === run.head_sha &&
        proofSteps.every((name) =>
          full.steps?.some((step) => step.name === name && successful(step)),
        )
      ) {
        return {
          runId: run.id,
          runAttempt: run.run_attempt,
          testedSha: run.head_sha,
        };
      }
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
    `No verified full regression for master ${targetSha} (tree ${targetTree}). ` +
      "Push this exact tree to a trusted release-candidate/<name> branch, " +
      "wait for successful Full regression, then rerun Documentation on master. " +
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
  if (env.GITHUB_REF !== "refs/heads/master" || targetSha !== env.GITHUB_SHA) {
    throw new Error(
      "Docs proof must run on the immutable master event checkout.",
    );
  }
  const request = createGitHubRequest(env.GITHUB_API_URL, env.GH_TOKEN);
  const proof = await findRegressionProof({
    request,
    repository: env.GITHUB_REPOSITORY,
    repositoryId: Number(env.GITHUB_REPOSITORY_ID),
    targetSha,
    targetTree: git("HEAD^{tree}"),
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
