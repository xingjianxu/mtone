# App Showcase Implementation Plan

> **For agentic workers:** Use subagent-driven-development or executing-plans task by task.

**Goal:** Demonstrate mtone components in a real interactive knowledge workspace.
**Architecture:** Self-contained AppShowcase React view with local data state; docs hash route hosts the view. Scoped styles prevent leakage.
**Tech Stack:** React, existing mtone components, Vite, Vitest, Chromium/Playwright.
**Spec:** docs/superpowers/specs/2026-11-15-app-showcase-design.md

## Global constraints
- Retain Component Gallery and per-component docs.
- No backend, persistence, block editor, npm release, or ChatGPT Site update.
- Explicitly disclose in-memory state; responsive at 360px.

## Review focus
- Empty searches and combined filters must be recoverable.
- Closing/canceling editor must not save a draft.
- Create/edit/delete must update visible data and counts.
- Mobile navigation, dialogs, and content must not overflow horizontally.
- Leaving and returning resets the demo without misleading persistence claims.

## Tasks
- [ ] Create `apps/docs/app-showcase.tsx` and `.css`: named export AppShowcase, seeded local records, real interactions using existing components.
- [ ] Update `docs-app.tsx` route `#/showcase`, title and navigation; preserve existing routes.
- [ ] Add `tests/showcase.test.tsx` for state transitions and cancellation; extend route tests.
- [ ] Add real-browser showcase test to CI for desktop/mobile layout, editing and navigation flows.
- [ ] Run full test/typecheck/build suite, independent review, push and verify Pages.
