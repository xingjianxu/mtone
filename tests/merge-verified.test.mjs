import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { guardedPush, promoteCandidate } from "../scripts/merge-verified.mjs";

const repository = "xingjianxu/mtone";
const root = `/repos/${repository}`;
const base = "a".repeat(40);
const sha = "b".repeat(40);
const tree = "c".repeat(40);
const other = "d".repeat(40);
const branch = `release-candidate/${base}/${sha}`;
const candidateRef = `refs/heads/${branch}`;
const masterRef = "refs/heads/master";
const identity = { id: 101, full_name: repository };
const run = {
  id: 201,
  run_attempt: 2,
  status: "completed",
  conclusion: "success",
  path: `.github/workflows/docs.yml@${branch}`,
  event: "push",
  repository: identity,
  head_repository: identity,
  head_branch: branch,
  head_sha: sha,
};
const full = {
  status: "completed",
  conclusion: "success",
  name: "Targeted validation",
  run_id: run.id,
  head_sha: sha,
  steps: [
    "Assert exact candidate checkout",
    "Run targeted checks",
    "Assert tracked files unchanged",
  ].map((name) => ({ name, status: "completed", conclusion: "success" })),
};

function setup({
  runs = [run],
  jobs = [full],
  remoteTree = tree,
  mutate = () => {},
} = {}) {
  const refs = new Map([[masterRef, base]]);
  const git = {
    assertOrigin: vi.fn(),
    assertClean: vi.fn(),
    resolve: vi.fn(() => ({ sha, tree })),
    assertAncestor: vi.fn(),
    remoteRef: vi.fn((ref) => refs.get(ref)),
    push: vi.fn((candidate, ref, expected) => {
      if (refs.get(ref) !== expected)
        throw new Error("guard rejected stale ref");
      refs.set(ref, candidate);
    }),
  };
  const request = vi.fn(async (path) => {
    if (path === root) return identity;
    if (path === `${root}/git/commits/${sha}`)
      return { sha, tree: { sha: remoteTree } };
    if (path === `${root}/actions/workflows/docs.yml/runs`)
      return { workflow_runs: runs };
    if (path === `${root}/actions/runs/201/attempts/2/jobs`) {
      mutate(refs);
      return { jobs };
    }
    throw new Error(`Unexpected request ${path}`);
  });
  let now = 1;
  return {
    refs,
    git,
    request,
    go: () =>
      promoteCandidate({
        candidate: "HEAD",
        expectedMaster: base,
        git,
        request,
        now: () => now,
        sleep: (ms) => {
          now += ms;
        },
        timeoutMs: 10,
        pollMs: 5,
      }),
  };
}

