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

Only the props listed in the mtone reference and TypeScript declarations
are supported. See the API boundaries below for sizing, styling and panel
lifecycle behavior.

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

## API boundaries

The chosen wrapper keeps the useful common layout behavior and a smaller API:

- Root `sizes` controls the whole layout instead of per-Panel `size`.
- `orientation` is the supported direction API; `layout` and the boolean
  `vertical` shorthand are not provided.
- `collapsible` is a boolean on each panel; per-side icon and motion
  configuration is not supported.
- `destroyOnHidden` is not provided. Collapsing is a layout operation, not an
  instruction to erase or unmount application state.
- Root and Panel `className`/`style` are supported; semantic style
  object/function APIs are not provided.

The mature resizing engine is
[react-resizable-panels](https://github.com/bvaughn/react-resizable-panels).
The public contract is the mtone types, not every prop of that underlying
package. Consumers need only install mtone and import its stylesheet.


## Keyboard, touch and separators

The divider exposes the separator role, orientation, related panel and current
size information. Tab to a separator and use the axis direction keys to resize.
Home/End move toward the available limits. Enter performs the same collapse cycle
as double-clicking the focused separator. F6/Shift+F6 move among separators in the same group.
Pointer interactions support mouse and touch; keep the focus outline intact.
Respect the surrounding text direction for RTL layouts.

## Separator collapse cycle

There are no separate collapse buttons. Double-click a separator, double-tap it
on a touch screen, or focus it and press Enter to cycle its adjacent panels. With both panels collapsible,
the sequence is **first panel collapsed → initial proportions → second panel
collapsed → first panel collapsed**, then repeats. “First” and “second” mean
rendered panel order, not physical left/right; this also applies to vertical
and RTL layouts. If only one neighbor is collapsible, the separator alternates
between collapsing that panel and restoring the initial proportions. With
neither neighbor collapsible, the activation does not change the layout.

Initial proportions are the adjacent pair's ratio from its first settled actual
layout, after constraints have been applied, not a copy of `defaultSize` values.
Restoring applies that ratio to the pair's **current combined size**, leaving
other panels unchanged. Container resizing therefore does not restore stale
pixel lengths. Manual dragging or arrow-key resizing restarts the cycle from
the first collapsible neighbor, but does not overwrite the initial ratio.
Changing the panel identity/order recaptures the initial layout. A controlled
parent must accept the requested `sizes`; rejected requests do not advance the
cycle.

Each boundary has its own cycle. In a multi-panel layout the middle panel can
participate at either boundary; this still changes one shared panel, not copies
of its state. Existing constraints continue to apply and may clamp restoration
or prevent a requested collapse. To fully collapse either side of a two-panel
layout, the other side must be allowed to occupy the remaining space. For
example, a `max="55%"` on navigation can prevent fully collapsing the document.
The live example therefore makes both panels collapsible without that maximum.
Its reset action remounts the example and starts a fresh cycle at 32% / 68%.

`disabled` locks the group. Either adjacent panel being non-resizable disables
that boundary's interaction. Collapsing keeps panel content mounted; a zero-size
panel is not a substitute for explicit application cleanup.

### Migration from button-based collapse

Remove instructions telling users to find hover or touch collapse buttons.
`onDraggerDoubleClick(index)` is now a notification accompanying the default
mouse double-click or touch double-tap cycle, not a callback-only action. Enter
uses the same cycle without invoking this pointer-specific notification. Existing handlers that implement their own
reset by updating controlled sizes should be reviewed to avoid competing with
the built-in cycle. The callback does not cancel the default action.

## Appearance

The default separator occupies 6px and uses a 2px quiet grip, with a visible
keyboard focus state. Shared mtone `--mt-bg`, `--mt-fg`, `--mt-border`,
`--mt-subtle` and `--mt-focus` variables keep it consistent with existing controls.
Do not change separator thickness in CSS without checking pixel sizing and
separator hit testing. This version has no dedicated thickness token.


## Events, cancellation and collapsed content

- `onResizeStart` marks a user pointer, keyboard or separator-collapse interaction.
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
