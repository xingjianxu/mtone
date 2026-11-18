# HoverCard Implementation Plan

**Goal:** Add contextual rich previews while retaining mtone's compact visual style.
**Architecture:** A separate HoverCard wraps the installed Base UI PreviewCard, reusing existing popup styles and theme scope. Popover remains click-oriented for actions/forms.
**Tech Stack:** React, TypeScript, Base UI, Vitest.

- [x] Inspect Mantine reference and existing Popover, Dropdown and Tooltip.
- [x] Create isolated feature worktree from aa9ca3f.
- [x] Write failing tests for hover, focus, Escape, controlled state and disabled behavior.
- [x] Implement HoverCard with trigger/content/title, side/align/offset/width, open/close delays, arrow, controlled state and disabled option.
- [x] Add docs examples, catalog API/limitations and regenerate llms.txt.
- [ ] Run full repository verification and review. No merge or publication.

Review focus: pointer transit between trigger and popup; keyboard focus retained; rapid leave cancels opening; controlled ownership; trigger click retained. Preview content must be supplemental and must not require hover/touch to complete an essential task. Forms belong in Popover/Dropdown.

## Verification
- Typecheck passed; full suite passed with one worker: 57 files / 611 tests. The first concurrent run exposed a catalog expectation omission (fixed) and three resource-related 5s test timeouts (passed on full rerun).
- Documentation and package builds pass; package smoke uses a writable temporary npm cache in this executor.
- Independent review caught a disabled-state control-mode bug; regression added and fixed, re-review passed.
- Three-engine browser script added. Local execution is blocked because Playwright browser binaries are absent; browser/visual validation remains pending. No temporary verification workflow is included.

## Portal-focus follow-up
- Reproduced delayed Base UI trigger blur closing a preview after focus entered a descendant portal (regression test failed before the fix).
- Added an internal React ownership chain projected by MtoneScope, so only descendant portals qualify as inside this HoverCard. Unrelated portals remain outside.
- Preserved Escape/outside dismissal; added popup blur handling for keyboard departure from descendants. No public API changes.
- Ten HoverCard unit tests pass, including actual nested Dropdown and two-stage Escape; typecheck passes. Added a separate three-engine browser regression, pending execution in integration CI (local browser launch blocked by socket permissions).
