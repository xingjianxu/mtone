import * as React from "react";
import { Popover } from "@base-ui/react/popover";
import { ChevronDown, X } from "lucide-react";
import { cn, MtoneScope, useMtone } from "./basic";
import { useFieldsetDisabled } from "./fieldset-context";
import { Tree, type TreeProps, type TreeRef } from "./tree";
import type { TreeItem, TreeKey } from "./tree-types";
import {
  normalizeTree,
  buildTreeIndex,
  conductTreeChecks,
  toggleTreeCheck,
  treeCheckDisabled,
} from "./tree-model";

export interface TreeSelectCommonProps {
  items: TreeItem[];
  disabled?: boolean;
  readOnly?: boolean;
  searchable?: boolean;
  searchValue?: string;
  defaultSearchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Use textValue on a node to search a non-text label. */
  filterNode?: (query: string, node: TreeItem) => boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyContent?: React.ReactNode;
  allowClear?: boolean;
  onClear?: () => void;
  checkStrictly?: boolean;
  /** Display only; onValueChange always returns all checked keys. */
  showCheckedStrategy?: "all" | "parent" | "leaf";
  maxTagCount?: number;
  renderValue?: (node: TreeItem) => React.ReactNode;
  expandedKeys?: TreeKey[];
  defaultExpandedKeys?: TreeKey[];
  defaultExpandAll?: boolean;
  onExpand?: TreeProps["onExpand"];
  loadData?: TreeProps["loadData"];
  onLoadError?: TreeProps["onLoadError"];
  loadedKeys?: TreeKey[];
  onLoad?: TreeProps["onLoad"];
  showLine?: boolean;
  showIcon?: boolean;
  titleRender?: TreeProps["titleRender"];
  height?: number;
  virtual?: boolean;
  size?: "sm" | "md" | "lg";
  status?: "error" | "warning";
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  dropdownWidth?: React.CSSProperties["width"];
  prefix?: React.ReactNode;
  name?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}
export type TreeSelectProps = TreeSelectCommonProps &
  (
    | {
        multiple?: false;
        value?: TreeKey | null;
        defaultValue?: TreeKey | null;
        onValueChange?: (value: TreeKey | null, nodes: TreeItem[]) => void;
      }
    | {
        multiple: true;
        value?: TreeKey[];
        defaultValue?: TreeKey[];
        onValueChange?: (value: TreeKey[], nodes: TreeItem[]) => void;
      }
  );
const textOf = (node: TreeItem) =>
  typeof node.textValue === "string"
    ? node.textValue
    : typeof node.label === "string" || typeof node.label === "number"
      ? String(node.label)
      : String(node.id);

