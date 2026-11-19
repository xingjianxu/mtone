# Component documentation layout

1. Add a shared demo/section contract and desktop/mobile TOC. Test hash navigation and legacy aliases with the existing docs tests; add a dedicated docs-layout test.
2. Render Table, Input, and Button using independent sections, where preview and copied code share one source file. Keep Gallery separate.
3. Migrate other grouped demos without changing library code. Verify feature coverage, focused headings and mobile overflow.
4. Run full checks, publish exact verified commit to master, verify Pages. Do not publish npm.
