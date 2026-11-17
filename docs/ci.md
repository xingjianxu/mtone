# Continuous integration and documentation deployment

`Verify and deploy` replaces the per-component verification workflows. All
`tests/*.browser.mjs` scripts are discovered automatically, so adding a component
must not add a new workflow. Chromium, Firefox and WebKit remain installed and
covered by the existing scripts. Local dot-browser checks supplement these tests;
they do not replace engine-specific regressions.

## When checks run

- Non-draft pull requests into `master`: full verification, no deployment.
- Explicit `verify/**` candidate branches: full verification on push (no deployment).
- Feature branches: run **Verify and deploy → Run workflow** on the desired branch
  once the candidate is ready. Routine `feat-*` and `fix-*` branch pushes do not spend runner time.
- `master` pushes: verify and deploy. A successful run from this same workflow,
  same repository, exact commit SHA, triggered by push or manual dispatch can be
  reused if its verified documentation artifact is still available. PR artifacts
  never qualify. Restored content must pass its commit marker and SHA-256 manifest checks. Missing or expired artifacts cause full validation; failed API
  or artifact downloads stop deployment instead of bypassing validation.
- Manual runs on `master` may also deploy, under the same gate.

A fast-forward of an already manually verified feature commit reuses its exact
build, avoiding a second full suite. A merge/squash commit has a different SHA and
is deliberately checked again. Branch protection should require the `verify`
job if PR-only integration is desired; this change does not alter branch settings.

The full gate retains type checking, all unit tests, document build, actual npm
package installation/SSR/types checks, `llms.txt` equality and every browser
regression script. A failing gate prevents Pages artifact publication/deployment.

Verified docs artifacts last 3 days. Browser diagnostics are saved for 3 days on
failure, or on manual runs with **keep_screenshots** enabled. Existing historical
artifacts are not deleted. Concurrency cancels obsolete runs for the same ref/PR.

`Publish npm package` is unchanged: manual dispatch validates only; publishing
requires the existing non-prerelease GitHub Release and npm environment workflow.
Do not trigger a release without explicit owner authorization.

## Initial rollout

GitHub requires `ci.yml` on the default branch before manual dispatch is available.
For initial rollout, push a reviewed candidate to `verify/workflows`: push-triggered
workflows are available from that branch before reaching master. After it passes,
a fast-forward to master reuses its exact-SHA artifact. A PR is another validation
option. If no eligible artifact exists, the first master run performs the full gate.
A candidate with an ordinary merge/squash SHA will also run the full gate.
