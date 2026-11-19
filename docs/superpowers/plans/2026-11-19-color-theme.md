# Theme implementation plan

1. Add regression coverage for default, explicit and system mode on nested MtoneScope and portalled surfaces. Add theme option to MtoneProvider/MtoneScope; keep light default and use CSS media query for system. Audit the portal paths.
2. Define shared semantic color pairs in styles.css. Replace hard-coded chromatic surfaces/text/borders across component sheets without changing light appearance or structural CSS; test representative inputs, lists, cards, overlays, interactive statuses and focus.
3. Add browser tests for live system changes, manual override, persistent reload, reset to system, showcase and mobile. Implement shared preference/bootstrap and Docs/Showcase control, then map docs surfaces to semantic colors.
4. Update catalog/theme documentation and generated llms.txt. Run typecheck, unit tests, docs and package builds, browser suite and artifact consistency. Review changes before proposing integration, no npm publication.
