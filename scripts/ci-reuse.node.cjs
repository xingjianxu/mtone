const test = require('node:test');
const assert = require('node:assert/strict');
const { eligibleRun, eligibleArtifact } = require('./ci-reuse.cjs');
const context = { sha: 'abc', runId: 10, repo: { owner: 'owner', repo: 'repo' } };
const run = { id: 9, head_sha: 'abc', conclusion: 'success', event: 'workflow_dispatch', path: '.github/workflows/ci.yml', head_repository: { full_name: 'owner/repo' } };
test('only exact-SHA successful trusted workflow runs qualify', () => {
  assert.equal(eligibleRun(run, context), true);
  for (const patch of [{ id: 10 }, { head_sha: 'other' }, { conclusion: 'failure' }, { event: 'pull_request' }, { path: '.github/workflows/other.yml' }, { head_repository: { full_name: 'fork/repo' } }]) assert.equal(eligibleRun({ ...run, ...patch }, context), false);
});
test('only live exact-SHA artifact qualifies', () => {
  const artifact = { name: 'verified-docs-abc', expired: false, expires_at: '2099-01-01T00:00:00Z' };
  assert.equal(eligibleArtifact(artifact, 'abc'), true);
  for (const patch of [{name: 'verified-docs-other'}, {expired: true}, {expires_at: '2020-01-01T00:00:00Z'}]) assert.equal(eligibleArtifact({...artifact, ...patch}, 'abc'), false);
});
const { findVerifiedArtifact } = require('./ci-reuse.cjs');
test('reuse selects live trusted artifact and otherwise leaves full verification enabled', async () => {
  for (const expired of [false, true]) {
    const outputs = {};
    const github = { rest: { actions: {
      listWorkflowRuns: async () => ({data: {workflow_runs: [run]}}),
      listWorkflowRunArtifacts: () => {},
    } }, paginate: async () => [{name:'verified-docs-abc', expired, expires_at:'2099-01-01T00:00:00Z'}] };
    await findVerifiedArtifact({github, context, core: { setOutput: (k,v) => outputs[k] = v, info() {} }});
    assert.deepEqual(outputs, expired ? {} : {'run-id':'9'});
  }
});
test('API errors fail closed rather than enabling deployment', async () => {
  await assert.rejects(findVerifiedArtifact({context, core: {}, github: {rest:{actions:{listWorkflowRuns:async()=>{throw Error('unavailable');}}}}}), /unavailable/);
});
