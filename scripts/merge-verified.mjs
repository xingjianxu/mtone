import { execFileSync } from "node:child_process";
import {
  accessSync,
  constants,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import { verifiedCandidateRun } from "./verify-docs-regression.mjs";

const repository = "xingjianxu/mtone";
const repositoryPath = `/repos/${repository}`;
const repositoryUrl = `https://github.com/${repository}`;
const masterRef = "refs/heads/master";
const shaPattern = /^[0-9a-f]{40}$/;
const zero = "0".repeat(40);
const canonicalUrl =
  /^(https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)xingjianxu\/mtone(?:\.git)?$/i;

function run(command, args, options = {}) {
  const { env, ...rest } = options;
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 30_000,
    ...rest,
    env: {
      ...process.env,
      GH_DEBUG: "",
      GH_PROMPT_DISABLED: "1",
      GIT_TERMINAL_PROMPT: "0",
      GIT_NO_REPLACE_OBJECTS: "1",
      ...env,
    },
  }).trim();
}

const commitChecks = (sha) => `${repositoryUrl}/commit/${sha}/checks`;

// Git advertises the previous remote object to the pre-push hook, and then
// sends that same previous object in the ordinary non-force ref update. Reject
// a different advertised object rather than accepting a racy fast-forward.
export function guardedPush({ cwd, sha, ref, expected }) {
  if (
    !shaPattern.test(sha) ||
    (expected !== undefined && !shaPattern.test(expected)) ||
    ![masterRef, `refs/heads/release-candidate/${sha}`].includes(ref)
  ) {
    throw new Error(
      "An exact single-ref push and expected old SHA are required.",
    );
  }
  const original = resolve(
    cwd,
    run("git", ["rev-parse", "--git-path", "hooks/pre-push"], { cwd }),
  );
  let originalHook = "";
  try {
    accessSync(original, constants.X_OK);
    originalHook = original;
  } catch (error) {
    if (!["ENOENT", "EACCES"].includes(error.code)) throw error;
  }
  const dir = mkdtempSync(join(tmpdir(), "mtone-expected-old-"));
  try {
    writeFileSync(
      join(dir, "pre-push"),
      `#!/bin/sh
set -eu
IFS= read -r update || exit 1
if [ "$update" != "$MTONE_EXPECTED_UPDATE" ] || IFS= read -r extra; then
  printf '%s\\n' MTONE_EXPECTED_OLD_REF_MISMATCH >&2
  exit 1
fi
if [ -n "$MTONE_ORIGINAL_PRE_PUSH" ]; then
  exec "$MTONE_ORIGINAL_PRE_PUSH" "$@" <<EOF
$update
EOF
fi
`,
      { mode: 0o700 },
    );
    run(
      "git",
      [
        "-c",
        `core.hooksPath=${dir}`,
        "push",
        "--no-force",
        "--no-mirror",
        "--no-follow-tags",
        "--recurse-submodules=no",
        "origin",
        `${sha}:${ref}`,
      ],
      {
        cwd,
        env: {
          MTONE_EXPECTED_UPDATE: `${sha} ${sha} ${ref} ${expected ?? zero}`,
          MTONE_ORIGINAL_PRE_PUSH: originalHook,
        },
      },
    );
  } catch (error) {
    if (String(error.stderr).includes("MTONE_EXPECTED_OLD_REF_MISMATCH"))
      throw new Error(`Expected-old guard rejected remote change to ${ref}.`);
    // Never include command stderr, which could contain local auth details.
    throw new Error(
      `Non-force push to ${ref} failed. Check its remote SHA, Git credentials, hooks, and branch permissions before retrying.`,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function localGit(cwd) {
  const git = (...args) => run("git", args, { cwd });
  return {
    assertOrigin() {
      try {
        for (const args of [[], ["--push"]]) {
          if (
            !canonicalUrl.test(
              git("remote", "get-url", "--all", ...args, "origin"),
            )
          )
            throw new Error();
        }
      } catch {
        throw new Error(
          `Origin fetch and push must both point only to github.com/${repository}.`,
        );
      }
    },
    assertClean() {
      if (
        git(
          "status",
          "--porcelain=v1",
          "--untracked-files=all",
          "--ignore-submodules=none",
        ) ||
        git("ls-files", "-u")
      ) {
        throw new Error(
          "Worktree is dirty. Commit or remove local changes before running verified merge.",
        );
      }
    },
    resolve(candidate) {
      try {
        const sha = git(
          "rev-parse",
          "--verify",
          "--end-of-options",
          `${candidate}^{commit}`,
        );
        return { sha, tree: git("rev-parse", `${sha}^{tree}`) };
      } catch {
        throw new Error(
          "Candidate must resolve to a committed local SHA or ref.",
        );
      }
    },
    assertAncestor(base, sha) {
      try {
        git("merge-base", "--is-ancestor", base, sha);
      } catch {
        throw new Error(
          "Expected master must be a local ancestor of the candidate; fetch and integrate current master first.",
        );
      }
    },
    remoteRef(ref) {
      let result;
      try {
        result = git("ls-remote", "--refs", "origin", ref);
      } catch {
        throw new Error(
          `Could not read remote ${ref}; check Git credentials/network and retry.`,
        );
      }
      if (!result) return undefined;
      const [sha, name, ...extra] = result.split(/\s+/);
      if (!shaPattern.test(sha) || name !== ref || extra.length)
        throw new Error(`Unexpected remote response for ${ref}.`);
      return sha;
    },
    push(sha, ref, expected) {
      guardedPush({ cwd, sha, ref, expected });
    },
  };
}

async function githubRequest(path, query = {}) {
  const params = new URLSearchParams(query).toString();
  try {
    return JSON.parse(
      run("gh", [
        "api",
        "--hostname",
        "github.com",
        "--method",
        "GET",
        "-H",
        "X-GitHub-Api-Version: 2022-11-28",
        path + (params ? `?${params}` : ""),
      ]),
    );
  } catch {
    throw new Error(
      `Could not verify GitHub API ${path}; check gh authentication, access, and network.`,
    );
  }
}

export async function promoteCandidate({
  candidate = "HEAD",
  expectedMaster,
  git,
  request,
  timeoutMs = 60 * 60 * 1000,
  pollMs = 15_000,
  now = Date.now,
  sleep: wait = sleep,
  report = () => {},
}) {
  if (!shaPattern.test(expectedMaster))
    throw new Error(
      "--expect-master must be the exact 40-character remote master SHA.",
    );
  git.assertOrigin();
  git.assertClean();
  const { sha, tree } = git.resolve(candidate);
  if (!shaPattern.test(sha) || !shaPattern.test(tree))
    throw new Error("Candidate resolved without an exact Git commit and tree.");
  const pagesUrl = commitChecks(sha);
  const actualMaster = git.remoteRef(masterRef);
  if (actualMaster === sha) return { outcome: "already-merged", sha, pagesUrl };
  const assertMaster = (actual) => {
    if (actual !== expectedMaster)
      throw new Error(
        `Remote master changed from ${expectedMaster} to ${actual ?? "missing"}. Review a new integration candidate; no master push attempted.`,
      );
  };
  assertMaster(actualMaster);
  git.assertAncestor(expectedMaster, sha);

  const identity = await request(repositoryPath);
  if (
    identity?.full_name?.toLowerCase() !== repository ||
    !Number.isSafeInteger(identity.id) ||
    identity.id <= 0
  )
    throw new Error(
      "GitHub did not confirm the trusted mtone repository identity.",
    );

  const branch = `release-candidate/${sha}`;
  const ref = `refs/heads/${branch}`;
  const existing = git.remoteRef(ref);
  if (existing !== undefined && existing !== sha)
    throw new Error(
      `Unexpected candidate ref ${ref}; refusing to overwrite it.`,
    );
  if (existing === undefined) {
    git.assertOrigin();
    git.assertClean();
    assertMaster(git.remoteRef(masterRef));
    git.push(sha, ref, undefined);
  }
  const checkCandidate = () => {
    if (git.remoteRef(ref) !== sha)
      throw new Error(`Candidate ref ${ref} no longer points to ${sha}.`);
  };
  checkCandidate();
  const serverCommit = await request(`${repositoryPath}/git/commits/${sha}`);
  if (serverCommit?.sha !== sha || serverCommit.tree?.sha !== tree)
    throw new Error(
      "GitHub candidate Git tree does not match the local committed tree.",
    );

  const tracker = `${branch} — ${commitChecks(sha)}`;
  report(`Waiting for Full regression: ${tracker}`);
  const deadline = now() + timeoutMs;
  let proof;
  while (now() < deadline) {
    proof = await verifiedCandidateRun({
      request,
      repository,
      repositoryId: identity.id,
      branch,
      sha,
    });
    if (proof) break;
    const remaining = deadline - now();
    if (remaining > 0) await wait(Math.min(pollMs, remaining));
  }
  if (!proof || now() > deadline)
    throw new Error(
      `Timed out waiting for exact Full regression; master was not pushed. ${tracker}`,
    );

  git.assertOrigin();
  git.assertClean();
  checkCandidate();
  const currentMaster = git.remoteRef(masterRef);
  if (currentMaster === sha)
    return { outcome: "already-merged", sha, pagesUrl, ...proof };
  assertMaster(currentMaster);
  git.push(sha, masterRef, expectedMaster);
  if (git.remoteRef(masterRef) !== sha)
    throw new Error(
      `Master was pushed but no longer points to ${sha}. Inspect without repushing: ${pagesUrl}`,
    );
  return { outcome: "merged", sha, pagesUrl, ...proof };
}

function parseArgs(args) {
  const usage =
    "Usage: node scripts/merge-verified.mjs --expect-master <40-character SHA> [candidate]";
  if (args.length === 1 && ["--help", "-h"].includes(args[0])) return { usage };
  if (
    args[0] !== "--expect-master" ||
    !shaPattern.test(args[1]) ||
    args.length > 3 ||
    args[2]?.startsWith("-")
  )
    throw new Error(usage);
  return { expectedMaster: args[1], candidate: args[2] };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.usage) return console.log(args.usage);
  let cwd;
  try {
    cwd = run("git", ["rev-parse", "--show-toplevel"]);
  } catch {
    throw new Error("Run the verified merge entry from an mtone Git worktree.");
  }
  const result = await promoteCandidate({
    ...args,
    git: localGit(cwd),
    request: githubRequest,
    report: console.log,
  });
  console.log(
    result.outcome === "merged"
      ? `Fast-forwarded master to ${result.sha} (verified Documentation run ${result.runId}).`
      : `Master already points to ${result.sha}; no ref was pushed.`,
  );
  console.log(
    `Track this commit (master Documentation; deployment not verified): ${result.pagesUrl}`,
  );
  console.log(
    `Exact master runs: gh api --hostname github.com 'repos/${repository}/actions/workflows/docs.yml/runs?branch=master&head_sha=${result.sha}'`,
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
