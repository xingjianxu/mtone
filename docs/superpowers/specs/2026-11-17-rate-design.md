# Rate design

Implement the requested Ant Design-like rating behavior without importing Ant Design or adding dependencies. Follow mtone's compact neutral palette, existing locale context, CSS tokens and source exports. This is a native React implementation rather than an API-identical wrapper.

## Approach

Use a single focusable ARIA slider with decorative character layers. This models zero and half-point values directly, avoids ten tab stops for five stars, and supports native ref focus/blur. An alternative radio-per-half-star model adds duplicate items and more complex labels; an Ant Design wrapper would add a second styling/dependency system. Chosen engineering approach: native slider semantics.

## Scope

- `value/defaultValue`, `onChange`, `count=5`, `allowHalf=false`, `allowClear=true`, disabled, keyboard=true, size small/medium/large.
- Default filled star (lucide already installed); a React node or per-item character renderer; string tooltips, hover callbacks, root DOM attributes and forwarded HTMLSpanElement ref.
- Pointer hover preview, half hit-testing, repeat-click clear, pointer leave/cancel reset, touch click, RTL hit testing and keyboard direction. No drag-to-rate gesture.
- Arrow keys commit a step, Home/End choose bounds, Delete/Backspace clear when allowed. Disabled removes tab stop. Focus indication is a single thin mtone input-style outline, not a thick halo.
- Compact sizes and CSS color/size tokens; whole characters wrap in narrow containers. Tooltips reuse the existing Base UI portal/positioner with viewport collision handling, Escape dismissal and selected text in aria-valuetext. Custom characters must be noninteractive.
- Count is a positive integer; values must be finite, clamped and rounded to the configured step. Dynamic count/step changes normalize presentation without emitting a user-change event.
- Docs, examples, llms reference, unit tests, browser fixture and CI check. No npm publication, push, merge or deployment in this task.
