import * as React from "react";
import {
  ChevronDown,
  ChevronRight,
  LoaderCircle,
  Folder,
  FolderOpen,
  File,
} from "lucide-react";
import { cn, useMtone } from "./basic";
import { HoverMarquee } from "./hover-marquee";
import { Checkbox as BCheckbox } from "@base-ui/react/checkbox";
import { Check, Minus } from "lucide-react";
import { animateTreeDrop, startTreeDragVisual } from "./tree-drag-visual";
import type { TreeItem, TreeKey } from "./tree-types";
import {
  normalizeTree,
  buildTreeIndex,
  flattenTree,
  getTreePath,
  conductTreeChecks,
  toggleTreeCheck,
  expandTreeParents,
} from "./tree-model";

const DEFAULT_TREE_ROW_HEIGHT = 32;
const MIN_TREE_ROW_HEIGHT = 24;
const DEFAULT_TREE_ROW_GAP = 2;
const DEFAULT_TREE_INDENT = 20;

export type { TreeItem, TreeKey, TreeNode } from "./tree-types";
export type TreeCheckedKeys =
  TreeKey[] | { checked: TreeKey[]; halfChecked: TreeKey[] };
export type TreeNodeInfo = {
  node: TreeItem;
  expanded: boolean;
  selected: boolean;
  checked: boolean;
  loading: boolean;
};
/** An independent control at the logical end of a tree row. */
export interface TreeAction {
  content: React.ReactNode;
  /** Defaults to hover; keyboard focus also reveals the control. */
  visibility?: "always" | "hover" | "active";
}
type TreeDropDestination = {
  /** Parent of the destination list; null means the root. */
  targetParentKey: TreeKey | null;
  /** Zero-based insertion index after removing the dragged node. */
  targetIndex: number;
};
export type TreeDropInfo = TreeDropDestination & {
  event: React.DragEvent;
  node: TreeItem;
  dragNode: TreeItem;
  dragNodesKeys: TreeKey[];
  dropPosition: -1 | 0 | 1;
  dropToGap: boolean;
};
export type TreeRef = {
  nativeElement: HTMLDivElement | null;
  focus: () => void;
  scrollTo: (options: {
    key: TreeKey;
    align?: "top" | "bottom" | "auto";
    offset?: number;
    autoExpand?: boolean;
  }) => void;
};
export interface TreeProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  | "draggable"
  | "onSelect"
  | "onLoad"
  | "onDragStart"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragOver"
  | "onDragLeave"
  | "onDrop"
  | "onDoubleClick"
