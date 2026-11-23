import * as React from "react";
import { cn } from "./basic";

export interface TableProps extends React.ComponentPropsWithoutRef<"table"> {
  /** Adds an outer border and vertical cell dividers. */
  bordered?: boolean;
  /** Adds a subtle alternating background to body rows. */
  striped?: boolean;
  /** Highlights body rows under the pointer. */
  highlightOnHover?: boolean;
}

/** A styled native table. Supply the caption, sections, rows and cells as children. */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table({
  bordered, striped, highlightOnHover, className, children, ...props
}, ref) {
  return (
    <table
      {...props}
      ref={ref}
      className={cn("mt-native-table", className)}
      data-bordered={bordered || undefined}
      data-striped={striped || undefined}
      data-highlight-on-hover={highlightOnHover || undefined}
    >
      {children}
    </table>
  );
});
