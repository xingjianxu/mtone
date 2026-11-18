# Progress enhancement
Preserve `value`, `label` and the default 5px muted-green linear bar with no visible label. Add line/circle/dashboard, optional information formatting, status, size/stroke, custom solid/gradient colors, success segment, discrete steps and configurable dashboard gap. Use React/CSS/SVG without dependencies. Status colors follow mtone; honor reduced motion. Bounds and invalid numbers remain safe, with one accessible progressbar.

## Approaches
Extend native CSS/SVG (chosen for small API and exact visual control) rather than adding a chart dependency or a second component library. This keeps mtone styling and existing consumers intact. The root coordinator approved execution of this scope.

## Non-goals
Interactive progress editing, npm publication and automatic master merge.
