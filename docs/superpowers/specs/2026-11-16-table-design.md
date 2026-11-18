# Table capability design

Goal: extend mtone Table with grouped headers, tree and expanded rows, fixed/sticky layouts, merged cells, selection, sorting, filtering and virtual rendering while retaining mtone's compact neutral styling and existing API behavior.

Approach: use MIT-licensed @rc-component/table 1.12.0 as the unstyled structural engine (React >=18 compatible with this project's React 19). It supplies grouped headers, tree/expanded rows, fixed/sticky layout, merged cells, components overrides, summary and virtual rendering. mtone owns state, sorting/filtering/selection, pagination, UI, locale and styling. This is an implementation choice, not a user-selected preference. A wholly custom engine was considered but rejected because complex virtualization/span/sticky combinations create avoidable correctness risks.

Compatibility: retain data, required-or-default rowKey, sortable/filterable, selectable/selectedKeys/onSelectionChange, manual, sort asc/desc, string filters, onChange(state), pagination.page/onPageChange, empty, and pagination=false default. Add dataSource, onTableChange(pagination,filters,sorter,extra) and modern column/rowSelection/expandable APIs. Never overload onChange with an incompatible payload. New APIs must be accurately documented against the mtone implementation and type declarations.

Scope: nested dataIndex, Column/ColumnGroup JSX; local and server sorting/filtering incl multiple priority, custom searchable/tree filter menus and controlled states; checkbox/radio/tree selection; expansions/tree/nested tables; fixed header/columns, sticky, spans, responsive/hidden/grouped columns; pagination placement/size/quick jump; loading/title/footer/summary/empty; semantic styling and element overrides; virtual scrolling and imperative scrollTo. Editable cell/row, row/column drag, and custom tooltip are compositions through render/onCell/components and must have working examples. Verify latest expand-all/forceRender/shared column options.

Anti-goals: no separate styling system, no silent breaking changes, no npm publish, no unverified feature claims. Unsupported combinations or omissions must be explicit and escalated for user decision if material.

Verification: baseline, regression tests, public type checks, component tests, package smoke, llms consistency, docs build, then browser checks on sticky/virtual/selection/filter/expansion.
