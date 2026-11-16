import * as React from "react";
import RcTable, {
  VirtualTable,
  EXPAND_COLUMN,
  Summary,
} from "@rc-component/table";
import type {
  ColumnsType,
  Reference,
  TableProps as RcTableProps,
  VirtualTableProps,
} from "@rc-component/table";
import {
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { cn, useMtone } from "./basic";
import { Tooltip } from "./interactive";
import type {
  TableProps,
  TableColumn,
  TableFilters,
  TableState,
  TablePagination,
  TableSortResult,
  TableColumnTitleProps,
} from "./table-types";
import {
  flattenColumns,
  getColumnKey,
  processTableData,
  type SortState,
} from "./table-model";
import { TableFilter } from "./table-filter";
import { useTableSelection } from "./table-selection";
import { TablePaginationBar } from "./table-pagination";
export * from "./table-types";
const SELECTION_COLUMN = Object.freeze({ key: "__mt_selection_column" });
function Column<T>(_props: TableColumn<T>) {
  return null;
}
function ColumnGroup<T>(
  _props: Omit<TableColumn<T>, "children"> & { children: React.ReactNode },
) {
  return null;
}
function jsxColumns<T>(children: React.ReactNode): TableColumn<T>[] {
  const result: TableColumn<T>[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const p = child.props as any;
    if (child.type === React.Fragment) {
      result.push(...jsxColumns<T>(p.children));
      return;
    }
    result.push({
      ...p,
      key: child.key ?? p.key,
      ...(child.type === ColumnGroup
        ? { children: jsxColumns<T>(p.children) }
        : {}),
    });
  });
  return result;
}
const Engine = RcTable as unknown as <T>(
  props: RcTableProps<T> & React.RefAttributes<Reference>,
) => React.ReactElement;
const VirtualEngine = VirtualTable as unknown as <T>(
  props: VirtualTableProps<T> & React.RefAttributes<Reference>,
) => React.ReactElement;
const breakpoints = { xs: 0, sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1600 };
function useResponsive() {
  const [width, set] = React.useState<number | null>(null);
  React.useEffect(() => {
    const update = () => set(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return width;
}
function TableInner<T>(
  props: TableProps<T>,
  forwardedRef: React.ForwardedRef<Reference>,
) {
  const {
    dataSource,
    data,
    columns: columnsProp,
    children,
    column: shared,
    manual = false,
    sort: legacySort,
    filters: legacyFilters,
    onChange,
    onTableChange,
    pagination = false,
    rowSelection,
    selectable,
    selectedKeys,
    onSelectionChange,
    loading = false,
    empty,
    locale = {},
    size = "middle",
    bordered = false,
    className,
    style,
    classNames,
    styles,
    sortDirections = ["ascend", "descend"],
    showSorterTooltip = true,
    getPopupContainer,
    virtual,
    virtualItemHeight = 38,
    scroll,
    expandable,
    components,
    rowKey = "key",
    rowClassName,
    onRow,
    ...engineProps
  } = props;
  const zh = useMtone().locale === "zh";
  const width = useResponsive();
  const source = dataSource ?? data ?? [];
  const rawColumns = React.useMemo(
    () => columnsProp ?? jsxColumns<T>(children),
    [columnsProp, children],
  );
  const columns = React.useMemo(() => {
    const walk = (cols: TableColumn<T>[]): TableColumn<T>[] =>
      cols.flatMap((c) => {
        if (c === EXPAND_COLUMN || c === SELECTION_COLUMN) return [c];
        const merged = { ...shared, ...c };
        if (
          width !== null &&
          merged.responsive &&
          !merged.responsive.some((b) =>
            b === "xs" ? width < 576 : width >= breakpoints[b],
          )
        )
          return [];
        if (merged.children) {
          const children = walk(merged.children);
          return children.length ? [{ ...merged, children }] : [];
        }
        return [merged];
      });
    return walk(rawColumns);
  }, [rawColumns, shared, width]);
  const leaves = flattenColumns(columns);
  const indexed = leaves.map((c, i) => ({ c, key: getColumnKey(c, i) }));
  const [sortState, setSortState] = React.useState<SortState[]>(() =>
    indexed.flatMap(({ c, key }) =>
      c.defaultSortOrder ? [{ key, order: c.defaultSortOrder }] : [],
    ),
  );
  const [filterState, setFilterState] = React.useState<TableFilters>(() =>
    Object.fromEntries(
      indexed
        .filter((x) => x.c.defaultFilteredValue)
        .map(({ c, key }) => [key, c.defaultFilteredValue!]),
    ),
  );
  const [textState, setTextState] = React.useState<Record<string, string>>({});
  const [pageState, setPage] = React.useState(
    pagination
      ? (pagination.defaultCurrent ??
          pagination.page ??
          pagination.current ??
          1)
      : 1,
  );
  const [sizeState, setSize] = React.useState(
    pagination ? (pagination.defaultPageSize ?? pagination.pageSize ?? 10) : 10,
  );
  const controlledSortColumns = indexed.filter(
    ({ c }) => c.sortOrder !== undefined,
  );
  const activeSorts: SortState[] =
    legacySort !== undefined
      ? legacySort
        ? [
            {
              key: legacySort.key,
              order: legacySort.direction === "asc" ? "ascend" : "descend",
            },
          ]
        : []
      : controlledSortColumns.length
        ? controlledSortColumns.flatMap(({ c, key }) =>
            c.sortOrder ? [{ key, order: c.sortOrder }] : [],
          )
        : sortState;
  const activeFilters: TableFilters = { ...filterState };
  indexed.forEach(({ c, key }) => {
    if (c.filteredValue !== undefined) activeFilters[key] = c.filteredValue;
  });
  const activeText = legacyFilters ?? textState;
  const getKey = React.useCallback(
    (r: T) => (typeof rowKey === "function" ? rowKey(r) : (r as any)[rowKey]),
    [rowKey],
  );
  const childrenName = expandable?.childrenColumnName ?? "children";
  const processed = processTableData(
    source,
    columns,
    activeSorts,
    activeFilters,
    activeText,
    manual,
    childrenName,
  );
  const pageSize = Math.max(
    1,
    Number(pagination ? (pagination.pageSize ?? sizeState) : 10) || 10,
  );
  const total =
    manual && pagination
      ? (pagination.total ?? processed.length)
      : processed.length;
  const requestedPage = pagination
    ? (pagination.current ?? pagination.page ?? pageState)
    : 1;
  const page = Math.min(
    Math.max(1, requestedPage),
    Math.max(1, Math.ceil(total / pageSize)),
  );
  const pageData =
    pagination && !manual
      ? processed.slice((page - 1) * pageSize, page * pageSize)
      : processed;
  const tableRef = React.useRef<Reference>(null);
  React.useImperativeHandle(
    forwardedRef,
    () => ({
      get nativeElement() {
        return tableRef.current!.nativeElement;
      },
      scrollTo: (config) => tableRef.current?.scrollTo(config),
    }),
    [],
  );
  const emit = (
    action: "paginate" | "sort" | "filter",
    next: {
      sorts?: SortState[];
      filters?: TableFilters;
      text?: Record<string, string>;
      page?: number;
      pageSize?: number;
    } = {},
  ) => {
    const sorts = next.sorts ?? activeSorts,
      filters = next.filters ?? activeFilters,
      text = next.text ?? activeText,
      current = next.page ?? page,
      size = next.pageSize ?? pageSize;
    const first = sorts[0];
    const state: TableState = {
      sort: first
        ? {
            key: first.key,
            direction: first.order === "ascend" ? "asc" : "desc",
          }
        : undefined,
      filters: text,
      page: current,
      pageSize: size,
    };
    onChange?.(state);
    const result: TableSortResult<T>[] = sorts.map((s) => {
      const c = indexed.find((x) => x.key === s.key)?.c;
      return {
        column: c,
        columnKey: c?.key ?? s.key,
        field: c?.dataIndex,
        order: s.order,
      };
    });
    const isMultiple =
      sorts.length > 1 ||
      indexed.some(
        ({ c }) =>
          typeof c.sorter === "object" && c.sorter.multiple !== undefined,
      );
    const nextData = processTableData(
      source,
      columns,
      sorts,
      filters,
      text,
      manual,
      childrenName,
    );
    onTableChange?.(
      {
        ...(pagination || {}),
        current,
        page: current,
        pageSize: size,
        total: manual ? total : nextData.length,
      },
      filters,
      isMultiple ? result : (result[0] ?? {}),
      { currentDataSource: nextData, action },
    );
    if (scroll?.scrollToFirstRowOnChange !== false)
      tableRef.current?.scrollTo({ top: 0 });
  };
  const changePage = (current: number, size: number) => {
    setPage(current);
    setSize(size);
    if (pagination) {
      pagination.onChange?.(current, size);
      pagination.onPageChange?.(current);
      if (size !== pageSize) pagination.onShowSizeChange?.(current, size);
    }
    emit("paginate", { page: current, pageSize: size });
  };
  const changeSort = (c: TableColumn<T>, key: string) => {
    const dirs = c.sortDirections ?? sortDirections,
      old = activeSorts.find((s) => s.key === key)?.order;
    const index = old ? dirs.indexOf(old) : -1;
    const order = dirs[index + 1] ?? null;
    const multi =
      typeof c.sorter === "object" && c.sorter.multiple !== undefined;
    let sorts = multi
      ? activeSorts.filter(
          (s) =>
            s.key !== key &&
            typeof indexed.find((x) => x.key === s.key)?.c.sorter === "object",
        )
      : [];
    if (order) sorts = [...sorts, { key, order }];
    setSortState(sorts);
    setPage(1);
    emit("sort", { sorts, page: 1 });
  };
  const titleProps: TableColumnTitleProps<T> = {
    sortColumns: activeSorts.flatMap((s) => {
      const c = indexed.find((x) => x.key === s.key)?.c;
      return c ? [{ column: c, order: s.order }] : [];
    }),
    filters: activeFilters,
  };
  let leafIndex = 0;
  const decorate = (cols: TableColumn<T>[]): TableColumn<T>[] =>
    cols.flatMap((c) => {
      if (c.hidden) {
        leafIndex += c.children ? flattenColumns(c.children).length : 1;
        return [];
      }
      if (c === EXPAND_COLUMN || c === SELECTION_COLUMN) {
        leafIndex++;
        return c;
      }
      const key = getColumnKey(c, leafIndex),
        title = typeof c.title === "function" ? c.title(titleProps) : c.title;
      if (c.children) {
        const children = decorate(c.children);
        return children.length ? { ...c, title, children } : [];
      }
      leafIndex++;
      const sort = activeSorts.find((s) => s.key === key)?.order ?? null,
        sortable = !!(c.sorter || c.sortable);
      const label = typeof title === "string" ? title : key;
      const tooltip = c.showSorterTooltip ?? showSorterTooltip;
      const directions = c.sortDirections ?? sortDirections;
      const nextOrder =
        directions[(sort ? directions.indexOf(sort) : -1) + 1] ?? null;
      const sortHint =
        typeof tooltip === "object" && tooltip.title !== undefined
          ? tooltip.title
          : nextOrder === "ascend"
            ? (locale.triggerAsc ?? (zh ? "点击升序" : "Sort ascending"))
            : nextOrder === "descend"
              ? (locale.triggerDesc ?? (zh ? "点击降序" : "Sort descending"))
              : (locale.cancelSort ?? (zh ? "取消排序" : "Cancel sorting"));
      const icon = (
        <span className="mt-table-sort-icon">
          {c.sortIcon ? (
            c.sortIcon({ sortOrder: sort })
          ) : sort === "ascend" ? (
            <ArrowUp size={13} aria-hidden="true" />
          ) : sort === "descend" ? (
            <ArrowDown size={13} aria-hidden="true" />
          ) : (
            <ArrowUpDown size={13} aria-hidden="true" />
          )}
        </span>
      );
      const iconOnly =
        typeof tooltip === "object" && tooltip.target === "sorter-icon";
      const sortButton = (
        <button
          type="button"
          className="mt-table-sort"
          onClick={() => changeSort(c, key)}
        >
          {title}
          {tooltip && iconOnly ? (
            <Tooltip content={sortHint}>{icon}</Tooltip>
          ) : (
            icon
          )}
        </button>
      );
      const heading = sortable ? (
        tooltip && !iconOnly ? (
          <Tooltip content={sortHint}>{sortButton}</Tooltip>
        ) : (
          sortButton
        )
      ) : (
        title
      );
      return {
        ...c,
        key,
        dataIndex: c.dataIndex ?? (c.key == null ? undefined : String(c.key)),
        title: (
          <>
            <div
              className="mt-table-heading"
              style={{
                justifyContent:
                  c.align === "center"
                    ? "center"
                    : c.align === "right" || c.align === "end"
                      ? "flex-end"
                      : undefined,
              }}
            >
              {heading}
              {(c.filters || c.filterDropdown) && (
                <TableFilter
                  column={c}
                  columnKey={key}
                  value={activeFilters[key] ?? null}
                  zh={zh}
                  locale={locale}
                  getPopupContainer={getPopupContainer}
                  onChange={(values) => {
                    const filters = { ...activeFilters, [key]: values };
                    setFilterState(filters);
                    setPage(1);
                    emit("filter", { filters, page: 1 });
                  }}
                />
              )}
            </div>
            {c.filterable && (
              <input
                className="mt-input mt-table-filter"
                aria-label={`${zh ? "筛选" : "Filter"} ${label}`}
                value={activeText[key] ?? ""}
                onChange={(e) => {
                  const text = { ...activeText, [key]: e.target.value };
                  setTextState(text);
                  setPage(1);
                  emit("filter", { text, page: 1 });
                }}
              />
            )}
          </>
        ),
        onHeaderCell: (col) => ({
          ...c.onHeaderCell?.(col),
          "aria-sort":
            sort === "ascend"
              ? "ascending"
              : sort === "descend"
                ? "descending"
                : undefined,
        }),
      };
    });
  const selection = useTableSelection({
    data: source,
    pageData,
    getRowKey: getKey,
    childrenColumnName: childrenName,
    rowSelection,
    selectedKeys,
    selectable,
    onSelectionChange,
    zh,
    locale,
  });
  let renderedColumns = decorate(columns);
  const hasSelectionMarker = renderedColumns.includes(
    SELECTION_COLUMN as TableColumn<T>,
  );
  renderedColumns = renderedColumns.flatMap((c) =>
    c === SELECTION_COLUMN ? (selection.column ? [selection.column] : []) : [c],
  );
  if (selection.column && !hasSelectionMarker)
    renderedColumns.unshift(selection.column);
  const resolvedClasses =
    typeof classNames === "function"
      ? classNames({ props })
      : (classNames ?? {});
  const resolvedStyles =
    typeof styles === "function" ? styles({ props }) : (styles ?? {});
  const spinning =
    typeof loading === "object" ? loading.spinning !== false : loading;
  const [showLoading, setShowLoading] = React.useState(
    spinning && !(typeof loading === "object" && loading.delay),
  );
  React.useEffect(() => {
    if (!spinning) {
      setShowLoading(false);
      return;
    }
    const delay = typeof loading === "object" ? (loading.delay ?? 0) : 0;
    if (!delay) {
      setShowLoading(true);
      return;
    }
    const timeout = setTimeout(() => setShowLoading(true), delay);
    return () => clearTimeout(timeout);
  }, [spinning, typeof loading === "object" ? loading.delay : 0]);
  const loadingContent =
    typeof loading === "object"
      ? (loading.indicator ?? loading.tip)
      : undefined;
  const rcComponents = {
    ...components,
    ExpandIcon:
      components?.ExpandIcon ??
      ((p: any) =>
        p.type==='row' && expandable?.expandIcon ? expandable.expandIcon({prefixCls:'mt-table',expanded:p.expanded,expandable:p.expandable,record:p.record,onExpand:(_record,event)=>p.onClick(event)}) : p.expandable ? (
          <button
            type="button"
            className="mt-table-expand"
            aria-label={
              p.type === "all"
                ? p.expanded
                  ? zh
                    ? "收起所有行"
                    : "Collapse all rows"
                  : zh
                    ? "展开所有行"
                    : "Expand all rows"
                : p.expanded
                  ? (locale.collapse ?? (zh ? "收起行" : "Collapse row"))
                  : (locale.expand ?? (zh ? "展开行" : "Expand row"))
            }
            aria-expanded={p.expanded}
            onClick={p.onClick}
          >
            {p.expanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
          </button>
        ) : (
          <span className="mt-table-expand-placeholder" />
        )),
  };
  const rcProps = {
    ...engineProps,
    ref: tableRef,
    prefixCls: "mt-table",
    className: cn("mt-table-engine", showLoading && "mt-table-is-loading"),
    data: pageData,
    columns: renderedColumns as ColumnsType<T>,
    rowKey,
    scroll,
    expandable,
    components: rcComponents,
    emptyText: showLoading
      ? null
      : (empty ?? locale.emptyText ?? (zh ? "暂无数据" : "No data")),
    classNames: resolvedClasses,
    styles: resolvedStyles,
    rowClassName: (r: T, i: number, indent: number) =>
      cn(
        typeof rowClassName === "function"
          ? rowClassName(r, i, indent)
          : rowClassName,
        selection.selectedKeys.includes(getKey(r)) && "mt-table-row-selected",
      ),
    onRow: (r: T, i?: number) => ({
      ...onRow?.(r, i),
      "data-selected": selection.selectedKeys.includes(getKey(r)) || undefined,
    }),
    "aria-busy": spinning || undefined,
  };
  const positions = pagination
    ? (pagination.placement ?? pagination.position ?? ["bottomEnd"])
    : [];
  const paginationNodes = (location: "top" | "bottom") =>
    pagination
      ? positions
          .filter((p) => p.startsWith(location))
          .map((p) => (
            <TablePaginationBar
              key={p}
              config={pagination}
              total={total}
              current={page}
              pageSize={pageSize}
              onChange={changePage}
              zh={zh}
              placement={p}
              className={resolvedClasses.pagination}
              style={resolvedStyles.pagination}
            />
          ))
      : null;
  return (
    <div
      className={cn(
        "mt-table-wrap",
        `mt-table-size-${size}`,
        bordered && "mt-table-bordered",
        resolvedClasses.root,
        className,
      )}
      style={{ ...style, ...resolvedStyles.root }}
      aria-busy={spinning || undefined}
    >
      {paginationNodes("top")}
      <div className="mt-table-container">
        {virtual ? (
          <VirtualEngine
            {...rcProps}
            scroll={{
              x: typeof scroll?.x === "number" ? scroll.x : 1000,
              y: typeof scroll?.y === "number" ? scroll.y : 400,
            }}
            listItemHeight={virtualItemHeight}
          />
        ) : (
          <Engine {...rcProps} />
        )}
        {showLoading && (
          <div className="mt-table-loading" role="status">
            {loadingContent ?? (zh ? "加载中…" : "Loading…")}
          </div>
        )}
      </div>
      {paginationNodes("bottom")}
    </div>
  );
}
export const Table = Object.assign(
  React.forwardRef(TableInner) as <T>(
    props: TableProps<T> & React.RefAttributes<Reference>,
  ) => React.ReactElement,
  {
    Column,
    ColumnGroup,
    Summary,
    EXPAND_COLUMN,
    SELECTION_COLUMN,
    SELECTION_ALL: "all" as const,
    SELECTION_INVERT: "invert" as const,
    SELECTION_NONE: "none" as const,
  },
);
