# CheckCard Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development. Execute the checked steps per task.

**Goal:** Add accessible selectable cards without changing regular cards.

**Architecture:** Use native inputs and group context, with a sibling action slot. Let CardGroup compose inside the selection group without adding grid options.

**Tech Stack:** React, TypeScript, CSS, Vitest, Playwright.

**Spec:** docs/superpowers/specs/2026-11-21-check-card-design.md

## Global Constraints
Independent branch. No new dependencies, master update, or release. Keep existing Card and CardGroup behavior.

## Review Focus
CardGroup wrappers preserve context and radio grouping; extra actions neither select nor submit by default; disabled/loading cannot change state; native form reset and submission remain sensible; source and packaged docs agree.

- [ ] Add failing unit tests for native single/multi, controlled/default, loading/disabled, sibling action, nested CardGroup, reset and submitted values; implement and rerun.
- [ ] Add catalog entry and independently labeled examples; verify composition and regenerate llms.txt.
- [ ] Exercise actual keyboard and form behaviors in Chromium. Review scope, run typecheck, unit suite, docs build, package smoke and byte comparison; publish branch only.
