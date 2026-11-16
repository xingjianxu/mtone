# Changelog

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
- React/ReactDOM ^19.2.0; ESM only. Not a drop-in implementation of all Ant Design props. Editing/dragging are application compositions; column resizing is not built in.
- See [Table API and limitations](docs/API.md#table).

## 0.2.0
- Consolidated Tag into Badge and corrected Select icons. See [migration guide](docs/MIGRATION.md).
