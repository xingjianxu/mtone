import React from "react";
import { cn } from "./basic";

const LOOP_GAP = 16;
const PIXELS_PER_SECOND = 30;
const HEAD_PAUSE = 0.45;
const TAIL_PAUSE = 0.65;

/** Copy rendered markup without a second React mount, duplicate IDs, or controls. */
function syncVisualCopy(original: HTMLElement, copy: HTMLElement) {
  const snapshot = original.cloneNode(true) as HTMLElement;
  for (const element of snapshot.querySelectorAll(
    "script,style,link,iframe,object,embed",
  )) {
    element.remove();
  }
  for (const element of snapshot.querySelectorAll(
    "a[href],area[href],button,input,select,textarea,summary,details,audio[controls],video[controls],[tabindex],[contenteditable],[role=button],[role=link]",
  )) {
    element.replaceWith(
      original.ownerDocument.createTextNode(element.textContent ?? ""),
    );
  }
  for (const element of snapshot.querySelectorAll("*")) {
    for (const attribute of element.getAttributeNames()) {
      if (
        attribute === "id" ||
        attribute === "autofocus" ||
        attribute.startsWith("on")
      )
        element.removeAttribute(attribute);
    }
  }
  copy.replaceChildren(...snapshot.childNodes);
}

export interface HoverMarqueeProps extends React.ComponentPropsWithRef<"span"> {
  /** Inline content on a single line. */
  children: React.ReactNode;
  /** Use "single" for interactive JSX: pan out and back without a visual copy. */
  mode?: "loop" | "single";
}

/** Reveal clipped text without changing the space allotted by the surrounding layout. */
export function HoverMarquee({
  children,
  mode = "loop",
  className,
  tabIndex,
  ref,
  onBlur,
  onPointerLeave,
  ...props
}: HoverMarqueeProps) {
  const viewport = React.useRef<HTMLSpanElement>(null);
  const text = React.useRef<HTMLSpanElement>(null);
  const repeat = React.useRef<HTMLSpanElement>(null);
  React.useImperativeHandle(ref, () => viewport.current!, []);
  const [{ distance, advance }, setTravel] = React.useState({
    distance: 0,
    advance: 0,
  });
  const overflowing = distance > 0;
  const single = mode === "single";

  const measure = React.useCallback(() => {
    const frame = viewport.current;
    const track = text.current;
    if (!frame || !track) return;
    // Measure original text only: the decorative next copy never contributes.
    const distance = Math.max(0, track.scrollWidth - frame.clientWidth);
    const advance = distance > 0 ? track.scrollWidth + LOOP_GAP : 0;
    setTravel((previous) =>
      previous.distance === distance && previous.advance === advance
        ? previous
        : { distance, advance },
    );
  }, []);

  const updateCopy = React.useCallback(() => {
    if (text.current && repeat.current)
      syncVisualCopy(text.current, repeat.current);
  }, []);

  React.useLayoutEffect(() => {
    measure();
    updateCopy();
  }, [children, measure, overflowing, updateCopy]);
  React.useEffect(() => {
    const frame = viewport.current;
    const track = text.current;
    if (!frame || !track) return;
    const doc = frame.ownerDocument;
    const view = doc.defaultView;
    const resize = view?.ResizeObserver
      ? new view.ResizeObserver(measure)
      : null;
    const mutation = view?.MutationObserver
      ? new view.MutationObserver(() => {
          measure();
          updateCopy();
        })
      : null;
    resize?.observe(frame);
    resize?.observe(track);
    mutation?.observe(track, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
    });
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
  }, [measure, updateCopy]);

  // Loop mode continues to the copy; single mode returns the same track.
  const duration =
    HEAD_PAUSE + TAIL_PAUSE + (single ? 2 * distance : advance) / PIXELS_PER_SECOND;
  const tailStart = HEAD_PAUSE + distance / PIXELS_PER_SECOND;
  const percent = (seconds: number) => `${(100 * seconds) / duration}%`;

  return (
    <span
      {...props}
      ref={viewport}
      className={cn("mt-hover-marquee", className)}
      tabIndex={tabIndex ?? (overflowing ? 0 : undefined)}
      data-overflow={overflowing ? "" : undefined}
      data-motion={single ? "single" : undefined}
      onBlur={(event) => {
        const frame = event.currentTarget;
        if (
          (single || !frame.matches(":hover")) &&
          !frame.contains(event.relatedTarget)
        ) frame.scrollLeft = 0;
        onBlur?.(event);
      }}
      onPointerLeave={(event) => {
        const frame = event.currentTarget;
        if (!frame.matches(":focus-within")) frame.scrollLeft = 0;
        onPointerLeave?.(event);
      }}
    >
      <span
        className="mt-hover-marquee-text"
        style={
          overflowing
            ? ({
                "--mt-marquee-duration": `${duration}s`,
                "--mt-marquee-gap": `${LOOP_GAP}px`,
                "--mt-marquee-head-end": percent(HEAD_PAUSE),
                "--mt-marquee-tail-start": percent(tailStart),
                "--mt-marquee-tail-end": percent(tailStart + TAIL_PAUSE),
                "--mt-marquee-tail-progress": distance / advance,
                "--mt-marquee-distance": `${distance}px`,
              } as React.CSSProperties)
            : undefined
        }
      >
        <span ref={text} className="mt-hover-marquee-original">
          {children}
        </span>
        {overflowing && !single && (
          <span
            ref={repeat}
            className="mt-hover-marquee-copy"
            aria-hidden="true"
            inert
          />
        )}
      </span>
    </span>
  );
}
