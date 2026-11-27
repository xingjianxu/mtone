# Changelog

## 1.1.0

- Name the unchanged built-in design Original (原调) and add theme presets with shared and mode-specific tokens for Provider and Scope.
- Add the optional `PageLayout.topbar` slot above the title; it follows `headerSpan` and does not change the layout when omitted.
- Share the 3px spacing token for adjacent navigation and popup options. Document the navigation selection colors and add interactive theme and layout previews.

## BlockEditor 1.1.0 (separate package)

- Expose the native BlockNote instance and allow additive inline content specs and editor extensions, including async mentions.
- Use the host's `uploadFile` callback for native clipboard file paste and drag-and-drop uploads.

## 1.0.0

- Add AppLayout without a global header, with independent navigation and content scrolling, bottom account actions, and optional sidebar resizing and icon-only collapse.
- Add standalone Topbar with a true center slot for controls, reused by AdminLayout.Header.
- Add optional Splitter separator borders independently of the outer frame. The AppLayout docs demo enables both edges.

### BlockEditor 1.0.0 (separate package)

- Move table row and column commands into the contextual toolbar and remove the floating row and column grips.
- Support mtone 1.x as a peer in addition to the previously supported mtone versions. The editor remains a separate installation.

## 0.15.5

- Add opt-in browser layout memory for Panel, Sidebar, Splitter, Tabs, FloatingWindow, and resizable layout sidebars.
- Keep Tree rows still while dragging, then animate the affected rows once on release. Enable `allowReparent` to drop into another node or insert between its children; the default is same-parent sorting.
- Add `moveTreeItem(items, info)` for immutable moves and `getTreeNodeInfo(items, key)` for parent, path and sibling position queries.

### BlockEditor 0.2.2 (separate package)

- Add `getBlockEditorStats(blocks)` to count words, characters, non-whitespace characters, and blocks without mounting an editor.
- Add `BlockEditorRef.focus()` to return focus to the editable document without exposing the underlying BlockNote instance.

## 0.15.4

- Add Container with shared 720 / 960 / 1200 / 1440px width presets, responsive centering, and configurable inline padding. PageLayout stays fluid by default.
- Remove the stray connector on top-level Tree nodes and reveal overflowing custom JSX labels without duplicating their content.
- Add the opt-in themed Splitter outer border without changing the divider or its defaults.

## 0.15.3

### Tree
- Hide hover-only node actions without reserving label width, and reveal them on row hover or keyboard focus.
- Enable HoverMarquee by default for overflowing plain-text node labels. Set `labelMarquee={false}` for a tree or for an individual node to opt out.

### BlockEditor 0.2.1 (separate package)
- Show labeled media fields and upload/link choices using the host's `uploadFile` callback; both documentation demos expose the upload flow.
- Add optional borderless and fill-height layouts, and keep rounded editor corners intact.
- Refine the audio player, attachment appearance and caption tooltips, and consolidate floating toolbar actions.

## 0.15.2

### Documentation
- Refresh the bundled AI reference for BlockEditor 0.2.0.

### BlockEditor 0.2.0 (separate package)
- Add video, audio, and file blocks with editable URLs and captions.
- Add Shiki highlighting and monospace typography while editing code blocks.
- Show contextual floating toolbars for text, tables, images, and media.
- Add table row and column handles for moving, inserting, and deleting rows and columns.

## 0.15.1

### Documentation
- Update the bundled AI reference for the standalone `@bixlab/mtone-blockeditor` package and its expanded block and text formatting. The core library does not install or export the editor.

## 0.15.0

### Added
- Reuse the documented semantic theme colors for shared selected states, component actions, and feedback while retaining existing overrides.
- Document the standalone BlockEditor in the shared docs. The main package does not install or export the editor.

### Fixed
- Center the active docs sidebar item on navigation from Spotlight and retain the manual sidebar scroll position on clicks.
- Keep SettingsDialog's active marker fully visible and support its built-in settings search.
- Improve the Tree playground layout and group PropertyItem usage within PropertyList documentation.

## 0.14.0

