"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { GripHorizontal, Maximize2, Minus, PanelTop, X } from "lucide-react";
import { Button, MtoneScope, useMtone } from "./basic";

import { useLayoutPreference } from "./layout-persistence";

type Position = { left: number; top: number };
type Size = { width: number; height: number };
type Geometry = Position & Size;
type Bounds = Position & { right: number; bottom: number };
type GestureKind = "move" | "resize";
type TriggerProps = React.HTMLAttributes<HTMLElement> & { type?: string; ref?: React.Ref<HTMLElement> };

export interface FloatingWindowProps {
  title: React.ReactNode;
  children?: React.ReactNode;
  trigger?: React.ReactElement | string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialPosition?: Position;
  initialSize?: Size;
  /** Remember position and size, not open/minimized state. */
  storageKey?: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  draggable?: boolean;
  resizable?: boolean;
  minimizable?: boolean;
  minimizedIcon?: React.ReactNode;
  zIndex?: number;
}

function readGeometry(value: unknown): Geometry | undefined {
  const g = value as Partial<Geometry> | null;
  if (!g || typeof g !== "object" ||
    ![g.left, g.top, g.width, g.height].every(Number.isFinite) ||
    g.width! <= 0 || g.height! <= 0) return undefined;
  return g as Geometry;
}

const inset = 12;
const collapsedSize = 40;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const finite = (value: number | undefined, fallback: number) =>
  value !== undefined && Number.isFinite(value) ? value : fallback;

function readBounds(): Bounds {
  const visual = window.visualViewport;
  const width = visual?.width || document.documentElement.clientWidth || window.innerWidth;
  const height = visual?.height || document.documentElement.clientHeight || window.innerHeight;
  const left = visual?.offsetLeft ?? 0;
  const top = visual?.offsetTop ?? 0;
  const inlineInset = Math.min(inset, width / 4);
  const blockInset = Math.min(inset, height / 4);
  return {
    left: left + inlineInset,
    top: top + blockInset,
    right: left + width - inlineInset,
    bottom: top + height - blockInset,
  };
}

type Limits = { minWidth: number; minHeight: number; maxWidth: number; maxHeight: number };
function readLimits(bounds: Bounds, props: {
  minWidth?: number; minHeight?: number; maxWidth?: number; maxHeight?: number;
}): Limits {
  const availableWidth = bounds.right - bounds.left;
  const availableHeight = bounds.bottom - bounds.top;
  // Preserve room for the titlebar actions and physical resize grip where possible.
  const chromeWidth = Math.min(108, availableWidth);
  const chromeHeight = Math.min(56, availableHeight);
  const maxWidth = clamp(finite(props.maxWidth, Infinity), chromeWidth, availableWidth);
  const maxHeight = clamp(finite(props.maxHeight, Infinity), chromeHeight, availableHeight);
  return {
    maxWidth,
    maxHeight,
    minWidth: clamp(finite(props.minWidth, 220), chromeWidth, maxWidth),
    minHeight: clamp(finite(props.minHeight, 140), chromeHeight, maxHeight),
  };
}
function fitWindow(bounds: Bounds, limits: Limits, position?: Position, size?: Size): Geometry {
  const width = clamp(finite(size?.width, 440), limits.minWidth, limits.maxWidth);
  const height = clamp(finite(size?.height, 320), limits.minHeight, limits.maxHeight);
  return {
    width, height,
    left: clamp(finite(position?.left, (bounds.left + bounds.right - width) / 2), bounds.left, bounds.right - width),
    top: clamp(finite(position?.top, (bounds.top + bounds.bottom - height) / 2), bounds.top, bounds.bottom - height),
  };
}
function updateGeometry(current: Geometry, kind: GestureKind, x: number, y: number, bounds: Bounds, limits: Limits): Geometry {
  if (kind === "move") {
    return fitWindow(bounds, limits, { left: current.left + x, top: current.top + y }, current);
  }
  const maxWidth = Math.min(limits.maxWidth, bounds.right - current.left);
  const maxHeight = Math.min(limits.maxHeight, bounds.bottom - current.top);
  return {
    ...current,
    width: clamp(current.width + x, Math.min(limits.minWidth, maxWidth), maxWidth),
    height: clamp(current.height + y, Math.min(limits.minHeight, maxHeight), maxHeight),
  };
}

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null): void | (() => void) {
  if (typeof ref === "function") return ref(node);
  if (ref) ref.current = node;
}

