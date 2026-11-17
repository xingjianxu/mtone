import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Menu } from "./interactive";
import type {
  TableColumn,
  TableLocale,
  TableRowSelection,
  TableSelectionType,
} from "./table-types";

type Options<T> = {
  data: T[];
  pageData: T[];
  getRowKey: (row: T) => React.Key;
  childrenColumnName: string;
  rowSelection?: TableRowSelection<T>;
  selectedKeys?: React.Key[];
  selectable?: boolean;
  onSelectionChange?: (keys: React.Key[]) => void;
  zh: boolean;
  locale?: TableLocale;
};
type Node<T> = {
  key: React.Key;
  row: T;
  parent?: Node<T>;
  children: Node<T>[];
  disabled: boolean;
};

/** Selection state is separate from the table renderer so virtualization cannot lose selected records. */
export function useTableSelection<T>({
  data,
  pageData,
  getRowKey,
  childrenColumnName,
  rowSelection,
  selectedKeys,
  selectable,
  onSelectionChange,
  zh,
  locale = {},
}: Options<T>): { column: TableColumn<T> | null; selectedKeys: React.Key[] } {
  const config = rowSelection ?? {};
  const enabled = !!rowSelection || !!selectable;
  const [internalKeys, setInternalKeys] = React.useState<React.Key[]>(
    () => config.defaultSelectedRowKeys ?? [],
  );
  const radioName = React.useId();
  const lastSelectedKey = React.useRef<React.Key | undefined>(undefined);
  const recordCache = React.useRef(new Map<React.Key, T>());
  const map = new Map<React.Key, Node<T>>();
  const flatten = (rows: T[], parent?: Node<T>): Node<T>[] =>
    rows.map((row) => {
      const key = getRowKey(row);
      const node: Node<T> = {
        key,
        row,
        parent,
        children: [],
        disabled: !!config.getCheckboxProps?.(row).disabled,
      };
      map.set(key, node);
      const children = (row as Record<string, unknown>)[childrenColumnName];
      node.children = Array.isArray(children)
        ? flatten(children as T[], node)
        : [];
      return node;
    });
  const roots = flatten(data);
  const pageKeys: React.Key[] = [];
  const visitPage = (rows: T[]) =>
    rows.forEach((row) => {
      pageKeys.push(getRowKey(row));
      const children = (row as Record<string, unknown>)[childrenColumnName];
      if (Array.isArray(children)) visitPage(children as T[]);
    });
  visitPage(pageData);
  const uniquePageKeys = [...new Set(pageKeys)];
  const availableKeys = uniquePageKeys.filter(
    (key) => !map.get(key)?.disabled && map.has(key),
  );
  // Legacy selectable historically kept keys across data replacements, including manual pagination.
  const preserve = config.preserveSelectedRowKeys ?? !rowSelection;
  const inputKeys = config.selectedRowKeys ?? selectedKeys ?? internalKeys;
  const validKeys = inputKeys.filter((key) => preserve || map.has(key));
  const inputSet = new Set(
    config.type === "radio" ? validKeys.slice(0, 1) : validKeys,
  );
  React.useEffect(() => {
    if (
      (!preserve || config.type === "radio") &&
      config.selectedRowKeys === undefined &&
      selectedKeys === undefined &&
      inputSet.size !== inputKeys.length
    ) {
      setInternalKeys([...inputSet]);
    }
  });
  const associated = config.checkStrictly === false && config.type !== "radio";

  const descendants = (node: Node<T>, fn: (item: Node<T>) => void) => {
    if (node.disabled) return;
    fn(node);
    node.children.forEach((child) => descendants(child, fn));
  };
  const conduct = (source: Set<React.Key>) => {
    const checked = new Set(source);
    const half = new Set<React.Key>();
    if (!associated) return { checked, half };
    // Explicit parent selections select descendants, stopping at disabled boundaries.
    [...checked].forEach((key) => {
      const node = map.get(key);
      if (node) descendants(node, (item) => checked.add(item.key));
    });
    const derive = (node: Node<T>) => {
      node.children.forEach(derive);
      if (node.disabled) return;
      const children = node.children.filter((child) => !child.disabled);
      if (!children.length) return;
      if (children.every((child) => checked.has(child.key)))
        checked.add(node.key);
      else {
        checked.delete(node.key);
        if (
          children.some(
            (child) => checked.has(child.key) || half.has(child.key),
          )
        )
          half.add(node.key);
      }
    };
    roots.forEach(derive);
    return { checked, half };
  };
  const { checked, half } = conduct(inputSet);
  const effectiveKeys = [...checked];
  React.useEffect(() => {
    const next = new Map<React.Key, T>();
    effectiveKeys.forEach((key) => {
      const row = map.get(key)?.row ?? recordCache.current.get(key);
      if (row !== undefined) next.set(key, row);
    });
    recordCache.current = next;
  });
  const records = (keys: React.Key[]) =>
    keys
      .map((key) => map.get(key)?.row ?? recordCache.current.get(key))
      .filter((row): row is T => row !== undefined);
  const apply = (next: Set<React.Key>, type: TableSelectionType) => {
    const result = [...conduct(next).checked].filter(
      (key) => preserve || map.has(key),
    );
    if (config.selectedRowKeys === undefined && selectedKeys === undefined)
      setInternalKeys(result);
    config.onChange?.(result, records(result), { type });
    onSelectionChange?.(result);
    return result;
  };
  const changeNodes = (
    base: Set<React.Key>,
    keys: React.Key[],
    value: boolean,
  ) => {
    const next = new Set(base);
    keys.forEach((key) => {
      const node = map.get(key);
      if (!node || node.disabled) return;
      const change = (item: Node<T>) => {
        if (value) next.add(item.key);
        else next.delete(item.key);
      };
      if (associated) {
        descendants(node, change);
        // Remove checked ancestors before recomputing, otherwise their downward pass restores the removed key.
        if (!value) {
          let parent = node.parent;
          while (parent && !parent.disabled) {
            next.delete(parent.key);
            parent = parent.parent;
          }
        }
      } else change(node);
    });
    return next;
  };
  const onRowChange = (row: T, event: React.ChangeEvent<HTMLInputElement>) => {
    const key = getRowKey(row),
      node = map.get(key);
    if (!node || node.disabled) return;
    const selected = event.target.checked;
    if (config.type === "radio") {
      const result = apply(new Set([key]), "single");
      config.onSelect?.(row, true, records(result), event.nativeEvent);
      lastSelectedKey.current = key;
      return;
    }
    const start =
      lastSelectedKey.current === undefined
        ? -1
        : uniquePageKeys.indexOf(lastSelectedKey.current);
    const end = uniquePageKeys.indexOf(key);
    const range =
      (event.nativeEvent as MouseEvent).shiftKey && start !== -1 && end !== -1;
    const changedKeys = range
      ? uniquePageKeys
          .slice(Math.min(start, end), Math.max(start, end) + 1)
          .filter((k) => !map.get(k)?.disabled)
      : [key];
    const next = changeNodes(checked, changedKeys, selected);
    const result = apply(next, range ? "multiple" : "single");
    if (range)
      config.onSelectMultiple?.(
        selected,
        records(result),
        records(changedKeys.filter((k) => checked.has(k) !== selected)),
      );
    else config.onSelect?.(row, selected, records(result), event.nativeEvent);
    lastSelectedKey.current = key;
  };
  const pageAll =
    availableKeys.length > 0 && availableKeys.every((key) => checked.has(key));
  const pageSome =
    !pageAll && availableKeys.some((key) => checked.has(key) || half.has(key));
  const selectPage = () => {
    const selected = !pageAll;
    const result = apply(changeNodes(checked, availableKeys, selected), "all");
    config.onSelectAll?.(
      selected,
      records(result),
      records(availableKeys.filter((key) => checked.has(key) !== selected)),
    );
  };
  const executeSelection = (selection: "all" | "invert" | "none") => {
    if (selection === "all") {
      apply(
        changeNodes(
          checked,
          [...map.keys()].filter((k) => !map.get(k)?.disabled),
          true,
        ),
        "all",
      );
    } else if (selection === "none") {
      const next = new Set([...checked].filter((k) => map.get(k)?.disabled));
      apply(next, "none");
      config.onSelectNone?.();
    } else {
      let next = new Set(checked);
      const add = availableKeys.filter((key) => !checked.has(key));
      const remove = availableKeys.filter((key) => checked.has(key));
      next = changeNodes(next, remove, false);
      next = changeNodes(next, add, true);
      const result = apply(next, "invert");
      config.onSelectInvert?.(result);
    }
  };
  if (!enabled) return { column: null, selectedKeys: effectiveKeys };
  const headerProps = config.getTitleCheckboxProps?.() ?? {};
  const checkbox =
    config.type === "radio" || config.hideSelectAll ? null : (
      <input
        {...headerProps}
        type="checkbox"
        aria-label={
          headerProps["aria-label"] ??
          locale.selectionAll ??
          (zh ? "选择所有行" : "Select all rows")
        }
        checked={pageAll}
        ref={(input) => {
          if (input) input.indeterminate = pageSome;
        }}
        disabled={headerProps.disabled || !availableKeys.length}
        onClick={(event) => {
          event.stopPropagation();
          headerProps.onClick?.(event);
        }}
        onChange={(event) => {
          headerProps.onChange?.(event);
          if (!event.defaultPrevented) selectPage();
        }}
      />
    );
  const commands =
    config.selections === true
      ? (["all", "invert", "none"] as const)
      : config.selections || [];
  const labels = {
    all: locale.selectAll ?? (zh ? "选择全部" : "Select all"),
    invert:
      locale.selectInvert ?? (zh ? "反选当前页" : "Invert page selection"),
    none: locale.selectNone ?? (zh ? "清空选择" : "Select none"),
  };
  const hasActions =
    config.type !== "radio" && !config.hideSelectAll && commands.length > 0;
  const controlsClass =
    "mt-table-selection-controls" +
    (hasActions ? " mt-table-selection-controls-with-actions" : "");
  const title = (
    <span className={controlsClass}>
      {checkbox}
      {hasActions && (
        <Menu
          trigger={
            <button
              type="button"
              className="mt-table-selection-actions"
              aria-label={
                locale.selectionActions ??
                (zh ? "选择操作" : "Selection actions")
              }
              onClick={(event) => event.stopPropagation()}
            >
              <ChevronDown size={12} aria-hidden="true" />
            </button>
          }
          items={commands.map((command, index) => ({
            key: String(index),
            label: typeof command === "string" ? labels[command] : command.text,
            onSelect: () => {
              if (typeof command === "string") executeSelection(command);
              else command.onSelect(availableKeys);
            },
          }))}
        />
      )}
    </span>
  );
  return {
    selectedKeys: effectiveKeys,
    column: {
      key: "__mtone_selection__",
      title:
        typeof config.columnTitle === "function"
          ? config.columnTitle(title)
          : (config.columnTitle ?? title),
      width: config.columnWidth ?? (hasActions ? 64 : 40),
      fixed: config.fixed,
      align: config.align ?? "center",
      className: "mt-table-selection-column",
      onCell: config.onCell,
      render: (_value, row, index) => {
        const key = getRowKey(row),
          props = config.getCheckboxProps?.(row) ?? {};
        const selected = checked.has(key);
        const control = (
          <input
            {...props}
            type={config.type ?? "checkbox"}
            name={
              config.type === "radio" ? (props.name ?? radioName) : props.name
            }
            aria-label={
              props["aria-label"] ??
              (typeof locale.selectRow === "function"
                ? locale.selectRow(key)
                : `${locale.selectRow ?? (zh ? "选择行" : "Select row")} ${String(key)}`)
            }
            checked={selected}
            ref={(input) => {
              if (input) input.indeterminate = half.has(key);
            }}
            onClick={(event) => {
              event.stopPropagation();
              props.onClick?.(event);
            }}
            onChange={(event) => {
              props.onChange?.(event);
              if (!event.defaultPrevented) onRowChange(row, event);
            }}
          />
        );
        return (
          <span className={controlsClass}>
            {config.renderCell
              ? config.renderCell(selected, row, index, control)
              : control}
          </span>
        );
      },
    },
  };
}
