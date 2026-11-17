import * as React from "react";
import { cn } from "./basic";
export interface AffixProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  /** Top offset, defaults to zero unless offsetBottom is supplied. Takes precedence. */
  offsetTop?: number;
  offsetBottom?: number;
  target?: () => Window | HTMLElement | null;
  onChange?: (affixed: boolean) => void;
}
type Position = { top: number; left: number; width: number; height: number };
/** Fixed positioning with an in-flow placeholder. Use with vertical scrolling. */
export const Affix = React.forwardRef<HTMLDivElement, AffixProps>(
  function Affix(
    {
      offsetTop,
      offsetBottom,
      target,
      onChange,
      className,
      style,
      children,
      ...props
    },
    forwardedRef,
  ) {
    const root = React.useRef<HTMLDivElement>(null);
    const content = React.useRef<HTMLDivElement>(null);
    const callback = React.useRef(onChange);
    callback.current = onChange;
    const lastAffixed = React.useRef(false);
    const [position, setPosition] = React.useState<Position | null>(null);
    React.useEffect(() => {
      const placeholder = root.current;
      const inner = content.current;
      if (!placeholder || !inner) return;
      const win = placeholder.ownerDocument.defaultView;
      if (!win) return;
      const scrollTarget = target ? target() : win;
      let frame: number | null = null;
      let active = true;
      const publish = (next: Position | null) => {
        setPosition((old) =>
          old?.top === next?.top &&
          old?.left === next?.left &&
          old?.width === next?.width &&
          old?.height === next?.height
            ? old
            : next,
        );
        if (lastAffixed.current !== !!next) {
          lastAffixed.current = !!next;
          callback.current?.(!!next);
        }
      };
      const update = () => {
        frame = null;
        if (!active) return;
        if (!scrollTarget) {
          publish(null);
          return;
        }
        const box = placeholder.getBoundingClientRect();
        const height = inner.getBoundingClientRect().height;
        const element =
          scrollTarget === win ? null : (scrollTarget as HTMLElement);
        const bounds = element?.getBoundingClientRect();
        const top = bounds ? bounds.top + element!.clientTop : 0;
        const bottom = bounds ? top + element!.clientHeight : win.innerHeight;
        const topMode = offsetTop !== undefined || offsetBottom === undefined;
        const rawOffset = topMode ? (offsetTop ?? 0) : (offsetBottom ?? 0);
        const offset = Number.isFinite(rawOffset) ? rawOffset : 0;
        const anchor = topMode ? top + offset : bottom - offset - height;
        const shouldFix =
          box.width > 0 &&
          height > 0 &&
          bottom > 0 &&
          top < win.innerHeight &&
          (topMode ? box.top < anchor : box.top + height > bottom - offset);
        publish(
          shouldFix
            ? { top: anchor, left: box.left, width: box.width, height }
            : null,
        );
      };
      const schedule = () => {
        if (frame === null) frame = win.requestAnimationFrame(update);
      };
      update();
      // Capture ancestor scroll too: the target itself may move within the document.
      win.addEventListener("scroll", schedule, true);
      win.addEventListener("resize", schedule);
      scrollTarget?.addEventListener("scroll", schedule);
      const observer =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(schedule)
          : null;
      observer?.observe(placeholder);
      observer?.observe(inner);
      if (scrollTarget && scrollTarget !== win)
        observer?.observe(scrollTarget as HTMLElement);
      return () => {
        active = false;
        if (frame !== null) win.cancelAnimationFrame(frame);
        win.removeEventListener("scroll", schedule, true);
        win.removeEventListener("resize", schedule);
        scrollTarget?.removeEventListener("scroll", schedule);
        observer?.disconnect();
      };
    });
    return (
      <div
        {...props}
        ref={(node) => {
          root.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        className={cn("mt-affix", className)}
        style={{ ...style, ...(position ? { height: position.height } : {}) }}
      >
        <div
          ref={content}
          className="mt-affix-content"
          data-affixed={position ? "" : undefined}
          style={
            position
              ? {
                  position: "fixed",
                  top: position.top,
                  left: position.left,
                  width: position.width,
                }
              : undefined
          }
        >
          {children}
        </div>
      </div>
    );
  },
);
