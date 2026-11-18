# HoverCard arrow seam correction

- User screenshot shows the arrow base not joining the card border cleanly.
- Existing implementation rotates an 8px bordered square at a fixed -5px offset, leaving the join dependent on diagonal box rasterization.
- Replace only HoverCard's arrow with an open-baseline SVG path on a 12px square. The base overlaps the popup border's inner edge (1px); rotations share exactly the same geometry for all four sides. Keep Base UI placement and collision handling unchanged.
- Popconfirm has independent SVG arrow markup/styles. No shared selectors, APIs, defaults, or generated reference changes are needed.
- Regression: SVG/ARIA unit assertion fails on the old square and passes after the change. Browser fixture covers top/bottom/left/right in light/dark surfaces at DPR 1/2, checks transformed baseline against the popup border, and saves screenshots for visual inspection.
- Local Chromium launch is blocked by environment socket permissions; browser pass must be confirmed by integration CI, not inferred from DOM tests.
