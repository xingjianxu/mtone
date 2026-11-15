import * as React from "react";
import { cn } from "./basic";
import { Sidebar, type SidebarProps } from "./navigation";

export type LayoutProps = React.HTMLAttributes<HTMLDivElement> & {
  hasSider?: boolean;
  fullHeight?: boolean;
};
export type LayoutSiderProps = Omit<SidebarProps, "header"> & {
  logo?: React.ReactNode;
  collapsedLogo?: React.ReactNode;
  width?: number;
  collapsedWidth?: number;
  breakpoint?: number;
  onBreakpoint?: (broken: boolean) => void;
};
function LayoutSider({
  logo,
  collapsedLogo,
  width = 240,
  collapsedWidth = 52,
  breakpoint,
  onBreakpoint,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  collapsible = false,
  className,
  style,
  ...props
}: LayoutSiderProps) {
  const [internal, setInternal] = React.useState(defaultCollapsed);
  const previousBreakpoint = React.useRef<number | undefined>(undefined);
  const callbacks = React.useRef({
    onBreakpoint,
    onCollapsedChange,
    collapsed,
  });
  callbacks.current = { onBreakpoint, onCollapsedChange, collapsed };
  const update = (next: boolean) => {
    if (collapsed === undefined) setInternal(next);
    onCollapsedChange?.(next);
  };
  React.useEffect(() => {
    if (!collapsible || !breakpoint || typeof window.matchMedia !== "function")
      return;
    const media = window.matchMedia(`(max-width: ${breakpoint - 0.02}px)`);
    const notify = (matches: boolean, initial = false) => {
      callbacks.current.onBreakpoint?.(matches);
      // A wide initial viewport must not erase defaultCollapsed.
      if (!initial || matches) {
        if (callbacks.current.collapsed === undefined) setInternal(matches);
        callbacks.current.onCollapsedChange?.(matches);
      }
    };
    const initial =
      previousBreakpoint.current === undefined ||
      previousBreakpoint.current === breakpoint;
    previousBreakpoint.current = breakpoint;
    notify(media.matches, initial);
    const listener = (event: MediaQueryListEvent) => notify(event.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [breakpoint, collapsible]);
  const safeWidth = Number.isFinite(width) ? Math.max(40, width) : 240;
  const safeCollapsedWidth = Number.isFinite(collapsedWidth)
    ? Math.max(40, collapsedWidth)
    : 52;
  return (
    <Sidebar
      {...props}
      collapsible={collapsible}
      collapsed={collapsed ?? internal}
      onCollapsedChange={update}
      header={(small) => (small ? (collapsedLogo ?? logo) : logo)}
      className={cn("mt-layout-sider", className)}
      style={
        {
          "--mt-layout-sider-width": `${safeWidth}px`,
          "--mt-layout-sider-collapsed-width": `${safeCollapsedWidth}px`,
          ...style,
        } as React.CSSProperties
      }
    />
  );
}
export type LayoutHeaderProps = React.HTMLAttributes<HTMLElement> & {
  breadcrumb?: React.ReactNode;
  extra?: React.ReactNode;
};
function LayoutHeader({
  breadcrumb,
  extra,
  children,
  className,
  ...props
}: LayoutHeaderProps) {
  return (
    <header {...props} className={cn("mt-layout-header", className)}>
      <div className="mt-layout-header-main">
        {breadcrumb}
        {children}
      </div>
      {extra != null && <div className="mt-layout-header-extra">{extra}</div>}
    </header>
  );
}
export type LayoutContentProps = React.HTMLAttributes<HTMLElement> & {
  as?: "main" | "section" | "div";
};
function LayoutContent({
  as: Element = "main",
  className,
  ...props
}: LayoutContentProps) {
  return <Element {...props} className={cn("mt-layout-content", className)} />;
}
function LayoutFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return <footer {...props} className={cn("mt-layout-footer", className)} />;
}
function containsSider(children: React.ReactNode): boolean {
  return React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === LayoutSider ||
        (child.type === React.Fragment &&
          containsSider(
            (child.props as { children?: React.ReactNode }).children,
          ))),
  );
}
function LayoutRoot({
  hasSider,
  fullHeight = false,
  className,
  children,
  ...props
}: LayoutProps) {
  return (
    <div
      {...props}
      className={cn(
        "mt-layout",
        (hasSider ?? containsSider(children)) && "mt-layout-has-sider",
        fullHeight && "mt-layout-full-height",
        className,
      )}
    >
      {children}
    </div>
  );
}
/** Compose nested layouts with the familiar Layout.Sider/Header/Content/Footer API. */
export const Layout = Object.assign(LayoutRoot, {
  Sider: LayoutSider,
  Header: LayoutHeader,
  Content: LayoutContent,
  Footer: LayoutFooter,
});
