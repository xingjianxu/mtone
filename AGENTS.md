# mtone contributor and agent instructions

## Track work in GitHub Issues

For repository changes, start from an existing issue or open one before editing.
Set the GitHub Issue Type when the repository supports it. Use an issue-linked
development branch, record material progress and verification on the issue, and
close it only after the agreed work is verified and delivered. See the
[CI and issue guide](docs/CONTRIBUTING-CI.md) for the exact handoff.

## Keep the AI reference synchronized

Whenever changing a component's public API, exports, defaults, behavior, usage
examples, or limitations, update its reference in `apps/docs/catalog.ts` and the
relevant documentation/tests in the same change. Verify the reference against
the implementation and TypeScript declarations; do not infer props from another
UI library.

Regenerate and commit `packages/mtone/llms.txt` with the component change:

```sh
node scripts/generate-llms.mjs
```

Do not hand-edit this generated file. If installation, version guidance, or
cross-component AI advice changes, update `scripts/generate-llms.mjs` as well.
For internal-only changes with no reference impact, regenerate and verify that
the file is still current; an artificial text change is not required.

## Verify the package and website stay consistent

Run relevant checks, not the full suite, for ordinary changes. Use the exact
Git diff and preview its component/docs checks with:

```sh
node scripts/check-targeted-changes.mjs <exact-master-base-SHA> <candidate-SHA> --plan
git diff --check
```

Markdown-only changes check source integrity without installing dependencies;
the Pages build still checks the generated reference.
Application, component, package and shared changes check the affected tests
and applicable type/build/package smoke. The docs build emits the same generated
file as `dist/docs/llms.txt`; do not maintain a separate website reference.
Run the full unit and comprehensive browser suite only on explicit request
using the manual workflow in [the release guide](docs/RELEASING.md). Routine
merges, Pages and stable npm releases do not run the full suite.

For an authorized fast-forward, use
`node scripts/merge-verified.mjs --expect-master <exact-remote-SHA> [candidate]`.
The entry requires a clean committed candidate and verifies targeted checks on
the exact same-repository candidate, bound to the intended master baseline.
Protected PR merges require the same evidence for the final complete Git tree.
Master automatically builds and deploys Pages after checking that proof,
without repeating tests. See [the CI guide](docs/CONTRIBUTING-CI.md).

The real npm tarball must contain `package/llms.txt`, and the installed file must
be available as `node_modules/@bixlab/mtone/llms.txt` (also exported through
`@bixlab/mtone/llms.txt`). The package smoke test checks inclusion and exact
content. Keep these checks when changing packaging or build workflows.

When an authorized change is deployed, verify CI for the exact commit and check
that the public `https://xingjianxu.github.io/mtone/llms.txt` matches the source
file. The live site follows master and may be newer than npm; retain that warning
in the AI reference and user documentation. Updating GitHub or Pages does not
authorize publishing npm. Publish only when the user explicitly authorizes it.
