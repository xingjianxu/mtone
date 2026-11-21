import * as React from "react";
import {
  ChevronRight,
  ChevronDown,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Circle,
} from "lucide-react";
import { Popover as BPopover } from "@base-ui/react/popover";
import { cn, IconButton, MtoneScope, useMtone } from "./basic";
import { Menu, type MenuProps, Tooltip } from "./interactive";
const SidebarContext = React.createContext(false);
const NavSubmenuSelectionContext = React.createContext<(() => void) | null>(null);
export type SidebarProps = React.HTMLAttributes<HTMLElement> & {
  header?: React.ReactNode | ((collapsed: boolean) => React.ReactNode);
  footer?: React.ReactNode | ((collapsed: boolean) => React.ReactNode);
  collapsePlacement?: "header" | "footer";
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
  footer,
  collapsePlacement = "header",
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
            {collapsePlacement === "header" && toggle}
          </div>
        ) : (
          collapsePlacement === "header" && toggle
        )}
        {collapsible || header !== undefined ? (
          <div id={contentId} className="mt-sidebar-content">
            {children}
          </div>
        ) : (
          children
        )}
        {(footer !== undefined ||
          (collapsePlacement === "footer" && collapsible)) && (
          <div className="mt-sidebar-footer">
            {footer !== undefined && (
              <div className="mt-sidebar-footer-content">
                {typeof footer === "function" ? footer(isCollapsed) : footer}
              </div>
            )}
            {collapsePlacement === "footer" && toggle}
          </div>
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
>(function NavItem({ active, icon, children, className, onClick, ...p }, ref) {
  const collapsed = React.useContext(SidebarContext);
  const [tipOpen, setTipOpen] = React.useState(false);
  const onSubmenuSelect = React.useContext(NavSubmenuSelectionContext);
  const plainLabel =
    typeof children === "string" || typeof children === "number";
  const label = p["aria-label"] ?? (plainLabel ? String(children) : undefined);
  const button = (
    <button
      type="button"
      {...p}
      ref={ref}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onSubmenuSelect?.();
      }}
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
      ) : plainLabel ? (
        <span className="mt-nav-item-label">{children}</span>
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
export interface NavSubmenuProps {
  label: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  disabled?: boolean;
}

function hasActiveNavItem(children: React.ReactNode): boolean {
  return React.Children.toArray(children).some((child) => {
    if (!React.isValidElement<{ active?: boolean; children?: React.ReactNode }>(child)) return false;
    if (child.type === React.Fragment) return hasActiveNavItem(child.props.children);
    return child.type === NavItem && child.props.active === true;
  });
}

export function NavSubmenu({
  label,
  children,
  icon,
  defaultExpanded = false,
  expanded,
  onExpandedChange,
  disabled = false,
}: NavSubmenuProps) {
  const collapsed = React.useContext(SidebarContext);
  const [inlineExpanded, setInlineExpanded] = React.useState(defaultExpanded);
  const [popupOpen, setPopupOpen] = React.useState(false);
  const [direction, setDirection] = React.useState<"ltr" | "rtl">("ltr");
  const panelId = React.useId();
  const popupTitleId = React.useId();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const popupActions = React.useRef<BPopover.Root.Actions>(null);
  const focusedInside = React.useRef(false);
  const priorMode = React.useRef(collapsed);

  // The inline disclosure and popup do not share DOM. On a breakpoint
  // crossing, hand off stranded focus without taking it from another control.
  React.useLayoutEffect(() => {
    const triggerElement = triggerRef.current;
    const owner = triggerElement?.ownerDocument;
    if (
      priorMode.current !== collapsed && focusedInside.current &&
      triggerElement && owner?.activeElement === owner?.body
    ) {
      triggerElement.focus({ preventScroll: true });
    }
    priorMode.current = collapsed;
  }, [collapsed]);
  const inlineOpen = expanded ?? inlineExpanded;
  const open = collapsed && !disabled && popupOpen;
  React.useEffect(() => {
    if (!collapsed || disabled) setPopupOpen(false);
  }, [collapsed, disabled]);

  const trigger = (
    <button
      type="button"
      ref={triggerRef}
      disabled={disabled}
      className={cn("mt-nav-item", "mt-nav-submenu-trigger", collapsed && "mt-nav-item-collapsed")}
      aria-expanded={collapsed ? open : inlineOpen}
      aria-controls={collapsed ? undefined : panelId}
      onClick={collapsed ? undefined : () => {
        if (expanded === undefined) setInlineExpanded(!inlineOpen);
        onExpandedChange?.(!inlineOpen);
      }}
    >
      {icon != null ? <span className="mt-nav-submenu-icon" aria-hidden="true">{icon}</span>
        : collapsed ? <Circle size={16} aria-hidden="true" /> : null}
      <span className={cn(
        collapsed ? "mt-sidebar-sr-only" : "mt-nav-item-label",
        hasActiveNavItem(children) && "mt-nav-submenu-label-active",
      )}>{label}</span>
      {!collapsed && <ChevronDown size={14} className="mt-nav-submenu-chevron" aria-hidden="true" />}
    </button>
  );

  return (
    <div
      className="mt-nav-submenu"
      onFocusCapture={() => { focusedInside.current = true; }}
      onBlurCapture={(event) => {
        const next = event.relatedTarget;
        focusedInside.current = !!next && (
          event.currentTarget.contains(next) || !!popupRef.current?.contains(next)
        );
      }}
    >
      {collapsed ? (
        <BPopover.Root
          modal={false}
          actionsRef={popupActions}
          open={open}
          onOpenChange={(next) => {
            if (next && triggerRef.current) {
              const view = triggerRef.current.ownerDocument.defaultView;
              setDirection(view?.getComputedStyle(triggerRef.current).direction === "rtl" ? "rtl" : "ltr");
            }
            setPopupOpen(next);
          }}
        >
          <BPopover.Trigger render={trigger} />
          <BPopover.Portal>
            <MtoneScope dir={direction}>
              <BPopover.Positioner
                side={direction === "rtl" ? "left" : "right"}
                align="start"
                sideOffset={6}
                className="mt-positioner"
              >
                <BPopover.Popup
                  ref={popupRef}
                  className="mt-popup mt-nav-submenu-popup"
                  aria-labelledby={popupTitleId}
                  initialFocus={() => popupRef.current?.querySelector<HTMLElement>(".mt-nav-item:not(:disabled)") ?? popupRef.current}
                >
                  <span id={popupTitleId} className="mt-sidebar-sr-only">{label}</span>
                  <SidebarContext.Provider value={false}>
                    <NavSubmenuSelectionContext.Provider value={() => popupActions.current?.close()}>
                      {children}
                    </NavSubmenuSelectionContext.Provider>
                  </SidebarContext.Provider>
                </BPopover.Popup>
              </BPopover.Positioner>
            </MtoneScope>
          </BPopover.Portal>
        </BPopover.Root>
      ) : (
        <>
          {trigger}
          <div id={panelId} className="mt-nav-submenu-children" hidden={!inlineOpen}>
            {children}
          </div>
        </>
      )}
    </div>
  );
}

export interface BreadcrumbItem {
  key?: React.Key;
  label: React.ReactNode;
  icon?: React.ReactNode;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  disabled?: boolean;
  "aria-label"?: string;
  /** Separator after this item; null hides it. */
  separator?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  menu?: Omit<MenuProps, "trigger">;
}
export interface BreadcrumbProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}
export function Breadcrumb({
  items,
  separator = <ChevronRight size={12} />,
  "aria-label": label = "Breadcrumb",
  ...props
}: BreadcrumbProps) {
  const id = React.useId();
  return (
    <nav aria-label={label} {...props}>
      <ol className="mt-breadcrumb">
        {items.map((item, i) => {
          const current = i === items.length - 1;
          const hasMenu = !item.disabled && !!item.menu?.items.length;
          const content = (
            <>
              {item.icon != null && (
                <span className="mt-breadcrumb-icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              {item.label}
            </>
          );
          const common = {
            id: `${id}-${i}`,
            className: "mt-breadcrumb-content",
            "aria-label": item["aria-label"],
            "aria-current": current ? ("page" as const) : undefined,
            "aria-disabled": item.disabled || undefined,
          };
          const link = !current && !item.disabled && item.href !== undefined;
          const action = !current && !item.disabled && !!item.onClick;
          const separateTrigger = link || action || current;
          const previous = items[i - 1];
          const divider =
            previous?.separator === undefined ? separator : previous.separator;
          return (
            <li key={item.key ?? i}>
              {i > 0 &&
                divider != null &&
                divider !== false &&
                divider !== "" && (
                  <span className="mt-breadcrumb-separator" aria-hidden="true">
                    {divider}
                  </span>
                )}
              <span className="mt-breadcrumb-item">
                {(!hasMenu || separateTrigger) &&
                  (link ? (
                    <a
                      {...common}
                      href={item.href}
                      target={item.target}
                      rel={
                        item.rel ??
                        (item.target === "_blank"
                          ? "noopener noreferrer"
                          : undefined)
                      }
                      onClick={item.onClick}
                    >
                      {content}
                    </a>
                  ) : action ? (
                    <button {...common} type="button" onClick={item.onClick}>
                      {content}
                    </button>
                  ) : (
                    <span {...common}>{content}</span>
                  ))}
                {hasMenu && (
                  <Menu
                    {...item.menu!}
                    trigger={
                      <button
                        type="button"
                        className={cn(
                          "mt-breadcrumb-content mt-breadcrumb-menu-trigger",
                          separateTrigger && "mt-breadcrumb-menu-arrow",
                        )}
                        aria-label={item["aria-label"]}
                        aria-labelledby={
                          separateTrigger && !item["aria-label"]
                            ? `${id}-${i}`
                            : undefined
                        }
                      >
                        {!separateTrigger && content}
                        <ChevronDown size={12} aria-hidden="true" />
                      </button>
                    }
                  />
                )}
              </span>
            </li>
          );
        })}
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
      <span className="mt-filter-chip-label">{children}</span>
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