export const TreeSelect = React.forwardRef<HTMLButtonElement, TreeSelectProps>(
  function TreeSelect(props, ref) {
    const disabled = useFieldsetDisabled(props.disabled);
    const { locale } = useMtone();
    const zh = locale === "zh";
    const label = props["aria-label"] ?? (zh ? "树选择" : "Tree select");
    const button = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(ref, () => button.current!);
    const tree = React.useRef<TreeRef>(null);
    const search = React.useRef<HTMLInputElement>(null);
    const [localValue, setLocalValue] = React.useState<
      TreeKey | TreeKey[] | null
    >(props.defaultValue ?? (props.multiple ? [] : null));
    const [localOpen, setLocalOpen] = React.useState(
      props.defaultOpen ?? false,
    );
    const [loaded, setLoaded] = React.useState<TreeKey[]>([]);
    const [localSearch, setLocalSearch] = React.useState(
      props.defaultSearchValue ?? "",
    );
    const [expanded, setExpanded] = React.useState<TreeKey[] | undefined>(
      props.defaultExpandedKeys,
    );
    const raw = props.value !== undefined ? props.value : localValue;
    const selected = Array.isArray(raw) ? raw : raw === null ? [] : [raw];
    const items = React.useMemo(
      () => normalizeTree(props.items),
      [props.items],
    );
    const index = React.useMemo(() => buildTreeIndex(items), [items]);
    const state =
      props.multiple && !props.checkStrictly
        ? conductTreeChecks(items, selected)
        : { checked: selected, halfChecked: [] };
    const unknownKeys = selected.filter((key) => !index.has(key));
    if (props.multiple && !props.checkStrictly)
      state.checked.push(...unknownKeys);
    const query = props.searchValue ?? localSearch;
    const filtering = !!query.trim();
    const open = !disabled && !props.readOnly && (props.open ?? localOpen);
    const changeSearch = (next: string) => {
      if (props.searchValue === undefined) setLocalSearch(next);
      props.onSearchChange?.(next);
    };
    const changeOpen = (next: boolean) => {
      if (next && (disabled || props.readOnly)) return;
      if (props.open === undefined) setLocalOpen(next);
      props.onOpenChange?.(next);
      if (!next) changeSearch("");
    };
    const emit = (keys: TreeKey[]) => {
      if (disabled || props.readOnly) return;
      const nodes = keys.flatMap((key) =>
        index.get(key)?.item ? [index.get(key)!.item] : [],
      );
      if (props.multiple) {
        if (props.value === undefined) setLocalValue(keys);
        props.onValueChange?.(keys, nodes);
      } else {
        const value = keys[0] ?? null;
        if (props.value === undefined) setLocalValue(value);
        props.onValueChange?.(value, nodes);
      }
    };
    const toggle = (key: TreeKey, checked: boolean) => {
      const item = index.get(key)?.item;
      if (item && treeCheckDisabled(item)) return;
      emit(
        props.checkStrictly || !index.has(key)
          ? checked
            ? [...new Set([...selected, key])]
            : selected.filter((k) => k !== key)
          : [
              ...toggleTreeCheck(items, selected, key, checked).checked,
              ...unknownKeys,
            ],
      );
    };
    const filtered = React.useMemo(() => {
      if (!filtering) return items;
      const visit = (list: TreeItem[]): TreeItem[] =>
        list.flatMap((node) => {
          const children = visit(node.children ?? []);
          const match = props.filterNode
            ? props.filterNode(query, node)
            : textOf(node)
                .toLocaleLowerCase()
                .includes(query.trim().toLocaleLowerCase());
          return match || children.length ? [{ ...node, children }] : [];
        });
      return visit(items);
    }, [items, filtering, query, props.filterNode]);
    const allFilteredKeys = [...buildTreeIndex(filtered).keys()];
    const display = state.checked.filter((key) => {
      if (!props.multiple || props.checkStrictly) return true;
      const node = index.get(key);
      if (props.showCheckedStrategy === "parent")
        return (
          node?.parent === undefined || !state.checked.includes(node.parent)
        );
      if (props.showCheckedStrategy === "leaf")
        return !node?.item.children?.some((child) =>
          state.checked.includes(child.id),
        );
      return true;
    });
    const valueLabel = (key: TreeKey) => {
      const item = index.get(key)?.item;
      return item ? (props.renderValue?.(item) ?? item.label) : String(key);
    };
    const maxTags = Math.max(
      0,
      Math.floor(props.maxTagCount ?? display.length),
    );
    const [side, align] = (props.placement ?? "bottom-start").split("-") as [
      "bottom" | "top",
      "start" | "end",
    ];
    return (
      <div
        className={cn("mt-tree-select-root", props.className)}
        style={props.style}
      >
        <Popover.Root open={open} onOpenChange={changeOpen}>
          <div
            className="mt-tree-select"
            data-disabled={disabled || undefined}
            data-size={props.size}
            data-status={props.status}
          >
            <Popover.Trigger
              ref={button}
              id={props.id}
              className="mt-tree-select-trigger"
              disabled={disabled}
              role="combobox"
              aria-haspopup="dialog"
              aria-label={label}
              aria-labelledby={props["aria-labelledby"]}
              aria-readonly={props.readOnly || undefined}
              aria-invalid={props.status === "error" || undefined}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault();
                  changeOpen(true);
                }
              }}
            >
              {props.prefix}
              <span
                className={cn(
                  "mt-tree-select-value",
                  !display.length && "mt-tree-select-placeholder",
                )}
              >
                {display.length
                  ? props.multiple
                    ? zh
                      ? `已选择 ${display.length} 项`
                      : `${display.length} selected`
                    : valueLabel(display[0])
                  : (props.placeholder ?? (zh ? "请选择" : "Select…"))}
              </span>
              <ChevronDown size={14} aria-hidden />
            </Popover.Trigger>
            {props.allowClear &&
              selected.length > 0 &&
              !disabled &&
              !props.readOnly && (
                <button
                  type="button"
                  className="mt-tree-select-clear"
                  aria-label={zh ? "清除选择" : "Clear selection"}
                  onClick={() => {
                    emit([]);
                    props.onClear?.();
                    button.current?.focus();
                  }}
                >
                  <X size={12} />
                </button>
              )}
            {props.name && (
              <input
                type="hidden"
                name={props.name}
                disabled={disabled}
                value={
                  props.multiple
                    ? JSON.stringify(state.checked)
                    : (selected[0] ?? "")
                }
              />
            )}
          </div>
          {props.multiple && display.length > 0 && (
            <div
              className="mt-tree-select-tags"
              aria-label={zh ? "已选节点" : "Selected nodes"}
            >
              {display.slice(0, maxTags).map((key) => (
                <span
                  className="mt-tree-select-tag"
                  key={`${typeof key}:${key}`}
                >
                  {valueLabel(key)}
                  {!disabled &&
                    !props.readOnly &&
                    !index.get(key)?.item.disabled &&
                    !index.get(key)?.item.disableCheckbox &&
                    index.get(key)?.item.checkable !== false && (
                      <button
                        type="button"
                        aria-label={`${zh ? "移除" : "Remove"} ${index.get(key) ? textOf(index.get(key)!.item) : key}`}
                        onClick={() => toggle(key, false)}
                      >
                        <X size={10} />
                      </button>
                    )}
                </span>
              ))}
              {display.length > maxTags && (
                <span className="mt-tree-select-tag">
                  +{display.length - maxTags}
                </span>
              )}
            </div>
          )}
          <Popover.Portal>
            <MtoneScope>
              <Popover.Positioner
                className="mt-positioner"
                side={side}
                align={align}
                sideOffset={4}
              >
                <Popover.Popup
                  className="mt-popup mt-tree-select-popup"
                  style={{ width: props.dropdownWidth }}
                  aria-label={label}
                  initialFocus={() => {
                    if (props.searchable) return search.current;
                    tree.current?.focus();
                    return false;
                  }}
                  finalFocus={button}
                >
                  {props.searchable && (
                    <input
                      className="mt-input mt-tree-select-search"
                      ref={search}
                      type="search"
                      aria-label={zh ? "搜索节点" : "Search nodes"}
                      placeholder={
                        props.searchPlaceholder ?? (zh ? "搜索" : "Search…")
                      }
                      value={query}
                      onChange={(e) => changeSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          tree.current?.focus();
                        }
                      }}
                    />
                  )}
                  {filtered.length ? (
                    <Tree
                      ref={tree}
                      items={filtered}
                      label={label}
                      blockNode
                      showLine={props.showLine}
                      showIcon={props.showIcon}
                      titleRender={props.titleRender}
                      height={props.height ?? 256}
                      virtual={props.virtual}
                      selectedKeys={props.multiple ? [] : selected}
                      selectable
                      onSelect={(keys, info) => {
                        if (props.multiple)
                          toggle(
                            info.node.id,
                            !state.checked.includes(info.node.id),
                          );
                        else {
                          emit(keys);
                          changeOpen(false);
                        }
                      }}
                      checkable={props.multiple}
                      checkStrictly
                      checkedKeys={state}
                      onCheck={(_keys, info) =>
                        toggle(info.node.id, info.checked)
                      }
                      expandedKeys={
                        filtering
                          ? allFilteredKeys
                          : (props.expandedKeys ?? expanded)
                      }
                      defaultExpandAll={props.defaultExpandAll}
                      onExpand={(keys, info) => {
                        if (!filtering) {
                          setExpanded(keys);
                          props.onExpand?.(keys, info);
                        }
                      }}
                      loadData={filtering ? undefined : props.loadData}
                      loadedKeys={props.loadedKeys ?? loaded}
                      onLoad={(keys, info) => {
                        setLoaded(keys);
                        props.onLoad?.(keys, info);
                      }}
                      onLoadError={props.onLoadError}
                    />
                  ) : (
                    <div className="mt-tree-select-empty" role="status">
                      {props.emptyContent ??
                        (zh ? "无匹配节点" : "No matching nodes")}
                    </div>
                  )}
                </Popover.Popup>
              </Popover.Positioner>
            </MtoneScope>
          </Popover.Portal>
        </Popover.Root>
      </div>
    );
  },
);
