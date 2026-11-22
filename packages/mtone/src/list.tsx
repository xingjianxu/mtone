import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GripVertical } from "lucide-react";
import { cn } from "./basic";

export type ListScrollTarget =
  | number
  | { top?: number; left?: number }
  | {
      key: React.Key;
      align?: "start" | "center" | "end" | "auto";
      offset?: number;
    }
  | {
      index: number;
      align?: "start" | "center" | "end" | "auto";
      offset?: number;
    }
  | {
      group: React.Key;
      align?: "start" | "center" | "end" | "auto";
      offset?: number;
    };
export interface ListHandle {
  readonly element: HTMLUListElement | null;
  scrollTo(target: ListScrollTarget): void;
}
export interface ListProps<T = unknown> extends Omit<
  React.HTMLAttributes<HTMLUListElement>,
  "children"
> {
  children?: React.ReactNode;
  items?: readonly T[];
  getKey?: (item: T, index: number) => React.Key;
  /** Render row content, not a li/ListItem. The List owns the row element. */
  renderItem?: (item: T, index: number) => React.ReactNode;
  /** Opt into live vertical drag sorting of nonvirtual data rows with a List.SortHandle. */
  onReorder?: (fromIndex: number, toIndex: number) => void;
  groupBy?: (item: T) => React.Key;
  renderGroup?: (key: React.Key, items: readonly T[]) => React.ReactNode;
  stickyGroups?: boolean;
  height?: number;
  contentWidth?: React.CSSProperties["minWidth"];
  virtual?: boolean;
  estimatedItemHeight?: number;
  estimatedGroupHeight?: number;
  overscan?: number;
  hoverable?: boolean;
  emptyContent?: React.ReactNode;
  loading?: boolean;
  loadingContent?: React.ReactNode;
  onEndReached?: () => void;
  endThreshold?: number;
  ref?: React.Ref<ListHandle>;
}
type Row<T> =
  | { id: string; key: React.Key; item: T; index: number; kind: "item" }
  | { id: string; key: React.Key; items: T[]; kind: "group" };
const identity = (key: React.Key) => `${typeof key}:${String(key)}`;
const positive = (value: number, fallback: number) =>
  Number.isFinite(value) && value > 0 ? value : fallback;
const lastMatch = (values: number[], predicate: (value: number) => boolean) => {
  for (let i = values.length - 1; i >= 0; i--)
    if (predicate(values[i])) return values[i];
  return undefined;
};
const emptyItems: readonly never[] = [];

