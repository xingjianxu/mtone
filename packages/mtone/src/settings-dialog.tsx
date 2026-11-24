import * as React from "react";
import { cn, useMtone } from "./basic";
import { Dialog, type DialogProps } from "./interactive";
import { NavGroup, NavItem } from "./navigation";
import { NavSubmenuSelectionContext, SidebarContext } from "./navigation-context";

export interface SettingsDialogCategory {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface SettingsDialogSearchContext {
  selectCategory: (value: string) => void;
}

export interface SettingsDialogProps extends Omit<DialogProps, "children"> {
  /** Unique categories, in navigation order. */
  categories: readonly SettingsDialogCategory[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  categoriesLabel?: string;
  /** Optional caller-owned search UI. No index or filtering is performed. */
  search?: React.ReactNode | ((context: SettingsDialogSearchContext) => React.ReactNode);
}

const COMPACT_QUERY = "(max-width: 600px)";
function getCompactSnapshot() {
  return typeof window === "undefined" ? false : window.matchMedia?.(COMPACT_QUERY)?.matches ?? false;
}
function subscribeToCompact(onChange: () => void) {
  const query = window.matchMedia?.(COMPACT_QUERY);
  query?.addEventListener?.("change", onChange);
  return () => query?.removeEventListener?.("change", onChange);
}
const getServerSnapshot = () => false;

export function SettingsDialog({
  categories,
  value,
  defaultValue,
  onValueChange,
  categoriesLabel,
  search,
  className,
  onOpenChange,
  ...dialogProps
}: SettingsDialogProps) {
  const { locale } = useMtone();
  const compact = React.useSyncExternalStore(subscribeToCompact, getCompactSnapshot, getServerSnapshot);
  const [localValue, setLocalValue] = React.useState(defaultValue);
  const [detail, setDetail] = React.useState(false);
  const [visited, setVisited] = React.useState<ReadonlySet<string>>(() => new Set());
  const navId = React.useId();
  const detailId = React.useId();
  const heading = React.useRef<HTMLHeadingElement>(null);
  const buttons = React.useRef(new Map<string, HTMLButtonElement>());
  const pendingFocus = React.useRef<"heading" | "category" | null>(null);
  const pendingSelection = React.useRef<string | null>(null);
  const current = categories.find((category) => category.value === (value ?? localValue)) ?? categories[0];
  const currentValue = current?.value;
  const showDetail = !compact || (detail && current !== undefined);

  React.useEffect(() => {
    if (currentValue === undefined) return;
    setVisited((previous) => previous.has(currentValue) ? previous : new Set(previous).add(currentValue));
  }, [currentValue]);

  function resetCompactView() {
    pendingSelection.current = null;
    pendingFocus.current = null;
    setDetail(false);
  }
  React.useEffect(() => {
    if (!compact || dialogProps.open === false) resetCompactView();
  }, [compact, dialogProps.open]);

  React.useLayoutEffect(() => {
    if (compact && currentValue !== undefined && pendingSelection.current === currentValue) {
      pendingSelection.current = null;
      pendingFocus.current = "heading";
      setDetail(true);
    }
  }, [compact, currentValue]);

  React.useLayoutEffect(() => {
    if (!compact || currentValue === undefined) return;
    if (showDetail && pendingFocus.current === "heading" && heading.current) {
      pendingFocus.current = null;
      heading.current.focus();
    } else if (!showDetail && pendingFocus.current === "category") {
      const button = buttons.current.get(currentValue);
      if (button) {
        pendingFocus.current = null;
        button.focus();
      }
    }
  }, [compact, currentValue, showDetail]);

  function selectCategory(next: string) {
    if (!categories.some((category) => category.value === next)) return;
    pendingSelection.current = null;
    if (compact) {
      if (next === currentValue || value === undefined) {
        if (!detail || next !== currentValue) pendingFocus.current = "heading";
        if (detail && next === currentValue) heading.current?.focus();
        setDetail(true);
      } else {
        pendingSelection.current = next;
      }
    }
    if (next !== currentValue) {
      if (value === undefined) setLocalValue(next);
      onValueChange?.(next);
    }
  }

  const searchContent = typeof search === "function" ? search({ selectCategory }) : search;
  const categoryName = categoriesLabel ?? (locale === "zh" ? "设置分类" : "Settings categories");
  return (
    <Dialog
      {...dialogProps}
      className={cn("mt-settings-dialog", className)}
      onOpenChange={(open) => {
        if (!open && dialogProps.open === undefined) resetCompactView();
        onOpenChange?.(open);
      }}
    >
      <div className="mt-settings-dialog-layout" data-compact={compact || undefined}>
        {searchContent != null && searchContent !== false && (
          <div className="mt-settings-dialog-search">{searchContent}</div>
        )}
        <div className="mt-settings-dialog-columns">
          <nav id={navId} aria-label={categoryName} className="mt-settings-dialog-nav" hidden={compact && showDetail}>
            <SidebarContext.Provider value={false}>
              <NavSubmenuSelectionContext.Provider value={null}>
                <NavGroup>
                  {categories.map(({ value: category, label, icon }) => (
                    <NavItem
                      key={category}
                      ref={(element: HTMLButtonElement | null) => {
                        if (element) buttons.current.set(category, element);
                        else buttons.current.delete(category);
                      }}
                      icon={icon}
                      active={currentValue === category}
                      aria-controls={detailId}
                      onClick={() => selectCategory(category)}
                    >
                      {label}
                    </NavItem>
                  ))}
                </NavGroup>
              </NavSubmenuSelectionContext.Provider>
            </SidebarContext.Provider>
          </nav>
          <section id={detailId} className="mt-settings-dialog-detail" hidden={!showDetail}>
            {current && (
              <>
                {compact && (
                  <button
                    type="button"
                    className="mt-settings-dialog-back"
                    aria-controls={navId}
                    onClick={() => {
                      pendingSelection.current = null;
                      pendingFocus.current = "category";
                      setDetail(false);
                    }}
                  >
                    {locale === "zh" ? "返回分类" : "Back to categories"}
                  </button>
                )}
                <h3 ref={heading} className="mt-settings-dialog-category-title" tabIndex={-1}>
                  {current.label}
                </h3>
              </>
            )}
            {categories.map(({ value: category, content }) =>
              (visited.has(category) || category === currentValue) && (
                <div key={category} hidden={category !== currentValue}>{content}</div>
              ),
            )}
          </section>
        </div>
      </div>
    </Dialog>
  );
}
