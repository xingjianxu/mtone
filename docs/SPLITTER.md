# Splitter

Splitter divides a workspace into resizable panels. It ships with the rest of
`@bixlab/mtone` and its precompiled stylesheet. Consumers do not install individual
components or a separate resize package.

## Layout and content

Horizontal orientation places panels side by side. Vertical orientation stacks
panels. Give the Splitter a definite usable width and height; for example, a
vertical splitter inside a parent with no height cannot infer how much space to
share. In flex or grid layouts, ensure the relevant ancestors can shrink with
`min-width: 0` and/or `min-height: 0`.

A panel is a layout container, not a route or a persistence mechanism. Place
existing mtone components inside it. Nest another Splitter inside a panel for a
workspace with both axes. Keep content scrollable inside each panel rather than
letting long text or tables force the divider beyond the viewport.

## Accessibility and interactions

Give each panel a meaningful accessible label. The separator is a keyboard
control, not just a decorative line. Do not remove its focus indicator or place
focusable content directly inside the drag handle. Use native buttons for any
additional application actions in a panel.

## Examples and persistence

The documentation example changes local React state only. Its reset action
restores the example proportions; resizing does not save account preferences or
send requests. An application can persist an accepted layout explicitly after
an interaction, using its own storage and validation policy.

## Scope

The API is inspired by Ant Design Splitter but is not a drop-in compatibility
layer. Only the props listed in the mtone reference and TypeScript declarations
are supported. In particular, do not assume AntD's deprecated aliases or all of
its visual customization and lazy-rendering options are available.

