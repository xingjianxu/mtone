import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button, cn, useMtone } from "./basic";
import { Pagination } from "./data";
import { Input } from "./input";
import { Checkbox } from "./interactive";
import { List } from "./list";
import { hasToolbarContent } from "./toolbar-slot";

export type DataListKey = string | number;

export interface DataListSearch<T> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Client-side matcher. Remote lists ignore it. */
  match?: (item: T, query: string) => boolean;
}
export interface DataListLocalPagination {
  mode?: "local";
  page?: number;
  defaultPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}
export interface DataListRemotePagination {
  mode: "remote";
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}
export type DataListPagination =
  DataListLocalPagination | DataListRemotePagination;

export interface DataListSelection<T> {
  selectedKeys?: readonly DataListKey[];
  defaultSelectedKeys?: readonly DataListKey[];
  onChange?: (keys: DataListKey[]) => void;
  getDisabled?: (item: T) => boolean;
}
export interface DataListExpansion<T> {
  expandedKeys?: readonly DataListKey[];
  defaultExpandedKeys?: readonly DataListKey[];
  onChange?: (keys: DataListKey[]) => void;
  isExpandable?: (item: T) => boolean;
  renderDetail: (item: T) => React.ReactNode;
}
export interface DataListBatchContext {
  selectedKeys: readonly DataListKey[];
  clearSelection: () => void;
}
export interface DataListSearchProps {
  label?: string;
  placeholder?: string;
}
export interface DataListSelectionProps {
  children?: (context: DataListBatchContext) => React.ReactNode;
}

export interface DataListProps<T> extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  items: readonly T[];
  /** Unique stable string or finite number. */
  getKey: (item: T) => DataListKey;
  /** Accessible row name; defaults to the stringified key. */
  getLabel?: (item: T) => string;
  /** Row content only. DataList's underlying List owns the li. */
  renderItem: (item: T, index: number) => React.ReactNode;
  search?: DataListSearch<T>;
  /** Client-side predicate. Remote lists ignore it. */
  filter?: (item: T) => boolean;
  /** Explicit top slot. Compose a Toolbar and connected controls if needed. */
  toolbar?: React.ReactNode;
  pagination?: DataListPagination;
  selection?: DataListSelection<T>;
  expansion?: DataListExpansion<T>;
  renderActions?: (item: T) => React.ReactNode;
  loading?: boolean;
  empty?: React.ReactNode;
}

type ToolbarContext = {
  search?: { value: string; onChange: (value: string) => void };
  selection?: DataListBatchContext & {
    all: boolean;
    partial: boolean;
    disabled: boolean;
    selectVisible: (checked: boolean) => void;
  };
};
const DataListToolbarContext = React.createContext<ToolbarContext | null>(null);

function DataListSearchField({ label, placeholder }: DataListSearchProps) {
  const zh = useMtone().locale === "zh";
  const search = React.useContext(DataListToolbarContext)?.search;
  if (!search) return null;
  return (
    <Input.Search
      wrapperClassName="mt-data-list-search"
      aria-label={label ?? (zh ? "搜索列表" : "Search list")}
      placeholder={placeholder ?? (zh ? "搜索…" : "Search…")}
      value={search.value}
      onChange={(event) => search.onChange(event.currentTarget.value)}
      allowClear
    />
  );
}

function DataListSelectionControl({ children }: DataListSelectionProps) {
  const zh = useMtone().locale === "zh";
  const selection = React.useContext(DataListToolbarContext)?.selection;
  if (!selection) return null;
  const { selectedKeys, clearSelection } = selection;
  return (
    <div className="mt-data-list-selection">
      <Checkbox
        label={zh ? "选择当前可见项" : "Select visible items"}
        checked={selection.all}
        indeterminate={selection.partial}
        disabled={selection.disabled}
        onCheckedChange={selection.selectVisible}
      />
      <span className="mt-data-list-count" aria-live="polite">
        {zh
          ? `已选择 ${selectedKeys.length} 项`
          : `${selectedKeys.length} selected`}
      </span>
      {selectedKeys.length > 0 && (
        <div className="mt-data-list-actions">
          {children?.({ selectedKeys, clearSelection })}
          <Button variant="ghost" type="button" onClick={clearSelection}>
            {zh ? "清除选择" : "Clear selection"}
          </Button>
        </div>
      )}
    </div>
  );
}

