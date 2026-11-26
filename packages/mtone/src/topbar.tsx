import * as React from "react";
import { cn } from "./basic";

export interface TopbarProps extends React.HTMLAttributes<HTMLElement> {
  /** Use a neutral wrapper when composing inside an existing application shell. */
  as?: "header" | "div";
  ref?: React.Ref<HTMLElement>;
  /** Leading navigation, typically Breadcrumb. */
  breadcrumb?: React.ReactNode;
  /** Compact contextual status, displayed next to the breadcrumb. */
  status?: React.ReactNode;
  /** Optional controls centered across the full bar, independently of side widths. */
  center?: React.ReactNode;
  /** Trailing page or application actions. */
  extra?: React.ReactNode;
}

/** Single-row header. Routing, status updates and actions belong to the host. */
export function Topbar({
  as = "header",
  breadcrumb,
  status,
  center,
  extra,
  children,
  className,
  ...props
}: TopbarProps) {
  const hasCenter =
    center != null && typeof center !== "boolean" && center !== "";
  return React.createElement(
    as,
    {
      ...props,
      className: cn(
        "mt-topbar",
        "mt-layout-header",
        hasCenter && "mt-topbar-with-center",
        className,
      ),
    },
    <div className="mt-layout-header-main">
      {breadcrumb}
      {status != null && <span className="mt-topbar-status">{status}</span>}
      {children}
    </div>,
    hasCenter && <div className="mt-topbar-center">{center}</div>,
    extra != null && <div className="mt-layout-header-extra">{extra}</div>,
  );
}
