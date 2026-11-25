import * as React from "react";
import {
  Group,
  Panel as ResizablePanel,
  Separator,
  type GroupImperativeHandle,
  type PanelImperativeHandle,
  type Layout,
} from "react-resizable-panels";
import { cn, useMtone } from "./basic";
import {
  splitterControlledLayout,
  splitterPairTarget,
  splitterSizeToPixels,
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
  /** Show a themed border around the outside of the splitter. Defaults to false. */
  bordered?: boolean;
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
    bordered = false,
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
    onPointerMoveCapture,
    onPointerUpCapture,
    onPointerCancelCapture,
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
  const initial = React.useRef<{ key: string; layout: Layout } | null>(null);
  const phases = React.useRef(
    new Map<string, "first" | "initial" | "second">(),
  );
  const cyclePending = React.useRef(false);
  const cycleToken = React.useRef(0);
  const queuedCycle = React.useRef<{
    boundary: number;
    topology: string;
  } | null>(null);
  const cycleHandler = React.useRef<(boundary: number) => void>(() => {});
  const touchTap = React.useRef<{
    boundary: number;
    x: number;
    y: number;
    time: number;
  } | null>(null);
  const touchDown = React.useRef<{
    boundary: number;
    x: number;
    y: number;
    time: number;
    pointerId: number;
    moved: boolean;
  } | null>(null);
  const lastTouchCycle = React.useRef(-Infinity);
  const suppress = React.useRef(false),
    mounted = React.useRef(true),
    lastApplied = React.useRef<{ key: string; layout: Layout } | null>(null),
    session = React.useRef<{
      before: Layout;
      phasesBefore: Map<string, "first" | "initial" | "second">;
      pointerId?: number;
      pointerType?: string;
      boundary?: number;
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
  const begin = (
    pointerId?: number,
    pointerType?: string,
    boundary?: number,
  ) => {
    if (session.current || disabled) return;
    session.current = {
      before: { ...layout.current },
      phasesBefore: new Map(phases.current),
      pointerId,
      pointerType,
      boundary,
    };
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
      const activeSession = session.current;
      requestAnimationFrame(() => {
        if (mounted.current && session.current === activeSession) {
          reportCollapse();
          finish();
        }
      });
    };
    const cancel = (event: PointerEvent) => {
      if (event.pointerId !== session.current?.pointerId) return;
      const activeSession = session.current;
      const before = activeSession?.before;
      if (!before) return;
      session.current!.cancelled = true;
      queueMicrotask(() => {
        if (mounted.current && session.current === activeSession) {
          phases.current = new Map(activeSession!.phasesBefore);
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
      cyclePending.current = false;
      queuedCycle.current = null;
      cycleToken.current++;
      win.removeEventListener("pointerup", end);
      win.removeEventListener("pointercancel", cancel, true);
      win.removeEventListener("keydown", escape, true);
      win.removeEventListener("blur", end);
    };
  }, [orientation]);
  const topology = JSON.stringify(ids);
  React.useLayoutEffect(() => {
    if (
      axis > 0 &&
      ids.every((id) => layout.current[id] !== undefined) &&
      initial.current?.key !== topology
    ) {
      initial.current = { key: topology, layout: { ...layout.current } };
      phases.current.clear();
      cyclePending.current = false;
      queuedCycle.current = null;
      cycleToken.current++;
    }
  });
  React.useEffect(() => {
    phases.current.clear();
  }, [orientation]);
  const cycle = (boundary: number) => {
    const current = latest.current;
    const a = current.panels[boundary]?.props,
      b = current.panels[boundary + 1]?.props;
    if (
      disabled ||
      !a ||
      !b ||
      a.resizable === false ||
      b.resizable === false ||
      (!a.collapsible && !b.collapsible)
    )
      return;
    if (cyclePending.current) {
      // Keep one trailing discrete activation while the accepted layout settles.
      // Key repeats never reach this path. Resolve against the latest props and
      // phase after the preceding operation, including controlled rejection.
      queuedCycle.current = { boundary, topology: JSON.stringify(current.ids) };
      return;
    }
    const aid = current.ids[boundary],
      bid = current.ids[boundary + 1];
    const key = JSON.stringify([aid, bid]);
    const snapshot = initial.current;
    if (!snapshot || snapshot.key !== JSON.stringify(current.ids)) return;
    const previous = phases.current.get(key);
    const phase =
      a.collapsible && b.collapsible
        ? previous === "first"
          ? "initial"
          : previous === "initial"
            ? "second"
            : "first"
        : previous === (a.collapsible ? "first" : "second")
          ? "initial"
          : a.collapsible
            ? "first"
            : "second";
    const available = measure();
    if (available <= 0) return;
    const percent = (value: SplitterSize) =>
      (splitterSizeToPixels(value, available) / available) * 100;
    const constraint = (p: SplitterPanelProps) => ({
      min: percent(p.min ?? (p.collapsible ? "10%" : 0)),
      max: percent(p.max ?? "100%"),
      collapsed: percent(p.collapsedSize ?? 0),
      collapsible: !!p.collapsible,
    });
    const initialTotal = snapshot.layout[aid] + snapshot.layout[bid];
    const target = splitterPairTarget(
      layout.current[aid] + layout.current[bid],
      initialTotal > 0 ? snapshot.layout[aid] / initialTotal : 0.5,
      phase,
      constraint(a),
      constraint(b),
    );
    if (!target) return;
    const before = { ...layout.current };
    const next = { ...before, [aid]: target[0], [bid]: target[1] };
    if (splitterLayoutsEqual(before, next)) {
      phases.current.set(key, phase);
      return;
    }
    cyclePending.current = true;
    const token = ++cycleToken.current;
    // A dblclick can arrive before the preceding pointerup RAF. Give the cycle
    // its own session so that a stale pointer completion cannot finish it.
    finish();
    begin();
    const applied = write(next);
    if (!applied || !splitterLayoutsEqual(applied, next)) {
      write(before);
      cyclePending.current = false;
      finish();
      return;
    }
    current.onResize?.(pixels(applied));
    requestAnimationFrame(() => {
      if (!mounted.current || cycleToken.current !== token) return;
      if (
        initial.current === snapshot &&
        splitterLayoutsEqual(layout.current, applied)
      )
        phases.current.set(key, phase);
      cyclePending.current = false;
      reportCollapse();
      finish();
      const queued = queuedCycle.current;
      queuedCycle.current = null;
      if (queued && queued.topology === JSON.stringify(latest.current.ids)) {
        cycleHandler.current(queued.boundary);
      }
    });
  };
  cycleHandler.current = cycle;
  const horizontal = orientation === "horizontal";
  return (
    <Group
      {...native}
      orientation={orientation}
      disabled={disabled}
      resizePreviewMode={lazy ? "separator" : "panel"}
      groupRef={group}
      elementRef={element}
      className={cn("mt-splitter", bordered && "mt-splitter-bordered", className)}
      style={{ ...style, position: "relative" }}
      data-orientation={orientation}
      onPointerDownCapture={(e) => {
        onPointerDownCapture?.(e);
        if (
          e.button !== 0 ||
          disabled ||
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
        if (target) {
          begin(
            e.pointerId,
            e.pointerType,
            Number(target.getAttribute("data-boundary")),
          );
          if (
            e.pointerType === "touch" &&
            session.current?.pointerId === e.pointerId
          )
            touchDown.current = {
              boundary: Number(target.getAttribute("data-boundary")),
              x: e.clientX,
              y: e.clientY,
              time: performance.now(),
              pointerId: e.pointerId,
              moved: false,
            };
        }
      }}
      onPointerMoveCapture={(e) => {
        onPointerMoveCapture?.(e);
        const down = touchDown.current;
        if (
          down?.pointerId === e.pointerId &&
          Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8
        )
          down.moved = true;
      }}
      onPointerCancelCapture={(e) => {
        onPointerCancelCapture?.(e);
        if (touchDown.current?.pointerId === e.pointerId) {
          touchDown.current = null;
          touchTap.current = null;
        }
      }}
      onPointerUpCapture={(e) => {
        onPointerUpCapture?.(e);
        const down = touchDown.current;
        if (!down || down.pointerId !== e.pointerId) return;
        touchDown.current = null;
        const now = performance.now();
        if (
          down.moved ||
          now - down.time > 350 ||
          Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8
        ) {
          touchTap.current = null;
          return;
        }
        const prior = touchTap.current;
        if (
          prior &&
          prior.boundary === down.boundary &&
          now - prior.time < 350 &&
          Math.hypot(e.clientX - prior.x, e.clientY - prior.y) < 24
        ) {
          touchTap.current = null;
          lastTouchCycle.current = now;
          // Finish the no-movement pointer session before the separate cycle.
          finish();
          onDraggerDoubleClick?.(down.boundary);
          cycle(down.boundary);
        } else
          touchTap.current = {
            boundary: down.boundary,
            x: e.clientX,
            y: e.clientY,
            time: now,
          };
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
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            if (!e.repeat)
              cycle(
                Number((e.target as Element).getAttribute("data-boundary")),
              );
            return;
          }
          const boundary = Number(
            (e.target as Element).getAttribute("data-boundary"),
          );
          phases.current.delete(
            JSON.stringify([ids[boundary], ids[boundary + 1]]),
          );
          begin(undefined, undefined, boundary);
          const activeSession = session.current;
          requestAnimationFrame(() => {
            if (mounted.current && session.current === activeSession) {
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
        if (
          !suppress.current &&
          session.current &&
          !session.current.cancelled
        ) {
          if (!cyclePending.current && session.current.boundary !== undefined) {
            const boundary = session.current.boundary;
            phases.current.delete(
              JSON.stringify([
                latest.current.ids[boundary],
                latest.current.ids[boundary + 1],
              ]),
            );
          }
          latest.current.onResize?.(pixels(next));
        }
      }}
      onLayoutChanged={(next, meta) => {
        if (!latest.current.ids.every((id) => next[id] !== undefined)) return;
        layout.current = next;
        if (!suppress.current) {
          if (
            meta.isUserInteraction &&
            session.current?.pointerId === undefined
          ) {
            const activeSession = session.current;
            requestAnimationFrame(() => {
              if (mounted.current && session.current === activeSession) {
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
                data-boundary={i}
                disableDoubleClick
                aria-description={collapsible || panels[i + 1].props.collapsible
                  ? locale === "zh"
                    ? "双击、触屏双击或按 Enter 循环收起相邻面板与恢复初始比例"
                    : "Double-click, double-tap, or press Enter to cycle adjacent panel collapse and initial proportions"
                  : undefined}
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
                onDoubleClick={() => {
                  if (performance.now() - lastTouchCycle.current < 700) return;
                  onDraggerDoubleClick?.(i);
                  cycle(i);
                }}
              >
                <span className="mt-splitter-grip" aria-hidden="true" />
              </Separator>,
            ];
      })}
    </Group>
  );
}
export const Splitter = Object.assign(SplitterRoot, { Panel: SplitterPanel });
