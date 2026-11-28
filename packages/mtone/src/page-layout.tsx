import * as React from "react";
import { Sidebar, type SidebarProps } from "./navigation";
import { SidebarResize, type SidebarResizeOptions } from "./sidebar-resize";

import { layoutWidths, type LayoutWidthPreset } from "./layout-widths";

export interface PageLayoutProps
  extends Omit<React.ComponentPropsWithRef<"div">, "title"> {
  title: React.ReactNode;
  /** Frame the page and stretch the sidebar with its column. Defaults to true. */
  bordered?: boolean;
  /** Optional page-local bar above the title; follows headerSpan. */
  topbar?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  description?: React.ReactNode;
  extra?: React.ReactNode;
  tabs?: React.ReactNode;
  /** Optional page-local sidebar. Pass a Sidebar or any other content. */
  sidebar?: React.ReactNode;
  /** Physical side of the main column when there is room. */
  sidebarPosition?: "left" | "right";
  sidebarResize?: boolean | SidebarResizeOptions;
  /** Span both columns with the header and tabs ("full"), only the header
   * ("header"), or keep both in the main column ("main"). */
  headerSpan?: "full" | "header" | "main";
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Center the entire layout in its parent, with a preset or maximum pixel width. */
  maxWidth?: LayoutWidthPreset | number;
}

function hasContent(node: React.ReactNode): boolean {
  if (node == null || typeof node === "boolean" || node === "") return false;
  if (Array.isArray(node)) return node.some(hasContent);
  if (React.isValidElement<{ children?: React.ReactNode }>(node) && node.type === React.Fragment) {
    return hasContent(node.props.children);
  }
  return true;
}

export function PageLayout({
  title, bordered = true, topbar, subtitle, icon, actions, description, extra, tabs, children,
  sidebar, sidebarPosition = "left", sidebarResize, headerSpan = "full",
  headingLevel = 1, maxWidth, className, style, ...rootProps
}: PageLayoutProps) {
  const Heading = `h${headingLevel}` as const;
  const showDescription = hasContent(description);
  const showExtra = hasContent(extra);
  const showSidebar = hasContent(sidebar);
  const width = typeof maxWidth === "number"
    ? maxWidth
    : maxWidth && layoutWidths[maxWidth];
  const constrained = width !== undefined && Number.isFinite(width) && width > 0;
  const rootClassName = [
    "mt-page-layout",
    bordered && "mt-page-layout-bordered",
    constrained && "mt-page-layout-constrained",
    showSidebar && "mt-page-layout-with-sidebar",
    className,
  ].filter(Boolean).join(" ");
  const rootStyle = constrained
    ? { "--mt-page-layout-max-width": `${width}px`, ...style } as React.CSSProperties
    : style;
  const slot = (name: string) => {
    const className = `mt-page-layout-${name}`;
    return bordered ? `${className} ${className}-bordered` : className;
  };
  const header = (
    <div className={slot("header")}>
      {hasContent(topbar) && <div className={slot("topbar")}>{topbar}</div>}
      <div className={slot("row")}>
        {hasContent(icon) && <div className="mt-page-layout-icon">{icon}</div>}
        <div className="mt-page-layout-heading">
          <Heading className="mt-page-layout-title">{title}</Heading>
          {hasContent(subtitle) && <div className="mt-page-layout-subtitle">{subtitle}</div>}
        </div>
        {hasContent(actions) && <div className="mt-page-layout-actions">{actions}</div>}
      </div>
      {(showDescription || showExtra) && (
        <div className={slot("details")}>
          {showDescription && <div className="mt-page-layout-description">{description}</div>}
          {showExtra && <div className="mt-page-layout-extra">{extra}</div>}
        </div>
      )}
    </div>
  );
  const tabsSlot = hasContent(tabs) && <div className={slot("tabs")}>{tabs}</div>;
  const body = hasContent(children) && <div className={slot("body")}>{children}</div>;
  const sidebarSlot = (content: React.ReactNode) => <div className={slot("sidebar")}>{content}</div>;
  const main = (
    <div className={slot("main")}>
      {headerSpan === "main" && header}
      {headerSpan !== "full" && tabsSlot}
      {body}
    </div>
  );

  return (
    <div {...rootProps} className={rootClassName} style={rootStyle}>
      {(!showSidebar || headerSpan !== "main") && header}
      {(!showSidebar || headerSpan === "full") && tabsSlot}
      {showSidebar ? (
        <div className={slot("columns")}>
          {sidebarResize ? (
            <SidebarResize layout="page" options={sidebarResize} sidebar={sidebar}
              separatorVariant={bordered ? "line" : undefined}
              collapsibleSidebar={React.isValidElement<SidebarProps>(sidebar) && sidebar.type === Sidebar ? sidebar : undefined}
              wrapSidebar={sidebarSlot} position={sidebarPosition === "left" ? "before" : "after"}>
              {main}
            </SidebarResize>
          ) : <>
            {sidebarPosition === "left" && sidebarSlot(sidebar)}
            {main}
            {sidebarPosition === "right" && sidebarSlot(sidebar)}
          </>}
        </div>
      ) : body}
    </div>
  );
}