const integer = (value: number | undefined, fallback: number, min: number) =>
  value !== undefined && Number.isFinite(value)
    ? Math.max(min, Math.trunc(value))
    : fallback;

function updateKeys(
  keys: ReadonlySet<DataListKey>,
  changed: readonly DataListKey[],
  add: boolean,
) {
  const next = new Set(keys);
  for (const key of changed) {
    if (add) next.add(key);
    else next.delete(key);
  }
  return [...next];
}

function DataListRow({
  checkbox,
  actions,
  children,
  detail,
}: {
  checkbox?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  detail?: {
    expanded: boolean;
    label: string;
    onToggle: () => void;
    render: () => React.ReactNode;
  };
}) {
  const detailId = React.useId();
  return (
    <>
      <div className="mt-data-list-row">
        {checkbox}
        <div className="mt-data-list-content">{children}</div>
        {(actions != null || detail) && (
          <div className="mt-data-list-actions">
            {detail && (
              <Button
                iconOnly
                className="mt-data-list-disclosure"
                variant="ghost"
                type="button"
                aria-label={detail.label}
                aria-controls={detailId}
                aria-expanded={detail.expanded}
                onClick={detail.onToggle}
              >
                {detail.expanded ? (
                  <ChevronDown size={16} aria-hidden="true" />
                ) : (
                  <ChevronRight size={16} aria-hidden="true" />
                )}
              </Button>
            )}
            {actions}
          </div>
        )}
      </div>
      {detail && (
        <div
          className="mt-data-list-detail"
          id={detailId}
          hidden={!detail.expanded}
        >
          {detail.expanded && detail.render()}
        </div>
      )}
    </>
  );
}

