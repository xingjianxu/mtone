# @bixlab/mtone-blocknote Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the standalone optional `@bixlab/mtone-blocknote` React block editor with mtone UI and shared docs, without depending on it from the core package.

**Architecture:** The editor wraps BlockNote's public React view, document model, and controllers. mtone owns the visible controls, scoped styling, and standalone form presentation, but not editing, selection, or caret-based controller positioning.

**Tech Stack:** React 19.2, BlockNote core/react 0.57.0, TypeScript, tsup, existing docs Vite and Dot Chromium.

**Spec:** Approved BlockNote integration plan, mockup, and package-name update; GitHub issue [#103](https://github.com/xingjianxu/mtone/issues/103).

## Global Constraints

- Exact scoped npm name `@bixlab/mtone-blocknote`; same repository and docs site; release main and add-on separately only after the exact release candidate passes validation and Pages deploys.
- No BlockNote or editor imports, exports, or dependencies in `@bixlab/mtone`. No BlockNote JavaScript or CSS fetched on other docs pages.
- Use `@blocknote/core` and `@blocknote/react` only, with their MPL-2.0 notices; no Mantine/shadcn/XL replacement UI.
- Use a single owner for every selection, popup position, and keyboard interaction; no storage service or upload.
- Dot-only focused browser checks, unless a separate hosted check is explicitly authorized. No full browser matrix or npm publication by implication.

## Review Focus

- Rejected unsafe links do not persist or mutate text; changing links preserves mixed formatting and replacement targets.
- Same-document rerenders leave the loaded document and undo history intact; document switches get independent state.
- Opening slash menu inside Dialog keeps floating UI in the modal and composition Enter/Escape reach the IME, not editor actions.
- Nested light/dark styles inherit the nearest mtone scope; controls remain usable at mobile widths.
- Installing the main tarball from scratch and opening normal docs must not fetch any BlockNote dependency or stylesheet.

## Milestones

- [ ] M0: use a disposable Vite spike to verify formatting original text selection, caret slash controller inside Dialog, and dependency isolation. Exercise browser composition semantics if supported, and distinguish actual Chinese IME from synthetic/manual typed CJK.
- [ ] M1: add `packages/mtone-blocknote` with React public `BlockEditor`, `BlockEditorProps`, `BlockEditorBlock` and `BlockEditorInput`; ESM, declarations and `styles.css`. Test default blocks, JSON/edit callbacks, read-only updates and `documentKey` replacement.
- [ ] M2: add scoped mtone formatting/buttons/links, controller-driven slash and block actions, controlled selection/focus presentation. Pin each keyboard, pointer, touch fallback, composition, link, undo and block command with focused integration fixtures.
- [ ] M3: use a dynamic editor demo import on the existing catalog route, document npm readiness, initial JSON/onChange example, theme/read-only and SSR. Verify generated llms, package assets/clean install, production lazy asset isolation and exact targeted plan; finish issue only after guarded master, live Pages and acceptance.
