import * as React from "react";
import {
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Circle,
} from "lucide-react";
import { Popover as BPopover } from "@base-ui/react/popover";
import { Button, cn, MtoneScope, useMtone } from "./basic";
import { Popover, type PopoverMenuProps, Tooltip } from "./interactive";
import { Tabs, TabsStorageScopeContext, type TabItem, type TabsProps } from "./tabs";
import { readBoolean, useLayoutPreference, SidebarResizeCollapseContext } from "./layout-persistence";
import { NavSubmenuSelectionContext, SidebarContext } from "./navigation-context";
export interface SidebarTabsOptions extends Pick<TabsProps, "label" | "value" | "defaultValue" | "onValueChange"> {
  items: readonly Pick<TabItem, "value" | "label" | "content" | "disabled" | "icon">[];
}
export type SidebarProps = React.HTMLAttributes<HTMLElement> & {
  header?: React.ReactNode | ((collapsed: boolean) => React.ReactNode);
  footer?: React.ReactNode | ((collapsed: boolean) => React.ReactNode);
  /** A nonempty list replaces children with tabbed local navigation. */
  tabs?: SidebarTabsOptions;
  /** Remember uncontrolled collapse and tab selection in this browser. */
  storageKey?: string;
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
  tabs,
  collapsePlacement = "header",
  collapsible = false,
  collapsed,
  defaultCollapsed = false,
  storageKey,
  onCollapsedChange,
  collapseLabel = "收起侧边栏",
  expandLabel = "展开侧边栏",
  ...p
}: SidebarProps) {
  const [internal, setInternal] = useLayoutPreference(
    "sidebar-collapse", collapsed === undefined ? storageKey : undefined, defaultCollapsed, readBoolean,
  );
  const isCollapsed = collapsible && (collapsed ?? internal);
  const reportCollapse = React.useContext(SidebarResizeCollapseContext);
  React.useLayoutEffect(() => { reportCollapse?.(isCollapsed); }, [isCollapsed, reportCollapse]);
  const contentId = React.useId();
  const items = React.useMemo(() => tabs?.items.map(({ content, ...item }) => ({
    ...item,
    content: <div className="mt-sidebar-content">{content}</div>,
  })), [tabs?.items]);
  const hasTabs = !!items?.length;
  const toggle = collapsible && (
    <Button iconOnly
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
    </Button>
  );
  return (
    <SidebarResizeCollapseContext.Provider value={null}>
    <SidebarContext.Provider value={isCollapsed}>
      <aside
        {...p}
        className={cn("mt-sidebar", hasTabs && "mt-sidebar-with-tabs", className)}
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
        {tabs && items?.length ? (
          <div id={contentId} className="mt-sidebar-tab-region">
            <TabsStorageScopeContext.Provider value="sidebar-tabs">
            <Tabs className="mt-sidebar-tabs"
              items={items} label={tabs.label} value={tabs.value} defaultValue={tabs.defaultValue}
              storageKey={storageKey}
              onValueChange={tabs.onValueChange} placement="top" variant="line" size="small"
              indicatorColor="blue" destroyOnHidden={false} />
            </TabsStorageScopeContext.Provider>
          </div>
        ) : collapsible || header !== undefined ? (
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
    </SidebarResizeCollapseContext.Provider>
  );
}

export interface NavItemAction {
  content: React.ReactNode;
  visibility?: "always" | "hover" | "active";
}

interface NavItemCommonProps {
  active?: boolean;
  icon?: React.ReactNode;
  actions?: NavItemAction | readonly NavItemAction[];
}
export type NavItemButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  NavItemCommonProps & { href?: undefined };
export type NavItemLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  NavItemCommonProps & { href: string; disabled?: boolean };
export type NavItemProps = NavItemButtonProps | NavItemLinkProps;

export const NavItem = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, NavItemProps>(
  function NavItem(props, ref) {
    const collapsed = React.useContext(SidebarContext);
    const [tipOpen, setTipOpen] = React.useState(false);
    const onSubmenuSelect = React.useContext(NavSubmenuSelectionContext);
    const { active, icon, children, className, actions } = props;
    const actionItems: readonly NavItemAction[] = !actions ? [] : "content" in actions ? [actions] : actions;
    const hasActions = !collapsed && actionItems.length > 0;
    const plainLabel = typeof children === "string" || typeof children === "number";
    const label = props["aria-label"] ?? (plainLabel ? String(children) : undefined);
    const rowProps = {
      "aria-current": active ? ("page" as const) : undefined,
      className: cn("mt-nav-item", active && "mt-active", collapsed && "mt-nav-item-collapsed", className),
    };
    const content = (
      <>
        {icon || (collapsed ? <Circle size={16} aria-hidden="true" /> : null)}
        {collapsed ? <span className="mt-sidebar-sr-only">{children}</span>
          : plainLabel ? <span className="mt-nav-item-label">{children}</span>
          : children}
      </>
    );

    let row: React.ReactElement;
    if (typeof props.href === "string") {
      const { href, disabled, onClick, onAuxClick, active, icon, children, className, actions, ...linkProps } = props;
      row = (
        <a
          {...linkProps}
          {...rowProps}
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={disabled ? undefined : href}
          role={disabled ? "link" : linkProps.role}
          aria-disabled={disabled ? true : linkProps["aria-disabled"]}
          tabIndex={disabled ? -1 : linkProps.tabIndex}
          onAuxClick={disabled ? undefined : onAuxClick}
          onClick={(event) => {
            if (disabled) return;
            onClick?.(event);
            if (!event.defaultPrevented && event.button === 0 &&
              !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
              onSubmenuSelect?.();
            }
          }}
        >
          {content}
        </a>
      );
    } else {
      const { href, active, icon, children, className, actions, onClick, ...buttonProps } = props;
      row = (
        <button
          type="button"
          {...buttonProps}
          {...rowProps}
          ref={ref as React.Ref<HTMLButtonElement>}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) onSubmenuSelect?.();
          }}
        >
          {content}
        </button>
      );
    }

    const trigger = label ? (
      <Tooltip
        content={label}
        side="right"
        open={collapsed && tipOpen}
        onOpenChange={(open) => setTipOpen(collapsed && open)}
      >
        {row}
      </Tooltip>
    ) : row;

    return hasActions ? (
      <div className="mt-nav-item-row" data-active={active || undefined}>
        {trigger}
        <div className="mt-nav-item-actions">
          {actionItems.map(({ content, visibility = "always" }, index) => (
            <div className="mt-nav-item-action" key={index} data-visibility={visibility}>
              {content}
            </div>
          ))}
        </div>
      </div>
    ) : trigger;
  },
) as {
  (props: NavItemLinkProps & React.RefAttributes<HTMLAnchorElement>): React.ReactNode;
  (props: NavItemButtonProps & React.RefAttributes<HTMLButtonElement>): React.ReactNode;
};

