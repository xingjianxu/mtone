# mtone API guide

Import all components by name from `@bixlab/mtone` and import `@bixlab/mtone/styles.css` once. Package includes TypeScript declarations. Below are the public contracts; detailed exact types are in the distributed `index.d.ts`.

## Version scope

This guide describes the repository's current `master` API, not a promise that every
feature is present in the latest published npm package. The live documentation also
follows `master`. Check the `index.d.ts` and `llms.txt` bundled with your installed
`@bixlab/mtone` version before using newer features. Merging code or updating the
website does not publish a new npm version.

## AI interface components

The AI interface components are presentation and interaction building blocks.
The application owns messages, model requests, tool execution, attachments,
permissions, persistence, and trusted source data. The documentation demos are
local examples, not a model or platform integration. Localized defaults follow
the mtone provider locale.

### Conversation and input

| Export | Main contract |
| --- | --- |
| `AiChat` | `children`, `empty`, and `footer` compose the conversation. `autoFollow` defaults to true; `bottomThreshold` defaults to 64 px. Give the layout a bounded height for internal scrolling. |
| `AiMessage` | Required `from` is user, assistant, or system; use `name`, `avatar`, `children`, `actions`, `status`, and `statusLabel` to customize presentation. |
| `AiPromptInput` | Required `onSubmit({ text, attachments })` may return a promise. Use `value` + `onValueChange` or `defaultValue`, and `status` + `onStop` for generation. Enter submits and Shift+Enter inserts a newline; IME composition does not submit. Use `attachments`, `onFilesSelect`, `onAttachmentRemove`, `accept`, and `multiple` for caller-owned files. Files are never uploaded automatically. Clear text or attachments in the application when appropriate. |
| `AiSuggestion` | `prompt` and `onSelect(prompt)`; inherits Button props. The application decides how to use the prompt. |
| `AiModelSelector` | Controlled `models`, `value`, `onValueChange`; optionally present `efforts`, `effort`, and `onEffortChange`. Choices are app-defined and do not grant access. |