> {
  items?: TreeItem[];
  treeData?: import("./tree-types").TreeNode[] | Record<string, unknown>[];
  fieldNames?: { key?: string; title?: string; children?: string };
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;
  selectedKeys?: TreeKey[];
  defaultSelectedKeys?: TreeKey[];
  multiple?: boolean;
  selectable?: boolean;
  expandedKeys?: TreeKey[];
  defaultExpandedKeys?: TreeKey[];
  defaultExpandAll?: boolean;
  defaultExpandParent?: boolean;
  autoExpandParent?: boolean;
  onSelect?: (
    keys: TreeKey[],
    info: {
      selected: boolean;
      node: TreeItem;
      selectedNodes: TreeItem[];
      event: React.SyntheticEvent;
    },
  ) => void;
  onExpand?: (
    keys: TreeKey[],
    info: { expanded: boolean; node: TreeItem },
  ) => void;
  checkable?: boolean;
  checkStrictly?: boolean;
  checkedKeys?: TreeCheckedKeys;
  defaultCheckedKeys?: TreeKey[];
  onCheck?: (
    keys: TreeCheckedKeys,
    info: {
      checked: boolean;
      node: TreeItem;
      checkedNodes: TreeItem[];
      halfCheckedKeys: TreeKey[];
      event: React.SyntheticEvent;
    },
  ) => void;
  disabled?: boolean;
  label?: string;
  blockNode?: boolean;
  showLine?: boolean;
  showIcon?: boolean;
  icon?: React.ReactNode | ((info: TreeNodeInfo) => React.ReactNode);
  switcherIcon?: React.ReactNode | ((info: TreeNodeInfo) => React.ReactNode);
  switcherLoadingIcon?: React.ReactNode;
  titleRender?: (node: TreeItem) => React.ReactNode;
  /** Reveal overflowing text and custom node labels unless a node opts out. Defaults to true. */
  labelMarquee?: boolean;
  /** Pixels of indentation per level; defaults to 20. */
  indent?: number;
  /** Space between adjacent rows in pixels; defaults to 2. */
  gap?: number;
  /** Renders separate display content at the logical end of each row. */
  endContent?: (info: TreeNodeInfo) => React.ReactNode;
  /** Renders independent trailing controls for enabled nodes. */
  actions?: (info: TreeNodeInfo) => TreeAction | readonly TreeAction[] | null | undefined;
  filterTreeNode?: (node: TreeItem) => boolean;
  loadData?: (node: TreeItem) => Promise<unknown>;
  loadedKeys?: TreeKey[];
  defaultLoadedKeys?: TreeKey[];
  onLoad?: (keys: TreeKey[], info: { node: TreeItem }) => void;
  onLoadError?: (error: unknown, node: TreeItem) => void;
  height?: number;
  /** Actual row height in pixels, excluding the gap. Defaults to 32, minimum 24. */
  itemHeight?: number;
  virtual?: boolean;
  draggable?: boolean | ((node: TreeItem) => boolean);
  /** Show the six-dot grip on draggable rows and their preview. Defaults to false. */
  showDragHandle?: boolean;
  /** Allow dropping into nodes and inserting across parents. Defaults to false. */
  allowReparent?: boolean;
  allowDrop?: (info: TreeDropDestination & {
    dragNode: TreeItem;
    dropNode: TreeItem;
    dropPosition: -1 | 0 | 1;
  }) => boolean;
  onDragStart?: (info: { event: React.DragEvent; node: TreeItem }) => void;
  onDragEnd?: (info: { event: React.DragEvent; node: TreeItem }) => void;
  onDragEnter?: (info: {
    event: React.DragEvent;
    node: TreeItem;
    expandedKeys: TreeKey[];
  }) => void;
  onDragOver?: (info: { event: React.DragEvent; node: TreeItem }) => void;
  onDragLeave?: (info: { event: React.DragEvent; node: TreeItem }) => void;
  onDrop?: (info: TreeDropInfo) => void;
  onRightClick?: (info: { event: React.MouseEvent; node: TreeItem }) => void;
  onDoubleClick?: (event: React.MouseEvent, node: TreeItem) => void;
  /** Directory interaction without creating a separate data format. */ directory?: boolean;
  expandAction?: false | "click" | "doubleClick";
}
export const Tree = React.forwardRef<TreeRef, TreeProps>(function Tree(
  {
    items,
    treeData,
    fieldNames,
    value,
    defaultValue,
    onValueChange,
    expanded,
    defaultExpanded,
    onExpandedChange,
    selectedKeys,
    defaultSelectedKeys,
    multiple = false,
    selectable = true,
    expandedKeys,
    defaultExpandedKeys,
    defaultExpandAll = false,
    defaultExpandParent = true,
    autoExpandParent = false,
    onSelect,
    onExpand,
    checkable = false,
    checkStrictly = false,
    checkedKeys,
    defaultCheckedKeys = [],
    onCheck,
    disabled = false,
    label,
    blockNode = true,
    showLine = false,
    showIcon,
    icon,
    switcherIcon,
    switcherLoadingIcon,
    titleRender,
    labelMarquee = true,
    indent = DEFAULT_TREE_INDENT,
    gap = DEFAULT_TREE_ROW_GAP,
    endContent,
    actions,
    filterTreeNode,
    loadData,
    loadedKeys,
    defaultLoadedKeys = [],
    onLoad,
    onLoadError,
    height,
    itemHeight = DEFAULT_TREE_ROW_HEIGHT,
    virtual = true,
    draggable = false,
    showDragHandle = false,
    allowReparent = false,
    allowDrop,
    onDragStart,
    onDragEnd,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    onRightClick,
    onDoubleClick,
    directory = false,
    expandAction = "click",
    className,
    style,
    onKeyDown,
    onScroll,
    ...rest
  },
  ref,
) {
  const zh = useMtone().locale === "zh";
  const treeId = React.useId();
  const nodes = React.useMemo(
    () => normalizeTree(items, treeData, fieldNames),
    [items, treeData, fieldNames],
  );
  const index = React.useMemo(() => buildTreeIndex(nodes), [nodes]);
  const branch = (n: TreeItem) =>
    n.isLeaf !== true && (!!n.children?.length || !!loadData);
  const [open, setOpen] = React.useState<TreeKey[]>(() => {
    const keys = defaultExpandAll
      ? [...index.values()].filter((e) => branch(e.item)).map((e) => e.item.id)
      : (defaultExpandedKeys ?? defaultExpanded ?? []);
    return defaultExpandParent ? expandTreeParents(index, keys) : keys;
  });
  const controlledExpand = expandedKeys !== undefined || expanded !== undefined;
  const rawOpen = expandedKeys ?? expanded ?? open;
  const openKeys = autoExpandParent
    ? expandTreeParents(index, rawOpen)
    : rawOpen;
  const openSet = new Set(openKeys);
  const [selection, setSelection] = React.useState<TreeKey[]>(
    defaultSelectedKeys ?? (defaultValue !== undefined ? [defaultValue] : []),
  );
  const selected = selectedKeys ?? (value !== undefined ? [value] : selection);
  const [checks, setChecks] = React.useState<TreeKey[]>(defaultCheckedKeys);
  const inputChecks = checkedKeys ?? checks;
  const checkList = Array.isArray(inputChecks)
    ? inputChecks
    : inputChecks.checked;
  const checked = checkStrictly
    ? {
        checked: checkList,
        halfChecked: Array.isArray(inputChecks) ? [] : inputChecks.halfChecked,
      }
    : conductTreeChecks(nodes, checkList);
  const [loaded, setLoaded] = React.useState<TreeKey[]>(defaultLoadedKeys);
  const [loading, setLoading] = React.useState<Set<TreeKey>>(new Set());
  const [errors, setErrors] = React.useState<Set<TreeKey>>(new Set());
  const pending = React.useRef(new Map<TreeKey, object>());
  const alive = React.useRef(true);
  const latest = React.useRef({
    index,
    loadedKeys,
    loaded,
    onLoad,
    onLoadError,
  });
  latest.current = { index, loadedKeys, loaded, onLoad, onLoadError };
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      pending.current.clear();
    };
  }, []);
  React.useLayoutEffect(() => {
    for (const key of pending.current.keys()) {
      if (!index.has(key)) pending.current.delete(key);
    }
    setLoading((s) => {
      const next = new Set([...s].filter((key) => index.has(key)));
      return next.size === s.size ? s : next;
    });
    setErrors((s) => {
      const next = new Set([...s].filter((key) => index.has(key)));
      return next.size === s.size ? s : next;
    });
    setLoaded((s) => {
      const next = s.filter((key) => index.has(key));
      return next.length === s.length ? s : next;
    });
  }, [index]);
  const [active, setActive] = React.useState<TreeKey>();
  const [scrollTop, setScrollTop] = React.useState(0);
  const root = React.useRef<HTMLDivElement>(null),
    rows = React.useRef(new Map<TreeKey, HTMLDivElement>());
  const visible = flattenTree(nodes, openSet),
    enabled = visible.filter((e) => !disabled && !e.item.disabled);
  const focusKey = enabled.some((e) => e.item.id === active)
    ? active
    : enabled[0]?.item.id;
  const rowHeight =
    Number.isFinite(itemHeight) && itemHeight > 0
      ? Math.max(MIN_TREE_ROW_HEIGHT, itemHeight)
      : DEFAULT_TREE_ROW_HEIGHT;
  // Use the same gap for CSS, virtual spacers and scroll positioning while
  // keeping itemHeight as the actual (clickable) row height.
  const rowGap = Number.isFinite(gap) && gap >= 0 ? gap : DEFAULT_TREE_ROW_GAP;
  const rowStride = rowHeight + rowGap;
  const levelIndent = Number.isFinite(indent) ? Math.max(0, indent) : DEFAULT_TREE_INDENT;
  const viewport =
    typeof height === "number" && Number.isFinite(height) && height > 0
      ? height
      : undefined;
  const isVirtual = !!viewport && virtual;
  const start = isVirtual
    ? Math.max(
        0,
        Math.min(visible.length - 1, Math.floor(scrollTop / rowStride) - 3),
      )
    : 0;
  const end = isVirtual
    ? Math.min(visible.length, start + Math.ceil(viewport! / rowStride) + 7)
    : visible.length;
  const selectedAnchor = React.useRef<TreeKey | undefined>(undefined);
  const pendingFocus = React.useRef<TreeKey | undefined>(undefined);
  const setExpanded = (next: TreeKey[], node?: TreeItem, expand?: boolean) => {
    if (!controlledExpand) setOpen(next);
    onExpandedChange?.(next.filter((k): k is string => typeof k === "string"));
    if (node) onExpand?.(next, { expanded: !!expand, node });
  };
  const expand = (node: TreeItem, next: boolean) => {
    if (disabled || node.disabled || !branch(node)) return;
    if (
      next &&
      loadData &&
      !(loadedKeys ?? loaded).includes(node.id) &&
      !pending.current.has(node.id)
    ) {
      const token = {};
      pending.current.set(node.id, token);
      setLoading((s) => new Set(s).add(node.id));
      setErrors((s) => {
        const n = new Set(s);
        n.delete(node.id);
        return n;
      });
      Promise.resolve()
        .then(() => loadData(node))
        .then(
          () => {
            if (!alive.current || pending.current.get(node.id) !== token)
              return;
            pending.current.delete(node.id);
            setLoading((s) => {
              const n = new Set(s);
              n.delete(node.id);
              return n;
            });
            if (!latest.current.index.has(node.id)) return;
            const nextLoaded = [
              ...new Set([
                ...(latest.current.loadedKeys ?? latest.current.loaded),
                node.id,
              ]),
            ];
            if (latest.current.loadedKeys === undefined) {
              latest.current.loaded = nextLoaded;
              setLoaded(nextLoaded);
            }
            latest.current.onLoad?.(nextLoaded, { node });
          },
          (error) => {
            if (!alive.current || pending.current.get(node.id) !== token)
              return;
            pending.current.delete(node.id);
            setLoading((s) => {
              const n = new Set(s);
              n.delete(node.id);
              return n;
            });
            setErrors((s) => new Set(s).add(node.id));
            latest.current.onLoadError?.(error, node);
            // A failed expansion can be retried with the same keyboard or switcher action.
            if (!controlledExpand)
              setOpen((s) => s.filter((k) => k !== node.id));
          },
        );
    }
    setExpanded(
      next
        ? [...new Set([...rawOpen, node.id])]
        : rawOpen.filter((k) => k !== node.id),
      node,
      next,
    );
  };
  const scrollIndex = (
    i: number,
    align: "top" | "bottom" | "auto" = "auto",
    offset = 0,
  ) => {
    const el = root.current;
    if (!el || i < 0) return;
    if (isVirtual) {
      const top = i * rowStride,
        bottom = top + rowHeight,
        view = viewport!;
      let next = el.scrollTop;
      if (align === "top" || top < next) next = top;
      else if (align === "bottom" || bottom > next + view) next = bottom - view;
      next = Math.max(0, next + offset);
      el.scrollTop = next;
      setScrollTop(next);
    } else
      rows.current.get(visible[i]?.item.id)?.scrollIntoView?.({
        block:
          align === "top" ? "start" : align === "bottom" ? "end" : "nearest",
      });
  };
  const focus = (key?: TreeKey) => {
    if (key === undefined || !enabled.some((e) => e.item.id === key)) return;
    setActive(key);
    pendingFocus.current = key;
    scrollIndex(visible.findIndex((e) => e.item.id === key));
    rows.current.get(key)?.focus({ preventScroll: true });
  };
  React.useLayoutEffect(() => {
    if (pendingFocus.current !== undefined) {
      const el = rows.current.get(pendingFocus.current);
      if (el) {
        el.focus({ preventScroll: true });
        pendingFocus.current = undefined;
      }
    }
  });
  const scrollRequest = React.useRef<
    Parameters<TreeRef["scrollTo"]>[0] | undefined
  >(undefined);
  React.useLayoutEffect(() => {
    if (scrollRequest.current) {
      const opts = scrollRequest.current,
        i = visible.findIndex((e) => e.item.id === opts.key);
      if (i >= 0) {
        scrollIndex(i, opts.align, opts.offset);
        scrollRequest.current = undefined;
      }
    }
  });
  React.useImperativeHandle(ref, () => ({
    nativeElement: root.current,
    focus: () => focus(focusKey),
    scrollTo: (opts) => {
      const i = visible.findIndex((e) => e.item.id === opts.key);
      if (i >= 0) scrollIndex(i, opts.align, opts.offset);
      else if (opts.autoExpand && !controlledExpand && index.has(opts.key)) {
        scrollRequest.current = opts;
        setExpanded([
          ...new Set([
            ...rawOpen,
            ...getTreePath(index, opts.key).slice(0, -1),
          ]),
        ]);
      }
    },
  }));
  const choose = (
    node: TreeItem,
    event: React.MouseEvent | React.KeyboardEvent,
  ) => {
    if (disabled || node.disabled || !selectable || node.selectable === false)
      return;
    let next: TreeKey[];
    if (
      multiple &&
      directory &&
      event.shiftKey &&
      selectedAnchor.current !== undefined
    ) {
      const a = enabled.findIndex((e) => e.item.id === selectedAnchor.current),
        b = enabled.findIndex((e) => e.item.id === node.id);
      next = enabled
        .slice(Math.min(a < 0 ? b : a, b), Math.max(a, b) + 1)
        .filter((e) => e.item.selectable !== false)
        .map((e) => e.item.id);
    } else if (multiple && (!directory || event.ctrlKey || event.metaKey))
      next = selected.includes(node.id)
        ? selected.filter((k) => k !== node.id)
        : [...selected, node.id];
    else next = [node.id];
    selectedAnchor.current = node.id;
    if (selectedKeys === undefined && value === undefined) setSelection(next);
    if (typeof node.id === "string") onValueChange?.(node.id);
    onSelect?.(next, {
      selected: next.includes(node.id),
      node,
      selectedNodes: next
        .map((k) => index.get(k)?.item)
        .filter((n): n is TreeItem => !!n),
      event,
    });
  };
  const check = (node: TreeItem, event: React.SyntheticEvent) => {
    if (
      disabled ||
      node.disabled ||
      node.disableCheckbox ||
      node.checkable === false
    )
      return;
    const nextChecked = !checked.checked.includes(node.id);
    const next = checkStrictly
      ? {
          checked: nextChecked
            ? [...checked.checked, node.id]
            : checked.checked.filter((k) => k !== node.id),
          halfChecked: checked.halfChecked.filter((k) => k !== node.id),
        }
      : toggleTreeCheck(nodes, checked.checked, node.id, nextChecked);
    if (checkedKeys === undefined) setChecks(next.checked);
    onCheck?.(checkStrictly ? next : next.checked, {
      checked: nextChecked,
      node,
      checkedNodes: next.checked
        .map((k) => index.get(k)?.item)
        .filter((n): n is TreeItem => !!n),
      halfCheckedKeys: next.halfChecked,
      event,
    });
  };
  const dragKey = React.useRef<TreeKey | undefined>(undefined);
  const pressedActionRow = React.useRef<TreeKey | undefined>(undefined);
  const [dropTarget, setDropTarget] = React.useState<{
    key: TreeKey;
    position: -1 | 0 | 1;
  }>();
  const activeTarget = React.useRef<typeof dropTarget>(undefined);
  const dragVisual = React.useRef<ReturnType<typeof startTreeDragVisual>>(undefined);
  const cleanupDrag = React.useRef<(() => void) | undefined>(undefined);
  const hoverTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const settleFrame = React.useRef(0);
  const rowAnimations = React.useRef<Animation[]>([]);
  const latestDropState = React.useRef({ index, openSet, expand, branch });
  latestDropState.current = { index, openSet, expand, branch };

  const updateDropTarget = (next?: NonNullable<typeof dropTarget>) => {
    dragVisual.current?.setValid(!!next);
    const previous = activeTarget.current;
    if (previous?.key === next?.key && previous?.position === next?.position) return;
    activeTarget.current = next;
    setDropTarget(next);
    clearTimeout(hoverTimer.current);
    if (next?.position !== 0 || openSet.has(next.key)) return;
    const item = index.get(next.key)?.item;
    if (!item || !branch(item)) return;
    hoverTimer.current = setTimeout(() => {
      const current = latestDropState.current;
      const target = current.index.get(next.key)?.item;
      if (activeTarget.current === next && target && !current.openSet.has(next.key))
        current.expand(target, true);
    }, 450);
  };

  const finishDrag = (accepted: boolean) => {
    const source = dragKey.current;
    if (source === undefined) return;
    dragKey.current = undefined;
    cleanupDrag.current?.();
    cleanupDrag.current = undefined;
    const visual = dragVisual.current;
    updateDropTarget();
    visual?.setValid(true);
    if (!accepted) {
      visual?.settle(rows.current.get(source));
      return;
    }
    const before = new Map([...rows.current].map(([key, row]) => [key, row.getBoundingClientRect()]));
    const view = root.current?.ownerDocument.defaultView;
    // React commits the consumer's reordered items before the next paint.
    // Calculate displacement once against that committed layout, never on hover.
    if (view) {
      settleFrame.current = view.requestAnimationFrame(() => {
        settleFrame.current = 0;
        rowAnimations.current = animateTreeDrop(rows.current, before, source);
        visual?.settle(rows.current.get(source));
      });
    } else visual?.dispose();
  };
  React.useEffect(() => () => {
    clearTimeout(hoverTimer.current);
    if (settleFrame.current) window.cancelAnimationFrame(settleFrame.current);
    cleanupDrag.current?.();
    dragVisual.current?.dispose();
    rowAnimations.current.forEach((animation) => animation.cancel());
  }, []);

  const dropIntent = (event: React.DragEvent, node: TreeItem, row = event.currentTarget) => {
    const source = dragKey.current === undefined ? undefined : index.get(dragKey.current);
    const target = index.get(node.id);
    if (!source || !target || disabled || source.item.disabled || node.disabled ||
        getTreePath(index, node.id).includes(source.item.id)) return;
    const rect = row.getBoundingClientRect();
    const ratio = rect.height ? (event.clientY - rect.top) / rect.height : 0.5;
    const position: -1 | 0 | 1 =
      allowReparent && node.isLeaf !== true && ratio >= .25 && ratio <= .75 ? 0 :
        ratio < .5 ? -1 : 1;
    const parent = position === 0 ? node.id : target.parent;
    if ((!allowReparent && parent !== source.parent) ||
        (parent !== undefined && index.get(parent)?.item.disabled)) return;
    const unadjusted = position === 0
      ? node.children?.length ?? 0
      : target.posInSet - 1 + (position === 1 ? 1 : 0);
    const targetIndex = unadjusted - Number(source.parent === parent && source.posInSet - 1 < unadjusted);
    const destination = { targetParentKey: parent ?? null, targetIndex };
    if (allowDrop && !allowDrop({ ...destination, dragNode: source.item, dropNode: node, dropPosition: position }))
      return;
    return { ...destination, dragNode: source.item, dropPosition: position };
  };

  const acceptDrop = (event: React.DragEvent, node: TreeItem, row?: HTMLDivElement) => {
    const info = dropIntent(event, node, row);
    finishDrag(!!info);
    if (!info) return;
    event.preventDefault();
    onDrop?.({
      ...info,
      event,
      node,
      dragNodesKeys: [...index.keys()].filter((key) => getTreePath(index, key).includes(info.dragNode.id)),
      dropToGap: info.dropPosition !== 0,
    });
  };

  // The configured gap is not a treeitem. Resolve it without enlarging any
  // row's hit box, so nested controls and pointer focus keep the same geometry.
  const gapTarget = (event: React.DragEvent) => {
    if (event.target !== event.currentTarget || !rowGap || dragKey.current === undefined)
      return;
    for (const [key, row] of rows.current) {
      const box = row.getBoundingClientRect();
      if (event.clientY < box.top && event.clientY >= box.top - rowGap &&
          event.clientX >= box.left && event.clientX <= box.right &&
          row.previousElementSibling?.classList.contains("mt-tree-item")) {
        const node = index.get(key)?.item;
        if (node) return { node, row };
      }
    }
  };
  return (
    <div
      {...rest}
      ref={root}
      role="tree"
      tabIndex={
        isVirtual &&
        !visible.slice(start, end).some((e) => e.item.id === focusKey) &&
        enabled.length
          ? 0
          : undefined
      }
      onFocus={(e) => {
        rest.onFocus?.(e);
        if (e.target === e.currentTarget)
          focus(
            visible.slice(start, end).find((e) => !e.item.disabled)?.item.id,
          );
      }}
      aria-label={label ?? rest["aria-label"] ?? (zh ? "目录树" : "Tree")}
      aria-multiselectable={multiple || undefined}
      aria-disabled={disabled || undefined}
      className={cn(
        "mt-tree",
        showLine && "mt-tree-lines",
        directory && "mt-tree-directory",
        !blockNode && "mt-tree-inline",
        className,
      )}
      style={{
        ...style,
        "--_mt-tree-row-height": `${rowHeight}px`,
        "--_mt-tree-row-gap": `${rowGap}px`,
        "--_mt-tree-indent": `${levelIndent}px`,
        ...(viewport ? { height: viewport, overflow: "auto" } : {}),
      } as React.CSSProperties}
      onScroll={(e) => {
        setScrollTop(e.currentTarget.scrollTop);
        onScroll?.(e);
      }}
      onKeyDown={onKeyDown}
      onDragOver={(event) => {
        const hit = gapTarget(event);
        if (!hit) {
          if (event.target === event.currentTarget) updateDropTarget();
          return;
        }
        const info = dropIntent(event, hit.node, hit.row);
        if (info) {
          event.preventDefault();
          if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
        }
        updateDropTarget(info ? { key: hit.node.id, position: info.dropPosition } : undefined);
      }}
      onDrop={(event) => {
        const hit = gapTarget(event);
        if (hit) acceptDrop(event, hit.node, hit.row);
      }}
    >
      {isVirtual && <div aria-hidden style={{ height: start * rowStride }} />}
      {visible
        .slice(start, end)
        .map(({ item: node, level, parent, posInSet, setSize }, rowIndex) => {
          const isDisabled = disabled || !!node.disabled,
            isBranch = branch(node),
            isOpen = openSet.has(node.id),
            isChecked = checked.checked.includes(node.id),
            mixed = checked.halfChecked.includes(node.id),
            busy = loading.has(node.id);
          const info = {
            node,
            expanded: isOpen,
            selected: selected.includes(node.id),
            checked: isChecked,
            loading: busy,
          };
          const actualIcon =
            node.icon !== undefined
              ? typeof node.icon === "function"
                ? node.icon(node)
                : node.icon
              : typeof icon === "function"
                ? icon(info)
                : icon;
          const end = endContent?.(info);
          const renderedActions = isDisabled ? null : actions?.(info);
          const rowActions = !renderedActions
            ? []
            : "content" in renderedActions
              ? [renderedActions]
              : renderedActions;
          const title = titleRender ? titleRender(node) : node.label;
          const marquee = node.labelMarquee ?? labelMarquee;
          const titleControl = (event: React.SyntheticEvent<HTMLDivElement>) => {
            const target = event.target;
            if (!(target instanceof Element)) return false;
            const label = target.closest(".mt-tree-title");
            if (!label || label.parentElement !== event.currentTarget) return false;
            const control = target.closest(
              "a[href],button,input,select,textarea,summary,[role=button],[role=link],[tabindex]:not(.mt-tree-title),[contenteditable]:not([contenteditable=false])",
            );
            return !!control && label.contains(control);
          };
          const canDrag = !isDisabled &&
            (typeof draggable === "function" ? draggable(node) : draggable);
          // Controls must not become part of the row's accessible name.
          const titleId = rowActions.length && typeof node.label !== "string"
            ? `${treeId}-title-${start + rowIndex}`
            : undefined;
          return (
            <div
              key={`${typeof node.id}:${node.id}`}
              ref={(el) => {
                if (el) rows.current.set(node.id, el);
                else rows.current.delete(node.id);
              }}
              role="treeitem"
              aria-label={
                typeof node.label === "string" ? node.label : undefined
              }
              aria-labelledby={titleId}
              aria-level={level}
              aria-posinset={posInSet}
              aria-setsize={setSize}
              aria-selected={
                selectable && node.selectable !== false
                  ? selected.includes(node.id)
                  : undefined
              }
              aria-expanded={isBranch ? isOpen : undefined}
              aria-checked={
                checkable && node.checkable !== false
                  ? mixed
                    ? "mixed"
                    : isChecked
                  : undefined
              }
              aria-disabled={isDisabled || undefined}
              aria-busy={busy || undefined}
              tabIndex={!isDisabled && focusKey === node.id ? 0 : -1}
              className={cn(
                "mt-tree-item",
                dropTarget?.key === node.id &&
                  `mt-tree-drop-${dropTarget.position}`,
              )}
              data-match={filterTreeNode?.(node) || undefined}
              style={{
                paddingInlineStart: 8 + (level - 1) * levelIndent,
                "--_mt-tree-drop-indent": `${(level - 1) * levelIndent}px`,
              } as React.CSSProperties}
              onFocus={() => setActive(node.id)}
              onClick={(e) => {
                if (isDisabled || titleControl(e)) return;
                focus(node.id);
                choose(node, e);
                if (directory && expandAction === "click")
                  expand(node, !isOpen);
              }}
              onDoubleClick={(e) => {
                if (isDisabled || titleControl(e)) return;
                onDoubleClick?.(e, node);
                if (directory && expandAction === "doubleClick")
                  expand(node, !isOpen);
              }}
              onContextMenu={(e) => {
                if (!isDisabled && !titleControl(e)) onRightClick?.({ event: e, node });
              }}
              onKeyDown={(e) => {
                if (
                  e.defaultPrevented ||
                  e.target !== e.currentTarget ||
                  isDisabled
                )
                  return;
                const i = enabled.findIndex((x) => x.item.id === node.id);
                if (
                  [
                    "ArrowDown",
                    "ArrowUp",
                    "ArrowRight",
                    "ArrowLeft",
                    "Home",
                    "End",
                    "Enter",
                    " ",
                  ].includes(e.key)
                )
                  e.preventDefault();
                switch (e.key) {
                  case "ArrowDown":
                    focus(enabled[i + 1]?.item.id);
                    break;
                  case "ArrowUp":
                    focus(enabled[i - 1]?.item.id);
                    break;
                  case "Home":
                    focus(enabled[0]?.item.id);
                    break;
                  case "End":
                    focus(enabled.at(-1)?.item.id);
                    break;
                  case "ArrowRight":
                    if (isBranch) {
                      if (!isOpen) expand(node, true);
                      else
                        focus(
                          enabled.find((x) => x.parent === node.id)?.item.id,
                        );
                    }
                    break;
                  case "ArrowLeft":
                    if (isOpen && isBranch) expand(node, false);
                    else focus(parent);
                    break;
                  case " ":
                    if (checkable) check(node, e);
                    else choose(node, e);
                    break;
                  case "Enter":
                    choose(node, e);
                    if (directory && expandAction) expand(node, !isOpen);
                    break;
                  default:
                    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                      const list = [
                        ...enabled.slice(i + 1),
                        ...enabled.slice(0, i + 1),
                      ];
                      focus(
                        list.find(
                          (x) =>
                            typeof x.item.label === "string" &&
                            x.item.label
                              .toLowerCase()
                              .startsWith(e.key.toLowerCase()),
                        )?.item.id,
                      );
                    }
                }
              }}
              draggable={canDrag}
              data-drag-handle={canDrag && showDragHandle ? "" : undefined}
              onPointerDownCapture={(e) => {
                pressedActionRow.current = titleControl(e) ? node.id : undefined;
              }}
              onPointerUpCapture={() => { pressedActionRow.current = undefined; }}
              onPointerCancelCapture={() => { pressedActionRow.current = undefined; }}
              onDragStart={(e) => {
                const row = e.currentTarget;
                if (pressedActionRow.current === node.id || titleControl(e) ||
                    !canDrag) {
                  e.preventDefault();
                  return;
                }
                e.dataTransfer?.setData("text/plain", String(node.id));
                onDragStart?.({ event: e, node });
                if (e.defaultPrevented) return;
                if (settleFrame.current) {
                  row.ownerDocument.defaultView?.cancelAnimationFrame(settleFrame.current);
                  settleFrame.current = 0;
                }
                cleanupDrag.current?.();
                dragVisual.current?.dispose();
                rowAnimations.current.forEach((animation) => animation.cancel());
                dragKey.current = node.id;
                dragVisual.current = startTreeDragVisual(row, e.nativeEvent);

                const dragRoot = root.current;
                dragRoot?.setAttribute("data-tree-dragging", "");
                const doc = row.ownerDocument;
                const handleOutside = (event: DragEvent) => {
                  if (!(event.target instanceof Node) || !root.current?.contains(event.target))
                    updateDropTarget();
                };
                const handleEnd = () => finishDrag(false);
                const handleDocumentDrop = () => {
                  // Let the row handler claim a valid drop before cancelling.
                  setTimeout(() => {
                    if (cleanupDrag.current === cleanup) handleEnd();
                  }, 0);
                };
                const handleEscape = (event: KeyboardEvent) => {
                  if (event.key === "Escape") finishDrag(false);
                };
                doc.addEventListener("dragover", handleOutside, true);
                doc.addEventListener("dragend", handleEnd, true);
                doc.addEventListener("drop", handleDocumentDrop, true);
                doc.addEventListener("keydown", handleEscape, true);
                const cleanup = () => {
                  dragRoot?.removeAttribute("data-tree-dragging");
                  doc.removeEventListener("dragover", handleOutside, true);
                  doc.removeEventListener("dragend", handleEnd, true);
                  doc.removeEventListener("drop", handleDocumentDrop, true);
                  doc.removeEventListener("keydown", handleEscape, true);
                };
                cleanupDrag.current = cleanup;
              }}
              onDragEnd={(e) => {
                finishDrag(false);
                onDragEnd?.({ event: e, node });
              }}
              onDragEnter={(e) => {
                const info = dropIntent(e, node);
                updateDropTarget(info ? { key: node.id, position: info.dropPosition } : undefined);
                if (info) {
                  e.preventDefault();
                  onDragEnter?.({ event: e, node, expandedKeys: openKeys });
                }
              }}
              onDragOver={(e) => {
                const info = dropIntent(e, node);
                updateDropTarget(info ? { key: node.id, position: info.dropPosition } : undefined);
                if (info) {
                  e.preventDefault();
                  if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
                  onDragOver?.({ event: e, node });
                }
              }}
              onDragLeave={(e) => {
                if (e.relatedTarget instanceof Node && e.currentTarget.contains(e.relatedTarget)) return;
                if (activeTarget.current?.key === node.id) updateDropTarget();
                onDragLeave?.({ event: e, node });
              }}
              onDrop={(e) => acceptDrop(e, node)}
            >
              {showLine &&
                level > 1 &&
                getTreePath(index, node.id)
                  .slice(0, -1)
                  .map((key, depth) => {
                    const ancestor = index.get(
                      getTreePath(index, node.id)[depth + 1],
                    )!;
                    const direct = depth === level - 2;
                    return (
                      <span
                        aria-hidden
                        key={depth}
                        className={cn(
                          "mt-tree-guide",
                          direct && "mt-tree-guide-direct",
                          direct &&
                            posInSet === setSize &&
                            "mt-tree-guide-last",
                        )}
                        style={{
                          insetInlineStart: 16 + depth * levelIndent,
                          borderInlineStartStyle:
                            direct || ancestor.posInSet < ancestor.setSize
                              ? "solid"
                              : "none",
                        }}
                      />
                    );
                  })}
              <span
                aria-hidden="true"
                className={cn("mt-tree-toggle", busy && "mt-tree-loading")}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDisabled) {
                    focus(node.id);
                    expand(node, errors.has(node.id) ? true : !isOpen);
                  }
                }}
              >
                {busy
                  ? (switcherLoadingIcon ?? <LoaderCircle size={14} />)
                  : isBranch
                    ? ((typeof switcherIcon === "function"
                        ? switcherIcon(info)
                        : switcherIcon) ??
                      (isOpen ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )))
                    : null}
              </span>
              {checkable && node.checkable !== false && (
                <span
                  className="mt-tree-check"
                  onClick={(e) => e.stopPropagation()}
                >
                  <BCheckbox.Root
                    className="mt-checkbox"
                    aria-label={
                      typeof node.label === "string"
                        ? node.label
                        : String(node.id)
                    }
                    tabIndex={-1}
                    checked={isChecked}
                    indeterminate={mixed}
                    disabled={isDisabled || node.disableCheckbox}
                    onClick={(e) => {
                      check(node, e);
                      focus(node.id);
                    }}
                  >
                    <BCheckbox.Indicator
                      className="mt-check-indicator"
                      aria-hidden
                    >
                      {mixed ? <Minus size={12} /> : <Check size={12} />}
                    </BCheckbox.Indicator>
                  </BCheckbox.Root>
                </span>
              )}
              {(showIcon ?? (directory || !!node.icon)) && (
                <span className="mt-tree-icon" aria-hidden>
                  {actualIcon ??
                    (directory ? (
                      isBranch ? (
                        isOpen ? (
                          <FolderOpen size={15} />
                        ) : (
                          <Folder size={15} />
                        )
                      ) : (
                        <File size={15} />
                      )
                    ) : null)}
                </span>
              )}
              {marquee ? (
                <HoverMarquee
                  className="mt-tree-title"
                  id={titleId}
                  tabIndex={-1}
                >
                  {title}
                </HoverMarquee>
              ) : (
                <span className="mt-tree-title" id={titleId}>{title}</span>
              )}
              {errors.has(node.id) && (
                <span className="mt-tree-load-error" role="status">
                  {zh ? "加载失败，请重试" : "Load failed. Retry"}
                </span>
              )}
              {end != null && typeof end !== "boolean" && end !== "" && (
                <span className="mt-tree-end">{end}</span>
              )}
              {rowActions.length > 0 && (
                <div
                  className="mt-tree-actions"
                  onPointerDownCapture={() => { pressedActionRow.current = node.id; }}
                  onClick={(event) => event.stopPropagation()}
                  onDoubleClick={(event) => event.stopPropagation()}
                  onContextMenu={(event) => event.stopPropagation()}
                  onDragStart={(event) => event.stopPropagation()}
                  onDragEnd={(event) => event.stopPropagation()}
                >
                  {rowActions.map(({ content, visibility = "hover" }, actionIndex) => (
                    <div className="mt-tree-action" key={actionIndex} data-visibility={visibility}>
                      {content}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      {isVirtual && (
        <div
          aria-hidden
          style={{ height: (visible.length - end) * rowStride }}
        />
      )}
    </div>
  );
});
