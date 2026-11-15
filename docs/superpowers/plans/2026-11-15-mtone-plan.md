# mtone Implementation Plan

> Use superpowers:subagent-driven-development or executing-plans.
> **Goal:** Installable styled React UI kit covering non-editor reference controls.
> **Architecture:** Base UI interaction primitives wrapped by high-level mtone components; precompiled scoped Tailwind CSS; docs app consumes public exports.
> **Tech Stack:** React, TypeScript, Base UI, Tailwind, Lucide, Vitest, Vite, tsup.
> **Spec:** ../specs/2026-11-15-mtone-design.md

## Global Constraints

Name mtone; no editor; no backend/publish; one install plus CSS; reference tokens; keyboard support; isolated styles.

## Review Focus

Controlled state; disabled inputs; portal theme; empty data/pagination; repeated uploads and cancellation.

## Task 1: Package foundations and basic controls

- [ ] Configure TS/build/tests and write export/render tests.
- [ ] Implement provider, buttons, inputs, display primitives and styles.
- [ ] Test types, renders, button loading and input events.

## Task 2: Interactive selection and overlays

- [ ] Write tests for selection, menu and modal behavior.
- [ ] Wrap Base UI with ready-styled Select, MultiSelect, Checkbox, RadioGroup, Switch, Slider, NumberInput, Tabs, Menu, Tooltip, Popover, Modal, Drawer, Toast.
- [ ] Test controlled transitions, keyboard and disabled states.

## Task 3: Data and application components

- [ ] Test tree navigation, table sorting/filter/pagination, date and upload adapter.
- [ ] Implement Tree, Table, DatePicker, Upload, navigation/list/card helpers.
- [ ] Run whole suite and typecheck.

## Task 4: Documentation and packaging

- [ ] Build interactive overview and knowledge-base example from public exports.
- [ ] Document APIs, limitations, tokens, locales, installation.
- [ ] Build tarball, install in clean consumer, smoke test exports and CSS.
- [ ] Review source, fix defects, package source and installable artifact.
