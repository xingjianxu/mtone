# Upload and RadioGroup consolidation

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Remove the duplicate public Dropzone and Segmented components without losing drag-and-drop or segmented radio interactions.

**Architecture:** Keep Upload's existing file pipeline. Render both RadioGroup appearances with the same Base UI radio group and option primitives. The component catalog and demo registry own the canonical documentation URLs and generated reference.

**Tech Stack:** React, Base UI, TypeScript, Vite, Vitest.

**Spec:** [Issue #22](https://github.com/xingjianxu/mtone/issues/22).

- [x] Assert former exports and docs routes are absent and canonical examples are discoverable. Confirm the assertions fail before implementation.
- [x] Keep drag-and-drop behavior in Upload; move the demo. Add `variant="segmented"` to RadioGroup with horizontal default; keep standard default vertical. Remove both duplicate exports.
- [x] Clean up the catalog, navigation, demos and API reference. Regenerate `llms.txt`.
- [ ] Verify the exact candidate with targeted CI (no full suite), fast-forward master and confirm the published Pages artifact before closing the issue. Do not publish npm.
