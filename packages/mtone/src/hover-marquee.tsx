import React from "react";
import { cn } from "./basic";

export interface HoverMarqueeProps extends React.ComponentPropsWithRef<"span"> {
  /** Short text or non-interactive inline content on a single line. */
  children: React.ReactNode;
}

/** Reveal clipped text without changing the space allotted by the surrounding layout. */
export function HoverMarquee({
  children,
  className,
  tabIndex,
  ref,
  onBlur,
  onPointerLeave,
  ...props
}: HoverMarqueeProps) {
  const viewport = React.useRef<HTMLSpanElement>(null);
  const text = React.useRef<HTMLSpanElement>(null);
  React.useImperativeHandle(ref, () => viewport.current!, []);
  const [distance, setDistance] = React.useState(0);

  const measure = React.useCallback(() => {
    const frame = viewport.current;
    const track = text.current;
    if (!frame || !track) return;
    // The track is full-width when idle and max-content during the reveal.
    // Its scrollWidth includes clipping without depending on its transform.
    const next = Math.max(0, track.scrollWidth - frame.clientWidth);
    setDistance(next);
  }, []);

  React.useLayoutEffect(measure, [children, measure]);
  React.useEffect(() => {
    const frame = viewport.current;
    const track = text.current;
    if (!frame || !track) return;
    const doc = frame.ownerDocument;
    const view = doc.defaultView;
    const resize = view?.ResizeObserver ? new view.ResizeObserver(measure) : null;
    const mutation = view?.MutationObserver ? new view.MutationObserver(measure) : null;
    resize?.observe(frame);
    resize?.observe(track);
    mutation?.observe(track, { childList: true, subtree: true, characterData: true });
    track.addEventListener("load", measure, true);
    doc.fonts?.addEventListener("loadingdone", measure);
    view?.addEventListener("resize", measure);
    return () => {
      resize?.disconnect();
      mutation?.disconnect();
      track.removeEventListener("load", measure, true);
      doc.fonts?.removeEventListener("loadingdone", measure);
      view?.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <span
      {...props}
      ref={viewport}
      className={cn("mt-hover-marquee", className)}
      tabIndex={tabIndex ?? (distance > 0 ? 0 : undefined)}
      data-overflow={distance > 0 ? "" : undefined}
      onBlur={(event) => {
        const frame = event.currentTarget;
        if (!frame.matches(":hover") && !frame.contains(event.relatedTarget)) frame.scrollLeft = 0;
        onBlur?.(event);
      }}
      onPointerLeave={(event) => {
        const frame = event.currentTarget;
        if (!frame.matches(":focus-within")) frame.scrollLeft = 0;
        onPointerLeave?.(event);
      }}
    >
      <span
        ref={text}
        className="mt-hover-marquee-text"
        style={{
          "--mt-marquee-travel": `${distance}px`,
          "--mt-marquee-duration": `${Math.max(2.8, distance / 30 + 1.3)}s`,
        } as React.CSSProperties}
      >
        {children}
      </span>
    </span>
  );
}
