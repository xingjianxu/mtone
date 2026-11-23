# Changes on master after 0.12.0

These changes are not in 0.12.0. Use the documentation for your installed release.

## Split native Table and DataTable

The old advanced `Table` is now named `DataTable`, with no compatibility alias for that old meaning of `Table`. When you use `dataSource` or legacy `data`, `columns`, row selection, pagination, virtualization, or any other advanced prop, switch the import and JSX to `DataTable`. Replace advanced types such as `TableProps<T>`, `TableColumn<T>`, and `TableRef` with `DataTableProps<T>`, `DataTableColumn<T>`, and `DataTableRef`; `SortOrder` becomes `DataTableSortOrder`. Use `DataTable.Column`, `DataTable.ColumnGroup`, `DataTable.Summary`, and constants such as `DataTable.EXPAND_COLUMN` and `DataTable.SELECTION_COLUMN`. Existing behavior, advanced CSS selectors and callback prop names such as `onTableChange` are unchanged.

```tsx
import { DataTable, type DataTableColumn } from "@bixlab/mtone";

const columns: DataTableColumn<{ id: string; name: string }>[] = [
  { title: "项目", dataIndex: "name" },
];
const projects = <DataTable rowKey="id" columns={columns} dataSource={[{ id: "p1", name: "组件文档整理" }]} />;
```

