# LoadingOverlay Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a compact local loading overlay to mtone.
**Architecture:** A controlled sibling overlay using existing Spinner and isolated CSS; no parent mutations or portals.
**Tech Stack:** React, TypeScript, CSS, Vitest, existing Vite docs.
**Spec:** `docs/superpowers/specs/2026-11-18-loading-overlay-design.md`

## Global Constraints
- Keep mtone neutral compact styling; no new dependencies.
- Do not merge, deploy, or publish npm.
- Regenerate llms.txt from catalog and run required verification.

## Review Focus
- Hidden overlays must stop intercepting input and announcing status immediately.
- Custom loaders must retain one accessible status.
- Repeated toggles must not change parent attributes or underlying values/focus.
- Invalid numeric visual props must fall back safely.
- Parent-relative layout, clipping and pointer interception need browser coverage.

## Task 1: Component and reference
- [x] Add failing tests in `tests/loading-overlay.test.tsx` for export, hidden/visible/repeated toggle, custom loader, named status, styling/ref/attributes and numeric bounds.
- [x] Run focused tests and confirm missing export failure.
- [x] Add `packages/mtone/src/loading-overlay.tsx` and `.css`, export/import through index/styles.
- [x] Run focused tests, add `apps/docs/loading-overlay-example.tsx`, register it in examples/catalog and regenerate llms.txt.
- [x] Add browser scenario to existing smoke tests for dimensions, blocked pointer clicks and dismissal.
- [x] Run typecheck, full tests, build:docs, test:package, cmp llms files, diff --check; report browser limits separately.
- [x] Obtain independent review and commit verified changes.

## Verification record

- typecheck passed; full suite: 58 files / 614 tests passed.
- docs build passed, llms files match; package smoke passed including LoadingOverlay SSR and type usage. npm cache was placed in /tmp due to unavailable default cache path.
- Independent review found no blocking defect; minor demo/test improvements applied.
- Browser script prepared for Chromium, Firefox and WebKit and wired into existing verification/docs workflows. Local Chromium cannot launch: socket() failed: Operation not permitted, including elevated attempt. Browser behavior remains unverified until CI runs.
- No merge, deployment or npm release performed.
