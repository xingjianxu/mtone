import { useFieldsetDisabled } from "./fieldset-context";
import * as React from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button, Input, cn, useMtone } from "./basic";
import { Checkbox } from "./interactive";
export interface TransferItem {
  key: string;
  label: React.ReactNode;
  description?: React.ReactNode;
  searchText?: string;
  disabled?: boolean;
}
export type TransferDirection = "left" | "right";
export interface TransferListContext {
  direction: TransferDirection;
  items: TransferItem[];
  selectedKeys: string[];
  disabled: boolean;
  select: (keys: string[], selected: boolean) => void;
  remove: (keys: string[]) => void;
}
export interface TransferProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "children"
> {
  items: TransferItem[];
  targetKeys?: string[];
  defaultTargetKeys?: string[];
  onChange?: (
    targetKeys: string[],
    direction: TransferDirection,
    moveKeys: string[],
  ) => void;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelectChange?: (sourceKeys: string[], targetKeys: string[]) => void;
  showSearch?: boolean;
  filterOption?: (
    query: string,
    item: TransferItem,
    direction: TransferDirection,
  ) => boolean;
  onSearch?: (direction: TransferDirection, query: string) => void;
  titles?: [React.ReactNode, React.ReactNode];
  panelLabels?: [string, string];
  operationLabels?: [string, string];
  searchPlaceholder?: string;
  emptyContent?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  oneWay?: boolean;
  showSelectAll?: boolean;
  pagination?: boolean | { pageSize?: number };
  height?: number | string;
  status?: "error" | "warning";
  renderItem?: (
    item: TransferItem,
    direction: TransferDirection,
  ) => React.ReactNode;
  renderList?: (context: TransferListContext) => React.ReactNode;
  footer?: (context: TransferListContext) => React.ReactNode;
}
const unique = (keys: string[]) => Array.from(new Set(keys));
export const Transfer = React.forwardRef<HTMLDivElement, TransferProps>(
  function Transfer(
    {
      items,
      targetKeys,
      defaultTargetKeys = [],
      onChange,
      selectedKeys,
      defaultSelectedKeys = [],
      onSelectChange,
      showSearch = false,
      filterOption,
      onSearch,
      titles,
      panelLabels,
      operationLabels,
      searchPlaceholder,
      emptyContent,
      disabled = false,
      loading = false,
      oneWay = false,
      showSelectAll = true,
      pagination = false,
      height = 220,
      status,
      renderItem,
      renderList,
      footer,
      className,
      ...props
    },
    ref,
  ) {
    disabled = useFieldsetDisabled(disabled);
    const { locale } = useMtone(),
      en = locale === "en";
    const labels =
      panelLabels ?? (en ? ["Available", "Selected"] : ["待选项", "已选项"]);
    const operations =
      operationLabels ??
      (en
        ? ["Move to selected", "Move to available"]
        : ["移入已选", "移回待选"]);
    const [internalTarget, setTarget] = React.useState(defaultTargetKeys),
      [internalSelected, setSelected] = React.useState(defaultSelectedKeys);
    const [queries, setQueries] = React.useState(["", ""]),
      [pages, setPages] = React.useState([1, 1]);
    const data = Array.from(
        new Map(items.map((item) => [item.key, item])).values(),
      ),
      map = new Map(data.map((item) => [item.key, item]));
    const target = unique(targetKeys ?? internalTarget),
      targetSet = new Set(target),
      selection = unique(selectedKeys ?? internalSelected).filter((key) =>
        map.has(key),
      ),
      selectionSet = new Set(selection);
    const blocked = disabled || loading;
    const sides = [
      data.filter((item) => !targetSet.has(item.key)),
      target
        .map((key) => map.get(key))
        .filter((item): item is TransferItem => !!item),
    ];
    const updateSelection = (next: string[]) => {
      if (selectedKeys === undefined) setSelected(next);
      onSelectChange?.(
        next.filter((key) => !targetSet.has(key)),
        next.filter((key) => targetSet.has(key)),
      );
    };
    const select = (
      direction: TransferDirection,
      keys: string[],
      checked: boolean,
    ) => {
      if (blocked) return;
      const right = direction === "right";
      const valid = keys.filter(
        (key) =>
          map.has(key) &&
          !map.get(key)!.disabled &&
          targetSet.has(key) === right,
      );
      updateSelection(
        checked
          ? unique([...selection, ...valid])
          : selection.filter((key) => !valid.includes(key)),
      );
    };
    const move = (direction: TransferDirection, explicit?: string[]) => {
      if (blocked) return;
      const moving = (explicit ?? selection).filter(
        (key) =>
          map.has(key) &&
          !map.get(key)!.disabled &&
          targetSet.has(key) === (direction === "left"),
      );
      if (!moving.length) return;
      const next =
        direction === "right"
          ? unique([...target, ...moving])
          : target.filter((key) => !moving.includes(key));
      if (targetKeys === undefined) setTarget(next);
      const remaining = selection.filter((key) => !moving.includes(key));
      if (selectedKeys === undefined) setSelected(remaining);
      onSelectChange?.(
        remaining.filter((key) => !next.includes(key)),
        remaining.filter((key) => next.includes(key)),
      );
      onChange?.(next, direction, moving);
    };
    const count = (side: number) =>
      sides[side].filter((item) => selectionSet.has(item.key) && !item.disabled)
        .length;
    const renderPanel = (side: number) => {
      const direction: TransferDirection = side ? "right" : "left",
        query = queries[side];
      const filtered = sides[side].filter(
        (item) =>
          !query ||
          (filterOption
            ? filterOption(query, item, direction)
            : (
                item.searchText ??
                (typeof item.label === "string" ? item.label : item.key)
              )
                .toLocaleLowerCase()
                .includes(query.toLocaleLowerCase())),
      );
      const requested =
        typeof pagination === "object" ? pagination.pageSize : 10;
      const pageSize =
        Number.isFinite(requested) && requested! > 0
          ? Math.max(1, Math.floor(requested!))
          : 10;
      const paginated = !!pagination && !renderList,
        totalPages = Math.max(1, Math.ceil(filtered.length / pageSize)),
        page = Math.min(pages[side], totalPages);
      const visible = paginated
        ? filtered.slice((page - 1) * pageSize, page * pageSize)
        : filtered;
      const enabled = visible.filter((item) => !item.disabled),
        checkedCount = enabled.filter((item) =>
          selectionSet.has(item.key),
        ).length;
      const context: TransferListContext = {
        direction,
        items: filtered,
        selectedKeys: selection.filter(
          (key) => targetSet.has(key) === (side === 1),
        ),
        disabled: blocked,
        select: (keys, checked) => select(direction, keys, checked),
        remove: (keys) => {
          if (direction === "right") move("left", keys);
        },
      };
      return (
        <section
          className="mt-transfer-panel"
          aria-label={labels[side]}
          aria-busy={loading}
          key={direction}
        >
          <div className="mt-transfer-header">
            {showSelectAll && !(oneWay && side === 1) && (
              <Checkbox
                aria-label={`${en ? "Select all" : "全选"}${labels[side]}`}
                checked={enabled.length > 0 && checkedCount === enabled.length}
                indeterminate={
                  checkedCount > 0 && checkedCount < enabled.length
                }
                disabled={blocked || !enabled.length}
                onCheckedChange={(checked) =>
                  select(
                    direction,
                    enabled.map((item) => item.key),
                    checked,
                  )
                }
              />
            )}
            <span className="mt-transfer-title">
              {titles?.[side] ?? labels[side]}
            </span>
            <span className="mt-transfer-count">
              {count(side)}/{sides[side].length}
            </span>
          </div>
          {showSearch && (
            <div className="mt-transfer-search">
              <Input
                aria-label={`${en ? "Search " : "搜索"}${labels[side]}`}
                placeholder={searchPlaceholder ?? (en ? "Search" : "搜索")}
                value={query}
                disabled={blocked}
                onChange={(event) => {
                  const value = event.target.value;
                  setQueries((q) => q.map((v, i) => (i === side ? value : v)));
                  setPages((p) => p.map((v, i) => (i === side ? 1 : v)));
                  onSearch?.(direction, value);
                }}
              />
            </div>
          )}
          <div className="mt-transfer-list" style={{ height }}>
            {loading && (
              <div className="mt-transfer-message" role="status">
                {en ? "Loading…" : "加载中…"}
              </div>
            )}
            {renderList
              ? renderList(context)
              : visible.map((item) => (
                  <div
                    className="mt-transfer-row"
                    key={item.key}
                    data-disabled={item.disabled || blocked || undefined}
                    data-selected={selectionSet.has(item.key) || undefined}
                  >
                    {oneWay && side === 1 ? (
                      <>
                        <div className="mt-transfer-item">
                          {renderItem?.(item, direction) ?? item.label}
                          {item.description && (
                            <small>{item.description}</small>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`${en ? "Remove " : "移除 "}${item.searchText ?? (typeof item.label === "string" ? item.label : item.key)}`}
                          disabled={blocked || item.disabled}
                          onClick={() => move("left", [item.key])}
                        >
                          <X size={14} />
                        </Button>
                      </>
                    ) : (
                      <Checkbox
                        checked={selectionSet.has(item.key)}
                        disabled={blocked || item.disabled}
                        onCheckedChange={(checked) =>
                          select(direction, [item.key], checked)
                        }
                      >
                        <span className="mt-transfer-item">
                          {renderItem?.(item, direction) ?? item.label}
                          {item.description && (
                            <small>{item.description}</small>
                          )}
                        </span>
                      </Checkbox>
                    )}
                  </div>
                ))}
            {!renderList && !visible.length && !loading && (
              <div className="mt-transfer-message">
                {emptyContent ?? (en ? "No items" : "暂无数据")}
              </div>
            )}
          </div>
          {paginated && (
            <div className="mt-transfer-pagination">
              <Button
                size="sm"
                variant="ghost"
                aria-label={en ? "Previous page" : "上一页"}
                disabled={blocked || page <= 1}
                onClick={() =>
                  setPages((p) => p.map((v, i) => (i === side ? page - 1 : v)))
                }
              >
                <ChevronLeft size={14} />
              </Button>
              <span>
                {page}/{totalPages}
              </span>
              <Button
                size="sm"
                variant="ghost"
                aria-label={en ? "Next page" : "下一页"}
                disabled={blocked || page >= totalPages}
                onClick={() =>
                  setPages((p) => p.map((v, i) => (i === side ? page + 1 : v)))
                }
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          )}
          {footer && (
            <div className="mt-transfer-footer">{footer(context)}</div>
          )}
        </section>
      );
    };
    return (
      <div
        {...props}
        ref={ref}
        className={cn("mt-transfer", className)}
        data-status={status}
        data-disabled={disabled || undefined}
      >
        {renderPanel(0)}
        <div className="mt-transfer-operations">
          <Button
            aria-label={operations[0]}
            disabled={blocked || !count(0)}
            onClick={() => move("right")}
          >
            <ChevronRight size={14} />
          </Button>
          {!oneWay && (
            <Button
              aria-label={operations[1]}
              disabled={blocked || !count(1)}
              onClick={() => move("left")}
            >
              <ChevronLeft size={14} />
            </Button>
          )}
        </div>
        {renderPanel(1)}
      </div>
    );
  },
);
