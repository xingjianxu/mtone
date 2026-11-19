import * as React from "react";
import { cn } from "./basic";
import { Sidebar, type SidebarProps } from "./navigation";

export type AdminLayoutProps = React.HTMLAttributes<HTMLDivElement> & {
  hasSider?: boolean;
  fullHeight?: boolean;
};
export type AdminLayoutSiderProps = Omit<
  SidebarProps,
  "header" | "footer" | "collapsePlacement"
> & {
  logo?: React.ReactNode;
  version?: React.ReactNode;
  collapsedLogo?: React.ReactNode;
  width?: number;
  collapsedWidth?: number;
  breakpoint?: number;
  onBreakpoint?: (broken: boolean) => void;
};
function AdminLayoutSider({
  logo,
  version,
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
}: AdminLayoutSiderProps) {
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
      collapsePlacement="footer"
      footer={version != null ? (small) => (small ? null : version) : undefined}
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
export type AdminLayoutHeaderProps = React.HTMLAttributes<HTMLElement> & {
  breadcrumb?: React.ReactNode;
  extra?: React.ReactNode;
};
function AdminLayoutHeader({
  breadcrumb,
  extra,
  children,
  className,
  ...props
}: AdminLayoutHeaderProps) {
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
export type AdminLayoutContentProps = React.HTMLAttributes<HTMLElement> & {
  as?: "main" | "section" | "div";
};
function AdminLayoutContent({
  as: Element = "main",
  className,
  ...props
}: AdminLayoutContentProps) {
  return <Element {...props} className={cn("mt-layout-content", className)} />;
}
function AdminLayoutFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return <footer {...props} className={cn("mt-layout-footer", className)} />;
}
function containsSider(children: React.ReactNode): boolean {
  return React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === AdminLayoutSider ||
        (child.type === React.Fragment &&
          containsSider(
            (child.props as { children?: React.ReactNode }).children,
          ))),
  );
}
function AdminLayoutRoot({
  hasSider,
  fullHeight = false,
  className,
  children,
  ...props
}: AdminLayoutProps) {
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
/** Compose nested layouts with the familiar AdminLayout.Sider/Header/Content/Footer API. */
export const AdminLayout = Object.assign(AdminLayoutRoot, {
  Sider: AdminLayoutSider,
  Header: AdminLayoutHeader,
  Content: AdminLayoutContent,
  Footer: AdminLayoutFooter,
});
