# LoadingOverlay

Add a local, controlled loading surface using mtone's existing Spinner, neutral surface tokens and compact typography. The overlay is a sibling of the covered content inside a positioned parent. It does not introduce a portal, modal semantics, focus trap or mutate parent DOM.

`visible` defaults to false. Visible overlays cover the parent with an absolute inset surface and centered loader. Support optional visible `label` (accessible fallback “Loading”), custom `loader`, `overlayColor`, `opacity` (default 0.75), `blur` (0), `radius` (inherit), and `zIndex` (10), plus div attributes/ref/style. A custom loader replaces Spinner but retains a single named status region. Hidden overlays unmount immediately, avoiding stale interception or announcements.

Prefer a sibling overlay over a content wrapper: it composes with existing Card/Table/form layouts and matches the reference's local-overlay model. A modal/dialog would alter focus and block more than the requested region. The overlay intercepts pointer input but does not disable the underlying keyboard targets; docs demonstrate disabled controls and explain inert and aria-busy on the covered region. No API compatibility or npm publication is required.

Add docs examples, catalog/llms reference, component tests, and verify package and site together. Merge and publication remain separate decisions.
