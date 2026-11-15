import * as React from "react";
import {
  ChevronRight,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Circle,
} from "lucide-react";
import { cn, IconButton, useMtone } from "./basic";
import { Tooltip } from "./interactive";
const SidebarContext = React.createContext(false);
export type SidebarProps = React.HTMLAttributes<HTMLElement> & {
  header?: React.ReactNode | ((collapsed: boolean) => React.ReactNode);
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  collapseLabel?: string;
  expandLabel?: string;
};
export function Sidebar({
  className,
  children,
  header,
  collapsible = false,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  collapseLabel = "收起侧边栏",
  expandLabel = "展开侧边栏",
  ...p
}: SidebarProps) {
  const [internal, setInternal] = React.useState(defaultCollapsed);
  const isCollapsed = collapsible && (collapsed ?? internal);
  const contentId = React.useId();
  const toggle = collapsible && (
    <IconButton
      className="mt-sidebar-toggle"
      variant="ghost"
      aria-label={isCollapsed ? expandLabel : collapseLabel}
      title={isCollapsed ? expandLabel : collapseLabel}
      aria-expanded={!isCollapsed}
      aria-controls={contentId}
      onClick={() => {
        if (collapsed === undefined) setInternal(!isCollapsed);
        onCollapsedChange?.(!isCollapsed);
      }}
    >
      {isCollapsed ? (
        <PanelLeftOpen size={16} aria-hidden="true" />
      ) : (
        <PanelLeftClose size={16} aria-hidden="true" />
      )}
    </IconButton>
  );
  return (
    <SidebarContext.Provider value={isCollapsed}>
      <aside
        {...p}
        className={cn("mt-sidebar", className)}
        data-collapsed={isCollapsed}
      >
        {header !== undefined ? (
          <div className="mt-sidebar-heading">
            <div className="mt-sidebar-brand">
              {typeof header === "function" ? header(isCollapsed) : header}
            </div>
            {toggle}
          </div>
        ) : (
          toggle
        )}
        {collapsible || header !== undefined ? (
          <div id={contentId} className="mt-sidebar-content">
            {children}
          </div>
        ) : (
          children
        )}
      </aside>
    </SidebarContext.Provider>
  );
}

export const NavItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    active?: boolean;
    icon?: React.ReactNode;
  }
>(function NavItem({ active, icon, children, className, ...p }, ref) {
  const collapsed = React.useContext(SidebarContext);
  const [tipOpen, setTipOpen] = React.useState(false);
  const label =
    p["aria-label"] ??
    (typeof children === "string" || typeof children === "number"
      ? String(children)
      : undefined);
  const button = (
    <button
      type="button"
      {...p}
      ref={ref}
      aria-current={active ? "page" : undefined}
      className={cn(
        "mt-nav-item",
        active && "mt-active",
        collapsed && "mt-nav-item-collapsed",
        className,
      )}
    >
      {icon || (collapsed ? <Circle size={16} aria-hidden="true" /> : null)}
      {collapsed ? (
        <span className="mt-sidebar-sr-only">{children}</span>
      ) : (
        children
      )}
    </button>
  );
  return label ? (
    <Tooltip
      content={label}
      side="right"
      open={collapsed && tipOpen}
      onOpenChange={(open) => setTipOpen(collapsed && open)}
    >
      {button}
    </Tooltip>
  ) : (
    button
  );
});
export function NavGroup({
  label,
  children,
}: {
  label?: React.ReactNode;
  children: React.ReactNode;
}) {
  const collapsed = React.useContext(SidebarContext);
  return (
    <div className={cn("mt-nav-group", collapsed && "mt-nav-group-collapsed")}>
      {label && (
        <div className={collapsed ? "mt-sidebar-sr-only" : "mt-nav-label"}>
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
export function Breadcrumb({
  items,
  "aria-label": label = "Breadcrumb",
}: {
  items: { label: React.ReactNode; href?: string }[];
  "aria-label"?: string;
}) {
  return (
    <nav aria-label={label}>
      <ol className="mt-breadcrumb">
        {items.map((x, i) => (
          <li key={i}>
            {i > 0 && <ChevronRight size={12} />}
            {i === items.length - 1 ? (
              <span aria-current="page">{x.label}</span>
            ) : (
              <a href={x.href}>{x.label}</a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function FilterChip({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  const { locale } = useMtone();
  return (
    <span className="mt-filter-chip">
      {children}
      <IconButton
        size="sm"
        variant="ghost"
        aria-label={locale === "zh" ? "移除筛选" : "Remove filter"}
        onClick={onRemove}
      >
        <X size={12} />
      </IconButton>
    </span>
  );
}
export const FilterBar = ({
  className,
  ...p
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...p} className={cn("mt-filter-bar", className)} />
);
