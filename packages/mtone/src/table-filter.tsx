import * as React from "react";
import { Popover } from "@base-ui/react/popover";
import { Filter, ChevronRight } from "lucide-react";
import { Button, cn, MtoneScope } from "./basic";
import type {
  DataTableColumn,
  DataTableFilterDropdownProps,
  DataTableFilterItem,
  DataTableFilterValue,
  DataTableLocale,
} from "./table-types";

export type TableFilterProps<T> = {
  column: DataTableColumn<T>;
  columnKey: string;
  value: DataTableFilterValue[] | null;
  onChange: (values: DataTableFilterValue[] | null) => void;
  zh: boolean;
  locale?: DataTableLocale;
  getPopupContainer?: (trigger: HTMLElement) => HTMLElement;
};
const sameValues = (
  a: readonly DataTableFilterValue[],
  b: readonly DataTableFilterValue[],
) => a.length === b.length && a.every((value, index) => value === b[index]);
function plainText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(plainText).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node))
    return plainText(node.props.children);
  return "";
}
function itemValues(item: DataTableFilterItem): DataTableFilterValue[] {
  return [item.value, ...(item.children ?? []).flatMap(itemValues)];
}
function MixedCheckbox({
  mixed,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { mixed: boolean }) {
  const input = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (input.current) input.current.indeterminate = mixed;
  }, [mixed]);
  return (
    <input
      {...props}
      ref={input}
      aria-checked={mixed ? "mixed" : props.checked}
    />
  );
}

