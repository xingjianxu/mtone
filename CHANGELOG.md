# Changelog

## 0.10.1

The 0.10.0 tag did not reach npm. This version contains the complete update from 0.9.0.

### Breaking changes
- Use `Popover.Menu` for a triggered menu. `Menu` renders menu content on its own; `ContextMenu` and `Menubar` reuse that content without giving up their trigger behavior.
- Consolidate Badge, FilterChip and FilterBar into Tag and the filter composition example; use Upload in place of Dropzone and the segmented RadioGroup variant in place of Segmented.
- Remove overlapping aliases for Toast, DirectoryTree, AiChainOfThought, Modal, DropdownMenu, Mention, SearchInput, Textarea and FormField. See the [upgrade notes](docs/MIGRATION.md) for replacements.

### Added
- `Popover.Select` opens a searchable single-selection list with a separate trigger, optional option icons, and keyboard navigation.
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
