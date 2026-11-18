# Breadcrumb Implementation Plan

**Goal:** Extend the existing compact Breadcrumb with icons, menus and configurable separators without breaking existing items.
**Architecture:** Keep label/href and last-item current-page behavior. Reuse Menu for keyboard navigation, nested items and Dropdown positioning. A linked item with a menu has separate link and menu button, avoiding nested interactive elements. No routing dependency is introduced.
**Tech Stack:** React, TypeScript, Base UI through mtone Menu, existing CSS tokens.

- [x] Add failing tests for icons/accessibility, global and per-item separators, disabled items, keyboard menu dismissal and split navigation/menu triggers.
- [x] Implement exported BreadcrumbItem/BreadcrumbProps in navigation.tsx with compact, wrapping CSS and gray hover without underlines.
- [x] Add separate documented examples for icons, menu and separators; synchronize catalog and llms.
- [x] Run types, full tests, docs and package smoke; add real-browser coverage and seek independent review before reporting.
