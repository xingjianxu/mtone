import React from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useDirection } from "@base-ui/react/direction-provider";
import { Button, cn, useMtone } from "./basic";
import { Tabs, TabsPanelContext, TabsStorageScopeContext, tabHint, type TabItem, type TabsProps, type TabsSize } from "./tabs";

import { readBoolean, useLayoutPreference } from "./layout-persistence";

type PanelTab = Pick<TabItem, "value" | "label" | "content" | "disabled" | "icon">;

export interface PanelProps extends Omit<
  React.ComponentPropsWithRef<"div">,
  "children" | "defaultValue" | "onChange"
>, Pick<TabsProps, "label" | "value" | "defaultValue" | "onValueChange"> {
  items: PanelTab[];
  /** Remember uncontrolled collapse and tab selection in this browser. */
  storageKey?: string;
  actions?: React.ReactNode;
  /** Tab item height, independent of external panel sizing. Defaults to md. */
  size?: TabsSize;
  /** Physical edge of the tab bar, independent of the surrounding layout. */
  tabPlacement?: "top" | "bottom" | "left" | "right";
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  /** Activate the open tab to collapse, or any tab to reopen. Defaults to true. */
  collapseOnTabClick?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Panel({
  items,
  actions,
  size = "md",
  tabPlacement = "top",
  collapsed,
  defaultCollapsed = false,
  storageKey,
  collapseOnTabClick = true,
  onCollapsedChange,
  className,
  ref,
  onFocusCapture,
  onBlurCapture,
  ...props
}: PanelProps) {
  const { locale } = useMtone();
  const inheritedDirection = useDirection();
  const rtl = (props.dir === "rtl" || props.dir === "ltr" ? props.dir : inheritedDirection) === "rtl";
  const sideRail = tabPlacement === "left" || tabPlacement === "right";
  const placement = !sideRail ? tabPlacement
    : (tabPlacement === "left") !== rtl ? "start" : "end";
  const compactRail = sideRail && items.every(item => item.icon != null && !!tabHint(item.label));
  const [localCollapsed, setLocalCollapsed] = useLayoutPreference(
    "panel-collapse", collapsed === undefined ? storageKey : undefined, defaultCollapsed, readBoolean,
  );
  const isCollapsed = collapsed ?? localCollapsed;
  const changeCollapsed = (next: boolean) => {
    if (collapsed === undefined) setLocalCollapsed(next);
    onCollapsedChange?.(next);
  };
  const onTabActivate = collapseOnTabClick ? (isSelected: boolean) => {
    if (isCollapsed || isSelected) changeCollapsed(!isCollapsed);
  } : undefined;
  const root = React.useRef<HTMLDivElement>(null);
  const toggle = React.useRef<HTMLButtonElement>(null);
  const bodyFocus = React.useRef<HTMLElement | null>(null);
  React.useImperativeHandle(ref, () => root.current!, []);
  React.useLayoutEffect(() => {
    if (!isCollapsed || !bodyFocus.current) return;
    const doc = root.current?.ownerDocument;
    if (doc && (doc.activeElement === bodyFocus.current || doc.activeElement === doc.body)) {
      toggle.current?.focus({ preventScroll: true });
    }
    bodyFocus.current = null;
  }, [isCollapsed]);

  const zh = locale === "zh";
  const DisclosureIcon = tabPlacement === "left"
    ? (isCollapsed ? ChevronRight : ChevronLeft)
    : tabPlacement === "right"
      ? (isCollapsed ? ChevronLeft : ChevronRight)
      : (isCollapsed ? ChevronUp : ChevronDown);
  return (
    <TabsPanelContext.Provider value={{ collapsed: isCollapsed, sideRail, onTabActivate }}>
      <TabsStorageScopeContext.Provider value="panel-tabs">
      <Tabs
        {...props}
        ref={root}
        items={items}
        storageKey={storageKey}
        placement={placement}
        size={size}
        indicatorColor="blue"
        destroyOnHidden={false}
        className={cn("mt-ide-panel", className)}
        data-collapsed={isCollapsed || undefined}
        data-panel-tab-placement={tabPlacement}
        data-side-rail={sideRail || undefined}
        data-compact-rail={compactRail || undefined}
        onFocusCapture={(event) => {
          const target = event.target as HTMLElement;
          const body = target.closest(".mt-tab-panel");
          bodyFocus.current = body && event.currentTarget.contains(body) ? target : null;
          onFocusCapture?.(event);
        }}
        onBlurCapture={(event) => {
          if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget)) {
            bodyFocus.current = null;
          }
          onBlurCapture?.(event);
        }}
        extraEnd={
          <>
            {actions != null && (
              <div className="mt-ide-panel-actions">
                <TabsPanelContext.Provider value={{ collapsed: false, sideRail: false }}>
                  {actions}
                </TabsPanelContext.Provider>
              </div>
            )}
            <Button
              ref={toggle}
              iconOnly
              size="sm"
              variant="ghost"
              aria-label={isCollapsed ? (zh ? "展开面板" : "Expand panel") : (zh ? "收起面板" : "Collapse panel")}
              aria-expanded={!isCollapsed}
              onClick={() => changeCollapsed(!isCollapsed)}
            >
              <DisclosureIcon size={15} aria-hidden="true" />
            </Button>
          </>
        }
      />
      </TabsStorageScopeContext.Provider>
    </TabsPanelContext.Provider>
  );
}
