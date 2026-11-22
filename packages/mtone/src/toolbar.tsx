import * as React from "react";
import { cn } from "./basic";

export interface ToolbarProps extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  /** Search or another control that takes the full first row in a narrow toolbar. */
  search?: React.ReactNode;
  /** Controls aligned at the logical start, after search when present. */
  start?: React.ReactNode;
  /** Controls aligned at the logical end. */
  end?: React.ReactNode;
  /** Surface color resolved from the active mtone theme. */
  background?: "white" | "gray";
}

const hasSlot = (node: React.ReactNode) =>
  node != null && typeof node !== "boolean" && node !== "";

/** Standalone presentation for search, filters and actions. */
export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  function Toolbar({
    search, start, end, background = "white", className, role, ...props
  }, ref) {
    const named = props["aria-label"]?.trim() || props["aria-labelledby"]?.trim();
    return (
      <div
        {...props}
        ref={ref}
        className={cn("mt-toolbar", className)}
        data-background={background}
        role={role ?? (named ? "group" : undefined)}
      >
        <div className="mt-toolbar-layout">
          {hasSlot(search) && <div className="mt-toolbar-search">{search}</div>}
          {hasSlot(start) && <div className="mt-toolbar-start">{start}</div>}
          {hasSlot(end) && <div className="mt-toolbar-end">{end}</div>}
        </div>
      </div>
    );
  },
);