/** Accessible, draft-based filter UI; table owns committed filter state. */
export function TableFilter<T>({
  column,
  columnKey,
  value,
  onChange,
  zh,
  locale,
  getPopupContainer,
}: TableFilterProps<T>) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = column.filterDropdownProps?.open ?? internalOpen;
  const [draft, setDraftState] = React.useState<DataTableFilterValue[]>(
    value ?? [],
  );
  const draftRef = React.useRef(draft);
  const committed = React.useRef<DataTableFilterValue[]>(value ?? []);
  const previousValue = React.useRef(value);
  const previousOpen = React.useRef(false);
  const [search, setSearch] = React.useState("");
  const [collapsed, setCollapsed] = React.useState<Set<DataTableFilterValue>>(
    new Set(),
  );
  const trigger = React.useRef<HTMLButtonElement | null>(null);
  const [portalContainer, setPortalContainer] = React.useState<
    HTMLElement | undefined
  >();
  const id = React.useId();
  const title =
    typeof column.title === "function"
      ? columnKey
      : plainText(column.title) || columnKey;
  const filterLabel = `${locale?.filterTitle ?? (zh ? "筛选" : "Filter")} ${title}`;
  const multiple = column.filterMultiple !== false;
  const isTree = column.filterMode === "tree";
  const setDraft = React.useCallback((keys: DataTableFilterValue[]) => {
    draftRef.current = keys;
    setDraftState(keys);
  }, []);
  React.useEffect(() => {
    const changed = !sameValues(previousValue.current ?? [], value ?? []);
    if (changed || (open && !previousOpen.current)) {
      setDraft(value ?? []);
      committed.current = value ?? [];
      if (open && !previousOpen.current) setSearch("");
    }
    previousValue.current = value;
    previousOpen.current = open;
  }, [value, open, setDraft]);
  React.useLayoutEffect(() => {
    if (trigger.current && getPopupContainer)
      setPortalContainer(getPopupContainer(trigger.current));
    else setPortalContainer(undefined);
  }, [getPopupContainer, open]);

  const commit = (keys: DataTableFilterValue[], force = false) => {
    if (force || !sameValues(committed.current, keys)) {
      committed.current = [...keys];
      onChange(keys.length ? [...keys] : null);
    }
  };
  const changeOpen = (next: boolean, applyOnClose = true) => {
    if (!next && open && applyOnClose && column.filterOnClose !== false)
      commit(draftRef.current);
    if (next) {
      setDraft(value ?? []);
      committed.current = value ?? [];
      setSearch("");
    }
    setInternalOpen(next);
    column.filterDropdownProps?.onOpenChange?.(next);
  };
  const confirm: DataTableFilterDropdownProps["confirm"] = (options) => {
    commit(draftRef.current, true);
    if (options?.closeDropdown !== false) changeOpen(false, false);
  };
  const clearFilters: DataTableFilterDropdownProps["clearFilters"] = (options) => {
    const next = column.filterResetToDefaultFilteredValue
      ? (column.defaultFilteredValue ?? [])
      : [];
    setDraft(next);
    if (options?.confirm !== false) commit(next, true);
    if (options?.closeDropdown) changeOpen(false, false);
  };
  const toggle = (item: DataTableFilterItem) => {
    if (!multiple) {
      setDraft([item.value]);
      return;
    }
    const values = isTree ? itemValues(item) : [item.value];
    const all = values.every((key) => draftRef.current.includes(key));
    const next = new Set(
      all
        ? draftRef.current.filter((key) => !values.includes(key))
        : [...draftRef.current, ...values],
    );
    if (isTree) {
      const reconcile = (items: DataTableFilterItem[]) =>
        items.forEach((node) => {
          if (!node.children?.length) return;
          reconcile(node.children);
          if (
            node.children.every((child) =>
              itemValues(child).every((key) => next.has(key)),
            )
          )
            next.add(node.value);
          else next.delete(node.value);
        });
      reconcile(column.filters ?? []);
    }
    setDraft([...next]);
  };
  const matches = (item: DataTableFilterItem) =>
    !search ||
    (typeof column.filterSearch === "function"
      ? column.filterSearch(search, item)
      : plainText(item.text)
          .toLocaleLowerCase()
          .includes(search.toLocaleLowerCase()));
  const visibleItems = (items: DataTableFilterItem[]): DataTableFilterItem[] =>
    items.flatMap((item) => {
      const children = item.children ? visibleItems(item.children) : undefined;
      return matches(item) || children?.length ? [{ ...item, children }] : [];
    });
  const originalItems = React.useMemo(() => {
    const map = new Map<DataTableFilterValue, DataTableFilterItem>();
    const visit = (items: DataTableFilterItem[]) =>
      items.forEach((item) => {
        map.set(item.value, item);
        if (item.children) visit(item.children);
      });
    visit(column.filters ?? []);
    return map;
  }, [column.filters]);
  const items = visibleItems(column.filters ?? []);
  const renderItems = (
    entries: DataTableFilterItem[],
    depth = 0,
  ): React.ReactNode =>
    entries.map((item, index) => {
      const original = originalItems.get(item.value) ?? item;
      const descendants = isTree ? itemValues(original) : [item.value];
      const checked =
        multiple && isTree
          ? descendants.every((key) => draft.includes(key))
          : draft.includes(item.value);
      const mixed =
        multiple &&
        isTree &&
        !checked &&
        descendants.some((key) => draft.includes(key));
      const expanded = !!search || !collapsed.has(item.value);
      const children = !!item.children?.length;
      const label = plainText(item.text) || String(item.value);
      return (
        <li
          key={`${typeof item.value}:${String(item.value)}:${index}`}
          className="mt-table-filter-item"
          role={isTree ? "treeitem" : undefined}
          aria-expanded={isTree && children ? expanded : undefined}
        >
          <div
            className="mt-table-filter-option"
            style={{ paddingInlineStart: depth * 14 }}
          >
            {isTree && children && (
              <button
                type="button"
                className="mt-table-filter-expand"
                aria-label={`${expanded ? (zh ? "收起" : "Collapse") : zh ? "展开" : "Expand"} ${label}`}
                onClick={() =>
                  setCollapsed((previous) => {
                    const next = new Set(previous);
                    next.has(item.value)
                      ? next.delete(item.value)
                      : next.add(item.value);
                    return next;
                  })
                }
              >
                <ChevronRight
                  size={12}
                  aria-hidden="true"
                  style={{ transform: expanded ? "rotate(90deg)" : undefined }}
                />
              </button>
            )}
            <label className="mt-table-filter-label">
              <MixedCheckbox
                type={multiple ? "checkbox" : "radio"}
                name={multiple ? undefined : id}
                checked={checked}
                mixed={mixed}
                aria-label={label}
                onChange={() => toggle(original)}
              />
              <span>{item.text}</span>
            </label>
          </div>
          {children && expanded && (
            <ul
              className="mt-table-filter-items"
              role={isTree ? "group" : undefined}
            >
              {renderItems(item.children!, depth + 1)}
            </ul>
          )}
        </li>
      );
    });
  const active = column.filtered ?? !!value?.length;
  const icon =
    typeof column.filterIcon === "function"
      ? column.filterIcon(active)
      : (column.filterIcon ?? (
          <Filter size={13} strokeWidth={1.5} aria-hidden="true" />
        ));
  const customProps: DataTableFilterDropdownProps = {
    prefixCls: "mt-table-filter",
    selectedKeys: draft,
    setSelectedKeys: setDraft,
    confirm,
    clearFilters,
    close: () => changeOpen(false, false),
    filters: column.filters,
    visible: open,
  };
  return (
    <Popover.Root open={open} onOpenChange={(next) => changeOpen(next)}>
      <Popover.Trigger
        ref={trigger}
        type="button"
        className={cn(
          "mt-table-filter-trigger",
          active && "mt-table-filter-active",
        )}
        aria-label={filterLabel}
        onClick={(event) => event.stopPropagation()}
      >
        {icon}
      </Popover.Trigger>
      <Popover.Portal container={portalContainer}>
        <MtoneScope>
          <Popover.Positioner
            side="bottom"
            align="end"
            sideOffset={4}
            className="mt-positioner"
          >
            <Popover.Popup
              className={cn(
                "mt-popup",
                "mt-table-filter-popup",
                column.filterDropdownProps?.className,
              )}
              style={column.filterDropdownProps?.style}
              aria-label={filterLabel}
              onClick={(event) => event.stopPropagation()}
            >
              {column.filterDropdown !== undefined ? (
                typeof column.filterDropdown === "function" ? (
                  column.filterDropdown(customProps)
                ) : (
                  column.filterDropdown
                )
              ) : (
                <>
                  {column.filterSearch && (
                    <input
                      type="search"
                      className="mt-input mt-table-filter-search"
                      aria-label={
                        locale?.filterSearchPlaceholder ??
                        (zh ? "搜索筛选项" : "Search filters")
                      }
                      placeholder={
                        locale?.filterSearchPlaceholder ??
                        (zh ? "搜索筛选项" : "Search filters")
                      }
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  )}
                  <ul
                    className="mt-table-filter-items"
                    role={isTree ? "tree" : undefined}
                    aria-label={isTree ? filterLabel : undefined}
                  >
                    {renderItems(items)}
                  </ul>
                  {!items.length && (
                    <div className="mt-table-filter-no-results">
                      {zh ? "无匹配项" : "No matches"}
                    </div>
                  )}
                  <div className="mt-table-filter-actions">
                    <Button variant="ghost" onClick={() => clearFilters()}>
                      {locale?.filterReset ?? (zh ? "重置" : "Reset")}
                    </Button>
                    <Button variant="soft" onClick={() => confirm()}>
                      {locale?.filterConfirm ?? (zh ? "确定" : "OK")}
                    </Button>
                  </div>
                </>
              )}
            </Popover.Popup>
          </Popover.Positioner>
        </MtoneScope>
      </Popover.Portal>
    </Popover.Root>
  );
}
