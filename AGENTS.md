# mtone contributor and agent instructions

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

Run the applicable tests plus the following before completing a component change:

```sh
npm run typecheck
npm test
npm run build:docs
npm run test:package
cmp packages/mtone/llms.txt dist/docs/llms.txt
git diff --check
```

The package build regenerates the file. Review and commit any generated diff.
The docs Vite build emits that same file as `dist/docs/llms.txt`; do not maintain
a separate manually copied website reference.

Before an authorized merge, follow [the Documentation CI workflow](docs/CONTRIBUTING-CI.md):
verify full regression on the exact same-repository release candidate, then
promote only the validated Git tree. Master automatically builds and deploys
Pages after checking that evidence; it does not repeat the regression suite.

The real npm tarball must contain `package/llms.txt`, and the installed file must
be available as `node_modules/@bixlab/mtone/llms.txt` (also exported through
`@bixlab/mtone/llms.txt`). The package smoke test checks inclusion and exact
content. Keep these checks when changing packaging or build workflows.

When an authorized change is deployed, verify CI for the exact commit and check
that the public `https://xingjianxu.github.io/mtone/llms.txt` matches the source
file. The live site follows master and may be newer than npm; retain that warning
in the AI reference and user documentation. Updating GitHub or Pages does not
authorize publishing npm. Publish only when the user explicitly authorizes it.
