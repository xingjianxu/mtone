# HoverCard arrow seam correction

- User screenshot shows the arrow base not joining the card border cleanly.
- Existing implementation rotates an 8px bordered square at a fixed -5px offset, leaving the join dependent on diagonal box rasterization.
- Replace only HoverCard's arrow with an open-baseline SVG path on a 12px square. The base overlaps the popup border's inner edge (1px); rotations share exactly the same geometry for all four sides. Keep Base UI placement and collision handling unchanged.
- Popconfirm has independent SVG arrow markup/styles. No shared selectors, APIs, defaults, or generated reference changes are needed.
- Regression: SVG/ARIA unit assertion fails on the old square and passes after the change. Browser fixture covers top/bottom/left/right in light/dark surfaces at DPR 1/2, checks transformed baseline against the popup border, and saves screenshots for visual inspection.
- Local Chromium launch is blocked by environment socket permissions; browser pass must be confirmed by integration CI, not inferred from DOM tests.

- CI caught the containing-block detail: Base UI's borderless Positioner owns the absolute arrow, not the popup padding box. Correct offset is -6px, so the 7px path baseline lands at the popup's 1px inner border edge.

## Verified result
- Local: 60 test files / 639 tests, typecheck, docs build, package smoke, llms equality and diff checks passed.
- Existing branch CI run 44266064595 passed its complete suite, including the new arrow regression in Chromium, Firefox and WebKit.
- Downloaded the 12 arrow screenshots and inspected representative light/dark, 1x/2x results across all three engines: all four arrow bases join their card edges cleanly without the original stepped gap.
- Temporary feature-branch workflow trigger removed. Added the regression to existing docs/verification workflows only; no new permanent workflow or deployment.