Reference: [Ant Design Splitter](https://ant.design/components/splitter/).

## Sizes and limits

`SplitterSize` accepts a number, a percentage string, or a pixel string:

- A number is a pixel length, so `240` and `"240px"` mean the same thing.
- Percentages are relative to the group's available panel space.
- Strings without a unit, other CSS units, negative numbers and non-finite
  numbers are not supported. They are rejected rather than silently guessed.
- `defaultSize` is an initial panel preference, not an ongoing controlled value.
- The default minimum is zero, or 10% for a collapsible panel.
- `min` and `max` apply to a panel. Keep the constraints feasible at the smallest
  expected container size. A same-unit minimum larger than its maximum is
  rejected. Constraints that cannot all fit the actual container are reconciled
  by the underlying layout engine, rather than making impossible guarantees.
- A collapsible panel may use `collapsedSize` (zero by default), outside its
  normal expanded minimum. Set an expanded `min` so folding is distinguishable
  from an ordinary small panel.

The engine handles container resize and bounds. `groupResizeBehavior` selects
whether to prefer relative proportions or pixel size during a container change;
it is not permission to violate the other panels' constraints. At least one panel
must retain relative sizing. Explicitly setting every panel to
`preserve-pixel-size` is rejected.

## Controlled layouts

Use one `sizes` array on the Splitter, in rendered panel order. Its length must
match the number of panels. There is no `Splitter.Panel.size` prop.

```tsx
import { useState } from 'react';
import { Splitter } from '@bixlab/mtone';
import '@bixlab/mtone/styles.css';

function Workspace() {
  const [sizes, setSizes] = useState<Array<number | `${number}%` | `${number}px`>>([
    '30%', '70%',
  ]);
  return (
    <Splitter style={{ height: 280 }} sizes={sizes} onResize={setSizes}>
      <Splitter.Panel id="navigation" label="Navigation" min="15%" collapsible>
        <nav style={{ padding: 12 }}>Navigation</nav>
      </Splitter.Panel>
      <Splitter.Panel id="content" label="Content" min="30%" collapsible>
        <article style={{ padding: 12 }}>Content</article>
      </Splitter.Panel>
    </Splitter>
  );
}
```

The controlled array is converted to pixels, then normalized to fill the available
panel space, excluding separator thickness. Thus `[100, 100]` requests equal
halves, not two fixed 100px panels with leftover space. To express exact pixel
sizes, their total must match the actual available panel space. All-zero arrays
are invalid. Bounds are applied after normalization. Controlled values take
precedence over the automatic container-resize preference.

Resize callback arrays contain **pixels**, not percentage values. The parent
accepts requested sizes by updating `sizes`. If persisting percentages, convert
using the same layout's panel total, rather than treating returned numbers as
percentages. Persisting is application work; no storage is written by mtone.

For an uncontrolled layout, omit `sizes` and give the panels `defaultSize` values
where needed. Use a new React key to reset an uncontrolled splitter. A controlled
layout can reset by setting a new valid `sizes` array.

## Dynamic and nested panels

Only direct `Splitter.Panel` elements are accepted as children; Fragments and
conditional rendering are supported. Do not wrap a Panel in another DOM element
or a custom component. Give dynamic panels explicit unique IDs that stay with
their content. When reordering a controlled layout, reorder its sizes together
with its panels. When adding/removing a panel, update the sizes array in the same
render so its length remains valid.

To combine axes, render another Splitter **inside** a Panel. The nested instance
has its own container, panel IDs, sizing constraints and callbacks. It does not
share layout state with its parent automatically.

## Differences from Ant Design

The chosen wrapper keeps the useful common layout behavior and a smaller API:

- Root `sizes` controls the whole layout instead of per-Panel `size`.
- `orientation` is the supported direction API. Deprecated aliases such as
  `layout` are not provided, nor is the boolean `vertical` shorthand.
- `collapsible` is a boolean on each panel. AntD's per-side icon and motion
  configuration is not implemented.
- `destroyOnHidden` is not provided. Collapsing is a layout operation, not an
  instruction to erase or unmount application state.
- Root and Panel `className`/`style` are supported; AntD's full semantic style
  object/function APIs are not copied.

The mature resizing engine is
[react-resizable-panels](https://github.com/bvaughn/react-resizable-panels).
The public contract is the mtone types, not every prop of that underlying
package. Consumers need only install mtone and import its stylesheet.


## Keyboard, touch and separators

The divider exposes the separator role, orientation, related panel and current
size information. Tab to a separator and use the axis direction keys to resize.
Home/End move toward the available limits. Enter toggles the preceding panel
when it is collapsible. F6/Shift+F6 move among separators in the same group.
Pointer interactions support mouse and touch; keep the focus outline intact.
Respect the surrounding text direction for RTL layouts.

Double-click invokes `onDraggerDoubleClick(index)`; it does not reset by itself.
Use that callback to change controlled sizes if double-click reset is desired.
`disabled` locks the group. A non-resizable panel also disables its adjacent
separator controls. Collapsing retains mounted panel content and application
state; a zero-size panel is not a substitute for explicit application cleanup.

## Per-boundary collapse controls

Each separator offers independent controls for its adjacent panels when those
panels have `collapsible` enabled. Enable it on both panels to let the user
choose which side to collapse. In a layout with three or more panels, a middle
panel may have a control at each of its two boundaries; both operate on the same
panel state, not separate copies of that panel.

On fine-pointer devices, the controls are hidden at rest and appear when the
separator is hovered or the separator/control area has keyboard focus. They
remain available while moving the pointer from the handle to a button. A
boundary adjacent to a collapsed panel keeps its whole control group visible,
including the restore control, so there is a clear way to reopen that panel. Coarse-pointer touch devices show the controls persistently and do
not require hover. Existing disabled and non-resizable settings still apply: if
either adjacent panel is non-resizable, that boundary's pair of controls is disabled.

Collapse and restore continue to obey the layout's constraints. To fully
collapse either side of a two-panel layout, the other side must be allowed to
occupy the remaining space. For example, a `max="55%"` on the navigation panel
can prevent a complete collapse of the document panel because navigation cannot
expand to fill the layout within that limit.
The live example therefore enables `collapsible` on both panels and does not set
that restrictive maximum. The reset button restores both starting proportions.

## Appearance

The default separator occupies 6px and uses a 2px quiet grip, with a visible
keyboard focus state. Shared mtone `--mt-bg`, `--mt-fg`, `--mt-border`,
`--mt-subtle` and `--mt-focus` variables keep it consistent with existing controls.
Do not change separator thickness in CSS without checking pixel sizing and
collapse-control placement. This version has no dedicated thickness token.


## Events, cancellation and collapsed content

- `onResizeStart` marks a user pointer, keyboard or collapse-control interaction.
- `onResize` reports size requests during those interactions. It is not fired
  just because the component mounted, its container changed, or the parent
  supplied new controlled sizes. In lazy mode, panel changes are deferred until
  release; cancellation reports the rollback request.
- `onResizeEnd` runs in a subsequent frame with the final accepted and constrained
  pixel sizes. An interaction that hits a limit without changing sizes still
  ends. This is a better place for expensive persistence than each pointer move.
- `onCollapse` reports actual collapsed-state transitions, including changes
  caused by controlled values. It does not announce initial state.
- Escape or `pointercancel` rolls the drag back to its starting layout. Window
  blur commits the last valid layout. The controlled parent should accept the
  rollback request in the same way it accepts other `onResize` requests.

A panel collapsed to zero remains mounted to retain application state, but is
`inert` and `aria-hidden`. Do not use collapsing as a security boundary: hidden
content still exists in the client. A nonzero `collapsedSize` can retain a narrow
visible region instead; design that region so its remaining content is usable.

## Multiple panels and nested axes

```tsx
<Splitter style={{ height: 360 }}>
  <Splitter.Panel id="files" label="Files" defaultSize="25%" min="15%" collapsible>
    Files
  </Splitter.Panel>
  <Splitter.Panel id="editor" label="Editor" defaultSize="50%" min="30%">
    <Splitter orientation="vertical" style={{ height: '100%' }}>
      <Splitter.Panel id="source" label="Source" defaultSize="65%" min="25%">
        Source
      </Splitter.Panel>
      <Splitter.Panel id="output" label="Output" min="15%" collapsible>
        Output
      </Splitter.Panel>
    </Splitter>
  </Splitter.Panel>
  <Splitter.Panel id="inspector" label="Inspector" min="15%">
    Inspector
  </Splitter.Panel>
</Splitter>
```

Panel content can be replaced by existing mtone components. The layout does not
supply a fixed application sidebar, routing, data loading or editor persistence.
