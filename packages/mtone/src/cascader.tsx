import { useFieldsetDisabled } from "./fieldset-context";
import * as React from "react";
import { Popover } from "@base-ui/react/popover";
import {
  Check,
  ChevronDown,
  ChevronRight,
  LoaderCircle,
  Minus,
  X,
} from "lucide-react";
import { cn, MtoneScope, useMtone } from "./basic";

export type CascaderKey = string | number;
export type CascaderPath = CascaderKey[];
export interface CascaderOption {
  value: CascaderKey;
  label: React.ReactNode;
  /** Required for searching non-text labels. */
  textValue?: string;
  children?: CascaderOption[];
  disabled?: boolean;
  /** false declares an unloaded branch; loadOptions must supply its children. */
  isLeaf?: boolean;
}
interface CascaderCommon {
  options: CascaderOption[];
  disabled?: boolean;
  readOnly?: boolean;
  changeOnSelect?: boolean;
  expandTrigger?: "click" | "hover";
  searchable?: boolean;
  searchValue?: string;
  defaultSearchValue?: string;
  onSearchChange?: (value: string) => void;
  filterOption?: (query: string, path: CascaderOption[]) => boolean;
  loadOptions?: (path: CascaderOption[]) => Promise<CascaderOption[]>;
  onLoadError?: (error: unknown, path: CascaderOption[]) => void;
  renderOption?: (
    option: CascaderOption,
    path: CascaderOption[],
  ) => React.ReactNode;
  emptyContent?: React.ReactNode;
  loadingText?: React.ReactNode;
  loadErrorText?: React.ReactNode;
  searchPlaceholder?: string;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}
type CascaderSelection =
  | {
      multiple?: false;
      value?: CascaderPath;
      defaultValue?: CascaderPath;
      onValueChange?: (value: CascaderPath, options: CascaderOption[]) => void;
    }
  | {
      multiple: true;
      value?: CascaderPath[];
      defaultValue?: CascaderPath[];
      onValueChange?: (
        value: CascaderPath[],
        options: CascaderOption[][],
      ) => void;
    };
export type CascaderPanelProps = CascaderCommon & CascaderSelection;
export type CascaderProps = CascaderPanelProps & {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  allowClear?: boolean;
  onClear?: () => void;
  size?: "sm" | "md" | "lg";
  status?: "error" | "warning";
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  /** Only changes multiple-value presentation; callbacks always contain leaf paths. */
  showCheckedStrategy?: "parent" | "leaf";
  maxTagCount?: number;
  renderValue?: (
    options: CascaderOption[],
    path: CascaderPath,
  ) => React.ReactNode;
  prefix?: React.ReactNode;
  name?: string;
  id?: string;
};
const keyOf = (path: CascaderPath) => JSON.stringify(path);
const textOf = (option: CascaderOption) =>
  option.textValue ??
  (typeof option.label === "string" || typeof option.label === "number"
    ? String(option.label)
    : String(option.value));
const prefixOf = (a: CascaderPath, b: CascaderPath) =>
  a.length <= b.length && a.every((v, i) => v === b[i]);
