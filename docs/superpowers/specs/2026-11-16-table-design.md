# Table parity design

Goal: provide the public capabilities demonstrated by Ant Design Table 6.7.1 while retaining mtone's compact neutral styling and existing API behavior.

Approach: use MIT-licensed @rc-component/table 1.12.0 as the unstyled structural engine (React >=18 compatible with this project's React 19). It supplies grouped headers, tree/expanded rows, fixed/sticky layout, merged cells, components overrides, summary and virtual rendering. mtone owns state, sorting/filtering/selection, pagination, UI, locale and styling. This is an implementation choice, not a user-selected preference. A wholly custom engine was considered but rejected because complex virtualization/span/sticky combinations create avoidable correctness risks. Importing Ant Design itself was rejected because its theme/dependency footprint conflicts with mtone's identity.

Compatibility: retain data, required-or-default rowKey, sortable/filterable, selectable/selectedKeys/onSelectionChange, manual, sort asc/desc, string filters, onChange(state), pagination.page/onPageChange, empty, and pagination=false default. Add dataSource, onTableChange(pagination,filters,sorter,extra) and modern column/rowSelection/expandable APIs. Never overload onChange with an incompatible payload. New APIs must be accurately documented, not asserted to be a drop-in Ant Design replacement.

Scope: nested dataIndex, Column/ColumnGroup JSX; local and server sorting/filtering incl multiple priority, custom searchable/tree filter menus and controlled states; checkbox/radio/tree selection; expansions/tree/nested tables; fixed header/columns, sticky, spans, responsive/hidden/grouped columns; pagination placement/size/quick jump; loading/title/footer/summary/empty; semantic styling and element overrides; virtual scrolling and imperative scrollTo. Editable cell/row, row/column drag, and custom tooltip are compositions through render/onCell/components and must have working examples. Verify latest expand-all/forceRender/shared column options.

Anti-goals: no wholesale Ant Design styling, no silent breaking changes, no npm publish, no unverified claim of complete parity. Unsupported combinations or omissions must be explicit and escalated for user decision if material.

Verification: baseline, regression tests, public type checks, component tests, package smoke, llms consistency, docs build, then browser checks on sticky/virtual/selection/filter/expansion. Source attribution in this design: https://ant.design/components/table/ (6.7.1 checked 2026-11-16).
