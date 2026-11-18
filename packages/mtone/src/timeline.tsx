import * as React from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "./basic";

export type TimelinePlacement = "start" | "end";
export type TimelineSemantic =
  "root" | "item" | "tail" | "icon" | "title" | "content";
export interface TimelineItem extends Omit<
  React.HTMLAttributes<HTMLLIElement>,
  "title" | "children" | "content" | "color"
> {
  key?: React.Key;
  title?: React.ReactNode;
  content?: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
  loading?: boolean;
  placement?: TimelinePlacement;
  /** Compatibility aliases; prefer title/content/icon/placement. */
  label?: React.ReactNode;
  children?: React.ReactNode;
  dot?: React.ReactNode;
  position?: TimelinePlacement | "left" | "right";
}
export interface TimelineProps extends Omit<
  React.HTMLAttributes<HTMLOListElement>,
  "children"
> {
  items?: readonly TimelineItem[];
  mode?: TimelinePlacement | "alternate" | "left" | "right";
  orientation?: "vertical" | "horizontal";
  reverse?: boolean;
  variant?: "outlined" | "filled";
  /** Title column width. A number is pixels, not a grid-column span. */
  titleSpan?: number | string;
  /** Compatibility ghost item. Prefer an explicit item with loading=true. */
  pending?: React.ReactNode;
  pendingDot?: React.ReactNode;
  classNames?: Partial<Record<TimelineSemantic, string>>;
  styles?: Partial<Record<TimelineSemantic, React.CSSProperties>>;
}
const colors: Record<string, string> = {
  blue: "var(--mt-primary, #2383e2)",
  red: "var(--mt-danger, #d44c47)",
  green: "var(--mt-success, #448361)",
  gray: "var(--mt-muted, #787774)",
};
export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  function Timeline(
    {
      items = [],
      mode = "start",
      orientation = "vertical",
      reverse = false,
      variant = "outlined",
      titleSpan,
      pending,
      pendingDot,
      classNames = {},
      styles = {},
      className,
      style,
      ...props
    },
    ref,
  ) {
    const normalizedMode =
      mode === "left" ? "start" : mode === "right" ? "end" : mode;
    const hasPending =
      pending !== undefined && pending !== null && pending !== false;
    const rows = items.map((item, index) => ({
      item,
      key: `item-${item.key ?? index}`,
    }));
    if (hasPending)
      rows.push({
        item: {
          content: pending === true ? undefined : pending,
          loading: true,
          icon: pendingDot,
        },
        key: "mt-pending",
      });
    if (reverse) rows.reverse();
    const balanced =
      normalizedMode !== "start" ||
      rows.some(
        ({ item }) =>
          item.placement === "end" ||
          item.position === "end" ||
          item.position === "right",
      );
    const titled = rows.some(
      ({ item }) =>
        (item.title !== undefined ? item.title : item.label) != null,
    );
    return (
      <ol
        role="list"
        {...props}
        ref={ref}
        className={cn("mt-timeline", classNames.root, className)}
        data-mode={normalizedMode}
        data-balanced={balanced || undefined}
        data-orientation={orientation}
        data-variant={variant}
        data-titled={titled || undefined}
        style={
          {
            ...styles.root,
            ...(titleSpan !== undefined
              ? {
                  "--mt-timeline-title-span":
                    typeof titleSpan === "number"
                      ? `${Math.max(0, titleSpan)}px`
                      : titleSpan,
                }
              : {}),
            ...style,
          } as React.CSSProperties
        }
      >
        {rows.map(({ item, key }, index) => {
          const {
            title,
            label,
            content,
            children,
            icon,
            dot,
            color,
            loading,
            placement,
            position,
            className: itemClass,
            style: itemStyle,
            key: _key,
            ...itemProps
          } = item;
          const side =
            placement ??
            (position === "left"
              ? "start"
              : position === "right"
                ? "end"
                : position) ??
            (normalizedMode === "alternate"
              ? index % 2
                ? "end"
                : "start"
              : normalizedMode);
          const marker = icon !== undefined ? icon : dot;
          return (
            <li
              {...itemProps}
              key={key}
              className={cn("mt-timeline-item", classNames.item, itemClass)}
              data-placement={side}
              aria-busy={loading || undefined}
              style={
                {
                  ...styles.item,
                  ...(color
                    ? { "--mt-timeline-color": colors[color] ?? color }
                    : {}),
                  ...itemStyle,
                } as React.CSSProperties
              }
            >
              <span
                aria-hidden="true"
                className={cn("mt-timeline-tail", classNames.tail)}
                style={styles.tail}
              />
              <span
                aria-hidden="true"
                className={cn("mt-timeline-icon", classNames.icon)}
                style={styles.icon}
              >
                {marker !== undefined ? (
                  marker
                ) : loading ? (
                  <LoaderCircle className="mt-timeline-spinner" size={14} />
                ) : (
                  <span className="mt-timeline-dot" />
                )}
              </span>
              {(title !== undefined ? title : label) != null && (
                <div
                  className={cn("mt-timeline-title", classNames.title)}
                  style={styles.title}
                >
                  {title !== undefined ? title : label}
                </div>
              )}
              <div
                className={cn("mt-timeline-content", classNames.content)}
                style={styles.content}
              >
                {content !== undefined ? content : children}
              </div>
            </li>
          );
        })}
      </ol>
    );
  },
);
