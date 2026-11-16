import * as React from "react";
import {
  Group,
  Panel as ResizablePanel,
  Separator,
  type GroupImperativeHandle,
  type PanelImperativeHandle,
  type Layout,
} from "react-resizable-panels";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn, IconButton, useMtone } from "./basic";
import {
  splitterControlledLayout,
  splitterLayoutsEqual,
  validateSplitterSize,
  type SplitterSize,
} from "./splitter-utils";
export type { SplitterSize } from "./splitter-utils";
export interface SplitterPanelProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onResize"
> {
  id?: string;
  label?: string;
  defaultSize?: SplitterSize;
  min?: SplitterSize;
  max?: SplitterSize;
  resizable?: boolean;
  collapsible?: boolean;
  collapsedSize?: SplitterSize;
  groupResizeBehavior?: "preserve-relative-size" | "preserve-pixel-size";
}
export interface SplitterProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onResize"
> {
  orientation?: "horizontal" | "vertical";
  sizes?: SplitterSize[];
  disabled?: boolean;
  lazy?: boolean;
  onResize?: (sizes: number[]) => void;
  onResizeStart?: (sizes: number[]) => void;
  onResizeEnd?: (sizes: number[]) => void;
  onCollapse?: (collapsed: boolean[], sizes: number[]) => void;
  onDraggerDoubleClick?: (index: number) => void;
}
function SplitterPanel(_props: SplitterPanelProps) {
  return null;
}
function collect(
  children: React.ReactNode,
): React.ReactElement<SplitterPanelProps>[] {
  const result: React.ReactElement<SplitterPanelProps>[] = [];
  React.Children.forEach(children, (child) => {
    if (child == null || typeof child === "boolean") return;
    if (!React.isValidElement(child))
      throw new Error("Splitter: children must be Splitter.Panel elements.");
    if (child.type === React.Fragment) {
      result.push(
        ...collect((child.props as { children?: React.ReactNode }).children),
      );
    } else if (child.type === SplitterPanel)
      result.push(child as React.ReactElement<SplitterPanelProps>);
    else
      throw new Error(
        "Splitter: children must be Splitter.Panel elements (Fragments are supported).",
      );
  });
  return result;
}
const resizeKeys = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "Enter",
]);
function SplitterRoot(props: SplitterProps) {
  const {
    children,
    orientation = "horizontal",
    sizes,
    disabled = false,
    lazy = false,
    onResize,
    onResizeStart,
    onResizeEnd,
    onCollapse,
    onDraggerDoubleClick,
    className,
    style,
    onPointerDownCapture,
    onKeyDownCapture,
    ...native
  } = props;
  const { locale } = useMtone();
  const prefix = React.useId();
  const panels = collect(children);
  const ids = panels.map(
    (child, i) => child.props.id ?? `${prefix}-${child.key ?? i}`,
  );
  if (
    panels.length > 0 &&
    panels.every(
      (panel) => panel.props.groupResizeBehavior === "preserve-pixel-size",
    )
  )
    throw new Error(
      "Splitter: at least one Panel must preserve relative size.",
    );
  if (new Set(ids).size !== ids.length)
    throw new Error("Splitter: Panel ids must be unique.");
  panels.forEach(({ props: p }, i) => {
    for (const name of ["defaultSize", "min", "max", "collapsedSize"] as const)
      validateSplitterSize(p[name], `Panel ${i} ${name}`);
    const unit = (v: SplitterSize) =>
      typeof v === "number" || v.endsWith("px") ? "px" : "%";
    if (
      p.min !== undefined &&
      p.max !== undefined &&
      unit(p.min) === unit(p.max) &&
      parseFloat(String(p.min)) > parseFloat(String(p.max))
    )
      throw new Error("Splitter: Panel min cannot exceed max.");
  });
  if (sizes) splitterControlledLayout(sizes, ids, 100);
  const group = React.useRef<GroupImperativeHandle | null>(null),
    element = React.useRef<HTMLDivElement | null>(null),
    panelRefs = React.useRef(new Map<string, PanelImperativeHandle>());
  const layout = React.useRef<Layout>({}),
    [view, setView] = React.useState<Layout>({}),
    [axis, setAxis] = React.useState(0),
    [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});
  const collapsedRef = React.useRef<Record<string, boolean>>({});
  const [barGeometry, setBarGeometry] = React.useState<{
    positions: number[];
    total: number;
  }>({ positions: [], total: 0 });
  const suppress = React.useRef(false),
    mounted = React.useRef(true),
    lastApplied = React.useRef<{ key: string; layout: Layout } | null>(null),
    session = React.useRef<{
      before: Layout;
      pointerId?: number;
      pointerType?: string;
      cancelled?: boolean;
    } | null>(null);
  const latest = React.useRef({
    ids,
    panels,
    sizes,
    onResize,
    onResizeStart,
    onResizeEnd,
    onCollapse,
  });
  latest.current = {
    ids,
    panels,
    sizes,
    onResize,
    onResizeStart,
    onResizeEnd,
    onCollapse,
  };
  const measure = () => {
    const el = element.current;
    if (!el) return 0;
    const horizontal = orientation === "horizontal";
    const rootRect = el.getBoundingClientRect();
    const scale =
      (horizontal
        ? rootRect.width / el.offsetWidth
        : rootRect.height / el.offsetHeight) || 1;
    return Array.from(el.children)
      .filter((node) => node.hasAttribute("data-panel"))
      .reduce((total, node) => {
        const panel = node as HTMLElement,
          rect = panel.getBoundingClientRect();
        const measured = (horizontal ? rect.width : rect.height) / scale;
        const rounded = horizontal ? panel.offsetWidth : panel.offsetHeight;
        return total + (Math.abs(measured - rounded) < 1 ? measured : rounded);
      }, 0);
  };
  const pixels = (values: Layout = layout.current) => {
    const available = measure();
    return latest.current.ids.map(
      (id) => ((values[id] ?? 0) * available) / 100,
    );
  };
  const write = (next: Layout) => {
    if (!group.current || !mounted.current) return;
    suppress.current = true;
    try {
      const applied = group.current.setLayout(next);
      layout.current = applied;
      setView(applied);
      return applied;
    } finally {
      suppress.current = false;
    }
  };
  const begin = (pointerId?: number, pointerType?: string) => {
    if (session.current || disabled) return;
    session.current = { before: { ...layout.current }, pointerId, pointerType };
    latest.current.onResizeStart?.(pixels());
  };
  const finish = () => {
    if (!session.current) return;
    session.current = null;
    latest.current.onResizeEnd?.(pixels());
  };
  const reportCollapse = () => {
    const next = Object.fromEntries(
      latest.current.ids.map((id) => [
        id,
        panelRefs.current.get(id)?.isCollapsed() ?? false,
      ]),
    );
    const prev = collapsedRef.current;
    const changed = latest.current.ids.some(
      (id) => prev[id] !== undefined && prev[id] !== next[id],
    );
    if (
      Object.keys(prev).length !== Object.keys(next).length ||
      latest.current.ids.some((id) => prev[id] !== next[id])
    ) {
      collapsedRef.current = next;
      setCollapsed(next);
    }
    if (changed)
      latest.current.onCollapse?.(
        latest.current.ids.map((id) => next[id]),
        pixels(),
      );
  };
  React.useLayoutEffect(() => {
    const el = element.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setAxis(measure()));
    setAxis(measure());
    observer.observe(el);
    return () => observer.disconnect();
  }, [orientation, ids.join("|")]);
  React.useLayoutEffect(() => {
    const el = element.current;
    if (!el) return;
    const horizontal = orientation === "horizontal";
    const positions = Array.from(el.children)
      .filter((node) => node.hasAttribute("data-separator"))
      .map((node) => {
        const bar = node as HTMLElement;
        return horizontal
          ? bar.offsetLeft + bar.offsetWidth / 2
          : bar.offsetTop + bar.offsetHeight / 2;
      });
    const total = horizontal ? el.clientWidth : el.clientHeight;
    setBarGeometry((prev) =>
      prev.total === total &&
      prev.positions.length === positions.length &&
      positions.every((value, i) => value === prev.positions[i])
        ? prev
        : { positions, total },
    );
  });
  React.useLayoutEffect(() => {
    if (
      !sizes ||
      !group.current ||
      axis <= 0 ||
      !ids.every((id) => layout.current[id] !== undefined)
    )
      return;
    const key = JSON.stringify([ids, sizes, axis]);
    const prior = lastApplied.current;
    if (
      prior?.key === key &&
      splitterLayoutsEqual(layout.current, prior.layout)
    )
      return;
    const applied = write(splitterControlledLayout(sizes, ids, axis));
    if (applied) {
      lastApplied.current = { key, layout: applied };
      reportCollapse();
    }
  });
  React.useEffect(() => {
    mounted.current = true;
    const win = element.current?.ownerDocument.defaultView;
    if (!win) return;
    const end = (event: Event) => {
      if (
        "pointerId" in event &&
        event.pointerId !== session.current?.pointerId
      )
        return;
      requestAnimationFrame(() => {
        if (mounted.current) {
          reportCollapse();
          finish();
        }
      });
    };
    const cancel = (event: PointerEvent) => {
      if (event.pointerId !== session.current?.pointerId) return;
      const before = session.current?.before;
      if (!before) return;
      session.current!.cancelled = true;
      queueMicrotask(() => {
        if (mounted.current) {
          write(before);
          latest.current.onResize?.(pixels(before));
          reportCollapse();
          finish();
        }
      });
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || session.current?.pointerId === undefined)
        return;
      e.preventDefault();
      const s = session.current;
      const target = element.current;
      target?.dispatchEvent(
        new PointerEvent("pointercancel", {
          bubbles: true,
          pointerId: s.pointerId ?? 1,
          pointerType: s.pointerType ?? "mouse",
        }),
      );
    };
    win.addEventListener("pointerup", end);
    win.addEventListener("pointercancel", cancel, true);
    win.addEventListener("keydown", escape, true);
    win.addEventListener("blur", end);
    return () => {
      mounted.current = false;
      session.current = null;
      win.removeEventListener("pointerup", end);
      win.removeEventListener("pointercancel", cancel, true);
      win.removeEventListener("keydown", escape, true);
      win.removeEventListener("blur", end);
    };
  }, [orientation]);
  const toggle = (id: string) => {
    if (disabled) return;
    const api = panelRefs.current.get(id);
    if (!api) return;
    begin();
    api.isCollapsed() ? api.expand() : api.collapse();
    requestAnimationFrame(() => {
      if (mounted.current) {
        reportCollapse();
        finish();
      }
    });
  };
  const horizontal = orientation === "horizontal";
  const rtl =
    native.dir === "rtl" ||
    element.current?.ownerDocument.defaultView?.getComputedStyle(
      element.current,
    ).direction === "rtl";
  return (
    <Group
      {...native}
      orientation={orientation}
      disabled={disabled}
      resizePreviewMode={lazy ? "separator" : "panel"}
      groupRef={group}
      elementRef={element}
      className={cn("mt-splitter", className)}
      style={{ ...style, position: "relative" }}
      data-orientation={orientation}
      onPointerDownCapture={(e) => {
        onPointerDownCapture?.(e);
        if (
          e.button !== 0 ||
          disabled ||
          (e.target as Element).closest(".mt-splitter-collapse") ||
          (e.target as Element).closest("[data-group]") !== element.current
        )
          return;
        const el = element.current;
        const radius = e.pointerType === "touch" ? 10 : 5;
        const target = Array.from(el?.children ?? []).find((node) => {
          if (
            !node.hasAttribute("data-separator") ||
            node.getAttribute("aria-disabled") === "true"
          )
            return false;
          const r = node.getBoundingClientRect();
          return horizontal
            ? Math.abs(e.clientX - (r.left + r.width / 2)) <= radius &&
                e.clientY >= r.top &&
                e.clientY <= r.bottom
            : Math.abs(e.clientY - (r.top + r.height / 2)) <= radius &&
                e.clientX >= r.left &&
                e.clientX <= r.right;
        });
        if (target) begin(e.pointerId, e.pointerType);
      }}
      onKeyDownCapture={(e) => {
        onKeyDownCapture?.(e);
        if (
          !e.defaultPrevented &&
          resizeKeys.has(e.key) &&
          (e.target as Element).hasAttribute("data-separator") &&
          (e.target as Element).parentElement === element.current &&
          (e.target as Element).getAttribute("aria-disabled") !== "true"
        ) {
          begin();
          requestAnimationFrame(() => {
            if (mounted.current) {
              reportCollapse();
              finish();
            }
          });
        }
      }}
      onLayoutChange={(next) => {
        if (!latest.current.ids.every((id) => next[id] !== undefined)) return;
        layout.current = next;
        setView(next);
        if (!suppress.current && session.current && !session.current.cancelled)
          latest.current.onResize?.(pixels(next));
      }}
      onLayoutChanged={(next, meta) => {
        if (!latest.current.ids.every((id) => next[id] !== undefined)) return;
        layout.current = next;
        if (!suppress.current) {
          if (
            meta.isUserInteraction &&
            session.current?.pointerId === undefined
          ) {
            requestAnimationFrame(() => {
              if (mounted.current) {
                reportCollapse();
                finish();
              }
            });
          } else if (!session.current) reportCollapse();
        }
      }}
    >
      {panels.flatMap((child, i) => {
        const {
          id: _,
          label,
          defaultSize,
          min,
          max,
          resizable = true,
          collapsible = false,
          collapsedSize = 0,
          groupResizeBehavior,
          children: panelChildren,
          ...p
        } = child.props;
        const id = ids[i];
        const content = (
          <ResizablePanel
            {...p}
            key={id}
            id={id}
            aria-label={label ?? p["aria-label"]}
            panelRef={(api) => {
              if (api) panelRefs.current.set(id, api);
              else panelRefs.current.delete(id);
            }}
            defaultSize={defaultSize}
            minSize={min ?? (collapsible ? "10%" : 0)}
            maxSize={max}
            disabled={!resizable}
            collapsible={collapsible}
            collapsedSize={collapsedSize}
            groupResizeBehavior={groupResizeBehavior}
            className={cn("mt-splitter-panel", p.className)}
          >
            <div
              className="mt-splitter-content"
              inert={view[id] === 0}
              aria-hidden={view[id] === 0 || undefined}
            >
              {panelChildren}
            </div>
          </ResizablePanel>
        );
        return i === panels.length - 1
          ? [content]
          : [
              content,
              <Separator
                key={`${id}-separator`}
                id={`${id}-separator`}
                className="mt-splitter-separator"
                disabled={
                  disabled ||
                  !resizable ||
                  panels[i + 1].props.resizable === false
                }
                aria-label={
                  locale === "zh"
                    ? `调整分栏 ${i + 1}`
                    : `Resize panels ${i + 1}`
                }
                onDoubleClick={() => onDraggerDoubleClick?.(i)}
              >
                <span className="mt-splitter-grip" aria-hidden="true" />
              </Separator>,
            ];
      })}
      {panels.map((child, i) => {
        if (!child.props.collapsible) return null;
        const id = ids[i],
          isCollapsed = collapsed[id] ?? false;
        const before = i < panels.length - 1;
        const boundary = before ? i : i - 1;
        if (boundary < 0) return null;
        const boundaryPosition = barGeometry.positions[boundary];
        if (boundaryPosition === undefined) return null;
        const side = (before ? -1 : 1) * (isCollapsed ? -1 : 1);
        let position =
          boundaryPosition + side * 26 * (horizontal && rtl ? -1 : 1);
        position = Math.max(12, Math.min(barGeometry.total - 12, position));
        const Icon = horizontal
          ? (rtl ? -side : side) < 0
            ? ChevronLeft
            : ChevronRight
          : side < 0
            ? ChevronUp
            : ChevronDown;
        const label =
          child.props.label ?? `${locale === "zh" ? "面板" : "panel"} ${i + 1}`;
        return (
          <IconButton
            key={`${id}-collapse`}
            size="sm"
            variant="ghost"
            className="mt-splitter-collapse"
            disabled={disabled || child.props.resizable === false}
            aria-label={`${isCollapsed ? (locale === "zh" ? "展开" : "Expand") : locale === "zh" ? "收起" : "Collapse"} ${label}`}
            aria-controls={id}
            aria-expanded={!isCollapsed}
            style={
              horizontal
                ? { left: position - 10, top: 4 }
                : { top: position - 10, left: 4 }
            }
            onClick={() => toggle(id)}
          >
            <Icon size={14} />
          </IconButton>
        );
      })}
    </Group>
  );
}
export const Splitter = Object.assign(SplitterRoot, { Panel: SplitterPanel });