describe("Authorized fast-forward after release-candidate regression", () => {
  it("promotes only the checked candidate and reports the matching Pages tracker", async () => {
    const { go, git } = setup();
    const result = await go();
    expect(git.push.mock.calls).toEqual([
      [sha, candidateRef, undefined],
      [sha, masterRef, base],
    ]);
    expect(result).toMatchObject({ sha, runId: run.id, outcome: "merged" });
    expect(result.pagesUrl).toBe(
      `https://github.com/${repository}/commit/${sha}/checks`,
    );
  });

  it("is a no-op once master already equals the candidate", async () => {
    const { go, refs, git, request } = setup();
    refs.set(masterRef, sha);
    expect(await go()).toMatchObject({ outcome: "already-merged", sha });
    expect(git.push).not.toHaveBeenCalled();
    expect(request).not.toHaveBeenCalled();
  });

  it("reuses an existing exact candidate and never repushes it", async () => {
    const { go, refs, git } = setup();
    refs.set(candidateRef, sha);
    await go();
    expect(git.push.mock.calls).toEqual([[sha, masterRef, base]]);
  });

  it("refuses a release-candidate ref pointing elsewhere", async () => {
    const { go, refs, git } = setup();
    refs.set(candidateRef, other);
    await expect(go()).rejects.toThrow(/candidate ref/i);
    expect(git.push).not.toHaveBeenCalled();
  });

  it("does not change any ref when master is already stale", async () => {
    const { go, refs, git } = setup();
    refs.set(masterRef, other);
    await expect(go()).rejects.toThrow(/master.*changed/i);
    expect(git.push).not.toHaveBeenCalled();
  });

  it("never promotes if master changes during the regression check", async () => {
    const { go, git } = setup({ mutate: (refs) => refs.set(masterRef, other) });
    await expect(go()).rejects.toThrow(/master.*changed/i);
    expect(git.push.mock.calls).toEqual([[sha, candidateRef, undefined]]);
  });

  it("never promotes if the candidate ref changes during verification", async () => {
    const { go, git } = setup({
      mutate: (refs) => refs.set(candidateRef, other),
    });
    await expect(go()).rejects.toThrow(/candidate ref/i);
    expect(git.push.mock.calls).toEqual([[sha, candidateRef, undefined]]);
  });

  it.each([
    { runs: [] },
    { runs: [{ ...run, head_sha: other }] },
    { runs: [{ ...run, head_branch: "release-candidate/unrelated" }] },
    { runs: [{ ...run, head_branch: `release-candidate/${other}/${sha}` }] },
    { runs: [{ ...run, head_branch: `release-candidate/${base}/${other}` }] },
    { runs: [{ ...run, head_repository: { ...identity, id: 102 } }] },
    { runs: [{ ...run, status: "queued", conclusion: null }] },
  ])(
    "times out without promoting absent, wrong, or unfinished proof: %j",
    async (config) => {
      const { go, git } = setup(config);
      await expect(go()).rejects.toThrow(/timed out/i);
      expect(git.push.mock.calls).toEqual([[sha, candidateRef, undefined]]);
    },
  );

  it("refuses a failed candidate workflow", async () => {
    const { go, git } = setup({ runs: [{ ...run, conclusion: "failure" }] });
    await expect(go()).rejects.toThrow(/failure/);
    expect(git.push.mock.calls).toEqual([[sha, candidateRef, undefined]]);
  });

  it("refuses success with a skipped actual job", async () => {
    const { go, git } = setup({ jobs: [{ ...full, conclusion: "skipped" }] });
    await expect(go()).rejects.toThrow(/Targeted validation/);
    expect(git.push.mock.calls).toEqual([[sha, candidateRef, undefined]]);
  });

  it("refuses a different server Git tree", async () => {
    const { go, git } = setup({ remoteTree: other });
    await expect(go()).rejects.toThrow(/candidate Git tree/i);
    expect(git.push.mock.calls).toEqual([[sha, candidateRef, undefined]]);
  });

  it("does not push a dirty or non-descendant candidate", async () => {
    const dirty = setup();
    dirty.git.assertClean.mockImplementation(() => {
      throw new Error("dirty");
    });
    await expect(dirty.go()).rejects.toThrow(/dirty/);
    expect(dirty.git.push).not.toHaveBeenCalled();
    const divergent = setup();
    divergent.git.assertAncestor.mockImplementation(() => {
      throw new Error("not ancestor");
    });
    await expect(divergent.go()).rejects.toThrow(/not ancestor/);
    expect(divergent.git.push).not.toHaveBeenCalled();
  });
});

describe("Non-force push expected-old guard", () => {
  it("rejects a competing fast-forward and preserves a user pre-push hook", () => {
    const dir = mkdtempSync(join(tmpdir(), "mtone-push-test-"));
    try {
      const local = join(dir, "local");
      const bare = join(dir, "remote.git");
      const git = (cwd, args, input) =>
        execFileSync("git", args, {
          cwd,
          input,
          encoding: "utf8",
          stdio: ["pipe", "pipe", "pipe"],
        }).trim();
      git(dir, ["init", "--bare", bare]);
      git(dir, ["init", "-b", "master", local]);
      git(local, ["remote", "add", "origin", bare]);
      const commit = () => {
        git(local, [
          "-c",
          "user.name=mtone",
          "-c",
          "user.email=tests@example.com",
          "commit",
          "--allow-empty",
          "--no-gpg-sign",
          "-m",
          "test",
        ]);
        return git(local, ["rev-parse", "HEAD"]);
      };
      const predecessor = commit();
      git(local, ["push", "origin", `${predecessor}:${masterRef}`]);
      const competing = commit();
      git(local, ["push", "origin", `${competing}:${masterRef}`]);
      const candidate = commit();
      expect(() =>
        guardedPush({
          cwd: local,
          sha: candidate,
          ref: `refs/heads/release-candidate/${candidate}`,
        }),
      ).toThrow(/single-ref/);
      guardedPush({
        cwd: local,
        sha: candidate,
        ref: `refs/heads/release-candidate/${predecessor}/${candidate}`,
      });
      expect(
        git(bare, [
          "rev-parse",
          `refs/heads/release-candidate/${predecessor}/${candidate}`,
        ]),
      ).toBe(candidate);
      const hooks = join(local, "local-hooks");
      mkdirSync(hooks);
      const marker = join(local, "user-hook-ran");
      writeFileSync(join(hooks, "pre-push"), `#!/bin/sh\ncat > "${marker}"\n`, {
        mode: 0o700,
      });
      git(local, ["config", "core.hooksPath", hooks]);
      expect(() =>
        guardedPush({
          cwd: local,
          sha: candidate,
          ref: masterRef,
          expected: predecessor,
        }),
      ).toThrow(/guard|expected/i);
      expect(git(bare, ["rev-parse", masterRef])).toBe(competing);
      guardedPush({
        cwd: local,
        sha: candidate,
        ref: masterRef,
        expected: competing,
      });
      expect(git(bare, ["rev-parse", masterRef])).toBe(candidate);
      expect(git(local, ["hash-object", "--", marker])).toMatch(
        /^[0-9a-f]{40}$/,
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