export interface NavGroupProps {
  label?: React.ReactNode;
  children: React.ReactNode;
  /** Show a decorative divider before this group when it follows another group. */
  divider?: boolean;
  /** Header controls at the inline end, hidden in the collapsed sidebar. */
  actions?: React.ReactNode;
}

export function NavGroup({ label, children, divider = true, actions }: NavGroupProps) {
  const collapsed = React.useContext(SidebarContext);
  const heading = label ? (
    <div className={collapsed ? "mt-sidebar-sr-only" : "mt-nav-label"}>
      {label}
    </div>
  ) : null;
  return (
    <div
      className={cn("mt-nav-group", collapsed && "mt-nav-group-collapsed")}
      data-no-divider={!divider || undefined}
    >
      {!collapsed && React.Children.toArray(actions).length > 0 ? (
        <div className="mt-nav-group-header">
          {heading}
          <div className="mt-nav-group-actions">{actions}</div>
        </div>
      ) : heading}
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
                  initialFocus={() => popupRef.current?.querySelector<HTMLElement>('.mt-nav-item:not(:disabled):not([aria-disabled="true"])') ?? popupRef.current}
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
  menu?: Omit<PopoverMenuProps, "trigger">;
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
                  <Popover.Menu
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
                        {!separateTrigger && (
                          <span className="mt-breadcrumb-menu-label">{content}</span>
                        )}
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
