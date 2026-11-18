# mtone API guide

Import all components by name from `@bixlab/mtone` and import `@bixlab/mtone/styles.css` once. Package includes TypeScript declarations. Below are the public contracts; detailed exact types are in the distributed `index.d.ts`.

## Provider and styling

`MtoneProvider` accepts `locale="zh" | "en"`, `density="compact" | "comfortable"` and `tokens` (CSS custom properties). All are optional. Without a provider components use Chinese, compact and default colors. `MtoneScope` applies the current provider context to a wrapper; popups do this automatically.

```tsx
<MtoneProvider
  locale="en"
  tokens={{ "--mt-fg": "#24332c", "--mt-primary": "#446c52" }}
>
  <Button>Save</Button>
</MtoneProvider>
```

Tokens: `--mt-fg` text, `--mt-text` alias, `--mt-muted`, `--mt-bg`, `--mt-subtle`, `--mt-border`, `--mt-primary`, `--mt-hover`, `--mt-height`, `--mt-radius`, `--mt-focus`. Prefer tokens to override the look; className/style are available on documented component types. Arbitrary Tailwind class precedence is not guaranteed. No global Preflight or host heading reset. Overlay z-index ranges are 1200–1300; integrate with host layers accordingly. This is not Shadow DOM isolation.

## Buttons and forms

- `Button`: `variant` solid/outline/soft/ghost, `size` sm/md/lg, `danger`, `loading`, `icon`, native/Base UI button props and ref. Loading disables actions.
- `IconButton`: Button props plus required `aria-label`.
- `ButtonGroup`: group wrapper.
- `Input`, `Textarea`, `SearchInput`: native input attributes, ref and onChange. SearchInput is an input with search icon, no global keyboard interception.
- `Form`: native form wrapper; no custom validation engine.
- `FormField`: `label`, `error`, `description`, `required`, one input child. Associates label/error with cloned child's id and ARIA attributes. Use direct label props for compound selectors rather than wrapping them as a native input.

## Selection

`Option = { value: string; label: ReactNode; disabled?: boolean }`.

- `Checkbox`, `Switch`: `checked`, `defaultChecked`, `onCheckedChange`, `label` or children, disabled; Checkbox also indeterminate.
- `RadioGroup`: options, value/defaultValue/onValueChange, label, orientation horizontal/vertical.
- `Select`: options, string/null value, defaultValue, onValueChange, placeholder, label, disabled, open/defaultOpen/onOpenChange. The dropdown chevron is a fixed 16px vector icon; long selected labels and placeholders truncate within constrained trigger widths without stretching or pushing out the icon. Selected options use a vertically centered 16px Lucide Check with a thin 1.5px stroke; selection semantics and APIs are unchanged.
- `MultiSelect`: options, string[] value, defaultValue, onValueChange, placeholder, label; searchable with removable chips. Use textual option labels for reliable filtering.
- `Slider`: number value/defaultValue/onValueChange, min/max/step, label, disabled.
- `NumberInput`: number/null value/defaultValue/onValueChange, min/max/step, label, disabled.
- `DatePicker`: single ISO `YYYY-MM-DD` value/defaultValue/onValueChange, min/max, disabledDate, label, disabled, name, clearable. **Uses the browser's native date calendar**: appearance and keyboard controls vary by platform; custom disabledDate is rejected on selection, not painted as disabled in the native calendar. No date range/time support.

## Navigation

