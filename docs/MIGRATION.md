# Upgrade notes for 0.8.0

- Remove `density` from `MtoneProvider`. The compact/comfortable modes and their `data-density` attributes are no longer present. Theme and locale remain independent.
- Default single-line controls and sidebar navigation rows now use a 34px outer height. Remove legacy height overrides if you want the new default, or use explicit size variants where supported. MultiSelect still grows when chips wrap. See [control heights](CONTROL-HEIGHTS.md).
- Expanded `NavItem` renders plain-text and numeric labels in `.mt-nav-item-label` for single-line truncation. Complex children keep their previous structure; review custom direct-child selectors that depend on plain label markup.

# Upgrade notes for 0.7.0

- Themes are opt-in for the library: the default remains `light`. Set `theme="dark"` or `theme="system"` on `MtoneProvider`; a nested `MtoneScope` can override the inherited theme. Review custom hard-coded colors when enabling dark mode.
- TagSelect is a new component with string-array values; select-all only acts on enabled options.
- List sorting remains application-controlled. `List.SortHandle` and `ListItem.sortHandle` provide a drag grip, not an automatic reorder engine. Supply keyboard reordering separately.
- Virtual lists with sticky groups now wrap each group heading in `.mt-list-group-boundary`; the inner heading retains `.mt-list-group`. Review custom `li.mt-list-group` or direct-child selectors.
- AdminLayout has been the published name since 0.6.0; no Layout compatibility alias is provided.

# Breaking changes in 0.6.0

- `Layout` has been renamed to `AdminLayout` without a compatibility alias. Update your import and all JSX references (including `Layout.Sider`, `Layout.Header`, `Layout.Content`, and `Layout.Footer`). Rename component-specific types to `AdminLayoutProps`, `AdminLayoutSiderProps`, `AdminLayoutHeaderProps`, and `AdminLayoutContentProps`. Behavior and CSS hooks are unchanged.

```tsx
import { AdminLayout, type AdminLayoutProps } from "@bixlab/mtone";

const props: AdminLayoutProps = { hasSider: true };
const page = <AdminLayout {...props}><AdminLayout.Sider /><AdminLayout.Content>Content</AdminLayout.Content></AdminLayout>;
```

Spotlight now keeps its top edge fixed while results change, rather than centering vertically. Other dialogs retain their existing positioning.

# Upgrade notes for 0.5.0

- Input/Textarea now have a stable wrapper. Native refs, `onChange(event)`, `className` and `style` still target the actual input. Review direct-child selectors and flex/grid layouts; use `wrapperClassName` for the wrapper. Input `prefix` now means decorative content, not the native RDFa attribute.
- `Menu` is the preferred name; `DropdownMenu` remains compatible. Menu entries now include groups, separators and submenus. Narrow by `type` before reading action-only fields. Popup content sizing and mounted-but-hidden overlays may affect custom CSS and DOM queries; query visible popups.
- Progress retains `value`, `label` and its default compact line, but adds a track wrapper. Replace `.mt-progress > span` overrides with `.mt-progress-fill`, or prefer `color`, `trackColor` and `strokeWidth`.
- List/ListItem children usage remains supported. In the new data mode, `renderItem` returns row content, not `li` or ListItem. The new ref is a `ListHandle`; use `ref.current.element` for its native list element.
- TreeSelect is new. Its single-selection value is nullable; multiple selection uses arrays. Follow the `multiple` discriminator and installed declarations.

# Upgrade notes for 0.4.0

- `TreeItem.id` now accepts `string | number`. Narrow the type or use `String(id)` when passing it to string-only code. Numeric keys use `selectedKeys` / `onSelect`; legacy `value` / `onValueChange` remain string-only.
- Tree now rejects duplicate keys and keys that are neither strings nor finite numbers. Ensure keys are stable and unique before rendering.
- AvatarGroup overflow now uses an interactive popover button; review custom DOM/CSS selectors targeting the previous static +N avatar.
- Tree `defaultExpandParent` defaults to `true`, automatically expanding ancestors of `defaultExpanded` nodes. Set it to `false` to retain exact legacy default-expanded lists.
- Tabs now initially selects the first enabled item. Removing or disabling the current uncontrolled item selects an enabled fallback and calls `onValueChange`. Controlled consumers remain responsible for supplying a valid enabled value.

## Additions

`Mentions` (`Mention` alias) is a new, opt-in plain-text mention component, available starting in 0.4.0. No existing input API changes. It uses `onChange(text: string)`, unlike
`Textarea`'s native change event. Size values are `sm` / `md` / `lg`.
Use `options` for suggestions, MtoneProvider for theme configuration, and the
standalone `getMentions` export for parsing. `Mentions.Option`, variants and
static `Mentions.getMentions` are not provided. See the
[API guide](API.md#mentions) for the supported API.

# Breaking changes in 0.3.0

## Card title

`Card.title` now renders a visible header instead of the native HTML tooltip.
Replace `<Card title="Tooltip">` with `<Card htmlTitle="Tooltip">` to keep the
old tooltip behavior. Plain Cards retain their previous markup and styling.

## Modal renamed to Dialog

Use `Dialog` and `DialogProps` in new code. `Modal` and `ModalProps` remain
deprecated aliases for compatibility. The old documentation URL also resolves to Dialog.

When upgrading from 0.2.0, note the new `modal` default is `true`, so outside
clicks **do not close** the dialog by default. Set `modal={false}` to retain
the earlier outside-dismissal behavior.

For users of intermediate, unreleased checkouts only: the short-lived
`closeOnOutsideClick` option has been replaced by `modal` with inverted semantics.
Use `modal={!oldCloseOnOutsideClick}` for an explicit old value.

This option only controls outside dismissal. Focus trapping, the backdrop,
scroll locking, Escape, and the close button remain unchanged. Existing styling
classes remain unchanged. Drawer and ConfirmDialog do not receive this option.

## Table compatibility

Legacy `data`, `sort`, textual filters and `onChange(state)` remain supported.
Use `onTableChange` for the new four-argument callback; legacy `onChange`
continues to receive a single state argument. See [API guide](API.md#table) for limits.

# Breaking changes in 0.2.0

## Tag consolidated into Badge

`Tag` is no longer exported. Replace `import { Tag } from "@bixlab/mtone"` with
`import { Badge } from "@bixlab/mtone"` and rename JSX `<Tag>` / `</Tag>` to
`<Badge>` / `</Badge>`.

Badge retains all previous behavior: six `tone` values, optional `onRemove`,
children, native span attributes, and localized accessible removal labels.
Applications still manage removal state themselves.

If you override the internal CSS class `.mt-tag`, update it to `.mt-badge`.
The documentation gallery now lists only Badge.