### Added
- Use `SettingsDialog` for settings organized by category. It has independently scrolling desktop panes and a compact list-and-detail layout, with optional application-provided search. Compose `SettingRow` and `SettingRow.Group` for labeled settings, descriptions, shortcut hints, and accessible controls.
- Dock an IDE-style `Panel` on any side, place tabs on any edge, and choose tab heights for Tabs and Panel. The active Panel tab can collapse the panel when activated again.
- Enable optional drag resizing for AdminLayout and PageLayout sidebars; use Splitter directly to resize a standalone Sidebar.
- Add `HoverMarquee` for overflow that scrolls on hover. The documentation site links to the site-wide and per-component AI references.
- Set Tree row heights and provide node-level actions alongside icons and metadata.

### Fixed
- Align and connect Tree guide lines with the configured row height and gap.
- Keep HoverMarquee cycles continuous and make the docs example overflow at practical viewport sizes.
- Improve Splitter grip visibility and Panel docking seams, restore double-click collapse, and keep the tab strip aligned when the size changes.

## 0.13.2

### Added
- Configure Tree indentation with `indent` and render right-aligned node metadata with `endContent`. The document-navigation example shows per-node icons, long titles, and lazy child loading with retry.

### Fixed
- A single PageLayout directly inside AdminLayout.Content fills the available height without introducing a separate scrollbar.
- Tree rows have a configurable `gap` (default 2px; use 0 for no gap), including in virtual lists, without changing guide continuity or interactive row heights.

## 0.13.1

### Fixed
- Keep the AdminLayout sidebar brand and top bar at the same fixed height (48px by default), with centered controls and a single-line breadcrumb. The responsive docs example keeps narrow-width actions available in a More menu.

## 0.13.0