function MeasuredRow({
  id,
  measure,
  children,
  measureChild = false,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement> & {
  id: string;
  measureChild?: boolean;
  measure: (key: string, size: number) => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  useLayoutEffect(() => {
    const element = measureChild ? ref.current?.firstElementChild : ref.current;
    if (!element) return;
    const update = () => measure(id, element.getBoundingClientRect().height);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [id, measure, measureChild]);
  return (
    <li {...props} ref={ref}>
      {children}
    </li>
  );
}

const ListSortStart = createContext<
  React.DragEventHandler<HTMLSpanElement> | undefined
>(undefined);
const enabledGrip =
  '.mt-list-sort-handle:not([aria-disabled="true"], [data-disabled])';
const ownsGrip = (row: Element) =>
  [...row.querySelectorAll(enabledGrip)].some(
    (grip) => grip.closest("li") === row,
  );
type SortRow = {
  row: HTMLElement;
  index: number;
  item: unknown;
  top: number;
  bottom: number;
};
type SortPreview = {
  root: HTMLUListElement;
  lane: SortRow[];
  source: SortRow;
  originY: number;
  target: SortRow | undefined;
  cleanup: () => void;
};

function useListSortPreview(
  list: React.RefObject<HTMLUListElement | null>,
  data: readonly unknown[],
  onReorder: ListProps["onReorder"],
) {
  const active = useRef<SortPreview | null>(null);
  const paintGap = (drag: SortPreview, target?: SortRow) => {
    if (drag.target === target) return;
    drag.target = target;
    const from = drag.lane.indexOf(drag.source);
    const to = target ? drag.lane.indexOf(target) : from;
    // Include any row spacing in the size of the gap left behind.
    const downward = to > from;
    const spacing = downward
      ? (drag.lane[from + 1]?.top ?? drag.source.bottom) - drag.source.bottom
      : drag.source.top - (drag.lane[from - 1]?.bottom ?? drag.source.top);
    const shift =
      (drag.source.bottom - drag.source.top + spacing) * (downward ? -1 : 1);
    drag.lane.forEach(({ row }, index) => {
      if (
        downward ? index > from && index <= to : index >= to && index < from
      ) {
        row.style.setProperty("--_mt-list-sort-y", `${shift}px`);
      } else if (index !== from) {
        row.style.removeProperty("--_mt-list-sort-y");
      }
    });
  };
  const reset = (drag: SortPreview) => {
    drag.source.row.removeAttribute("data-list-sort-moving");
    drag.source.row.style.removeProperty("--_mt-list-sort-y");
    paintGap(drag);
  };
  const stop = useCallback(() => {
    const drag = active.current;
    if (!drag) return;
    active.current = null;
    drag.cleanup();
    drag.root.removeAttribute("data-list-sort-active");
    drag.source.row.removeAttribute("data-list-sort-moving");
    drag.lane.forEach(({ row }) =>
      row.style.removeProperty("--_mt-list-sort-y"),
    );
  }, []);
  useEffect(() => stop, [onReorder !== undefined, stop]);

  const start: React.DragEventHandler<HTMLSpanElement> = (event) => {
    const root = list.current;
    const row = event.currentTarget.closest<HTMLElement>(
      "li[data-list-sort-index]",
    );
    if (!root || row?.parentElement !== root) return;
    if (
      !event.currentTarget.matches(enabledGrip) ||
      event.currentTarget.closest("li") !== row
    ) {
      event.preventDefault();
      return;
    }
    // A heading or a row with no enabled handle bounds this sorting lane.
    const valid = (item: Element | null): item is HTMLElement =>
      item instanceof HTMLElement &&
      item.hasAttribute("data-list-sort-index") &&
      ownsGrip(item);
    const before: HTMLElement[] = [];
    const after: HTMLElement[] = [];
    for (
      let item = row.previousElementSibling;
      valid(item);
      item = item.previousElementSibling
    )
      before.push(item);
    for (
      let item = row.nextElementSibling;
      valid(item);
      item = item.nextElementSibling
    )
      after.push(item);
    if (!before.length && !after.length) {
      event.preventDefault();
      return;
    }
    stop();
    const origin = root.getBoundingClientRect().top - root.scrollTop;
    const lane = [...before.reverse(), row, ...after].map((item) => {
      const { top, bottom } = item.getBoundingClientRect();
      const index = Number(item.dataset.listSortIndex);
      return {
        row: item,
        index,
        item: data[index],
        top: top - origin,
        bottom: bottom - origin,
      };
    });
    const source = lane[before.length];
    const doc = root.ownerDocument;
    const handle = event.currentTarget;
    const image = doc.createElement("canvas");
    image.width = image.height = 1;
    image.style.cssText = "position:fixed;left:0;top:0;pointer-events:none";
    doc.body.append(image);
    // Keep native drag/drop, but paint the actual themed row, not a second ghost.
    event.dataTransfer.setDragImage(image, 0, 0);
    if (!event.dataTransfer.types.length)
      event.dataTransfer.setData("application/x-mtone-list-sort", "1");
    event.dataTransfer.effectAllowed = "move";

    const owned = (target: EventTarget | null) =>
      target instanceof Element && target.closest("ul.mt-list") === root;
    const outside = (next: DragEvent) => {
      if (active.current === drag && !owned(next.target)) reset(drag);
    };
    const leaveDocument = (next: DragEvent) => {
      const view = doc.defaultView;
      if (
        !next.relatedTarget &&
        view &&
        (next.clientX <= 0 ||
          next.clientX >= view.innerWidth ||
          next.clientY <= 0 ||
          next.clientY >= view.innerHeight)
      )
        reset(drag);
    };
    // Trusted events can run microtasks between capture and React's bubble.
    const afterDrop = () =>
      setTimeout(() => {
        if (active.current === drag) stop();
      }, 0);
    const finish = (next: DragEvent) => {
      if (next.target === handle) stop();
    };
    const escape = (next: KeyboardEvent) => {
      if (next.key === "Escape") stop();
    };
    const drag: SortPreview = {
      root,
      lane,
      source,
      originY: event.clientY - origin,
      target: undefined,
      cleanup: () => {
        image.remove();
        doc.removeEventListener("dragover", outside, true);
        doc.removeEventListener("dragleave", leaveDocument, true);
        doc.removeEventListener("dragend", finish, true);
        doc.removeEventListener("drop", afterDrop, true);
        doc.removeEventListener("keydown", escape, true);
      },
    };
    active.current = drag;
    doc.addEventListener("dragover", outside, true);
    doc.addEventListener("dragleave", leaveDocument, true);
    doc.addEventListener("dragend", finish, true);
    doc.addEventListener("drop", afterDrop, true);
    doc.addEventListener("keydown", escape, true);
    const native = event.nativeEvent;
    setTimeout(() => {
      if (active.current === drag && native.defaultPrevented) stop();
    }, 0);
  };
  const project = (
    event: React.DragEvent<HTMLUListElement>,
    drag: SortPreview,
  ) => {
    if (
      !(event.target instanceof Element) ||
      event.target.closest("ul.mt-list") !== drag.root
    )
      return;
    const box = drag.root.getBoundingClientRect();
    const y = event.clientY - box.top + drag.root.scrollTop;
    if (
      event.clientX < box.left ||
      event.clientX >= box.right ||
      event.clientY < box.top ||
      event.clientY >= box.bottom ||
      // Never land on group headings or on unsortable rows.
      y < drag.lane[0].top ||
      y >= drag.lane[drag.lane.length - 1].bottom
    )
      return;
    const from = drag.lane.indexOf(drag.source);
    let target = drag.source;
    for (let i = 0; i < drag.lane.length; i++) {
      const entry = drag.lane[i];
      const middle = (entry.top + entry.bottom) / 2;
      if (
        (i < from && y < middle && target === drag.source) ||
        (i > from && y > middle)
      )
        target = entry;
    }
    return { y, target };
  };

  return {
    start: onReorder ? start : undefined,
    over(event: React.DragEvent<HTMLUListElement>) {
      const drag = active.current;
      if (!drag) return;
      const next = project(event, drag);
      if (!next || event.defaultPrevented) {
        reset(drag);
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      // Once native dragging has begun, keep UL as the stable hit target.
      // Otherwise translated rows can change the target on a stationary drop.
      drag.root.setAttribute("data-list-sort-active", "");
      drag.source.row.setAttribute("data-list-sort-moving", "");
      drag.source.row.style.setProperty(
        "--_mt-list-sort-y",
        `${next.y - drag.originY}px`,
      );
      paintGap(drag, next.target);
    },
    drop(event: React.DragEvent<HTMLUListElement>) {
      const drag = active.current;
      if (!drag) return;
      const next = project(event, drag);
      stop();
      if (
        event.defaultPrevented ||
        !next ||
        !drag.target ||
        drag.target !== next.target
      )
        return;
      // Cancel if a consumer changed data, group membership or controls mid-drag.
      if (
        drag.lane.some(
          ({ row, index, item }, i) =>
            row.parentElement !== drag.root ||
            Number(row.dataset.listSortIndex) !== index ||
            !Object.is(data[index], item) ||
            (i > 0 && drag.lane[i - 1].row.nextElementSibling !== row) ||
            !ownsGrip(row),
        )
      )
        return;
      event.preventDefault();
      if (next.target !== drag.source)
        onReorder?.(drag.source.index, next.target.index);
    },
  };
}

/** Compact native list, with optional grouped and windowed data rendering. */
function ListRoot<T = unknown>({
  children,
  items,
  getKey,
  renderItem,
  onReorder,
  groupBy,
  renderGroup,
  stickyGroups = false,
  height,
  contentWidth,
  virtual = false,
  estimatedItemHeight = 36,
  estimatedGroupHeight = 30,
  overscan = 3,
  hoverable = true,
  emptyContent = "暂无数据",
  loading = false,
  loadingContent = "加载中…",
  onEndReached,
  endThreshold = 80,
  ref,
  className,
  style,
  onScroll,
  onDragOver,
  onDrop,
  ...props
}: ListProps<T>) {
  const element = useRef<HTMLUListElement>(null);
  const sizes = useRef(new Map<string, number>());
  const metrics = useRef(new Map<string, { top: number; size: number }>());
  const virtualRef = useRef(false);
  const pendingAnchor = useRef<{base: number; delta: number} | null>(null);
  const [revision, setRevision] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const data = items ?? emptyItems;
  const dataMode = items !== undefined;
  const viewport = height === undefined ? undefined : positive(height, 240);
  const windowed = dataMode && virtual && viewport !== undefined;
  virtualRef.current = windowed;
  const sort = useListSortPreview(element, data, dataMode && !windowed ? onReorder : undefined);
  const rows = useMemo(() => {
    const itemRow = (item: T, index: number): Row<T> => {
      const key = getKey ? getKey(item, index) : index;
      return { kind: "item", item, index, key, id: `item:${identity(key)}` };
    };
    if (!groupBy) return data.map(itemRow);
    const groups = new Map<React.Key, { items: T[]; rows: Row<T>[] }>();
    data.forEach((item, index) => {
      const key = groupBy(item);
      const group = groups.get(key) ?? { items: [], rows: [] };
      group.items.push(item);
      group.rows.push(itemRow(item, index));
      groups.set(key, group);
    });
    return [...groups].flatMap(([key, group]) => [
      {
        kind: "group",
        key,
        id: `group:${identity(key)}`,
        items: group.items,
      } as Row<T>,
      ...group.rows,
    ]);
  }, [data, getKey, groupBy]);
  const measure = useCallback((key: string, size: number) => {
    if (size > 0 && Math.abs((sizes.current.get(key) ?? 0) - size) > 0.5) {
      const previous = metrics.current.get(key);
      const el = element.current;
      if (virtualRef.current && el && previous) {
        const pending = pendingAnchor.current ?? { base: el.scrollTop, delta: 0 };
        if (previous.top + previous.size <= pending.base) {
          pending.delta += size - (sizes.current.get(key) ?? previous.size);
          pendingAnchor.current = pending;
        }
      }
      sizes.current.set(key, size);
      setRevision((x) => x + 1);
    }
  }, []);
  useEffect(() => {
    const keys = new Set(rows.map((row) => row.id));
    for (const key of sizes.current.keys())
      if (!keys.has(key)) sizes.current.delete(key);
  }, [rows]);
  const layout = useMemo(() => {
    let total = 0;
    const offsets = rows.map((row) => {
      const top = total;
      const size =
        sizes.current.get(row.id) ??
        positive(
          row.kind === "group" ? estimatedGroupHeight : estimatedItemHeight,
          36,
        );
      total += size;
      return { top, size };
    });
    return {
      offsets,
      total,
      metrics: new Map(rows.map((row, index) => [row.id, offsets[index]])),
    };
  }, [rows, revision, estimatedItemHeight, estimatedGroupHeight]);
  metrics.current = layout.metrics;
  const top = windowed
    ? Math.min(scrollTop, Math.max(0, layout.total - viewport!))
    : scrollTop;
  useLayoutEffect(() => {
    const pending = pendingAnchor.current;
    pendingAnchor.current = null;
    if (windowed && element.current) {
      // Apply after the spacer has resized, using one committed anchor for
      // all observer entries. This also avoids browser clamping at the old end.
      const next = pending ? Math.max(0, Math.min(pending.base + pending.delta, Math.max(0, layout.total - viewport!))) : top;
      if (pending || next !== scrollTop) {
        element.current.scrollTop = next;
        setScrollTop(next);
      }
    }
  }, [windowed, top, scrollTop, revision, layout.total, viewport]);
  const groupIndices = useMemo(
    () => rows.flatMap((row, i) => (row.kind === "group" ? [i] : [])),
    [rows],
  );
  const nextGroups = useMemo(
    () => new Map(groupIndices.map((index, i) => [index, groupIndices[i + 1]])),
    [groupIndices],
  );
  const positions = useMemo(() => {
    let position = 0;
    return rows.map((row) => (row.kind === "item" ? ++position : 0));
  }, [rows]);
  const visible = useMemo(() => {
    if (!windowed) return rows.map((_, i) => i);
    // Binary search avoids a linear scan on every scroll of a long list.
    let low = 0,
      high = rows.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (layout.offsets[mid].top + layout.offsets[mid].size <= top)
        low = mid + 1;
      else high = mid;
    }
    const extra = Math.max(
      0,
      Math.floor(Number.isFinite(overscan) ? overscan : 3),
    );
    const start = Math.max(0, low - extra);
    let end = low;
    while (end < rows.length && layout.offsets[end].top < top + viewport!)
      end++;
    const indices = Array.from(
      { length: Math.max(0, Math.min(rows.length, end + extra) - start) },
      (_, i) => start + i,
    );
    if (stickyGroups) {
      const active = lastMatch(
        groupIndices,
        (i) => layout.offsets[i].top <= top,
      );
      if (active !== undefined && !indices.includes(active))
        indices.unshift(active);
    }
    return indices;
  }, [
    windowed,
    rows,
    layout,
    top,
    viewport,
    overscan,
    stickyGroups,
    groupIndices,
  ]);
  useImperativeHandle(
    ref,
    () => ({
      get element() {
        return element.current;
      },
      scrollTo(target) {
        const el = element.current;
        if (!el) return;
        let next = typeof target === "number" ? target : el.scrollTop;
        if (typeof target === "object") {
          if ("top" in target || "left" in target) {
            if (target.top !== undefined) next = target.top;
            if (target.left !== undefined) el.scrollLeft = target.left;
          } else {
            const index = rows.findIndex((row) =>
              "group" in target
                ? row.kind === "group" && row.key === target.group
                : row.kind === "item" &&
                  ("key" in target
                    ? row.key === target.key
                    : "index" in target && row.index === target.index),
            );
            if (index < 0) return;
            const row = layout.offsets[index];
            const h = el.clientHeight || viewport || 0;
            const align = "align" in target ? target.align : "start";
            const inset =
              stickyGroups && rows[index].kind === "item"
                ? (layout.offsets[
                    lastMatch(groupIndices, (i) => i < index) ?? -1
                  ]?.size ?? 0)
                : 0;
            if (
              align === "auto" &&
              row.top >= el.scrollTop + inset &&
              row.top + row.size <= el.scrollTop + h
            )
              return;
            next =
              row.top -
              (align === "end"
                ? h - row.size
                : align === "center"
                  ? (h - row.size) / 2
                  : inset) +
              ("offset" in target ? (target.offset ?? 0) : 0);
          }
        }
        if (!Number.isFinite(next)) return;
        next = Math.max(
          0,
          Math.min(
            next,
            Math.max(
              0,
              (windowed ? layout.total : el.scrollHeight || layout.total) -
                (el.clientHeight || viewport || 0),
            ),
          ),
        );
        el.scrollTop = next;
        setScrollTop(next);
      },
    }),
    [rows, layout, viewport, windowed, stickyGroups, groupIndices],
  );
  const notified = useRef<string | null>(null);
  useEffect(() => {
    if (!dataMode || !onEndReached || loading || !viewport) return;
    const el = element.current;
    const total = windowed ? layout.total : el?.scrollHeight || layout.total;
    const nearEnd = total - scrollTop - viewport <= Math.max(0, endThreshold);
    const marker = `${data.length}:${rows.at(-1)?.id ?? ""}`;
    if (!nearEnd) {
      notified.current = null;
      return;
    }
    if (notified.current !== marker) {
      notified.current = marker;
      onEndReached();
    }
  }, [
    dataMode,
    onEndReached,
    loading,
    viewport,
    windowed,
    layout.total,
    scrollTop,
    endThreshold,
    data.length,
    rows,
  ]);
  const list = (
    <ul
      {...props}
      ref={element}
      className={cn(
        "mt-list",
        dataMode && "mt-list-data",
        hoverable && dataMode && "mt-list-hoverable",
        windowed && "mt-list-virtual",
        className,
      )}
      aria-busy={loading ? true : props["aria-busy"]}
      style={{
        ...style,
        ...(viewport !== undefined
          ? { height: viewport, overflow: "auto" }
          : {}),
      }}
      onDragOver={
        sort.start
          ? (event) => {
              onDragOver?.(event);
              sort.over(event);
            }
          : onDragOver
      }
      onDrop={
        sort.start
          ? (event) => {
              onDrop?.(event);
              sort.drop(event);
            }
          : onDrop
      }
      onScroll={(event) => {
        setScrollTop(event.currentTarget.scrollTop);
        onScroll?.(event);
      }}
    >
      {!dataMode ? (
        children
      ) : (
        <>
          {windowed && (
            <li
              role="presentation"
              aria-hidden="true"
              style={{
                height: layout.total,
                minWidth: contentWidth,
                pointerEvents: "none",
              }}
            />
          )}
          {visible.map((index) => {
            const row = rows[index];
            const group = row.kind === "group";
            const nextGroup = group ? nextGroups.get(index) : undefined;
            if (windowed && stickyGroups && row.kind === "group") {
              const start = layout.offsets[index].top;
              const end = nextGroup === undefined
                ? layout.total
                : layout.offsets[nextGroup].top;
              // The absolute section provides a native sticky containing
              // block. Its child follows scrolling without awaiting React.
              return (
                <MeasuredRow
                  key={row.id}
                  id={row.id}
                  measure={measure}
                  measureChild
                  role="presentation"
                  className="mt-list-group-boundary"
                  style={{ top: start, height: end - start, minWidth: contentWidth }}
                >
                  <div
                    className="mt-list-group mt-list-group-sticky"
                    data-list-group={String(row.key)}
                  >
                    {renderGroup?.(row.key, row.items) ?? String(row.key)}
                  </div>
                </MeasuredRow>
              );
            }
            return (
              <MeasuredRow
                key={row.id}
                id={row.id}
                measure={measure}
                role={group ? "presentation" : undefined}
                aria-setsize={!group && windowed ? data.length : undefined}
                aria-posinset={
                  !group && windowed ? positions[index] : undefined
                }
                data-list-key={!group ? String(row.key) : undefined}
                data-list-sort-index={sort.start && !group ? row.index : undefined}
                data-list-group={group ? String(row.key) : undefined}
                className={cn(
                  group ? "mt-list-group" : "mt-list-row",
                  group && stickyGroups && "mt-list-group-sticky",
                )}
                style={{
                  minWidth: contentWidth,
                  ...(windowed
                    ? { position: "absolute", top: layout.offsets[index].top, width: "100%" }
                    : {}),
                }}
              >
                {row.kind === "group"
                  ? (renderGroup?.(row.key, row.items) ?? String(row.key))
                  : renderItem
                    ? renderItem(row.item, row.index)
                    : String(row.item ?? "")}
              </MeasuredRow>
            );
          })}
          {!data.length && !loading && (
            <li role="presentation" className="mt-list-state">
              {emptyContent}
            </li>
          )}
          {loading && (
            <li role="presentation" className="mt-list-state">
              <span role="status">{loadingContent}</span>
            </li>
          )}
        </>
      )}
    </ul>
  );
  return <ListSortStart.Provider value={sort.start}>{list}</ListSortStart.Provider>;
}
/** Drag grip for a controlled sortable list. Supply keyboard reordering separately. */
export type ListSortHandleProps = Omit<React.HTMLAttributes<HTMLSpanElement>, "children" | "draggable">;

function ListSortHandle({ className, title = "拖动排序", onDragStart, ...props }: ListSortHandleProps) {
  const start = useContext(ListSortStart);
  const handleDragStart: React.DragEventHandler<HTMLSpanElement> = (event) => {
    if (start) {
      onDragStart?.(event);
      if (!event.defaultPrevented) start(event);
      return;
    }
    const row = event.currentTarget.closest("li.mt-list-row, li.mt-list-item");
    if (row && !event.defaultPrevented && event.dataTransfer?.setDragImage) {
      const bounds = row.getBoundingClientRect();
      // Preview the original row without turning its other controls into drag targets.
      event.dataTransfer.setDragImage(
        row,
        Math.round(event.clientX - bounds.left),
        Math.round(event.clientY - bounds.top),
      );
    }
    // Callers can still cancel the native drag or replace its preview.
    onDragStart?.(event);
  };
  return (
    <span {...props} title={title} aria-hidden="true" draggable onDragStart={handleDragStart} className={cn("mt-list-sort-handle", className)}>
      <GripVertical size={16} focusable="false" />
    </span>
  );
}

export interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  sortHandle?: ListSortHandleProps;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}
export function ListItem({
  children,
  sortHandle,
  icon,
  description,
  actions,
  ...props
}: ListItemProps) {
  return (
    <li {...props} className={cn("mt-list-item", props.className)}>
      {sortHandle && <ListSortHandle {...sortHandle} />}
      {icon}
      <div className="mt-list-content">
        <div>{children}</div>
        {description && <small>{description}</small>}
      </div>
      {actions}
    </li>
  );
}

export const List = Object.assign(ListRoot, { SortHandle: ListSortHandle });
