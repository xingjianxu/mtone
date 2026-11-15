# Verification report — mtone 0.1.0

## Passed
- TypeScript `tsc --noEmit` across package, documentation app and tests.
- 40 behavior tests covering primitives, labels, disabled/loading states, selected values, tabs, menus, modal Escape/focus restoration, portal provider values, table sort/filter/selection/pagination, tree keyboard behavior, date range rejection, upload validation/retry/cancellation and stale callbacks.
- One additional distributed-CSS isolation assertion (41 tests total).
- ESM JavaScript, declaration and precompiled stylesheet builds; documentation static build.
- npm tarball installed in separate React19.2 consumer: public exports, server render of provider/button, CSS export resolution.
- Separate host Tailwind stylesheet + packed mtone bundle compile successfully.
- Independent source review; fixed numeric row-key selection, explicit null sorting reset, locale-independent upload validation and popup/modal stacking.

## Limitations
- Local Chromium launch failed due execution environment socket permission. This report does not claim browser visual QA, screen reader testing, mobile Safari, or all browser compatibility.
- Only React19.2 tested; peer range restricted to React19.2. ESM only. SSR smoke is representative, not a full Next.js integration certification.
- Vite prints expected ignored `use client` directive warnings from Base UI/Lucide during client app bundling and a large showcase-chunk advisory. Library build retains its use-client directive.
- No network backend, registry publish or real server upload performed. Documentation upload is explicitly simulated.
- DatePicker uses native calendar. Advanced table features and block editing are outside v0.1 scope.

## Reproduce

`npm ci && npm test && npm run typecheck && npm run build`

Install `bixlab-mtone-0.1.0.tgz` into an ordinary React19.2 app and import `@bixlab/mtone/styles.css` once. The source package includes test files; local temporary consumer smoke harness was run against the packed artifact.
