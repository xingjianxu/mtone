# Avatar and Popconfirm implementation

Base: feat-rate, retaining Calendar and Rate changes. No publication authorized.

## Design
- Keep Avatar's name/src/numeric size and AvatarGroup items/numeric max compatible. Add shape, icon/text/image options, fitted text, responsive sizes and keyboard-operable overflow disclosure. Keep neutral mtone appearance.
- Add a compact anchored confirmation using existing Base UI Popover and mtone Button. Cover controlled/uncontrolled visibility, placement, keyboard/focus, dismissal, customization and async confirmation. A rejected confirmation stays open; repeated requests and stale promises must not affect a newer session.
- Update catalog, examples, generated llms, exports and package validation. Ant Design is a capability reference, not a drop-in API guarantee.

## Steps
1. Implement and test Avatar independently.
2. Implement and test Popconfirm independently.
3. Integrate docs, browser regression fixture and CI, with mobile and async interrupted-flow coverage.
4. Run typecheck, full tests, docs build, package smoke and reference consistency checks.
5. Independent code review and corrections. Report browser/environment limits honestly.

## Verification outcome
- 391 tests, TypeScript, docs build, isolated tarball installation/SSR/types, llms equality and diff checks passed.
- Independent review found and fixed Avatar theme contrast and popup CSS cascade/arrow clipping; regression tests added and review passed.
- Browser regression script covers image fallback, fitted/responsive Avatar, keyboard overflow disclosure, confirmation focus/dismissal, async failure/retry, all placements, wide triggers and 375/320px layouts.
- Browser execution is blocked locally: Playwright binaries absent; system Chromium launch is denied by platform socket restrictions. CI must run before merge/deployment; no remote changes or npm publication performed.
