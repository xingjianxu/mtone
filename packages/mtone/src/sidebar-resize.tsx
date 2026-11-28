import * as React from "react";
import { SidebarResizeCollapseContext, SplitterStorageScopeContext } from "./layout-persistence";
import type { SidebarProps } from "./navigation";
import { Splitter } from "./splitter";

export interface SidebarResizeOptions {
  /** Initial width in pixels (read when the split mounts). */
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  /** Show the Splitter separator’s two edge borders. */
  separatorBordered?: boolean;
  /** Remember the dragged sidebar width in this browser. */
  storageKey?: string;
}
type CollapseProps = Pick<SidebarProps, "collapsible" | "collapsed" | "defaultCollapsed" | "onCollapsedChange">;

interface SidebarResizeProps {
  options: boolean | SidebarResizeOptions;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  collapsibleSidebar?: React.ReactElement<CollapseProps>;
  wrapSidebar?: (node: React.ReactNode) => React.ReactNode;
  defaultWidth?: number;
  collapsedWidth?: number;
  position?: "before" | "after";
  layout: "admin" | "page" | "app";
  separatorVariant?: "line";
}
const dimension = (value: number | undefined, fallback: number) =>
  value !== undefined && Number.isFinite(value) && value >= 0 ? value : fallback;

export function SidebarResize({
  options, sidebar, children, collapsibleSidebar, wrapSidebar,
  defaultWidth = 240, collapsedWidth = 52, position = "before", layout, separatorVariant,
}: SidebarResizeProps) {
  const config = typeof options === "object" ? options : {};
  const max = Math.max(1, dimension(config.maxWidth, 480));
  const min = Math.min(max, Math.max(1, dimension(config.minWidth, 160)));
  const startingWidth = Math.max(min, Math.min(max, dimension(config.defaultWidth, defaultWidth)));
  const [internalCollapsed, setCollapsed] = React.useState<boolean | undefined>();
  const collapse = collapsibleSidebar?.props;
  const collapsed = !!collapse?.collapsible && (collapse.collapsed ?? internalCollapsed ?? collapse.defaultCollapsed ?? false);
  const side = collapsibleSidebar
    ? <SidebarResizeCollapseContext.Provider value={setCollapsed}>{collapsibleSidebar}</SidebarResizeCollapseContext.Provider>
    : sidebar;
  const host = React.useRef<HTMLDivElement>(null);
  const [compact, setCompact] = React.useState(false);

  React.useLayoutEffect(() => {
    const element = host.current;
    if (!element) return;
    const measure = (width: number) => {
      if (width > 0) setCompact(width < 640);
    };
    measure(element.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => measure(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const sidebarPanel = (
    <Splitter.Panel key="sidebar" data-sidebar-resize-pane="sidebar"
      defaultSize={startingWidth} min={min} max={max}
      groupResizeBehavior="preserve-pixel-size">
      {wrapSidebar ? wrapSidebar(side) : side}
    </Splitter.Panel>
  );
  const mainPanel = (
    <Splitter.Panel key="main" data-sidebar-resize-pane="main">
      {children}
    </Splitter.Panel>
  );

  return (
    <div ref={host} className={`mt-sidebar-resize mt-sidebar-resize-${layout}`}
      data-compact={compact || undefined} data-sidebar-collapsed={collapsed || undefined}
      style={{
        "--_mt-sidebar-resize-initial": `${startingWidth}px`,
        "--_mt-sidebar-resize-collapsed": `${collapsedWidth}px`,
      } as React.CSSProperties}>
      <SplitterStorageScopeContext.Provider value={`sidebar-resize:${layout}`}>
      <Splitter storageKey={config.storageKey} separatorBordered={config.separatorBordered} separatorVariant={separatorVariant} disabled={compact || collapsed} style={{ overflow: "visible", height: layout === "page" ? "auto" : "100%" }}>
        {position === "before" ? [sidebarPanel, mainPanel] : [mainPanel, sidebarPanel]}
      </Splitter>
      </SplitterStorageScopeContext.Provider>
    </div>
  );
}
