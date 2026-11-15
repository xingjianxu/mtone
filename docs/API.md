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
- `Select`: options, string/null value, defaultValue, onValueChange, placeholder, label, disabled, open/defaultOpen/onOpenChange.
- `MultiSelect`: options, string[] value, defaultValue, onValueChange, placeholder, label; searchable with removable chips. Use textual option labels for reliable filtering.
- `Slider`: number value/defaultValue/onValueChange, min/max/step, label, disabled.
- `NumberInput`: number/null value/defaultValue/onValueChange, min/max/step, label, disabled.
- `DatePicker`: single ISO `YYYY-MM-DD` value/defaultValue/onValueChange, min/max, disabledDate, label, disabled, name, clearable. **Uses the browser's native date calendar**: appearance and keyboard controls vary by platform; custom disabledDate is rejected on selection, not painted as disabled in the native calendar. No date range/time support.

## Navigation

- Sidebar, NavGroup(label), NavItem(active, icon, native button props): layout and navigation buttons. Routing remains the application's responsibility.
- Breadcrumb: items `{label,href?}`; final item is current page.
- Tree: items `{id,label,children?,disabled?,icon?}`, value/defaultValue/onValueChange, expanded/defaultExpanded/onExpandedChange, label. Arrow keys, Home/End, Enter/Space supported; no drag/drop or lazy-loading protocol.
- Tabs: items `{value,label,content,disabled?}`, value/defaultValue/onValueChange.
- Segmented: options, value/defaultValue/onValueChange, label.
- FilterBar: flexible layout; FilterChip(children,onRemove).
- Pagination: total, pageSize (default10), **controlled** page/onPageChange.

## Menus and overlays

- DropdownMenu: trigger React element, items `{key,label,icon?,shortcut?,disabled?,danger?,onSelect?}`, onSelect(key), open/defaultOpen/onOpenChange.
- ContextMenu: same items and open contract, children are the right-click area.
- Popover: trigger, content, optional title and side.
- Tooltip: child trigger element, content, side. Supply accessible names on icon-only children.
- Modal/Drawer: title, description, children, footer, optional trigger; open/defaultOpen/onOpenChange. Escape and close button restore focus. Drawer has right-edge interaction.
- ConfirmDialog: same basic dialog properties, onConfirm (sync/async), confirmText/cancelText/danger. Async failures remain open with error; pending action disables buttons.
- ToastProvider (alias Toast): wraps application, timeout and limit. `useToast().add({title,description})` creates a dismissible toast. Place inside MtoneProvider.

Triggers use Base UI's `render` composition. Custom trigger components must forward ref and DOM props; standard mtone Button does this.

## Content and status

- Card, Text(muted), Divider, List, ListItem(icon,description,actions): styled semantic wrappers.
- DocumentList: items `{id,title,description?,updatedAt?,icon?,onClick?}`. DocumentCard accepts one item.
- Tag/Badge: tone neutral/blue/green/orange/red/purple, onRemove optional.
- Status: tone, children. Avatar: name, src, size; falls back to initials on image error. AvatarGroup: items, max.
- Progress: value clamped0–100, label. PropertyList and PropertyItem(label): definition-list display.
- Alert: tone info/success/warning/error, title, children, onClose.
- Empty(title,description,action), Skeleton(native div props), Spinner(label).

## Table

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
      render: (value) => <Tag>{String(value)}</Tag>,
    },
  ]}
  pagination={{ pageSize: 10 }}
/>
```

`Table<T>` accepts data, columns, rowKey (keyof T or `(row)=>React.Key`), selectable, selectedKeys/onSelectionChange, sort, filters, onChange, manual, pagination, empty, loading. Columns: key/title/dataIndex/render(value,row,index)/sortable/filterable. Sorting is single-column, filtering is case-insensitive text containment. Remote mode `manual` delegates sorting/filtering/paging to application and never reprocesses supplied rows; provide pagination.total and controlled page. `onChange` receives `{sort,filters,page,pageSize}`. Explicit `sort={null}` clears controlled sort. Row keys must be unique strings or numbers. Selection persists across pages; application controls removal of stale keys when data changes.

No spreadsheet editing, frozen columns, virtualization or column resizing in this release.

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
