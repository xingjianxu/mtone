# Component playgrounds implementation plan

**Goal:** Each public component page starts with a live preview and a compact settings toolbar, following the approved Tree design.

**Architecture:** A docs-only shared toolbar renders curated controls. Each component recipe owns a real sample and its controllable settings. The existing examples and their deep links remain available. Tree keeps its existing playground anchor.

**Tech stack:** React, mtone, Vite, Vitest, Playwright.

**Constraints:** No library API change, no npm publish, no full regression. Do not invent configurable props on components that only accept content. Keep transient playground state local.

## Implementation
- [ ] Add coverage for the first visible example on each public route, then verify the existing site fails that coverage.
- [ ] Add a reusable toolbar with toggle, select, numeric and text controls and an advanced popover. Support responsive wrap, scoped state and a complete reset.
- [ ] Map the public catalog to curated component recipes and platform-native controls; leave specialized fixtures and copyable source at their original routes. Fold the existing Tree configuration into the shared toolbar without duplicating that example.
- [ ] Verify all recipes mount and expose actionable settings, test representative state changes and reset, and exercise Tree and responsive layout in Chromium.
- [ ] Regenerate the reference and deliver the exact targeted candidate through GitHub Pages.
