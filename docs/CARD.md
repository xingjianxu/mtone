# Card

`Card` is a styled, compact content container. It remains part of the single
`@bixlab/mtone` package: there is no per-component installation step.

```tsx
import { Card, Button } from '@bixlab/mtone';
import '@bixlab/mtone/styles.css';

<Card title="Project notes" extra={<Button size="sm">Edit</Button>}>
  Content
</Card>
```

## Compatibility and migration

A Card with only `children` keeps the original medium appearance: 16px body
padding, a 1px border and 6px radius by default. Existing `className`, `style`,
ARIA attributes and applicable div events still apply to its root. With no new
structural Card props, the original direct-child DOM and root padding behavior
are preserved; `htmlTitle` alone does not create extra wrappers. Supplying new
Card features enables the structured header/body/footer layout.

**`title` now means a visible Card title**, not the HTML tooltip attribute. This
is an intentional API change. Migrate existing tooltips explicitly:

```tsx
// Before: title was forwarded to the native div.
<Card title="Tooltip text">Content</Card>
// Now:
<Card htmlTitle="Tooltip text">Content</Card>
// A visible heading and an optional tooltip can coexist:
<Card title="Project notes" htmlTitle="Project overview">Content</Card>
```

The supported mtone API is documented
in the mtone catalog and its TypeScript declarations. In particular:

- `size` is `medium | small`; `default` is not a supported size.
- Use `variant="outlined" | "borderless"`, not `bordered`.
- Use semantic `styles`/`classNames`, not `bodyStyle`/`headStyle`.
- `tabProps` currently accepts only `className`, the existing mtone Tabs styling
  hook. Other Tabs props are not forwarded.
- Meta and Grid are `Card.Meta` and `Card.Grid`, not standalone named exports.

## Structure and presentation

`title` and `extra` form the header. A string title is not automatically a
heading landmark; pass a suitable `<h2>` or `<h3>` when the page structure calls
for a heading. `cover` is a separate cover region, suitable
for an image or other React content. Supply image alternative text when the
image conveys information; decorative images should use an empty `alt`.

`actions` is an array of nodes rendered at the bottom. Use real `Button`,
`Button iconOnly` or link elements for actions. A string or icon alone does not become
an accessible button automatically. Give icon-only actions an accessible name.

`size="small"` reduces spacing. `variant="borderless"` hides the visible border while preserving its outer geometry.
`type="inner"` gives nested content a quieter header treatment. These options
can be combined. `hoverable` adds visual hover feedback only; it does not make
the Card a button or add keyboard activation. Prefer an explicit internal link
or button rather than a click handler on the entire card.

`loading` uses the existing Skeleton component rather than a new loading
implementation. `loadingLabel` supplies the loading announcement. The runnable
website example toggles loading locally and does not fetch or persist data.

## Controlled and uncontrolled tabs

`tabList` contains items with a unique `key`, a `label`, optional `disabled` and
optional `content`. When an item has no content, the Card's `children` supplies
its body. This makes externally controlled content straightforward:

```tsx
const [active, setActive] = useState('summary');

<Card
  title="Project"
  tabList={[
    { key: 'summary', label: 'Summary' },
    { key: 'notes', label: 'Notes' },
  ]}
  activeTabKey={active}
  onTabChange={setActive}
  tabBarExtraContent={<Badge>Local</Badge>}
>
  {active === 'summary' ? <Summary /> : <Notes />}
</Card>
```

Alternatively, put content on each tab item and use `defaultActiveTabKey` for an
uncontrolled card. Without an explicit initial key, the first enabled tab is
selected. If an uncontrolled selection is removed or disabled, it falls back
to the first enabled tab. An invalid controlled key has no active panel, so the
caller should keep its key synchronized with the list. Controlled callers must update `activeTabKey` in response to
`onTabChange`. `tabBarExtraContent` belongs to the tabs area and is separate from
the header's `extra`.

Keyboard navigation and tab/tabpanel semantics are provided by the existing
mtone Tabs. Loading does not create a second tab control implementation.

## Meta and Grid

```tsx
<Card title="People">
  <Card.Meta
    avatar={<Avatar name="Lin" />}
    title="Lin"
    description="Design systems"
  />
</Card>

<Card title="Shortcuts" size="small">
  <Card.Grid>Overview</Card.Grid>
  <Card.Grid>Documents</Card.Grid>
  <Card.Grid hoverable={false}>History</Card.Grid>
</Card>
```

Meta accepts optional `avatar`, `title` and `description`, native div attributes,
`htmlTitle` and semantic styling. Grid accepts native div attributes and
`hoverable` (default `true`). Place Grid items directly inside Card to activate
its responsive grid layout. Custom wrappers are not automatically identified as
Grid items. Grid items are not buttons; use semantic interactive content inside
them when navigation or actions are needed.

## Semantic styles

Both object and callback forms are supported. The callback receives `{ props }`.
Card semantic keys: `root`, `header`, `title`, `extra`, `cover`, `body`, `actions`,
`tabs`. Meta keys: `root`, `section`, `avatar`, `title`, `description`.

```tsx
<Card
  title="Notes"
  classNames={{ body: 'project-card-body' }}
  styles={({ props }) => ({
    header: { background: props.type === 'inner' ? '#f7f7f5' : 'transparent' },
    body: { padding: 12 },
  })}
>
  Content
</Card>
```

Treat these hooks as the stable customization interface rather than depending
on incidental descendant structure. Explicit styles can override compact
defaults, so test narrow layouts and long labels after customization.


## Theme tokens

`tokens` accepts per-card theme values. Lengths accept numbers (converted to px)
or CSS length strings; colors accept strings. The corresponding CSS variables
can also be set through `MtoneProvider` tokens for inherited application themes.

| CardTokens key | CSS variable | Default |
| --- | --- | --- |
| bodyPadding | --mt-card-body-padding | 16px |
| bodyPaddingSM | --mt-card-body-padding-sm | 12px |
| headerPadding | --mt-card-header-padding | 16px |
| headerPaddingSM | --mt-card-header-padding-sm | 12px |
| headerHeight | --mt-card-header-height | 42px minimum |
| headerHeightSM | --mt-card-header-height-sm | 36px minimum |
| headerFontSize | --mt-card-header-font-size | 14px |
| headerFontSizeSM | --mt-card-header-font-size-sm | 13px |
| headerBg | --mt-card-header-bg | transparent, or subtle for inner |
| actionsBg | --mt-card-actions-bg | transparent |
| actionsPadding | --mt-card-actions-padding | 8px per action |
| borderRadius | --mt-card-border-radius | 6px |
| gridMinWidth | --mt-card-grid-min-width | 180px, bounded by available width |

```tsx
<Card
  title="Compact project"
  tokens={{ bodyPadding: 12, headerBg: 'var(--mt-subtle)', gridMinWidth: 160 }}
>
  Content
</Card>
```

Existing shared `--mt-bg`, `--mt-border`, `--mt-subtle` and `--mt-muted` tokens
continue to control background, borders and secondary colors. Header heights
are minimums, not hard clipping bounds, so long titles can wrap. To adjust
content spacing specifically, use `styles.body` or body padding tokens rather
than root `style.padding`; the latter adds padding around the entire structure.
Explicit root `style` wins over `styles.root` and per-card token declarations
when the same property is supplied. Specific section styles override their
stylesheet defaults.