- Sidebar, NavGroup(label), NavItem(active, icon, native button props): layout and navigation buttons. Routing remains the application's responsibility.
- Breadcrumb: items `{label,href?}`; final item is current page.
- Tree/DirectoryTree: legacy items `{id,label,children?,disabled?,icon?}`, value/defaultValue/onValueChange and expanded/defaultExpanded/onExpandedChange remain supported. New `treeData`, `selectedKeys` / `onSelect`, checkboxes with associated/strict checking, `loadData`, `draggable` / `onDrop`, virtual scrolling and ref navigation are available. Dragging reports intent; the application must update its data. Use stable unique string or finite-number keys. See [Tree reference](https://xingjianxu.github.io/mtone/#/components/Tree), installed declarations and [0.4.0 migration notes](MIGRATION.md).
- Tabs: items `{value,label,content,disabled?}`, value/defaultValue/onValueChange. Also supports line/card/editable-card variants, placement, sizes, overflow navigation, add/remove callbacks and panel lifecycle controls. The application owns item changes; see [Tabs reference](https://xingjianxu.github.io/mtone/#/components/Tabs).
- Segmented: options, value/defaultValue/onValueChange, label.
- FilterBar: flexible layout; FilterChip(children,onRemove).
- Pagination: total, pageSize (default10), **controlled** page/onPageChange.

## Menus and overlays

- DropdownMenu: trigger React element, items `{key,label,icon?,shortcut?,disabled?,danger?,onSelect?}`, onSelect(key), open/defaultOpen/onOpenChange.
- ContextMenu: same items and open contract, children are the right-click area.
- Popover: trigger, content, optional title and side.
- Tooltip: child trigger element, content, side. Supply accessible names on icon-only children.
- Dialog/Drawer: title, description, children, footer, optional trigger; open/defaultOpen/onOpenChange. Escape and close button restore focus. Drawer has right-edge interaction.
- ConfirmDialog: same basic dialog properties, onConfirm (sync/async), confirmText/cancelText/danger. Async failures remain open with error; pending action disables buttons.
- ToastProvider (alias Toast): wraps application, timeout and limit. `useToast().add({title,description})` creates a dismissible toast. Place inside MtoneProvider.

Triggers use Base UI's `render` composition. Custom trigger components must forward ref and DOM props; standard mtone Button does this.

## Content and status

- Card, Text(muted), Divider, List, ListItem(icon,description,actions): styled semantic wrappers.
- DocumentList: items `{id,title,description?,updatedAt?,icon?,onClick?}`. DocumentCard accepts one item.
- Badge: tone neutral/blue/green/orange/red/purple, onRemove optional.
- Status: tone, children. Avatar: name, src, size; falls back to initials on image error. AvatarGroup: items, max.
- Progress: value clamped0–100, label. PropertyList and PropertyItem(label): definition-list display.
- Alert: tone info/success/warning/error, title, children, onClose.
- Empty(title,description,action), Skeleton(native div props), Spinner(label).

## Table

### Version scope

This section describes the Table API introduced in **0.3.0**. Version 0.2.0 contains only the legacy API below. The [live documentation](https://xingjianxu.github.io/mtone/#/components/Table) follows `master` and may be newer than npm; check the declarations bundled with your installed version.

### Basic usage (legacy API retained)

```tsx
<Table
  data={rows}
  rowKey="id"
  selectable
  columns={[
    {
      key: "title",
      title: "标题",
      dataIndex: "title",
      sortable: true,
      filterable: true,
    },
    {
      key: "status",
      title: "状态",
      dataIndex: "status",
      render: (value) => <Badge>{String(value)}</Badge>,
    },
  ]}
  pagination={{ pageSize: 10 }}
/>
```

### Current Table API

- **Data and columns:** use `dataSource` (takes precedence) or legacy `data`, and `columns` or `Table.Column` / `Table.ColumnGroup` children. `rowKey` defaults to `"key"`; provide stable, unique string or number keys. Columns support nested `dataIndex` paths, grouped `children`, `render`, width/alignment, `hidden`, `responsive`, `ellipsis`, `fixed`, `onCell`, `onHeaderCell` and `shouldCellUpdate`. `column` supplies shared column defaults. Use `onCell` to supply `rowSpan` / `colSpan` for merged cells.
- **Sorting:** legacy `sortable` retains its simple behavior. `sorter` accepts a comparator or `{ compare, multiple }` for prioritized multi-column sorting. `sorter={true}` reports sorting intent rather than applying a local comparator. Use `sortOrder` / `defaultSortOrder` (`"ascend"`, `"descend"`, or `null`), `sortDirections`, `sortIcon` and `showSorterTooltip` for configuration.
- **Filtering:** legacy `filterable` provides case-insensitive text containment. Modern column `filters` and `onFilter` support menu/tree options, search, multiple selection, controlled `filteredValue`, defaults and reset behavior. `filterDropdown` can render a custom panel using `selectedKeys`, `setSelectedKeys`, `confirm`, `clearFilters` and `close`.
- **Selection:** legacy `selectable`, `selectedKeys` and `onSelectionChange` remain supported. `rowSelection` adds checkbox/radio selection, controlled/default keys, disabled rows, `checkStrictly={false}` tree association, `preserveSelectedRowKeys`, custom cells, callbacks and bulk actions. Bulk-action commands use mtone's `DropdownMenu`, not a value-holding Select. The application remains responsible for deciding when retained keys should be removed.
- **Pagination and remote data:** pagination is disabled by default. `pagination` supports controlled `page`/`current`, defaults, page size choices, quick jumping, totals, placement and callbacks. `manual` delegates sorting, filtering and paging to the application and does not reprocess supplied rows; supply the server total and controlled page.
- **Tree and expansion:** `expandable` configures tree children, controlled/default expanded keys, detail rows, custom icons and expansion callbacks. Render another Table in expanded content for nested tables.
- **Layout:** `scroll`, `sticky`, fixed columns, grouped headers, `size`, `bordered`, `showHeader`, `tableLayout`, row properties and custom `components` support richer layouts. `title`, `footer` and `summary` receive the current data; use `Table.Summary.Row` and `Table.Summary.Cell` for summary rows.
- **Virtualization:** enable `virtual`, preferably with numeric `scroll.x` and `scroll.y`. Defaults are a 1000×400 virtual viewport and `virtualItemHeight={38}`. The ref exposes `nativeElement` and `scrollTo` for row/index/offset positioning. Use `<Table.Summary fixed>` for summary rows with virtual scrolling; non-fixed summaries are not rendered by the virtual body. Validate complex combinations and custom body components in the target application.
- **Presentation:** `loading` accepts a boolean or `{ spinning?, tip?, delay?, indicator? }`. Use `empty`, `locale`, `classNames` and `styles` for empty-state content, text and semantic styling.

### Events and compatibility

The legacy `onChange(state)` remains unchanged: it receives `{ sort, filters, page, pageSize }`, with legacy sort directions `"asc"` / `"desc"`. Explicit `sort={null}` clears the controlled legacy sort. Use the new `onTableChange(pagination, filters, sorter, extra)` for modern array-valued filters, single/multiple sorter results and `extra.action` (`"paginate"`, `"sort"`, `"filter"`). Do not assign a four-argument handler to the legacy single-argument `onChange` prop.

`filterDropdownProps` supports only `open`, `onOpenChange`, `className` and `style`; sorter tooltip options support `title` and `target`; loading supports the fields listed above. Other popup, tooltip or loading-indicator props are not forwarded. Editing and row/column dragging are application compositions demonstrated in the live documentation, not automatic persistence or a spreadsheet engine. Column-width resizing is not built in. Exact current types are in `packages/mtone/src/table-types.ts` and the built declarations; use your installed package's declarations for a released version.

## Upload

```tsx
<Upload
  accept=".pdf,image/*"
  maxSize={10 * 1024 * 1024}
  upload={async (file, { signal, onProgress }) => {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/your-upload-api", {
      method: "POST",
      body,
      signal,
    });
    if (!response.ok) throw new Error("Upload failed");
    onProgress(100);
  }}
/>
```

Required adapter `upload(file,{signal,onProgress}) => Promise<unknown>`. Progress0–100. Props accept/maxSize(bytes)/multiple/disabled/onChange(files). Dropzone is an alias. Retry, cancel and removal abort active work; stale results cannot overwrite newer attempts. Validation is client convenience only; server must enforce file rules too. The component does not persist files, provide credentials or choose an endpoint. Documentation demo is explicitly simulated.

### Dialog dismissal

`Dialog` is the primary name (`Modal` / `ModalProps` remain deprecated aliases).
`modal?: boolean` defaults to `true`: outside clicks do not close the dialog.
Set `modal={false}` to allow outside clicks to close it. This option only controls
outside dismissal. Focus trapping, the backdrop, scroll locking, Escape, the close
button, and controlled `open` updates remain unchanged in both modes. It is not
forwarded as Base UI's `modal` option. Drawer and ConfirmDialog are unaffected.

### Selection icons

Select and MultiSelect use the same decorative 16px Lucide ChevronDown and
16px Check (1.5px stroke), keeping accessible labels unchanged. Checkbox uses
the same thin-line Check/Minus in a 12px icon to fit its 16px control. Native
table selection checkboxes and non-selection disclosure icons are unchanged.

## Mentions

`Mentions` (alias `Mention`) adds plain-text mention completion with mtone styling.
Available starting in 0.4.0. The live website follows master and can be ahead of npm;
check the declarations shipped in your installed package.

```tsx
const [value, setValue] = useState("");
<Mentions aria-label="评论" value={value} onChange={setValue}
  options={[{ value: "alice", label: "Alice" }, { value: "bob", label: "Bob" }]}
  allowClear autoSize={{ minRows: 2, maxRows: 5 }} />
```

- `value` / `defaultValue` are strings; `onChange(text)` is **not** a native change event. `onSelect(option, prefix)` reports candidate selection. Native textarea attributes and focus/blur events remain available. `ref` exposes `nativeElement`, `focus(options?)` and `blur()`.
- `options` contains `{ value, label?, key?, disabled?, className?, style? }`. `value` is inserted; `label` is display-only. The default filter matches `value` case-insensitively. Supply `filterOption(query, option)` or `false` for externally filtered options.
- `prefix` defaults to `"@"` and accepts strings or arrays, including multi-character prefixes. A trigger must follow the start of text, whitespace or `split` (default one space); email interiors do not activate it. Default searches stop at whitespace or split. `validateSearch(query, split)` replaces that validation. `split` is appended after selection only if not already present immediately after the caret.
- `onSearch(query, prefix)` lets the application replace `options`. Applications own fetching, debounce, errors and stale-response cancellation. Use `loading` to block selection during a pending search, and `notFoundContent` for an empty state. The documentation's async demo is a local simulation and uses a generation check plus cleanup to reject outdated results.
- `size` uses mtone's `"sm" | "md" | "lg"` (default md); `status` is `"error" | "warning"`. `autoSize` accepts a boolean or `{ minRows?, maxRows? }`; default false, `rows` defaults to 3. `allowClear` accepts a boolean or `{ clearIcon?, label?, tabIndex? }`; clearing also invokes `onClear`.
- Inserting an option that would exceed native `maxLength` does nothing; the option is never partially inserted.
- Suggestions follow the caret. `placement="top" | "bottom"` sets a preference, with viewport-aware flipping. `getPopupContainer()` overrides the default body portal; avoid transformed fixed-position containing blocks. `popupRender(menu)` should retain the supplied menu and its accessibility semantics. `onPopupScroll` supports application-managed pagination, not built-in virtualization.
- `className/style` target the root. `classNames/styles` are static objects keyed by `root`, `textarea`, `popup`, `option`, `clear`. Provider locale, density and tokens are retained in the portal.

Arrows move through enabled options; Enter selects; Escape closes; Tab closes and
moves focus normally. Composition keys are left to the IME. Native Home/End,
selection and editing semantics are preserved. The component remains plain text:
selection replaces only the trigger/query before the caret and retains text after
it. It does not render immutable mention chips or validate whether a person exists.

`getMentions(text, { prefix?, split? })` is a **standalone exported helper**, returning
`{ prefix, value }[]`. It applies boundary/whitespace splitting, not custom search
validation or membership checks. Values containing spaces need an application-specific
parsing strategy. Bind `Mentions` directly to `FormField` using its string change
contract; enforce membership and authorization on your server.

Use `options` for suggestions and MtoneProvider for theme configuration.
`Mentions.Option` children, variants, function-style semantic customization and
virtual suggestions are not supported. See the component catalog for the full
current declaration-backed API.

## Calendar

`Calendar` displays a month/date grid or a year/month grid using mtone styles.
It is a date-display component, separate from the native-input `DatePicker`.
All date values are ISO `YYYY-MM-DD` **strings**, not Dayjs or Date instances.
Supported years are `0001`–`9999`; year `0000` is invalid. Grid cells overflowing
these endpoints are empty.

```tsx
const [date, setDate] = useState("2026-11-16");
<Calendar value={date} onChange={setDate} showWeek
  cellRender={(current, info) =>
    info.type === "date" && current === "2026-11-16" ? "Release planning" : null}
/>
<Calendar fullscreen={false} defaultValue="2026-11-16"
  validRange={["2026-11-05", "2026-12-20"]} />
```

- `value` / `defaultValue`, `onChange` / `onValueChange`: controlled/uncontrolled date selection.
- `mode` / `defaultMode`: `month` (dates) or `year` (months); selecting a month keeps year mode.
- `onPanelChange(date, mode)` and `onSelect(date, { source })`: panel and selection notifications.
- `validRange` is inclusive; `disabledDate(date)` blocks individual dates; `disabled` blocks interaction.
- `fullscreen` defaults to true; false is compact card layout, not a browser full-screen operation.
- `locale` is `zh` or `en`, defaulting to `MtoneProvider`; `weekStartsOn` overrides week start (Chinese Monday, English Sunday), `showWeek` displays the ISO week number of each row’s Thursday.
- `cellRender(date, info)` appends content; `fullCellRender(date, info)` replaces the internal content while preserving the accessible cell button. Do not nest interactive controls inside either render result.
- `headerRender({ value, type, onChange, onTypeChange })` replaces the default Select/Button header.
- Exported types: `CalendarProps`, `CalendarMode`, `CalendarSelectInfo`, `CalendarCellInfo`, `CalendarHeaderInfo`, `CalendarSemanticSlot`.
- Invalid `value` / `defaultValue` or an invalid/reversed `validRange` throws `RangeError`. Initial defaults are clamped to range. Custom-header changes clamp valid dates to range, then check `disabledDate`; malformed strings are ignored.
- Both change callbacks run when supplied, only on actual value changes. Controlled callers must update `value` to accept a selection; refusing it preserves the selected date and panel, while keyboard focus navigation remains independent.
- Default-header navigation uses the first enabled day in the target month when its corresponding date is disabled. If no day is available, the value does not change.
- `classNames` and `styles` accept objects for `root`, `header`, `body`, `cell`.
- Direction keys, Home/End and Page Up/Down move focus; Shift + Page Up/Down moves by year. Enter/Space selects; Tab leaves the grid normally. Keyboard navigation skips disabled dates/months in its target direction, bounded to 366 probes; if no enabled cell is found, focus stays put.

The supported API does not include Dayjs values or locale objects,
legacy date/month render callbacks, lunar conversion, time/range selection or event drag-and-drop.
Use render callbacks for calculated lunar labels or event text and show interactive details outside
the calendar. No network request or data persistence is performed. Available starting in 0.4.0.