### Breaking changes
- Split the former advanced `Table` into `DataTable` and a new native JSX `Table`. Move existing data-driven imports, table-specific types, compound components, and constants to `DataTable`; there is no alias for the old meaning of `Table`.
- Pass complete toolbar content via `DataList.toolbar`. Replace `filters` with controls in Toolbar slots, move the search label and placeholder into `DataList.Search`, and replace `renderBatchActions` with render-function children of `DataList.Selection`. Keep the data configuration and cross-page selection in DataList. See the [migration guide](docs/MIGRATION.md#upgrade-notes-for-0130).

### Added
- Compose `toolbar={<Toolbar … />}` inside DataTable or DataList to share the same frame. Native `Table` keeps HTML table semantics and offers `bordered`, `striped`, and `highlightOnHover`.
- Register app keyboard shortcuts with `ShortcutsProvider`, `ShortcutScope`, and `useShortcut`. Use `formatShortcut` for platform-specific hints. Spotlight can use the shared registry without changing its existing shortcut format or standalone behavior; menu shortcut text remains display-only.
- Extend Tooltip with alignment, optional arrows, collision controls, alternate triggers, controlled visibility, colors and part styles, and custom portal mounting. `TooltipProvider` coordinates hover delays. The original content, child trigger, side, and default hover-plus-focus behavior are retained.

### Changed
- Toolbar defaults to a gray background with borderless standalone buttons and Select controls; set `background="white"` for the previous surface, or `controlStyle="default"` for standard controls on gray. ButtonGroup and keyboard interactions are unchanged.
- Ordinary non-searchable single Select sizes to the widest placeholder or option text instead of a 160px minimum, preserves its width when selecting or clearing, and truncates long labels in narrow containers. Existing explicit widths still work; searchable, multiple, tags, and popup search sizing is unchanged.

## 0.12.0

### Breaking changes
- Remove the `MultiSelect` component and `MultiSelectProps` entirely. Use `Select mode="multiple"` and `SelectMultipleProps`; multiple selection, tags, keyboard interaction, and form behavior remain available. See the [upgrade notes](docs/MIGRATION.md#select-multiple-mode).

## 0.11.1

The v0.11.0 GitHub tag did not reach npm. This release includes the full update from 0.10.3.

### Breaking changes
- Replace `Popover.SearchableSelect` with `Select searchable="popup"` and use `renderOption` for custom option content. No compatibility alias is provided. Existing inline Select search and ordinary Popover and Popover.Menu behavior are unchanged. See the [upgrade notes](docs/MIGRATION.md#searchable-selection-popover).

### Added
- Standalone `Toolbar` with white and gray surfaces, logical start/end slots, and container-aware wrapping. DataList reuses its layout while keeping its existing customization slot.
- Nonmodal `FloatingWindow` with dragging, lower-right resizing, and a floating minimize/restore control that preserves draft state.
- Optional top Tabs for Sidebar; the header, tabs and footer stay in place while the active navigation panel scrolls.
- Unified Select for single, multiple, and tags modes, including inline single search and a separate searchable popup. `MultiSelect` remains a deprecated compatibility export.

### Fixed and documented
- Document the deprecated MultiSelect compatibility export and its 32px baseline while demonstrating migration to Select.
- Align the Select clear icon and avoid a duplicate focus border in inline search.
- Serve lazy syntax highlighting for all Shiki languages from the app's own build, without a third-party runtime CDN.
- Add independent Toolbar and Table composition examples, and use a single frame for the joined Toolbar and Table surfaces.

## 0.10.3

The earlier 0.10.x tags did not reach npm. This version contains the complete update from 0.9.0.

### Breaking changes
- Use `Popover.Menu` for a triggered menu. `Menu` renders menu content on its own; `ContextMenu` and `Menubar` reuse that content without giving up their trigger behavior.
- Consolidate Badge, FilterChip and FilterBar into Tag and the filter composition example; use Upload in place of Dropzone and the segmented RadioGroup variant in place of Segmented.
- Remove overlapping aliases for Toast, DirectoryTree, AiChainOfThought, Modal, DropdownMenu, Mention, SearchInput, Textarea and FormField. See the [upgrade notes](docs/MIGRATION.md) for replacements.

### Added
- `Popover.SearchableSelect` opens a searchable single-selection list with a separate trigger, optional option icons, and keyboard navigation.
- `SectionGroup` for titled content sections with trailing controls and evenly spaced separators.
- `PageLayout` supports an optional left or right Sidebar, and can span the entire header and Tabs, span the heading area only, or keep both in the main column. Tabs are optional.
- Nonvirtual data Lists can opt into controlled reordering with a whole-row drag preview and live insertion feedback.

### Fixed
- Keep the default Table selection column compact, with extra room only when needed for batch actions.
- Restore the Popover card example's default frame and shadow, and fix soft Button hover feedback.
- Reuse TableOfContents for the docs outline, NavGroup in the PageLayout sidebar demo, and Typography.Code for example source. Center the active sidebar link on direct navigation without disturbing manual sidebar navigation.

## 0.9.0

### Breaking and migration
- Replace the removed `IconButton` export with `Button iconOnly` and provide an accessible name. Replace the removed `Dropdown` export with `Popover`; `DropdownMenu` remains the Menu alias.
- The default single-line controls, sidebar navigation and Tabs items now use a 32px outer height. Button sizes are 28/32/36px and can inherit from ButtonGroup; existing size aliases remain accepted. MultiSelect and other multiline controls still grow as needed. See [upgrade notes](docs/MIGRATION.md).

### Added
- DataList, CardGroup and collapsible cards, Questionnaire, CheckCard, and the AI messaging, activity and evidence components.
- NavSubmenu, independent NavItem and NavGroup actions, NavGroup dividers, and native navigation links. PageLayout supports centered maximum widths; the standalone GlobalNotice can also sit above both AdminLayout columns without scrolling with the content.
- Button leading/trailing content, opt-in pressed states, icon-only mode and the visual dropdown preset. Menu accepts string triggers and offers optional hover opening without replacing keyboard, click, or touch interaction.
- Top attached Tabs with a themed panel seam, custom line-indicator colors, and a new coral accent shared by the theme palette. Card and editable-card alignment and native overflow navigation are preserved.
- Typography title dividers and inline or block Code. Explicit block languages can opt into lazy syntax highlighting without loading rules for plain text.
- Popover now supports width and horizontal alignment from Dropdown, plus optional unstyled presentation.

### Fixed and documented
- Keep the joined outline for ButtonGroup while a popup is open. Refine navigation spacing, narrow layouts, and Tabs hover and scroll seams.
- Add an independent color-preset guide and keep the packaged AI reference and documentation synchronized.
- Organize the documentation sidebar by component families and reading order while preserving component links and search.

## 0.8.0

### Breaking
- Remove the `density` prop from `MtoneProvider` and the compact/comfortable modes. Remove the prop when upgrading; explicit component size variants remain available. See [migration notes](docs/MIGRATION.md).

### Changed
- Use a consistent 34px default outer height for single-line controls, while allowing MultiSelect to grow when chips wrap.
- Use 34px navigation rows in Sidebar, NavGroup, AdminLayout and the documentation site. Preserve row spacing and collapsed navigation, and truncate long plain-text labels without changing their accessible names.

## 0.7.0

### Added
- Light, dark and system themes through `MtoneProvider` and `MtoneScope`, with inherited scoped themes and theme-aware component styles.
- TagSelect with controlled/uncontrolled selection, responsive expand/collapse, disabled options and optional select-all.
- `List.SortHandle` and `ListItem.sortHandle` for application-controlled drag sorting.

### Fixed and refined
- Native sticky group headings in virtual lists, including stable transitions between groups.
- Theme-aware documentation and showcase, preserving saved theme preferences and following the system when no preference is saved.
- Synchronized API guide and packaged AI reference. See [upgrade notes](docs/MIGRATION.md).

## 0.6.0

### Breaking
- Rename `Layout` and its component-specific types to `AdminLayout` with no compatibility aliases. Update imports and JSX compound-component references; behavior and CSS hooks remain unchanged. See [migration notes](docs/MIGRATION.md).

### Fixed
- Anchor Spotlight near the top of the viewport so filtering results no longer moves the search field. Short viewports use a smaller offset and constrained scrolling.

### Documentation
- Split component examples into focused sections with a sticky page outline and refreshed documentation layout.
- Synchronize API guides, migration instructions and the packaged AI reference.

## 0.5.0

### Added and enhanced
- Typography with editing, copying, ellipsis and block quotes; connected ButtonGroup.
- Menu, Dropdown and Menubar composition; LoadingOverlay, HoverCard and Fieldset.
- TreeSelect; expanded List grouping/virtual scrolling and Progress line/circle/dashboard/steps.
- Input family with Search, Password, TextArea and OTP, variants, clear controls and composed decorations; Spotlight reuses SearchInput.
- Breadcrumb icons, menus and separators; unified compact menu spacing and thin focus styling.
- Synchronized API guides, component examples and packaged AI reference.

### Compatibility
- See [migration notes](docs/MIGRATION.md) for DOM/styling and API behavior details. React/ReactDOM ^19.2.0 and ESM remain required.

## 0.4.0

### Added
- Mentions/Mention, Calendar, Rate, Popconfirm, Timeline, Affix, Result, Image/preview groups, TableOfContents, AutoComplete, Cascader/CascaderPanel and Transfer.
- Enhanced Avatar/AvatarGroup, Tree/DirectoryTree, Tabs and Divider while retaining existing entry points.
- Expanded documentation examples, AI reference and real tarball consumer checks for the new APIs.

### Fixed and refined
- Compact Tabs/card styling, neutral Breadcrumb hover styling, AutoComplete popup spacing and Timeline connector alignment.
- Browser regression synchronization and isolated consumer dependency verification.

### Compatibility
- Tree IDs now accept numeric keys, default ancestor expansion is enabled, and Tabs skips disabled items and recovers uncontrolled selection. See [migration notes](docs/MIGRATION.md).
- React/ReactDOM ^19.2.0 and ESM remain required. See each component reference for supported features and limitations.

## 0.3.0

### Added
- Advanced Table sorting, filtering, selection, pagination, fixed columns/headers, tree/detail expansion, summaries, virtual scrolling and ref API. Existing Table API remains supported.
- Splitter with controlled sizes, constraints, keyboard interaction and double-click collapse/restore cycle.
- Rich Card composition, Form state/validation APIs, Spotlight, application showcase and packaged AI reference (`llms.txt`).

### Changed and fixed
- Card `title` now renders a visible heading; use `htmlTitle` for native tooltips.
- Prefer Dialog; Modal remains an alias. Outside dismissal defaults off (`modal={false}` enables it). See [migration guide](docs/MIGRATION.md).
- Unified control sizing, icons and focus styling. Select/MultiSelect options use background-only highlights.
- Table selection header uses DropdownMenu; page-size selector uses mtone Select. Checkbox and tree disclosure alignment corrected.
- Fixed native Node ESM Table rendering with rc-table CommonJS interop; tarball tests now cover normal/virtual Table, Summary and generic ref types.
- Fixed malformed Splitter forced-colors CSS so high-contrast separator borders and grips render correctly.
- Documentation groups, API reference and package-version labels synchronized.

### Compatibility
- React/ReactDOM ^19.2.0; ESM only. Editing/dragging are application compositions; column resizing is not built in.
- See [Table API and limitations](docs/API.md#table).

## 0.2.0
- Consolidated Tag into Badge and corrected Select icons. See [migration guide](docs/MIGRATION.md).
