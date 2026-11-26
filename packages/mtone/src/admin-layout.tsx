import * as React from "react";
import { readBoolean, useLayoutPreference } from "./layout-persistence";
import { cn } from "./basic";
import { Sidebar, type SidebarProps } from "./navigation";
import { SidebarResize, type SidebarResizeOptions } from "./sidebar-resize";

export type { SidebarResizeOptions } from "./sidebar-resize";

export type AdminLayoutProps = React.HTMLAttributes<HTMLDivElement> & {
  hasSider?: boolean;
  fullHeight?: boolean;
  sidebarResize?: boolean | SidebarResizeOptions;
  /** Optional banner above the sidebar and main area, outside their scroll regions. */
  notice?: React.ReactNode;
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
  storageKey,
  onCollapsedChange,
  collapsible = false,
  className,
  style,
  ...props
}: AdminLayoutSiderProps) {
  const [internal, setInternal] = useLayoutPreference(
    "admin-sider-collapse", collapsed === undefined ? storageKey : undefined, defaultCollapsed, readBoolean,
  );
  const [responsiveCollapsed, setResponsiveCollapsed] = React.useState<boolean>();
  const setInternalRef = React.useRef(setInternal);
  setInternalRef.current = setInternal;
  const previousBreakpoint = React.useRef<number | undefined>(undefined);
  const callbacks = React.useRef({
    onBreakpoint,
    onCollapsedChange,
    collapsed,
  });
  callbacks.current = { onBreakpoint, onCollapsedChange, collapsed };
  const update = (next: boolean) => {
    if (collapsed === undefined) {
      setResponsiveCollapsed(undefined);
      setInternal(next);
    }
    onCollapsedChange?.(next);
  };
  React.useEffect(() => {
    if (!collapsible || !breakpoint || typeof window.matchMedia !== "function") {
      setResponsiveCollapsed(undefined);
      return;
    }
    const media = window.matchMedia(`(max-width: ${breakpoint - 0.02}px)`);
    const notify = (matches: boolean, initial = false) => {
      callbacks.current.onBreakpoint?.(matches);
      // A wide initial viewport must not erase defaultCollapsed.
      if (!initial || matches) {
        if (callbacks.current.collapsed === undefined) {
          if (storageKey) setResponsiveCollapsed(matches || undefined);
          else setInternalRef.current(matches, false);
        }
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
  }, [breakpoint, collapsible, storageKey]);
  const safeWidth = Number.isFinite(width) ? Math.max(40, width) : 240;
  const safeCollapsedWidth = Number.isFinite(collapsedWidth)
    ? Math.max(40, collapsedWidth)
    : 52;
  return (
    <Sidebar
      {...props}
      collapsible={collapsible}
      storageKey={storageKey}
      collapsed={collapsed ?? responsiveCollapsed ?? internal}
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
function collectLayoutChildren(children: React.ReactNode, path = ""): React.ReactNode[] {
  return React.Children.toArray(children).flatMap((child, i) => {
    if (!React.isValidElement<{ children?: React.ReactNode }>(child)) return [child];
    const key = `${path}/${child.key ?? i}`;
    return child.type === React.Fragment
      ? collectLayoutChildren(child.props.children, key)
      : [React.cloneElement(child, { key })];
  });
}
function AdminLayoutRoot({
  hasSider,
  fullHeight = false,
  sidebarResize,
  className,
  children,
  notice,
  ...props
}: AdminLayoutProps) {
  const showNotice = notice != null && typeof notice !== "boolean" && notice !== "";
  const detectedSider = hasSider ?? containsSider(children);
  const parts = sidebarResize && detectedSider ? collectLayoutChildren(children) : [];
  const siders = parts.filter((child): child is React.ReactElement<AdminLayoutSiderProps> =>
    React.isValidElement(child) && child.type === AdminLayoutSider);
  const sider = siders.length === 1 ? siders[0] : undefined;
  const resize = sidebarResize && sider;
  return (
    <div
      {...props}
      className={cn(
        "mt-layout",
        detectedSider && "mt-layout-has-sider",
        resize && "mt-layout-sidebar-resizable",
        fullHeight && "mt-layout-full-height",
        showNotice && "mt-layout-with-notice",
        className,
      )}
    >
      {showNotice && <div className="mt-layout-notice">{notice}</div>}
      {resize ? (
        <SidebarResize layout="admin" options={sidebarResize}
          sidebar={sider} collapsibleSidebar={sider}
          position={parts.indexOf(sider) === 0 ? "before" : "after"}
          defaultWidth={Number.isFinite(sider.props.width) ? Math.max(40, sider.props.width!) : undefined}
          collapsedWidth={Number.isFinite(sider.props.collapsedWidth) ? Math.max(40, sider.props.collapsedWidth!) : undefined}>
          {parts.filter((child) => child !== sider)}
        </SidebarResize>
      ) : children}
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
