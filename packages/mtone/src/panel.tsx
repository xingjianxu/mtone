import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button, cn, useMtone } from "./basic";
import { Tabs, TabsCollapsedContext, type TabItem, type TabsProps } from "./tabs";

type PanelTab = Pick<TabItem, "value" | "label" | "content" | "disabled" | "icon">;

export interface PanelProps extends Omit<
  React.ComponentPropsWithRef<"div">,
  "children" | "defaultValue" | "onChange"
>, Pick<TabsProps, "label" | "value" | "defaultValue" | "onValueChange"> {
  items: PanelTab[];
  actions?: React.ReactNode;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Panel({
  items,
  actions,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  className,
  ref,
  onFocusCapture,
  onBlurCapture,
  ...props
}: PanelProps) {
  const { locale } = useMtone();
  const [localCollapsed, setLocalCollapsed] = React.useState(defaultCollapsed);
  const isCollapsed = collapsed ?? localCollapsed;
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
  return (
    <TabsCollapsedContext.Provider value={isCollapsed}>
      <Tabs
        {...props}
        ref={root}
        items={items}
        size="small"
        indicatorColor="blue"
        destroyOnHidden={false}
        className={cn("mt-ide-panel", className)}
        data-collapsed={isCollapsed || undefined}
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
            {actions != null && <div className="mt-ide-panel-actions">{actions}</div>}
            <Button
              ref={toggle}
              iconOnly
              size="sm"
              variant="ghost"
              aria-label={isCollapsed ? (zh ? "展开面板" : "Expand panel") : (zh ? "收起面板" : "Collapse panel")}
              aria-expanded={!isCollapsed}
              onClick={() => {
                const next = !isCollapsed;
                if (collapsed === undefined) setLocalCollapsed(next);
                onCollapsedChange?.(next);
              }}
            >
              {isCollapsed ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
            </Button>
          </>
        }
      />
    </TabsCollapsedContext.Provider>
  );
}