export function FloatingWindow({
  title, children, trigger, open: controlledOpen, defaultOpen = false, onOpenChange,
  initialPosition, initialSize, storageKey, minWidth, minHeight, maxWidth, maxHeight,
  draggable = true, resizable = true, minimizable = true, minimizedIcon, zIndex = 1150,
}: FloatingWindowProps) {
  const { locale } = useMtone();
  const zh = locale === "zh";
  const dialogId = React.useId();
  const titleId = `${dialogId}-title`;
  const moveHelp = `${dialogId}-move`;
  const resizeHelp = `${dialogId}-resize`;
  const [localOpen, setOpen] = React.useState(defaultOpen);
  const open = controlledOpen ?? localOpen;
  const [minimized, setMinimized] = React.useState(false);
  const collapsed = minimizable && minimized;
  const [bounds, setBounds] = React.useState<Bounds>();
  const [storedGeometry, setGeometry] = useLayoutPreference<Geometry | undefined>(
    "floating-window", storageKey, undefined, readGeometry,
  );
  const initial = React.useRef({ position: initialPosition, size: initialSize });
  const triggerRef = React.useRef<HTMLElement>(null);
  const triggerElement = typeof trigger === "object" ? trigger as React.ReactElement<TriggerProps> : undefined;
  const externalTriggerRef = triggerElement?.props.ref;
  const captureTrigger = React.useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
    const cleanUp = assignRef(externalTriggerRef, node);
    if (cleanUp) return () => { triggerRef.current = null; cleanUp(); };
  }, [externalTriggerRef]);
  const windowRef = React.useRef<HTMLElement>(null);
  const restoreRef = React.useRef<HTMLButtonElement>(null);
  const pendingFocus = React.useRef<"window" | "restore" | "trigger" | undefined>(undefined);
  const focusWithin = React.useRef(false);
  const markFocused = () => { focusWithin.current = true; };
  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget;
    if (next && !(windowRef.current?.contains(next) || restoreRef.current?.contains(next))) {
      focusWithin.current = false;
      if (pendingFocus.current === "trigger") pendingFocus.current = undefined;
    }
  };
  const gesture = React.useRef<{ id: number; kind: GestureKind; x: number; y: number; geometry: Geometry; last?: Geometry } | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const refresh = () => {
      gesture.current = null;
      setBounds(readBounds());
    };
    refresh();
    const visual = window.visualViewport;
    window.addEventListener("resize", refresh);
    visual?.addEventListener("resize", refresh);
    visual?.addEventListener("scroll", refresh);
    return () => {
      window.removeEventListener("resize", refresh);
      visual?.removeEventListener("resize", refresh);
      visual?.removeEventListener("scroll", refresh);
      gesture.current = null;
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) {
      setMinimized(false);
      if (pendingFocus.current === "trigger" || focusWithin.current) {
        triggerRef.current?.focus({ preventScroll: true });
      }
      focusWithin.current = false;
      pendingFocus.current = undefined;
      return;
    }
    const target = pendingFocus.current === "window" && !collapsed ? windowRef.current
      : pendingFocus.current === "restore" && collapsed ? restoreRef.current : null;
    if (target) {
      pendingFocus.current = undefined;
      target.focus({ preventScroll: true });
    }
  }, [open, collapsed, bounds]);

  const limits = bounds && readLimits(bounds, { minWidth, minHeight, maxWidth, maxHeight });
  const geometry = bounds && limits && fitWindow(
    bounds, limits, storedGeometry ?? initial.current.position, storedGeometry ?? initial.current.size,
  );

  const changeOpen = (next: boolean) => {
    if (controlledOpen === undefined) setOpen(next);
    onOpenChange?.(next);
  };
  const restore = () => {
    pendingFocus.current = "window";
    setMinimized(false);
  };
  const requestOpen = () => {
    if (!open) {
      pendingFocus.current = "window";
      changeOpen(true);
    } else if (collapsed) {
      restore();
    } else {
      windowRef.current?.focus({ preventScroll: true });
    }
  };
  const close = () => {
    pendingFocus.current = "trigger";
    changeOpen(false);
  };
  const minimize = () => {
    gesture.current = null;
    pendingFocus.current = "restore";
    setMinimized(true);
  };

  function pointerDown(kind: GestureKind, event: React.PointerEvent<HTMLElement>) {
    if (!geometry || gesture.current || event.button !== 0 || event.defaultPrevented) return;
    if (kind === "move" && event.target instanceof Element &&
      event.target.closest("button, a[href], input, select, textarea, [contenteditable], [role=button]") &&
      !event.target.closest(".mt-floating-window-move")) return;
    gesture.current = { id: event.pointerId, kind, x: event.clientX, y: event.clientY, geometry };
    event.preventDefault();
    // Capture carries the gesture across the rest of the page, even when a resize
    // moves the grip away from the pointer. Detached/synthetic targets can reject it.
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* native capture unavailable */ }
  }
  function pointerMove(event: React.PointerEvent<HTMLElement>) {
    const start = gesture.current;
    if (!start || !bounds || !limits || start.id !== event.pointerId) return;
    start.last = updateGeometry(start.geometry, start.kind, event.clientX - start.x, event.clientY - start.y, bounds, limits);
    setGeometry(start.last, false);
  }
  function pointerEnd(event: React.PointerEvent<HTMLElement>) {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
    gesture.current = null;
    if (start.last && event.type === "pointerup") setGeometry(start.last);
    else if (start.last) setGeometry(start.geometry, false);
  }
  function keyDown(kind: GestureKind, event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!geometry || !bounds || !limits || event.altKey || event.ctrlKey || event.metaKey) return;
    const step = event.shiftKey ? 24 : 8;
    const x = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
    const y = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
    if (!x && !y) return;
    event.preventDefault();
    event.stopPropagation();
    setGeometry(updateGeometry(geometry, kind, x, y, bounds, limits));
  }
  const pointerEvents = {
    onPointerMove: pointerMove,
    onPointerUp: pointerEnd,
    onPointerCancel: pointerEnd,
    onLostPointerCapture: pointerEnd,
  };

  let opener: React.ReactNode = null;
  if (typeof trigger === "string") {
    opener = <Button type="button" ref={triggerRef as React.Ref<HTMLButtonElement>}
      aria-haspopup="dialog" aria-expanded={open && !collapsed} aria-controls={open ? dialogId : undefined}
      onClick={requestOpen}>{trigger}</Button>;
  } else if (triggerElement) {
    opener = React.cloneElement(triggerElement, {
      ...(triggerElement.type === "button" && triggerElement.props.type === undefined ? { type: "button" } : {}),
      ref: captureTrigger,
      "aria-haspopup": "dialog",
      "aria-expanded": open && !collapsed,
      "aria-controls": open ? dialogId : undefined,
      onClick(event) {
        triggerElement.props.onClick?.(event);
        if (!event.defaultPrevented) {
          triggerRef.current = event.currentTarget;
          requestOpen();
        }
      },
    });
  }

  const content = open && geometry && bounds && createPortal(
    <MtoneScope className="mt-floating-window-scope">
      <React.Activity mode={collapsed ? "hidden" : "visible"}>
        <section ref={windowRef} id={dialogId} role="dialog" aria-modal="false"
          aria-labelledby={titleId} tabIndex={-1} onFocusCapture={markFocused} onBlurCapture={handleBlur}
          className="mt-floating-window" style={{ ...geometry, zIndex }}>
          <header className="mt-floating-window-header">
            <div className="mt-floating-window-caption" data-draggable={draggable || undefined}
              {...(draggable ? { ...pointerEvents, onPointerDown: (event: React.PointerEvent<HTMLElement>) => pointerDown("move", event) } : {})}>
              {draggable && <Button type="button" variant="ghost" size="sm" iconOnly className="mt-floating-window-move"
                aria-label={zh ? "移动窗口" : "Move window"} aria-describedby={moveHelp} onKeyDown={(event) => keyDown("move", event)}>
                <GripHorizontal size={15} aria-hidden="true" />
              </Button>}
              <h2 id={titleId} className="mt-floating-window-title">{title}</h2>
            </div>
            <div className="mt-floating-window-actions">
              {minimizable && <Button type="button" variant="ghost" size="sm" iconOnly
                aria-label={zh ? "最小化窗口" : "Minimize window"} onClick={minimize}>
                <Minus size={15} aria-hidden="true" />
              </Button>}
              <Button type="button" variant="ghost" size="sm" iconOnly aria-label={zh ? "关闭窗口" : "Close window"} onClick={close}>
                <X size={15} aria-hidden="true" />
              </Button>
            </div>
          </header>
          {draggable && <span className="mt-floating-window-sr-only" id={moveHelp}>
            {zh ? "用方向键移动，按住 Shift 加快移动。" : "Use the arrow keys to move. Hold Shift for larger steps."}
          </span>}
          <div className="mt-floating-window-content">{children}</div>
          {resizable && <span className="mt-floating-window-sr-only" id={resizeHelp}>
            {zh ? "用方向键调整大小，按住 Shift 增大步长。" : "Use the arrow keys to resize. Hold Shift for larger steps."}
          </span>}
          {resizable && <button type="button" className="mt-floating-window-resize"
            aria-label={zh ? "调整窗口大小" : "Resize window"} aria-describedby={resizeHelp} {...pointerEvents}
            onPointerDown={(event) => pointerDown("resize", event)} onKeyDown={(event) => keyDown("resize", event)}>
            <Maximize2 size={13} aria-hidden="true" />
          </button>}
        </section>
      </React.Activity>
      {collapsed && <Button type="button" ref={restoreRef} variant="outline" iconOnly
        className="mt-floating-window-restore" aria-label={zh ? "恢复窗口" : "Restore window"} onClick={restore}
        onFocus={markFocused} onBlur={handleBlur}
        style={{ left: Math.max(bounds.left, bounds.right - collapsedSize), top: Math.max(bounds.top, bounds.bottom - collapsedSize),
          width: Math.min(collapsedSize, bounds.right - bounds.left), height: Math.min(collapsedSize, bounds.bottom - bounds.top), zIndex }}>
        <span aria-hidden="true">{minimizedIcon ?? <PanelTop size={18} />}</span>
      </Button>}
    </MtoneScope>, document.body,
  );
  return <>{opener}{content}</>;
}