The new `Table` is for native JSX cells, not data-driven props. Its `TableProps` are non-generic native table props plus `bordered`, `striped`, and `highlightOnHover`. See the separate [Table](https://xingjianxu.github.io/mtone/#/components/Table) and [DataTable](https://xingjianxu.github.io/mtone/#/components/DataTable) examples.

## DataTable and DataList toolbar slots

Replace a separate Toolbar over DataTable with `toolbar={<Toolbar … />}` when
they should share a frame. Remove any extra wrapper border, clipping and
DataTable border reset used to make the old arrangement look like one box.

DataList no longer constructs a toolbar from `search`, `selection` or
`toolbar`. The optional `toolbar` prop now takes the complete header
content, typically a `Toolbar` with explicit slots.

| Before | Now |
| --- | --- |
| Set `search.label` or `search.placeholder` | Pass them to `<DataList.Search />` inside the toolbar. Keep `value`, `defaultValue`, `onChange` and `match` in `search`. |
| Set `filters` to a filter control | Put the control in a Toolbar slot. Keep the local predicate in `filter`. |
| Let `selection` automatically show select-all and a count | Keep `selection` for row checkboxes and add `<DataList.Selection />` to the toolbar for the header controls. |
| Set `renderBatchActions` | Pass the same render function as children of `DataList.Selection`; `selectedKeys` and `clearSelection` are unchanged. |
| Pass extra controls to `toolbar` | Put them in a slot of the complete toolbar you provide. |

For example, replace the header-related props with the following composition:

```tsx
<DataList
  aria-label="Documents"
  items={documents}
  getKey={(item) => item.id}
  renderItem={(item) => item.title}
  search={{ match: (item, query) => item.title.includes(query) }}
  selection={{}}
  toolbar={
    <Toolbar background="gray"
      search={<DataList.Search label="Search documents" />}
      start={<DataList.Selection />}
    />
  }
/>
```

# Upgrade notes for 0.12.0

Start with the Select migration when upgrading from 0.11.1 to 0.12.0. The later sections also cover earlier releases.

## Select multiple mode

Starting in 0.12.0, `MultiSelect` and `MultiSelectProps` are removed with no compatibility aliases. Replace `MultiSelect` with `Select` and add `mode="multiple"`. Use `SelectMultipleProps` for props that include the mode, or `Omit<SelectMultipleProps, "mode">` if a wrapper supplies it. Values and callbacks remain `string[]` for multiple fields; the default single mode continues to use `string | null`. If you styled the previous `.mt-multiselect` selector, target `.mt-select-multiple` instead.

```tsx
import { Select } from "@bixlab/mtone";

const roles = <Select mode="multiple" label="Roles" defaultValue={["read"]} options={[{ value: "read", label: "Read" }]} />;
```

## Searchable selection popover

When your installed mtone includes popup search, replace `Popover.SearchableSelect` with `Select searchable="popup"`; no compatibility alias is provided. Rename `items` to `options`, `title` to `popupTitle`, and `width` to `popupWidth`; remove Popover-specific `align` or `side` settings. Preserve the trigger and selected state, and use `renderOption(option)` for icons or other non-interactive option content. The selection value is `string | null`. Use `searchable={true}` if you prefer typing directly in the Select field.

```tsx
import { Select } from "@bixlab/mtone";

const repositoryPicker = (
  <Select searchable="popup" trigger="Switch repository" popupTitle="Repositories"
    options={[{ value: "mtone", label: "mtone" }]} defaultValue="mtone" />
);
```

# Upgrade notes for 0.10.x

This release consolidates overlapping components and removes the old names without compatibility aliases.

| Removed export | Use instead |
| --- | --- |
| `Badge` | `Tag` |
| `FilterChip` | `Tag variant="filter"` |
| `FilterBar` | Compose filter tags and controls; see the Tag documentation example |
| `Dropzone` | `Upload` |
| `Segmented` | `RadioGroup variant="segmented"` |
| `Toast` | `ToastProvider` with `useToast` |
| `DirectoryTree` | `Tree directory` |
| `AiChainOfThought` / `AiChainOfThoughtProps` | `AiTask` / `AiTaskProps`; set a summary title explicitly |
| `Modal` / `ModalProps` | `Dialog` / `DialogProps` |
| `DropdownMenu` / `DropdownMenuProps` | `Popover.Menu` / `PopoverMenuProps` for a triggered menu |
| `Mention` | `Mentions` |
| `SearchInput` | `Input.Search` |
| `Textarea` | `Input.TextArea` |
| `FormField` | `Form.Item` |

## Menu triggers

`Menu` now renders the menu content only. If you used `<Menu trigger={...} items={...} />`, switch to `<Popover.Menu trigger={...} items={...} />` and use `PopoverMenuProps` for the trigger-based API. For mixed content such as a card, use `Popover` with a custom `content` node. An inline `Menu` inside a generic `Popover` does not automatically dismiss it when an item is selected; use controlled open state if needed.

```tsx
import { Popover } from "@bixlab/mtone";

const actions = <Popover.Menu trigger="Actions" items={[{ key: "edit", label: "Edit" }]} />;
```

# Upgrade notes for 0.9.0

## Removed exports

- Replace `IconButton` with `Button iconOnly` and retain a meaningful `aria-label` or `aria-labelledby`. Icon-only buttons are square at the chosen Button size. Prefer checking installed types for refs and native button attributes.
- Replace `Dropdown` and `DropdownProps` with `Popover` and `PopoverProps`. Keep existing `trigger`, `content`, `open`, `defaultOpen`, `onOpenChange`, `width` and `label` where relevant. If you relied on Dropdown’s implicit start alignment, add `align="start"`; Popover defaults to centered alignment. `DropdownMenu` is still the Menu alias, not an alias for Popover.

```tsx
import { Button, Popover } from "@bixlab/mtone";

const remove = <Button iconOnly aria-label="Remove">×</Button>;
const details = <Popover trigger={<Button>Details</Button>} content={<p>More details</p>} align="start" />;
```

## Sizing and composition

- Default single-line controls, sidebar navigation and Tabs items use a 32px outer height with 20px single-line text. Multiline controls still grow. See [control heights](CONTROL-HEIGHTS.md) for scoped `--mt-height` overrides and exclusions.
- Buttons and ButtonGroup use `small` / `normal` / `large` (28 / 32 / 36px), and `sm` / `md` / `lg` still work. Buttons without an explicit size inherit their nearest ButtonGroup size.
- A NavItem with trailing actions wraps the trigger and actions as siblings. Custom CSS expecting that item to be a direct child of a navigation group should account for the wrapper; items without actions retain their existing trigger structure.
- With Tabs `indicatorColor`, `"coral"` now uses the theme token. Use `"#ff7f50"` to retain the standard CSS named color when migrating an existing value.

# Upgrade notes for 0.8.0

- Remove `density` from `MtoneProvider`. The compact/comfortable modes and their `data-density` attributes are no longer present. Theme and locale remain independent.
- Default single-line controls and sidebar navigation rows now use a 34px outer height in 0.8.0. Remove legacy height overrides if you want that version’s default, or use explicit size variants where supported. MultiSelect still grows when chips wrap. See [control heights](CONTROL-HEIGHTS.md).
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
deprecated aliases for compatibility. The legacy URL was available in earlier documentation releases.

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

## Tag consolidated into Badge (0.2.0 through 0.9.0)

Those releases exported `Badge` instead of `Tag`. Use this note only when
targeting those releases; the current source uses `Tag` again.

## Unreleased: Upload and RadioGroup consolidation

- Replace `Dropzone` with `Upload` without changing props. Click-to-select and drag-and-drop use the same upload area.
- Replace `Segmented` with `RadioGroup variant="segmented"`. Keep the existing options and value props; the segmented style defaults to horizontal.

## Unreleased: Badge renamed to Tag

- Replace the `Badge` import and JSX with `Tag`. The `tone`, `onRemove`, children, and native span attributes are unchanged.
- Replace custom selectors for `.mt-badge` with `.mt-tag`. Use the new Tag documentation page; the old page is not redirected.

## Unreleased: filter controls are composed with Tag

- Replace `<FilterChip onRemove={remove}>…</FilterChip>` with `<Tag variant="filter" onRemove={remove}>…</Tag>`. A filter tag does not remove itself.
- Replace `FilterBar` with a regular flex container (`display: flex`, `align-items: center`, `flex-wrap: wrap`, `gap: 8px`). Neither old component name remains exported. See the [Tag filter example](https://xingjianxu.github.io/mtone/#/components/Tag?section=filter).
- If you customized the old filter-chip CSS selector, use `.mt-tag-filter`.
