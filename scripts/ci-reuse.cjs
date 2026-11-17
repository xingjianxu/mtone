// Only immutable successful checks from this workflow/repository may feed Pages.
function eligibleRun(run, context) {
  return run.id !== context.runId && run.head_sha === context.sha &&
    run.conclusion === 'success' && ['push', 'workflow_dispatch'].includes(run.event) &&
    run.path === '.github/workflows/ci.yml' &&
    run.head_repository?.full_name === `${context.repo.owner}/${context.repo.repo}`;
}
function eligibleArtifact(artifact, sha) {
  return artifact.name === `verified-docs-${sha}` && artifact.expired === false &&
    Date.parse(artifact.expires_at) > Date.now();
}
async function findVerifiedArtifact({ github, context, core }) {
  // A miss is safe: the caller runs the complete verification pipeline.
  const { data } = await github.rest.actions.listWorkflowRuns({ ...context.repo,
    workflow_id: 'ci.yml', head_sha: context.sha, status: 'success', per_page: 100 });
  for (const run of data.workflow_runs.filter(run => eligibleRun(run, context))) {
    const artifacts = await github.paginate(github.rest.actions.listWorkflowRunArtifacts,
      { ...context.repo, run_id: run.id, per_page: 100 });
    const artifact = artifacts.find(artifact => eligibleArtifact(artifact, context.sha));
    if (artifact) {
      core.setOutput('run-id', String(run.id));
      core.info(`Reusing exact revision ${context.sha} verified in run ${run.id}`);
      return;
    }
  }
  core.info('No reusable verified artifact; running full checks.');
}
module.exports = { eligibleRun, eligibleArtifact, findVerifiedArtifact };
