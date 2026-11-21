# Button icon-only consolidation

- Add explicit `iconOnly` to Button, selecting the existing square class and never inferring icon-only mode from children. Document the required `aria-label` or `aria-labelledby` when enabled. Keep the exported props object extendable by TypeScript consumer interfaces, and leave ordinary visible-label Buttons unchanged.
- Match icon-only width to the existing md/theme, sm and lg heights and remove horizontal padding; preserve normal Button section padding, toggle/loading behavior, variants, and refs. Keep IconButton as a forwarding compatibility wrapper with its required `aria-label` and legacy geometry.
- Write focused type/DOM tests before implementation and verify consumer interface extension/spread, both native name sources, wrapper, loading and toggle. In Chromium verify real dimensions, section padding and theme height; avoid broad tests.
- Make Button's icon-only docs canonical, redirect historic IconButton URLs and keep the exported wrapper discoverable as an alias. Update package API and regenerate llms; review only scoped files.
