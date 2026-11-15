# Documentation implementation plan

> For agentic workers: use subagent-driven development for content and examples, with independent final review.

**Goal:** Deliver searchable component gallery and per-component documentation to GitHub Pages.
**Architecture:** Vite static React site with hash routes and typed registry; actual mtone components render examples.
**Tech Stack:** React 19.2, TypeScript, Vite, existing mtone.
**Spec:** ../specs/2026-11-15-documentation-design.md

## Global constraints
No ChatGPT Site updates. No new component library dependencies. All aliases documented. Native date/upload limits explicit. /mtone/ production base. Keep credentials out of source.

## Review focus
Unknown routes, copy failures, search empty state, long code on narrow screens, stale route on browser back.

## Tasks
- [x] Catalog: create apps/docs/catalog.ts ComponentDoc[] from exact source props; test coverage against public exports.
- [x] Examples: create apps/docs/examples.tsx ComponentExample({name}); test every documented name renders.
- [x] Shell: replace apps/docs/main.tsx, add docs-app.tsx and site.css; hash routing, mobile sidebar, search, code copy errors, page headings and per-component API.
- [x] Tests: tests/docs.test.tsx verifies coverage, example rendering, search and routing; run npm test, npm run typecheck.
- [ ] Deploy: add build:docs with /mtone/ base and official .github/workflows/docs.yml; build and verify asset paths.
- [ ] Review, merge worktree into master, update remote using lease, verify Actions and Pages result. Remove worktree only after retained changes are verified.