function DataListRoot<T>({
  items,
  getKey,
  getLabel,
  renderItem,
  search,
  filter,
  toolbar,
  pagination,
  selection,
  expansion,
  renderActions,
  loading = false,
  empty,
  className,
  ...props
}: DataListProps<T>) {
  const zh = useMtone().locale === "zh";
  const remote = pagination?.mode === "remote";
  const [localQuery, setLocalQuery] = React.useState(
    search?.defaultValue ?? "",
  );
  const [localPage, setLocalPage] = React.useState(
    integer(
      pagination?.mode === "remote" ? undefined : pagination?.defaultPage,
      1,
      1,
    ),
  );
  const [localSelected, setLocalSelected] = React.useState<
    readonly DataListKey[]
  >(selection?.defaultSelectedKeys ?? []);
  const [localExpanded, setLocalExpanded] = React.useState<
    readonly DataListKey[]
  >(expansion?.defaultExpandedKeys ?? []);

  const query = search?.value ?? localQuery;
  const trimmedQuery = query.trim();
  const selected = new Set(selection?.selectedKeys ?? localSelected);
  const expanded = new Set(expansion?.expandedKeys ?? localExpanded);
  const rows = React.useMemo(() => {
    const keys = new Set<DataListKey>();
    return items.map((item) => {
      const key = getKey(item);
      if (
        typeof key !== "string" &&
        (typeof key !== "number" || !Number.isFinite(key))
      ) {
        throw new Error("DataList item keys must be a string or finite number");
      }
      if (keys.has(key))
        throw new Error(`DataList has a duplicate item key: ${String(key)}`);
      keys.add(key);
      return { item, key };
    });
  }, [items, getKey]);
  const filtered =
    remote || (!filter && !(search?.match && trimmedQuery))
      ? rows
      : rows.filter(
          ({ item }) =>
            (!filter || filter(item)) &&
            (!trimmedQuery ||
              !search?.match ||
              search.match(item, trimmedQuery)),
        );
  const pageSize = integer(pagination?.pageSize, 10, 1);
  const total =
    pagination?.mode === "remote"
      ? integer(pagination.total, 0, 0)
      : filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const requestedPage = integer(pagination?.page, localPage, 1);
  const page = remote ? requestedPage : Math.min(requestedPage, pageCount);
  const visible =
    pagination && !remote
      ? filtered.slice((page - 1) * pageSize, page * pageSize)
      : filtered;
  const enabledKeys = selection
    ? visible
        .filter(({ item }) => !selection.getDisabled?.(item))
        .map(({ key }) => key)
    : [];
  const picked = enabledKeys.filter((key) => selected.has(key)).length;
  const all = picked > 0 && picked === enabledKeys.length;

  // Clamp uncontrolled local state after a data/filter change, so restoring
  // results later does not bounce the user back to a previously invalid page.
  React.useEffect(() => {
    if (
      pagination &&
      !remote &&
      pagination.page === undefined &&
      page !== localPage
    ) {
      setLocalPage(page);
    }
  }, [pagination, remote, page, localPage]);

  const changePage = (next: number) => {
    if (!pagination || next === requestedPage) return;
    if (!remote && pagination.page === undefined) setLocalPage(next);
    pagination.onPageChange?.(next);
  };
  const changeQuery = (next: string) => {
    if (!search || next === query) return;
    if (search.value === undefined) setLocalQuery(next);
    search.onChange?.(next);
    changePage(1);
  };
  const changeSelection = (next: DataListKey[]) => {
    if (!selection) return;
    if (selection.selectedKeys === undefined) setLocalSelected(next);
    selection.onChange?.(next);
  };
  const clearSelection = () => {
    if (selected.size) changeSelection([]);
  };

  const toolbarContext: ToolbarContext | null = hasToolbarContent(toolbar)
    ? {
        search: search ? { value: query, onChange: changeQuery } : undefined,
        selection: selection
          ? {
              all,
              partial: picked > 0 && !all,
              disabled: !enabledKeys.length,
              selectedKeys: [...selected],
              selectVisible: (checked) =>
                changeSelection(updateKeys(selected, enabledKeys, checked)),
              clearSelection,
            }
          : undefined,
      }
    : null;

  return (
    <DataListToolbarContext.Provider value={null}>
      <section {...props} className={cn("mt-data-list", className)}>
        {toolbarContext && (
          <div className="mt-data-list-toolbar">
            <DataListToolbarContext.Provider value={toolbarContext}>
              {toolbar}
            </DataListToolbarContext.Provider>
          </div>
        )}
        <List
          items={visible}
          getKey={(row) => row.key}
          loading={loading}
          loadingContent={zh ? "加载中…" : "Loading…"}
          emptyContent={empty ?? (zh ? "暂无数据" : "No items")}
          renderItem={({ item, key }, index) => {
            const label = getLabel?.(item) ?? String(key);
            const isExpanded = expanded.has(key);
            const detail =
              expansion && (expansion.isExpandable?.(item) ?? true)
                ? {
                    expanded: isExpanded,
                    label: zh
                      ? `${isExpanded ? "收起" : "展开"} ${label}`
                      : `${isExpanded ? "Collapse" : "Expand"} ${label}`,
                    render: () => expansion.renderDetail(item),
                    onToggle: () => {
                      const next = updateKeys(expanded, [key], !isExpanded);
                      if (expansion.expandedKeys === undefined)
                        setLocalExpanded(next);
                      expansion.onChange?.(next);
                    },
                  }
                : undefined;
            return (
              <DataListRow
                checkbox={
                  selection && (
                    <Checkbox
                      className="mt-data-list-row-check"
                      checked={selected.has(key)}
                      disabled={selection.getDisabled?.(item)}
                      onCheckedChange={(checked) =>
                        changeSelection(updateKeys(selected, [key], checked))
                      }
                    >
                      <span className="mt-data-list-sr-only">
                        {zh ? `选择 ${label}` : `Select ${label}`}
                      </span>
                    </Checkbox>
                  )
                }
                actions={renderActions?.(item)}
                detail={detail}
              >
                {renderItem(item, index)}
              </DataListRow>
            );
          }}
        />
        {pagination && (
          <Pagination
            className="mt-data-list-pagination"
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={changePage}
          />
        )}
      </section>
    </DataListToolbarContext.Provider>
  );
}

export const DataList = Object.assign(DataListRoot, {
  Search: DataListSearchField,
  Selection: DataListSelectionControl,
});