[Conversation demos and reference](https://xingjianxu.github.io/mtone/#/components/AiChat)

### Work progress and decisions

The disclosure panels use `title`, `status`, `statusLabel`, `open`,
`defaultOpen`, and `onOpenChange`. `AiActivityStatus` is `pending`, `running`,
`completed`, `error`, or `cancelled`; an `AiActivityStep` has a stable
`id`, `title`, and optional `description` and `status`.

| Export | Main contract |
| --- | --- |
| `AiPlan` | Required `items`; shows the number of completed steps and starts open by default. |
| `AiQueue` | Required `items`; separates completed/cancelled from remaining items and starts open by default. |
| `AiTask` | Optional `steps` and children for task progress or a caller-provided public summary. Set `title` for the latter; does not obtain or reveal hidden reasoning. |
| `AiReasoning` | Required `text` for a caller-provided public explanation; does not access hidden reasoning. |
| `AiSubagent` | Required `name` and optional `description`, `result`; does not launch or control agents. |
| `AiTool` | Required `name` and optional plain-text `input`, `output`; does not call tools. |
| `AiCheckpoint` | `label`, `description`, `onRestore`, `restoreLabel`, `disabled`; restoration is an app action, not a component side effect. |
| `AiConfirmation` | Controlled `state` (pending/approved/rejected), `busy`, `onConfirm`, `onReject`, and custom labels. It displays requests and decisions, not authorization or execution. |

[Activity demos and reference](https://xingjianxu.github.io/mtone/#/components/AiPlan)

### Evidence and developer output

| Export | Main contract |
| --- | --- |
| `AiSources` | Required `sources: AiSource[]`, optional `defaultOpen`; shows titles, descriptions, and safe links. |
| `AiInlineCitation` | Required `source: AiSource`, optional `index`. `AiSource` has `id`, `title`, and optional `url` and `description`. |
| `AiContext` | Required `usedTokens`, optional `maxTokens`, `inputTokens`, `outputTokens`, and caller-formatted `cost`; does not count tokens or calculate billing. |
| `AiFileTree` | Required `items: AiFileNode[]`, controlled `selectedId` or `defaultSelectedId`, optional `onSelect` and `defaultExpandedIds`; does not read the filesystem. |
| `AiStackTrace` | Required `message` and `frames` with file and optional line, column, and function name. |
| `AiTerminal` | Required plain-text `output` and optional `status` (idle/running/success/error); does not start a process. |
| `AiTestResults` | Required `results`, optional `defaultOpen`; displays passed, failed, skipped, and running tests without running them. |

Citations link only supported safe HTTP(S), root-relative paths or anchors.
Other values render as non-link text; the app remains responsible for verifying
source content and access. Supply stable IDs for evidence lists and file trees.

[Evidence demos and reference](https://xingjianxu.github.io/mtone/#/components/AiSources)

## Provider and styling

Migration: remove the former `density` prop. Compact/comfortable modes are no longer part of the provider or scope API; single-line controls use a unified 32px default. Independent component `size` variants and CSS token overrides remain supported. Tabs use the same 32px height for every tab item; their separate size prop still varies typography.

`MtoneProvider` accepts `locale="zh" | "en"`, `theme="light" | "dark" | "system"` and `tokens` (CSS custom properties). All are optional. Without a provider components use Chinese, a 32px default control baseline and light colors. `theme="system"` responds immediately to the operating system color preference. A nested `MtoneScope theme="light"` (or `"dark"` / `"system"`) overrides just that subtree, including its mtone popups. Nested scopes and providers inherit the enclosing theme when omitted. The library does not read or store the selection.

```tsx
<MtoneProvider
  locale="en"
  tokens={{ "--mt-fg": "#24332c", "--mt-primary": "#446c52" }}
>
  <Button>Save</Button>
</MtoneProvider>
```

Tokens: `--mt-fg` text, `--mt-text` alias, `--mt-muted`, `--mt-bg`, `--mt-subtle`, `--mt-border`, `--mt-primary`, `--mt-hover`, `--mt-height`, `--mt-radius`, `--mt-focus`. Prefer tokens to override the look; className/style are available on documented component types. Arbitrary Tailwind class precedence is not guaranteed. No global Preflight or host heading reset. Overlay z-index ranges are 1200–1300; integrate with host layers accordingly. This is not Shadow DOM isolation.

### Shared theme accents

Use the theme-aware `--mt-accent-neutral`, `--mt-accent-blue`, `--mt-accent-green`, `--mt-accent-orange`, `--mt-accent-red`, `--mt-accent-purple`, `--mt-accent-teal`, and `--mt-accent-coral` tokens in component styles (for example, `color: var(--mt-accent-teal)`). The optional `MtoneAccent` type enumerates their keys. The palette follows light, dark or system mode. Override values under an application scope, for example `<MtoneProvider tokens={{ "--mt-accent-teal": "#25686c" }}>`. Existing components keep their colors unless they explicitly use these tokens. Coral uses `#D1634B` in light mode and `#FD8C73` in dark mode (including system dark). Treat it as a decorative accent by default and check contrast before using it for text; it is not a new Tag tone or a replacement for danger. In preset-aware values such as Tabs `indicatorColor`, `"coral"` means the mtone preset; use `"#ff7f50"` for the CSS keyword’s standard color.

## Buttons and forms

- `Button`: `variant` blue/solid/outline/soft/ghost, `size` small / normal / large (28 / 32 / 36px, with sm / md / lg as aliases), `danger`, `loading`, `icon`, `leftSection`, `rightSection`, native/Base UI button props and ref. The optional sections accept React nodes and follow logical inline start/end (flipped in RTL); a supplied `leftSection` takes precedence over the legacy `icon`. Loading disables actions, displays a spinner instead of the leading content, and keeps the trailing section. Use `preset="dropdown"` for a decorative 14px trailing chevron only; an explicit `rightSection` replaces it, and `null` hides it. Menu behavior is separate.
- `Button iconOnly`: square icon-only mode with the same variants, sizes, loading, and toggle behavior. Give it an accessible name with either `aria-label` or `aria-labelledby`. See the [icon-only example](https://xingjianxu.github.io/mtone/#/components/Button?section=icon-only).
- `ButtonGroup`: optional `size` using the same names as Button. Button descendants without an explicit size inherit it, including a Popover.Menu trigger composed from Button. A nested group can override its outer group; ungrouped buttons default to normal.
- `Input`: native input attributes, native ref and `onChange(event)`, with `prefix`, `suffix`, `allowClear`, character counts and appearance options. `Input.Search`, `Input.Password`, `Input.TextArea` and `Input.OTP` are subcomponents; `SearchInput` and `Textarea` remain compatibility exports. See [Input family](#input-family).
- `Form`: native form props plus managed values and validation through `Form.useForm()`, `form`, `initialValues`, named `Form.Item` fields and `rules`. Use `onFinish` for valid values and `onFinishFailed` for validation errors; `onSubmit` remains available. See the installed declarations for the supported rule and trigger contracts.
- `Form.Item`: `label`, `error`, `description`, `required`, one input child. Associates label/error with cloned child's id and ARIA attributes. Use direct label props for compound selectors rather than wrapping them as a native input.

## Questionnaire

`Questionnaire` receives an ordered `items` array. Every item has a unique, stable `id`, a `title`, and optional `description` and `required`. Item types are `single` and `multiple` (both take unique-value `choices`) or `text` (freeform). Single-choice items can add `other: { label?, placeholder? }` as an exclusive text answer.

Pass `defaultAnswers` for initial drafts or `answers` and `onAnswersChange` for controlled drafts. Answers are keyed by item id and use tagged shapes: `{type:"choice",value}`, `{type:"choices",values}`, or `{type:"text",value}`. Back preserves drafts. Explicit Skip clears that optional item's draft and omits it from submission. Unanswered optional items are also omitted; text is trimmed and choices are validated and ordered on submit.

`onSubmit` accepts synchronous or asynchronous handling. Pending submission locks the controls; a rejection allows retry. Success shows a completion message; remount with a new React key to start another questionnaire. The component does not create a native form or persist, transmit, or branch answers itself. `submitLabel` sets the final action's label.

## Selection

`Option = { value: string; label: ReactNode; disabled?: boolean }`.

- `Checkbox`, `Switch`: `checked`, `defaultChecked`, `onCheckedChange`, `label` or children, disabled; Checkbox also indeterminate.
- `RadioGroup`: options, value/defaultValue/onValueChange, label and form name. The default radio style is vertical; `variant="segmented"` shows compact buttons and defaults to horizontal. Override either with `orientation`.
- `Select`: options, string/null value, defaultValue, onValueChange, placeholder, label, disabled, open/defaultOpen/onOpenChange. The dropdown chevron is a fixed 16px vector icon; long selected labels and placeholders truncate within constrained trigger widths without stretching or pushing out the icon. Selected options use a vertically centered 16px Lucide Check with a thin 1.5px stroke; selection semantics and APIs are unchanged.
- `MultiSelect`: options, string[] value, defaultValue, onValueChange, placeholder, label; searchable with removable chips. Use textual option labels for reliable filtering.
- `Slider`: number value/defaultValue/onValueChange, min/max/step, label, disabled.
- `NumberInput`: number/null value/defaultValue/onValueChange, min/max/step, label, disabled.
- `DatePicker`: single ISO `YYYY-MM-DD` value/defaultValue/onValueChange, min/max, disabledDate, label, disabled, name, clearable. **Uses the browser's native date calendar**: appearance and keyboard controls vary by platform; custom disabledDate is rejected on selection, not painted as disabled in the native calendar. No date range/time support.

## Navigation

- [PageLayout](https://xingjianxu.github.io/mtone/#/components/PageLayout): single-page frame with a required `title`, optional `headingLevel` (default 1), `icon`, `subtitle`, `actions`, `description`, `extra`, `tabs`, and body children. Pass a complete `Tabs` instance to render its own panels after the header, or omit `tabs` to leave no tab row. PageLayout does not manage navigation or tab state; it can sit inside `AdminLayout.Content`. Compose a page-local `Sidebar` through the optional `sidebar` slot. `sidebarPosition="left"` (default) or `"right"` picks a physical side; `headerSpan="full"` (default) spans both columns with the header and tabs; `"header"` spans both columns with the header only, leaving tabs and body in the main column; `"main"` keeps the header and tabs in the main column. The header includes the title, icon, subtitle, actions, description and extra content. `maxWidth` constrains both columns. At an available width of 640px or more the sidebar defaults to 240px (override with `--mt-page-layout-sidebar-width`, up to half the layout width); below that it stacks before or after the main column in reading order. No sidebar leaves the single-column markup unchanged.
- AdminLayout: application shell; compose `AdminLayout.Sider`, `AdminLayout.Header`, `AdminLayout.Content`, and optional `AdminLayout.Footer`. The root `notice?: ReactNode` slot spans the shell above the sidebar and main column; keep the shell mounted for cross-route notices. This replaces `Layout` starting with 0.6.0, without a compatibility alias.
- Sidebar, NavGroup(label), NavItem(active, icon, optional href and actions): layout and navigation. NavItem is a button by default; an href renders a native anchor with corresponding props and ref. Native anchor navigation is unchanged. Pass one or more `{ content, visibility? }` descriptors for independent trailing actions. Visibility can be `always` (default), `hover` (also keyboard focus or touch-only), or `active`. The collapsed icon rail hides actions; the full rows in a submenu popup retain them.
- NavSubmenu: a navigation branch with required `label` and NavItem children, optional `icon` and `disabled`, and `defaultExpanded` / `expanded` / `onExpandedChange` for inline disclosure. A collapsed Sidebar or AdminLayout.Sider opens a side popup; set active leaf state on NavItem.
- Breadcrumb: items `{label,href?}`; final item is current page.
- Tree (set `directory` for file and folder behavior): legacy items `{id,label,children?,disabled?,icon?}`, value/defaultValue/onValueChange and expanded/defaultExpanded/onExpandedChange remain supported. New `treeData`, `selectedKeys` / `onSelect`, checkboxes with associated/strict checking, `loadData`, `draggable` / `onDrop`, virtual scrolling and ref navigation are available. Dragging reports intent; the application must update its data. Use stable unique string or finite-number keys. See [Tree reference](https://xingjianxu.github.io/mtone/#/components/Tree), installed declarations and [0.4.0 migration notes](MIGRATION.md).
- Tabs: items `{value,label,content,disabled?}`, value/defaultValue/onValueChange. Also supports line/card/editable-card/attached variants, placement, sizes, overflow navigation, add/remove callbacks and panel lifecycle controls. Every tab item is 32px tall including borders, in every variant, size and placement. The default inter-item gap is 6px for line and 4px for both card variants; explicit `gap` overrides the default. Line labels have 6px inline margins. Selected card and editable-card labels retain their background on hover. `indicatorColor` styles only the selected line indicator, using an accent preset or a CSS color (including a CSS variable); it defaults to `currentColor` and does not recolor the list divider, text, or cards. The application owns item changes; see [Tabs reference](https://xingjianxu.github.io/mtone/#/components/Tabs).
- Pagination: total, pageSize (default10), **controlled** page/onPageChange.
- `TableOfContents` discovers headings by default. Supply ordered `items` to use explicit IDs and levels, `listStyle="nested"` for semantic hierarchy, and `getHref` for native links to app routes instead of built-in scrolling. The optional `collapseBelow` breakpoint creates one responsive native disclosure; normal activation closes it on narrow screens and modified links stay native. Set a measured `offset`, `fallbackActiveId` or `highlightLastAtEnd` to adjust scroll tracking; page routing and same-route focus remain application concerns.

## Menus and overlays

- `Menu` renders commands inline without a trigger or outer popup. Provide grouped or nested `items`, an accessible `label`, optional `className`, and `onSelect(key)` for ordinary leaf commands. The same item schema is shared with the hosted menus.
- `Popover.Menu` (type `PopoverMenuProps`) hosts an action menu with a string or React element `trigger`, `items`, optional `label` and `onSelect(key)`, `width`, `align`, and `open` / `defaultOpen` / `onOpenChange`. It keeps menu semantics, keyboard navigation, nested menus and focus return, without wrapping the menu in a dialog. A string trigger uses the content-width dropdown Button preset. `triggerMode="click" | "hover"` defaults to click; desktop mouse hover can cross the trigger gap and enter submenus without stealing keyboard focus, while click, keyboard and touch still work. Replace prior `<Menu trigger=…>` usage with `<Popover.Menu trigger=…>`. See [trigger mode examples](https://xingjianxu.github.io/mtone/#/components/Popover?section=trigger-mode).
- `ContextMenu` uses the same item schema and open contract, with children as the right-click area. `Menubar` coordinates multiple action menus.
- `Popover.Select` (types `PopoverSelectProps`, `PopoverSelectItem`) is a searchable single-choice popover, not a command menu or form field. Supply `trigger` and `items` with unique string `value`, string `label`, and optional `icon` / `disabled`; use `value` or `defaultValue` (`null` for no selection) with `onValueChange(value)`. It shares Popover's title, label, trigger, placement, and open-state props, defaults to a viewport-constrained 320px panel and start alignment, and accepts `searchPlaceholder`. The search field filters labels by case-insensitive substring and stays above the scrolling list. Arrow keys skip disabled items, Enter or click selects and closes, Escape closes without changing the value, and the search resets on close. Re-selecting the current value closes without firing a value-change event. See [searchable single choice](https://xingjianxu.github.io/mtone/#/components/Popover?section=searchable-select).
- `Popover` remains a nonmodal popup for arbitrary `content`, with a `trigger` and optional title, side, alignment, width and open state. Set `unstyled` only if the content supplies its own visual shell: it removes the Popover background, border, shadow and padding without changing positioning, keyboard behavior or open/close state. Compose a standalone `Menu` in its content when needed; the caller can close the outer Popover from the menu's `onSelect` by controlling `open`.
- Tooltip: child trigger element, content, side. Supply accessible names on icon-only children.
- Dialog/Drawer: title, description, children, footer, optional trigger; open/defaultOpen/onOpenChange. Escape and close button restore focus. Drawer has right-edge interaction.
- ConfirmDialog: same basic dialog properties, onConfirm (sync/async), confirmText/cancelText/danger. Async failures remain open with error; pending action disables buttons.
- [GlobalNotice](https://xingjianxu.github.io/mtone/#/components/GlobalNotice): persistent warning banner with required `title`, optional `children`, `icon` (`false` hides the decorative default), `onAction`, `actionLabel`, `actionRef`, `loading`, `error`, and native div attributes/ref. `onAction` adds a button; with no visible label it uses a localized accessible dismiss name. Loading disables the action, and errors use alert semantics. The app owns retries, visibility and restoring focus to a stable control after dismissal. Use standalone or in the outer `AdminLayout.notice` slot, not inside a route page when it must persist across routes.
- ToastProvider: wraps application, timeout and limit. `useToast().add({title,description})` creates a dismissible toast. Place inside MtoneProvider.

Triggers use Base UI's `render` composition. Custom trigger components must forward ref and DOM props; standard mtone Button does this.

## Content and status

- Card, Text(muted), Divider and ListItem(icon,description,actions): styled semantic wrappers. `List` retains children-based use and also supports grouped/virtual data rendering; see [List](#list).
- DocumentList: items `{id,title,description?,updatedAt?,icon?,onClick?}`. DocumentCard accepts one item.
- `Tag` (`TagProps`): six neutral/blue/green/orange/red/purple tones and optional `onRemove`. Use `variant="filter"` for applied conditions: 32px by default via `--mt-height`, single-line ellipsis, and a localized remove action. Keep filter state in the app and lay out several tags in a wrapping flex container.
- Status: tone, children. Avatar: name, src, size; falls back to initials on image error. AvatarGroup: items, max.
- `Progress`: line, circle or dashboard progress, status, success segments, steps and custom information; see [Progress](#progress). PropertyList and PropertyItem(label): definition-list display.
- Alert: tone info/success/warning/error, title, children, onClose.
- Empty(title,description,action), Skeleton(native div props), Spinner(label).

## Typography.Code

Use `<Typography.Code>` inline or `<Typography.Code block>` for a semantic preformatted block.
Add `language="tsx"` (or `js`, `ts`, `jsx`, `json`, `html`, `css`, `bash`) to opt into
Shiki syntax highlighting for a string child. The engine and individual grammars
load only when such a block is used. SSR, the initial client view, unsupported
languages, and loading failures all retain plain text. Inline code and element
children keep their previous rendering. Colors follow the current light, dark, or
system mtone theme without changing the underlying code text.
See [Code examples](https://xingjianxu.github.io/mtone/#/components/Typography?section=Code).

## Input family

`Input` keeps native `value` / `defaultValue`, `onChange(event)`, form attributes and
an `HTMLInputElement` ref. `className` / `style` target that native input;
`wrapperClassName` targets its stable wrapper. `controlSize="sm" | "md" | "lg"`
controls appearance (default md, 32px); native `size` still means character
width. `variant` is `outlined` (default), `filled`, `borderless` or `underlined`;
`status` is `error` or `warning`. Focus uses mtone's thin light-blue treatment.

- `prefix` / `suffix` render adornments. `allowClear`, `clearLabel` and `onClear`
  configure clearing; controlled callers must accept the resulting change event.
- `showCount` displays a count; `countCharacters(text)` customizes counting only,
  not native `maxLength` enforcement.
- `Input.Search` adds a search icon, optional `searchButton`, `loading` and
  `onSearch(text)`. Enter submits outside IME composition; a search button also
  submits. It does not fetch results or install a global shortcut. Spotlight
  reuses this component.
- `Input.Password` adds `visible` / `defaultVisible` / `onVisibleChange` for the
  visibility toggle while retaining the native input contract.
- `Input.TextArea` keeps native textarea events and an `HTMLTextAreaElement` ref,
  plus appearance/count options and `autoSize` (boolean or `{ minRows?, maxRows? }`).
- `Input.OTP` uses a string `value` / `defaultValue`, `onValueChange(text)` and
  `onComplete(text)`, not a native change event. `length` defaults to 6 and is
  clamped to 1–32. It supports paste, arrows, Backspace/Delete, `mask`, `separator`,
  `controlSize`, `disabled`, `readOnly`, `name` / `form` and a ref to the first cell.
  Whitespace is removed; `inputMode` is only a keyboard hint, not digit validation.
  This component collects a code; it does not authenticate or verify it.

See [Input examples and full API](https://xingjianxu.github.io/mtone/#/components/Input).

## TreeSelect

`TreeSelect` accepts `items: TreeItem[]`, using the tree node shape
`{ id, label, children?, ... }` and stable unique string or finite-number IDs.
Provide `textValue` for searching non-text labels.

- Single selection: `value` / `defaultValue` is a key or `null`;
  `onValueChange(value, nodes)` reports selection. With `multiple`, values are
  key arrays and parent/child checkbox association is enabled by default.
- `checkStrictly` makes multiple selection independent. `showCheckedStrategy`
  (`all`, `parent`, `leaf`) changes displayed tags only; associated selection
  callbacks still return all checked keys. `maxTagCount` limits visible tags.
- `searchable`, `searchValue` / `defaultSearchValue` / `onSearchChange` and
  `filterNode(query, node)` configure search. Matches retain their ancestor path;
  checking while filtered still uses the full tree. Closing clears search.
- `expandedKeys`, defaults, `onExpand`, `loadData`, `loadedKeys`, `onLoad` and
  `onLoadError` reuse Tree's expansion/loading contracts. The application updates
  `items` with loaded children; the component does not fetch data itself.
- `open` / `defaultOpen` / `onOpenChange`, `allowClear`, `onClear`, `renderValue`,
  `titleRender`, `showLine`, `showIcon`, `virtual` and `height` configure interaction
  and rendering. The popup tree height defaults to 256px.
- `placement`, `dropdownWidth`, `prefix`, `size`, `status`, `disabled` and `readOnly`
  configure presentation. The ref targets the trigger button. Give it an accessible
  name with `aria-label` or `aria-labelledby`.
- `name` adds a hidden form field: one key for single selection, a JSON key array
  for multiple selection. Disabled fields are not submitted. Unknown selected keys
  remain retained, but the callback's `nodes` includes only currently known nodes.

See [TreeSelect examples and full API](https://xingjianxu.github.io/mtone/#/components/TreeSelect).

## List

Existing `<List><ListItem ... /></List>` usage remains supported. Data mode uses
`items`, stable `getKey(item, index)` and `renderItem(item, index)`. Return row
**content**, not another `li` or `ListItem`: List owns the row element.

- `groupBy(item)` and `renderGroup(key, items)` add groups; `stickyGroups` enables
  sticky headers. `height` sets a scroll viewport and `contentWidth` allows wider,
  horizontally scrollable content.
- `virtual` requires data mode and a numeric `height`. Measured row heights support
  rich content; `estimatedItemHeight` (36), `estimatedGroupHeight` (30) and `overscan`
  (3) tune initial estimates/windowing. Estimates can make initial positioning
  approximate until measurement; use stable keys when changing data.
- The `ListHandle` ref exposes `element` (the native `ul`) and `scrollTo(target)`.
  Targets are an offset number, `{ top?, left? }`, or `{ key | index | group,
  align?, offset? }`, where align is `start`, `center`, `end` or `auto`.
- `emptyContent`, `loading`, `loadingContent` and `hoverable` configure states.
  `onEndReached` and `endThreshold` (80px) support loading more in data mode with
  a height. The application owns requests, loading state, errors and appended data.
- Sorting is application-controlled, illustrated with drag and keyboard-accessible
  buttons; the component does not persist ordering or fetch data.

For controlled drag sorting, render `List.SortHandle` first in each data-row flex layout or use `ListItem.sortHandle` in children mode. Only the six-dot grip starts dragging, but the native drag preview shows the entire row. Handle drop/reordering in the application and provide keyboard-accessible move controls. An application can still cancel the drag or supply its own preview in `onDragStart`.

See [List examples and full API](https://xingjianxu.github.io/mtone/#/components/List).

## DataList

`DataList<T>` composes the existing `List` for managing records without changing
the base list contract. Provide `items: readonly T[]`, stable unique
`getKey(item): string | number`, and `renderItem(item, index)` (content only, not
a `ListItem` or `li`; the index is zero-based within the current page). Use
`getLabel(item)` for readable selection and disclosure names; it defaults to
the key as a string. Numeric keys must be finite. The root accepts section attributes such as `aria-label`,
`className` and `style`.

- `search` enables a search input. Use `value` with `onChange` for controlled
  search or `defaultValue` for the initial query. Set `placeholder`/`label` and
  a local `match(item, query)` predicate if needed. The local predicate receives
  a trimmed query. Without `match`, the input does not filter the records.
  `filter(item)` applies another local predicate; use `filters` to render filter
  controls and `toolbar` to supply other controls or context.
- `pagination` is optional. Local mode applies search and filters before paging;
  `page`/`defaultPage`, `pageSize` (default 10) and `onPageChange` configure it.
  Local results clamp to the available page range. Editing the search requests
  page 1. For `mode: "remote"`, supply controlled `page`, `pageSize`, `total`,
  `onPageChange` and the current page of `items`. DataList neither slices nor
  filters those items. The application resets the page when external filters
  change.
- `selection` provides row checkboxes and select-all for enabled items on the
  current page; `selectedKeys`/`defaultSelectedKeys`, `onChange` and
  `getDisabled(item)` configure it. Selection is keyed across pages.
  `renderBatchActions({ selectedKeys, clearSelection })` provides an optional
  bulk-action area; clearing it clears keys on other pages too.
- `expansion` requires `renderDetail(item)` and optionally accepts
  `expandedKeys`/`defaultExpandedKeys`, `onChange` and `isExpandable(item)`.
  `renderActions(item)` provides row-level controls; neither they nor the
  disclosure button implicitly select the row.
- `loading` and `empty` customize states. For remote mode, the application owns
  fetching, cancellation and error handling. This version has no built-in grid,
  editing or virtualization.

See [local and remote examples](https://xingjianxu.github.io/mtone/#/components/DataList).

## Progress

`value` is normalized to 0–100. `type` is `line` (default), `circle` or `dashboard`;
`status` is `normal`, `active`, `success` or `exception`. `label` supplies the
accessible label. `showInfo` defaults to false; enable it to display the percentage
or `format(value, successValue)` result.

- `size` accepts `small`, `medium` (default) or a number: numeric size means line
  height or circular diameter in pixels. `strokeWidth` overrides thickness;
  `strokeLinecap` is `round`, `butt` or `square`.
- `color` accepts a CSS color or `{ from, to }` gradient; `trackColor` changes the
  track. `success={{ value, color? }}` adds a completed segment capped at `value`.
- `steps` accepts a count or `{ count, gap? }`. Dashboard `gapDegree` defaults to 75,
  and `gapPosition` to `bottom` (`top`, `left` and `right` are also supported).

See [Progress examples and full API](https://xingjianxu.github.io/mtone/#/components/Progress).

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
      render: (value) => <Tag>{String(value)}</Tag>,
    },
  ]}
  pagination={{ pageSize: 10 }}
/>
```

### Current Table API

- **Data and columns:** use `dataSource` (takes precedence) or legacy `data`, and `columns` or `Table.Column` / `Table.ColumnGroup` children. `rowKey` defaults to `"key"`; provide stable, unique string or number keys. Columns support nested `dataIndex` paths, grouped `children`, `render`, width/alignment, `hidden`, `responsive`, `ellipsis`, `fixed`, `onCell`, `onHeaderCell` and `shouldCellUpdate`. `column` supplies shared column defaults. Use `onCell` to supply `rowSpan` / `colSpan` for merged cells.
- **Sorting:** legacy `sortable` retains its simple behavior. `sorter` accepts a comparator or `{ compare, multiple }` for prioritized multi-column sorting. `sorter={true}` reports sorting intent rather than applying a local comparator. Use `sortOrder` / `defaultSortOrder` (`"ascend"`, `"descend"`, or `null`), `sortDirections`, `sortIcon` and `showSorterTooltip` for configuration.
- **Filtering:** legacy `filterable` provides case-insensitive text containment. Modern column `filters` and `onFilter` support menu/tree options, search, multiple selection, controlled `filteredValue`, defaults and reset behavior. `filterDropdown` can render a custom panel using `selectedKeys`, `setSelectedKeys`, `confirm`, `clearFilters` and `close`.
- **Selection:** legacy `selectable`, `selectedKeys` and `onSelectionChange` remain supported. `rowSelection` adds checkbox/radio selection, controlled/default keys, disabled rows, `checkStrictly={false}` tree association, `preserveSelectedRowKeys`, custom cells, callbacks and bulk actions. The default selection track stays compact on wide tables (32px for a standard checkbox or radio, 56px with the batch-action menu). Set `rowSelection.columnWidth` for wider custom headers or cells. Bulk actions use mtone's `Popover.Menu`, not a value-holding Select. The application remains responsible for deciding when retained keys should be removed.
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

Required adapter `upload(file,{signal,onProgress}) => Promise<unknown>`. Progress0–100. Props accept/maxSize(bytes)/multiple/disabled/onChange(files). Files can be selected by click or dropped onto the upload area. Retry, cancel and removal abort active work; stale results cannot overwrite newer attempts. Validation is client convenience only; server must enforce file rules too. The component does not persist files, provide credentials or choose an endpoint. Documentation demo is explicitly simulated.

### Dialog dismissal

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

`Mentions` adds plain-text mention completion with mtone styling.
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
- `className/style` target the root. `classNames/styles` are static objects keyed by `root`, `textarea`, `popup`, `option`, `clear`. Provider locale, color theme and tokens are retained in the portal.

Arrows move through enabled options; Enter selects; Escape closes; Tab closes and
moves focus normally. Composition keys are left to the IME. Native Home/End,
selection and editing semantics are preserved. The component remains plain text:
selection replaces only the trigger/query before the caret and retains text after
it. It does not render immutable mention chips or validate whether a person exists.

`getMentions(text, { prefix?, split? })` is a **standalone exported helper**, returning
`{ prefix, value }[]`. It applies boundary/whitespace splitting, not custom search
validation or membership checks. Values containing spaces need an application-specific
parsing strategy. Bind `Mentions` directly to `Form.Item` using its string change
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
