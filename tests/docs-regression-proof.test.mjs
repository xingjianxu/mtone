import { describe, expect, it, vi } from "vitest";
import { findRegressionProof } from "../scripts/verify-docs-regression.mjs";

const repository = "octocat/mtone";
const repositoryId = 101;
const targetSha = "a".repeat(40);
const testedSha = "b".repeat(40);
const targetTree = "c".repeat(40);
const otherTree = "d".repeat(40);
const path = `/repos/${repository}/actions/workflows/docs.yml/runs`;
const fullJob = {
  name: "Full regression",
  status: "completed",
  conclusion: "success",
  steps: [
    {
      name: "Assert exact candidate checkout",
      status: "completed",
      conclusion: "success",
    },
    {
      name: "Assert tracked files unchanged",
      status: "completed",
      conclusion: "success",
    },
  ],
};
const run = {
  id: 201,
  run_attempt: 2,
  event: "push",
  status: "completed",
  conclusion: "success",
  path: ".github/workflows/docs.yml",
  head_branch: "release-candidate/tabs",
  head_sha: targetSha,
  repository: { id: repositoryId, full_name: repository },
  head_repository: { id: repositoryId, full_name: repository },
};
const jobPath = `/repos/${repository}/actions/runs/${run.id}/attempts/2/jobs`;

function setup({
  direct = [],
  recent = [],
  jobs = [fullJob],
  tree = targetTree,
} = {}) {
  const request = vi.fn(async (resource, query) => {
    if (resource === path)
      return { workflow_runs: query.head_sha ? direct : recent };
    if (resource === jobPath)
      return {
        jobs: jobs.map((job) => ({
          run_id: run.id,
          head_sha: direct[0]?.head_sha ?? recent[0]?.head_sha ?? targetSha,
          ...job,
        })),
      };
    if (resource === `/repos/${repository}/git/commits/${testedSha}`) {
      return { sha: testedSha, tree: { sha: tree } };
    }
    throw new Error(`Unexpected API request ${resource}`);
  });
  return {
    request,
    lookup: () =>
      findRegressionProof({
        request,
        repository,
        repositoryId,
        targetSha,
        targetTree,
      }),
  };
}

describe("Pages pre-merge regression proof", () => {
  it("fails closed when the workflow was just introduced and there is no prior candidate run", async () => {
    const { lookup } = setup();
    await expect(lookup()).rejects.toThrow(/release-candidate/);
  });

  it("uses a successful exact-SHA candidate run before scanning different commits", async () => {
    const { lookup, request } = setup({ direct: [run] });
    await expect(lookup()).resolves.toMatchObject({
      runId: run.id,
      testedSha: targetSha,
      runAttempt: 2,
    });
    expect(request.mock.calls).toEqual([
      [path, expect.objectContaining({ head_sha: targetSha })],
      [jobPath, expect.anything()],
    ]);
  });

  it.each(["@release-candidate/tabs", "@refs/heads/release-candidate/tabs"])(
    "accepts the GitHub API path suffix %s only for the candidate ref",
    async (suffix) => {
      const { lookup } = setup({
        direct: [{ ...run, path: run.path + suffix }],
      });
      await expect(lookup()).resolves.toMatchObject({ runId: run.id });
    },
  );

  it("accepts a different merge commit only when the complete candidate tree is identical", async () => {
    const candidate = {
      ...run,
      head_sha: testedSha,
      event: "workflow_dispatch",
    };
    await expect(
      setup({ recent: [candidate] }).lookup(),
    ).resolves.toMatchObject({ testedSha, runId: run.id });
    await expect(
      setup({ recent: [candidate], tree: otherTree }).lookup(),
    ).rejects.toThrow(/release-candidate/);
  });

  it("never accepts a reported metadata tree without confirming the immutable Git tree", async () => {
    const candidate = {
      ...run,
      head_sha: testedSha,
      head_commit: { tree_id: targetTree },
    };
    await expect(
      setup({ recent: [candidate], tree: otherTree }).lookup(),
    ).rejects.toThrow(/release-candidate/);
  });

  it.each([
    { path: ".github/workflows/similarly-named.yml" },
    { path: ".github/workflows/docs.yml@master" },
    { event: "pull_request" },
    { event: "workflow_run" },
    { head_branch: "master" },
    { head_repository: { id: 601, full_name: repository } },
    { repository: { id: repositoryId, full_name: "someone/else" } },
    { status: "in_progress" },
    { conclusion: "cancelled" },
    { run_attempt: 0 },
  ])(
    "rejects non-candidate or unsuccessful run fields %j",
    async (overrides) => {
      const { lookup } = setup({ direct: [{ ...run, ...overrides }] });
      await expect(lookup()).rejects.toThrow(/release-candidate/);
    },
  );

  it.each([
    { jobs: [{ ...fullJob, conclusion: "skipped" }] },
    { jobs: [{ ...fullJob, status: "in_progress" }] },
    { jobs: [{ ...fullJob, name: "Fake successful job" }] },
    { jobs: [{ ...fullJob, run_id: 999 }] },
    { jobs: [{ ...fullJob, head_sha: testedSha }] },
    { jobs: [{ ...fullJob, steps: fullJob.steps.slice(0, 1) }] },
    {
      jobs: [
        {
          ...fullJob,
          steps: [
            { ...fullJob.steps[0], conclusion: "skipped" },
            fullJob.steps[1],
          ],
        },
      ],
    },
    { jobs: [] },
  ])(
    "requires a completed successful regression job and successful proof steps",
    async ({ jobs }) => {
      await expect(setup({ direct: [run], jobs }).lookup()).rejects.toThrow(
        /release-candidate/,
      );
    },
  );

  it("does not make deployable proof when authoritative workflow API lookup fails", async () => {
    const request = vi
      .fn()
      .mockRejectedValue(new Error("GitHub API inaccessible"));
    await expect(
      findRegressionProof({
        request,
        repository,
        repositoryId,
        targetSha,
        targetTree,
      }),
    ).rejects.toThrow(/API inaccessible/);
  });
});