type Entry = {
  option: CascaderOption;
  path: CascaderPath;
  nodes: CascaderOption[];
  children: Entry[];
  branch: boolean;
  disabled: boolean;
  unloaded: boolean;
};
const EMPTY_OPTIONS: CascaderOption[] = [];
function useCascader(props: CascaderPanelProps) {
  const [internal, setInternal] = React.useState<CascaderPath | CascaderPath[]>(
    props.defaultValue ?? [],
  );
  const raw = props.value ?? internal;
  const selected: CascaderPath[] = props.multiple
    ? (raw as CascaderPath[])
    : raw.length
      ? [raw as CascaderPath]
      : [];
  const [searchInternal, setSearchInternal] = React.useState(
    props.defaultSearchValue ?? "",
  );
  const search = props.searchValue ?? searchInternal;
  const setSearch = (value: string) => {
    if (props.searchValue === undefined) setSearchInternal(value);
    props.onSearchChange?.(value);
  };
  const [expanded, setExpanded] = React.useState<CascaderPath>(
    selected[0]?.slice(0, -1) ?? [],
  );
  // Structural identity survives ordinary controlled re-renders with inline arrays.
  // Change the component key to explicitly reset loaded data for a new data source.
  const describe = (options: CascaderOption[]): unknown[] =>
    options.map((option) => [
      option.value,
      textOf(option),
      !!option.disabled,
      option.isLeaf,
      option.children ? describe(option.children) : null,
    ]);
  const source = JSON.stringify(describe(props.options));
  const [cache, setCache] = React.useState<{
    source: string;
    children: Map<string, CascaderOption[]>;
  }>({ source, children: new Map() });
  const validCache = cache.source === source;
  const [pending, setPending] = React.useState<Set<string>>(new Set());
  const [errors, setErrors] = React.useState<Set<string>>(new Set());
  const generation = React.useRef(0),
    alive = React.useRef(true),
    inFlight = React.useRef(new Set<string>());
  React.useLayoutEffect(() => {
    generation.current++;
    inFlight.current.clear();
    setPending(new Set());
    setErrors(new Set());
    setCache({
      source,
      children: new Map(),
    });
  }, [source]);
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      generation.current++;
    };
  }, []);
  const roots = React.useMemo(() => {
    const walk = (
      options: CascaderOption[],
      path: CascaderPath,
      nodes: CascaderOption[],
      disabled: boolean,
    ): Entry[] =>
      options.map((option) => {
        const next = [...path, option.value],
          cached = validCache ? cache.children.get(keyOf(next)) : undefined;
        const children = option.children ?? cached;
        const unloaded = option.isLeaf === false && children === undefined;
        const entry: Entry = {
          option,
          path: next,
          nodes: [...nodes, option],
          children: [],
          branch: option.isLeaf !== true && (unloaded || !!children?.length),
          disabled: disabled || !!option.disabled,
          unloaded,
        };
        entry.children =
          option.isLeaf === true
            ? []
            : walk(
                children ?? EMPTY_OPTIONS,
                next,
                entry.nodes,
                entry.disabled,
              );
        return entry;
      });
    return walk(props.options, [], [], false);
  }, [props.options, cache, validCache]);
  const all: Entry[] = [];
  const visit = (entries: Entry[]) =>
    entries.forEach((e) => {
      all.push(e);
      visit(e.children);
    });
  visit(roots);
  const byKey = new Map(all.map((e) => [keyOf(e.path), e]));
  const selectedKeys = new Set(selected.map(keyOf));
  const leaves = (entry: Entry): Entry[] =>
    entry.disabled
      ? []
      : entry.branch
        ? entry.children.flatMap(leaves)
        : [entry];
  const checked = (entry: Entry): boolean | "mixed" => {
    const targets = leaves(entry);
    const count = targets.filter((e) => selectedKeys.has(keyOf(e.path))).length;
    return count === 0 ? false : count === targets.length ? true : "mixed";
  };
  const emit = (next: CascaderPath[]) => {
    if (props.disabled || props.readOnly) return;
    if (props.multiple) {
      if (props.value === undefined) setInternal(next);
      props.onValueChange?.(
        next,
        next.map((p) => byKey.get(keyOf(p))?.nodes ?? []),
      );
    } else {
      const path = next[0] ?? [];
      if (props.value === undefined) setInternal(path);
      props.onValueChange?.(path, byKey.get(keyOf(path))?.nodes ?? []);
    }
  };
  const load = async (entry: Entry) => {
    if (
      !entry.unloaded ||
      !props.loadOptions ||
      inFlight.current.has(keyOf(entry.path)) ||
      props.disabled ||
      props.readOnly ||
      entry.disabled
    )
      return;
    const key = keyOf(entry.path),
      version = generation.current;
    inFlight.current.add(key);
    setPending((s) => new Set(s).add(key));
    setErrors((s) => {
      const n = new Set(s);
      n.delete(key);
      return n;
    });
    try {
      const children = await props.loadOptions(entry.nodes);
      if (!alive.current || generation.current !== version) return;
      setCache((s) => ({
        ...s,
        children: new Map(s.children).set(key, children),
      }));
    } catch (error) {
      if (!alive.current || generation.current !== version) return;
      setErrors((s) => new Set(s).add(key));
      props.onLoadError?.(error, entry.nodes);
    } finally {
      if (alive.current && generation.current === version) {
        inFlight.current.delete(key);
        setPending((s) => {
          const n = new Set(s);
          n.delete(key);
          return n;
        });
      }
    }
  };
  const expand = (entry: Entry) => {
    if (entry.disabled || props.disabled || props.readOnly) return;
    setExpanded(entry.path);
    if (entry.unloaded) void load(entry);
  };
  const toggle = (entry: Entry) => {
    if (entry.disabled || props.disabled || props.readOnly) return;
    const targets = leaves(entry);
    if (!targets.length) {
      expand(entry);
      return;
    }
    const targetKeys = new Set(targets.map((e) => keyOf(e.path)));
    const next = selected.filter((p) => !targetKeys.has(keyOf(p)));
    if (checked(entry) !== true) next.push(...targets.map((e) => e.path));
    emit(next);
  };
  const pick = (entry: Entry) => {
    if (entry.disabled || props.disabled || props.readOnly) return false;
    if (entry.branch) expand(entry);
    if (props.multiple) {
      if (!entry.branch) toggle(entry);
      return false;
    }
    if (!entry.branch || props.changeOnSelect) {
      emit([entry.path]);
      return !entry.branch;
    }
    return false;
  };
  const results = all.filter(
    (e) =>
      !e.disabled &&
      (!e.branch || (!props.multiple && props.changeOnSelect)) &&
      (props.filterOption
        ? props.filterOption(search, e.nodes)
        : search
            .trim()
            .toLocaleLowerCase()
            .split(/\s+/)
            .every((word) =>
              e.nodes
                .map(textOf)
                .join(" / ")
                .toLocaleLowerCase()
                .includes(word),
            )),
  );
  const columns: Entry[][] = [roots];
  let cursor = roots;
  for (let i = 0; i < expanded.length; i++) {
    const entry = cursor.find((e) => e.option.value === expanded[i]);
    if (!entry || !entry.branch || entry.disabled) break;
    columns.push(entry.children);
    cursor = entry.children;
  }
  return {
    selected,
    selectedKeys,
    search,
    setSearch,
    expanded,
    roots,
    byKey,
    columns,
    results,
    pending,
    errors,
    emit,
    load,
    expand,
    toggle,
    pick,
    checked,
    leaves,
  };
}
type Controller = ReturnType<typeof useCascader>;
function CascaderView({
  props,
  state,
  onComplete,
  autoFocus = false,
}: {
  props: CascaderPanelProps;
  state: Controller;
  onComplete?: () => void;
  autoFocus?: boolean;
}) {
  const { locale } = useMtone();
  const zh = locale === "zh";
  const rootRef = React.useRef<HTMLDivElement>(null),
    searchRef = React.useRef<HTMLInputElement>(null);
  const refs = React.useRef(new Map<string, HTMLDivElement>());
  const [focused, setFocused] = React.useState("");
  const desired = React.useRef<string | null>(null);
  const composing = React.useRef(false);
  const searching = props.searchable && !!state.search.trim();
  const columns = searching ? [state.results] : state.columns;
  const enabled = columns.flat().filter((e) => !e.disabled);
  const focusKey = enabled.some((e) => keyOf(e.path) === focused)
    ? focused
    : keyOf(enabled[0]?.path ?? []);
  const focus = (entry?: Entry) => {
    if (!entry) return;
    const key = keyOf(entry.path);
    setFocused(key);
    desired.current = key;
    refs.current.get(key)?.focus();
  };
  React.useLayoutEffect(() => {
    if (desired.current && refs.current.has(desired.current)) {
      refs.current.get(desired.current)?.focus();
      desired.current = null;
    }
  });
  React.useEffect(() => {
    if (autoFocus) {
      if (props.searchable) searchRef.current?.focus();
      else refs.current.get(focusKey)?.focus();
    }
  }, [autoFocus]); // focus only on opening, never steal focus on content changes
  const enterChild = (entry: Entry) => {
    state.expand(entry);
    const child = entry.children.find((e) => !e.disabled);
    if (child) focus(child);
  };
  const handleKey = (
    event: React.KeyboardEvent,
    entry: Entry,
    column: Entry[],
  ) => {
    if (
      event.nativeEvent.isComposing ||
      composing.current ||
      props.disabled ||
      props.readOnly
    )
      return;
    const items = column.filter((e) => !e.disabled),
      index = items.indexOf(entry);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      focus(
        items[
          (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) %
            items.length
        ],
      );
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      focus(event.key === "Home" ? items[0] : items.at(-1));
    } else if (event.key === "ArrowRight" && !searching) {
      event.preventDefault();
      enterChild(entry);
    } else if (event.key === "ArrowLeft" && !searching) {
      event.preventDefault();
      const parent = state.byKey.get(keyOf(entry.path.slice(0, -1)));
      if (parent) {
        state.expand(parent);
        focus(parent);
      } else searchRef.current?.focus();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (props.multiple && (event.key === " " || !entry.branch)) {
        state.toggle(entry);
      } else {
        const complete = state.pick(entry);
        if (entry.branch) enterChild(entry);
        if (complete) onComplete?.();
      }
    }
  };
  const id = React.useId();
  return (
    <div
      ref={rootRef}
      className="mt-cascader-body"
      data-disabled={props.disabled || undefined}
    >
      {props.searchable && (
        <input
          ref={searchRef}
          type="search"
          className="mt-input mt-cascader-search"
          aria-label={zh ? "搜索路径" : "Search paths"}
          placeholder={props.searchPlaceholder ?? (zh ? "搜索…" : "Search…")}
          disabled={props.disabled}
          readOnly={props.readOnly}
          value={state.search}
          onChange={(e) => state.setSearch(e.target.value)}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={() => {
            composing.current = false;
          }}
          onKeyDown={(e) => {
            if (
              !composing.current &&
              !e.nativeEvent.isComposing &&
              e.key === "ArrowDown"
            ) {
              e.preventDefault();
              focus(enabled[0]);
            }
          }}
        />
      )}
      <div
        className="mt-cascader-columns"
        role="tree"
        aria-label={
          props["aria-label"] ?? (zh ? "级联选项" : "Cascading options")
        }
        aria-multiselectable={props.multiple || undefined}
        aria-disabled={props.disabled || undefined}
      >
        {columns.map((column, index) => {
          const parent =
            !searching && index > 0
              ? state.byKey.get(keyOf(state.expanded.slice(0, index)))
              : undefined;
          const pending = parent && state.pending.has(keyOf(parent.path)),
            error = parent && state.errors.has(keyOf(parent.path));
          return (
            <div
              className="mt-cascader-column"
              role="presentation"
              key={searching ? "search" : index}
            >
              {column.map((entry, position) => {
                const key = keyOf(entry.path),
                  check = state.checked(entry),
                  label = searching
                    ? entry.nodes.map(textOf).join(" / ")
                    : textOf(entry.option);
                return (
                  <div
                    key={key}
                    id={`${id}-${encodeURIComponent(key)}`}
                    ref={(node) => {
                      if (node) refs.current.set(key, node);
                      else refs.current.delete(key);
                    }}
                    role="treeitem"
                    aria-label={label}
                    aria-level={searching ? 1 : entry.path.length}
                    aria-posinset={position + 1}
                    aria-setsize={column.length}
                    aria-expanded={
                      entry.branch && !searching
                        ? prefixOf(entry.path, state.expanded)
                        : undefined
                    }
                    aria-selected={
                      props.multiple ? undefined : state.selectedKeys.has(key)
                    }
                    aria-checked={props.multiple ? check : undefined}
                    aria-disabled={
                      entry.disabled || props.disabled || undefined
                    }
                    tabIndex={
                      !props.disabled && !entry.disabled && key === focusKey
                        ? 0
                        : -1
                    }
                    className="mt-cascader-option"
                    data-active={
                      (!searching && prefixOf(entry.path, state.expanded)) ||
                      undefined
                    }
                    data-disabled={
                      entry.disabled || props.disabled || undefined
                    }
                    data-checked={
                      (props.multiple && check === true) || undefined
                    }
                    onFocus={() => setFocused(key)}
                    onKeyDown={(e) => handleKey(e, entry, column)}
                    onMouseEnter={() => {
                      if (
                        props.expandTrigger === "hover" &&
                        entry.branch &&
                        !searching
                      )
                        state.expand(entry);
                    }}
                    onClick={() => {
                      focus(entry);
                      if (state.pick(entry)) onComplete?.();
                    }}
                  >
                    {props.multiple && (
                      <span
                        role="checkbox"
                        aria-label={`${zh ? "选择" : "Select"} ${label}`}
                        aria-checked={check}
                        aria-disabled={
                          entry.disabled ||
                          props.disabled ||
                          props.readOnly ||
                          undefined
                        }
                        className="mt-cascader-check"
                        onClick={(e) => {
                          e.stopPropagation();
                          focus(entry);
                          state.toggle(entry);
                        }}
                      >
                        {check === true ? (
                          <Check size={11} />
                        ) : check === "mixed" ? (
                          <Minus size={11} />
                        ) : null}
                      </span>
                    )}
                    <span className="mt-cascader-label">
                      {searching
                        ? label
                        : (props.renderOption?.(entry.option, entry.nodes) ??
                          entry.option.label)}
                    </span>
                    {state.pending.has(key) ? (
                      <LoaderCircle
                        size={13}
                        className="mt-cascader-spinner"
                        aria-hidden
                      />
                    ) : entry.branch && !searching ? (
                      <ChevronRight size={13} aria-hidden />
                    ) : !props.multiple && state.selectedKeys.has(key) ? (
                      <Check size={13} aria-hidden />
                    ) : null}
                  </div>
                );
              })}
              {pending ? (
                <div role="status" className="mt-cascader-message">
                  {props.loadingText ?? (zh ? "加载中…" : "Loading…")}
                </div>
              ) : error ? (
                <div role="alert" className="mt-cascader-message">
                  {props.loadErrorText ?? (zh ? "加载失败" : "Unable to load")}
                  <button
                    type="button"
                    className="mt-cascader-retry"
                    disabled={props.disabled || props.readOnly}
                    onClick={() => {
                      if (parent) void state.load(parent);
                    }}
                  >
                    {zh ? "重试加载" : "Retry loading"}
                  </button>
                </div>
              ) : !column.length ? (
                <div role="status" className="mt-cascader-message">
                  {props.emptyContent ??
                    (parent?.unloaded
                      ? zh
                        ? "请提供加载函数"
                        : "Provide loadOptions to load this branch"
                      : zh
                        ? "无选项"
                        : "No options")}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export function CascaderPanel(props: CascaderPanelProps) {
    props = { ...props, disabled: useFieldsetDisabled(props.disabled) };
  const state = useCascader(props);
  return (
    <div
      className={cn("mt-cascader-panel", props.className)}
      style={props.style}
    >
      <CascaderView props={props} state={state} />
    </div>
  );
}
export const Cascader = React.forwardRef<HTMLButtonElement, CascaderProps>(
  function Cascader(props, forwardedRef) {
    props = { ...props, disabled: useFieldsetDisabled(props.disabled) };
    const state = useCascader(props);
    const { locale } = useMtone();
    const zh = locale === "zh";
    const [internalOpen, setInternalOpen] = React.useState(
      props.defaultOpen ?? false,
    );
    const open =
      !props.disabled && !props.readOnly && (props.open ?? internalOpen);
    const changeOpen = (next: boolean) => {
      if (next && (props.disabled || props.readOnly)) return;
      if (props.open === undefined) setInternalOpen(next);
      props.onOpenChange?.(next);
      if (!next && state.search) state.setSearch("");
    };
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(forwardedRef, () => buttonRef.current!);
    const renderPath = (path: CascaderPath) => {
      const nodes = state.byKey.get(keyOf(path))?.nodes ?? [];
      return (
        props.renderValue?.(nodes, path) ??
        (nodes.length ? nodes.map(textOf).join(" / ") : path.join(" / "))
      );
    };
    const displayed: CascaderPath[] = [];
    if (props.multiple && props.showCheckedStrategy !== "leaf") {
      const walk = (entries: Entry[]) =>
        entries.forEach((entry) => {
          if (state.checked(entry) === true) {
            displayed.push(entry.path);
          } else if (entry.children.length) walk(entry.children);
        });
      walk(state.roots);
      for (const path of state.selected)
        if (!displayed.some((shown) => prefixOf(shown, path)))
          displayed.push(path);
    } else displayed.push(...state.selected);
    const max =
      props.maxTagCount === undefined
        ? 3
        : Math.max(0, Math.floor(props.maxTagCount));
    const summary = props.multiple
      ? displayed
          .map((p) => {
            const e = state.byKey.get(keyOf(p));
            return e ? e.nodes.map(textOf).join(" / ") : p.join(" / ");
          })
          .join(", ")
      : undefined;
    const clear = () => {
      state.emit([]);
      props.onClear?.();
      buttonRef.current?.focus();
    };
    const [side, align] = (props.placement ?? "bottom-start").split("-") as [
      "bottom" | "top",
      "start" | "end",
    ];
    return (
      <Popover.Root open={open} onOpenChange={changeOpen}>
        <div
          className={cn("mt-cascader", props.className)}
          data-size={props.size ?? "md"}
          data-status={props.status}
          data-disabled={props.disabled || undefined}
          style={props.style}
        >
          <Popover.Trigger
            ref={buttonRef}
            id={props.id}
            className="mt-cascader-trigger"
            disabled={props.disabled}
            role="combobox"
            aria-haspopup="dialog"
            aria-label={props["aria-label"] ?? (zh ? "级联选择" : "Cascader")}
            aria-labelledby={props["aria-labelledby"]}
            aria-readonly={props.readOnly || undefined}
            aria-invalid={props.status === "error" || undefined}
            onKeyDown={(e) => {
              if (["ArrowDown", "ArrowUp"].includes(e.key)) {
                e.preventDefault();
                changeOpen(true);
              }
            }}
          >
            {props.prefix && (
              <span className="mt-cascader-prefix">{props.prefix}</span>
            )}
            <span
              className={cn(
                "mt-cascader-value",
                !state.selected.length && "mt-cascader-placeholder",
              )}
              title={summary}
            >
              {props.multiple
                ? displayed.length
                  ? zh
                    ? `已选择 ${displayed.length} 项`
                    : `${displayed.length} selected`
                  : (props.placeholder ?? (zh ? "请选择" : "Select…"))
                : state.selected.length
                  ? renderPath(state.selected[0])
                  : (props.placeholder ?? (zh ? "请选择" : "Select…"))}
            </span>
            <ChevronDown size={14} aria-hidden />
          </Popover.Trigger>
          {props.allowClear &&
            state.selected.length > 0 &&
            !props.disabled &&
            !props.readOnly && (
              <button
                className="mt-cascader-clear"
                type="button"
                aria-label={zh ? "清除选择" : "Clear selection"}
                onClick={clear}
              >
                <X size={12} />
              </button>
            )}
          {props.name && (
            <input
              type="hidden"
              name={props.name}
              disabled={props.disabled}
              value={JSON.stringify(
                props.multiple ? state.selected : (state.selected[0] ?? []),
              )}
            />
          )}
        </div>
        {props.multiple && displayed.length > 0 && (
          <div
            className="mt-cascader-tags"
            aria-label={zh ? "已选路径" : "Selected paths"}
          >
            {displayed.slice(0, max).map((path) => (
              <span className="mt-cascader-tag" key={keyOf(path)}>
                {renderPath(path)}
                {!props.disabled && !props.readOnly && (
                  <button
                    type="button"
                    aria-label={`${zh ? "移除" : "Remove"} ${state.byKey.get(keyOf(path))?.nodes.map(textOf).join(" / ") ?? path.join(" / ")}`}
                    onClick={() => {
                      state.emit(
                        state.selected.filter((p) => !prefixOf(path, p)),
                      );
                    }}
                  >
                    <X size={10} />
                  </button>
                )}
              </span>
            ))}
            {displayed.length > max && (
              <span className="mt-cascader-tag" title={summary}>
                +{displayed.length - max}
              </span>
            )}
          </div>
        )}
        <Popover.Portal>
          <MtoneScope>
            <Popover.Positioner
              side={side}
              align={align}
              sideOffset={4}
              className="mt-positioner"
            >
              <Popover.Popup
                className="mt-popup mt-cascader-popup"
                aria-label={
                  props["aria-label"] ?? (zh ? "级联选择" : "Cascader")
                }
                initialFocus={false}
                finalFocus={buttonRef}
              >
                <CascaderView
                  props={props}
                  state={state}
                  onComplete={() => changeOpen(false)}
                  autoFocus
                />
              </Popover.Popup>
            </Popover.Positioner>
          </MtoneScope>
        </Popover.Portal>
      </Popover.Root>
    );
  },
);
