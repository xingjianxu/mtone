import * as React from "react";
import { cn, useMtone } from "./basic";
import { Dialog, type DialogProps } from "./interactive";
import { Input } from "./input";
import { NavGroup, NavItem } from "./navigation";
import {
  NavSubmenuSelectionContext,
  SidebarContext,
} from "./navigation-context";

export interface SettingsDialogCategory {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface SettingsDialogSearchEntry {
  /** Value of the category that owns the setting. */
  category: string;
  /** DOM id of the target element inside the category content. */
  id: string;
  label: string;
  keywords?: readonly string[];
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
  /** Opt into built-in search with targets supplied by the application. */
  searchIndex?: readonly SettingsDialogSearchEntry[];
  /** Optional caller-owned search UI. Takes precedence over searchIndex. */
  search?:
    | React.ReactNode
    | ((context: SettingsDialogSearchContext) => React.ReactNode);
}

const COMPACT_QUERY = "(max-width: 600px)";
function getCompactSnapshot() {
  return typeof window === "undefined"
    ? false
    : (window.matchMedia?.(COMPACT_QUERY)?.matches ?? false);
}
function subscribeToCompact(onChange: () => void) {
  const query = window.matchMedia?.(COMPACT_QUERY);
  query?.addEventListener?.("change", onChange);
  return () => query?.removeEventListener?.("change", onChange);
}
const getServerSnapshot = () => false;

function scrollInside(container: HTMLElement, item: HTMLElement, inset = 0) {
  const outer = container.getBoundingClientRect();
  const inner = item.getBoundingClientRect();
  const top = outer.top + container.clientTop + inset;
  const bottom =
    outer.top + container.clientTop + container.clientHeight - inset;
  if (
    inner.top < top ||
    (inner.height > bottom - top && inner.bottom > bottom)
  ) {
    container.scrollTop += inner.top - top;
  } else if (inner.bottom > bottom) {
    container.scrollTop += inner.bottom - bottom;
  }
}

export function SettingsDialog({
  categories,
  value,
  defaultValue,
  onValueChange,
  categoriesLabel,
  search,
  searchIndex,
  className,
  onOpenChange,
  ...dialogProps
}: SettingsDialogProps) {
  const { locale } = useMtone();
  const compact = React.useSyncExternalStore(
    subscribeToCompact,
    getCompactSnapshot,
    getServerSnapshot,
  );
  const [localValue, setLocalValue] = React.useState(defaultValue);
  const [detail, setDetail] = React.useState(false);
  const [visited, setVisited] = React.useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(-1);
  const [jump, setJump] = React.useState<{
    entry: SettingsDialogSearchEntry;
    from: string | undefined;
  } | null>(null);
  const composing = React.useRef(false);
  const nav = React.useRef<HTMLElement>(null);
  const pane = React.useRef<HTMLElement>(null);
  const activeContent = React.useRef<HTMLDivElement>(null);
  const activeOption = React.useRef<HTMLDivElement>(null);
  const highlightCleanup = React.useRef<(() => void) | null>(null);
  const listId = React.useId();
  const navId = React.useId();
  const detailId = React.useId();
  const heading = React.useRef<HTMLHeadingElement>(null);
  const buttons = React.useRef(new Map<string, HTMLButtonElement>());
  const pendingFocus = React.useRef<"heading" | "category" | null>(null);
  const pendingSelection = React.useRef<string | null>(null);
  const current =
    categories.find((category) => category.value === (value ?? localValue)) ??
    categories[0];
  const currentValue = current?.value;
  const showDetail = !compact || (detail && current !== undefined);

  const builtIn = searchIndex !== undefined && search == null;
  const queryWords = query
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const searching = builtIn && queryWords.length > 0;
  const categoryLabels = new Map(
    categories.map(({ value: category, label }) => [
      category,
      typeof label === "string" || typeof label === "number"
        ? String(label)
        : category,
    ]),
  );
  const results = searching
    ? searchIndex.flatMap((entry) => {
        const categoryLabel = categoryLabels.get(entry.category);
        if (categoryLabel === undefined) return [];
        const text = [entry.label, categoryLabel, ...(entry.keywords ?? [])]
          .join(" ")
          .toLocaleLowerCase();
        return queryWords.every((word) => text.includes(word))
          ? [{ entry, categoryLabel }]
          : [];
      })
    : [];
  const activeIndex = active < results.length ? active : -1;

  function clearSearch() {
    setQuery("");
    setActive(-1);
    setJump(null);
    composing.current = false;
  }

  React.useLayoutEffect(() => {
    if (nav.current && activeOption.current)
      scrollInside(nav.current, activeOption.current);
  }, [activeIndex, query]);

  React.useEffect(() => () => highlightCleanup.current?.(), []);
  React.useLayoutEffect(() => {
    if (!jump) return;
    if (currentValue !== jump.entry.category) {
      if (currentValue !== jump.from) setJump(null);
      return;
    }
    if (!showDetail) {
      setDetail(true);
      return;
    }
    if (!pane.current) return;
    setJump(null);
    highlightCleanup.current?.();
    const target = Array.from(
      activeContent.current?.querySelectorAll<HTMLElement>("[id]") ?? [],
    ).find(
      (element) =>
        element.id === jump.entry.id &&
        !element.closest("[hidden], [inert], [aria-hidden='true']"),
    );
    pendingFocus.current = null;
    if (!target) {
      heading.current?.focus({ preventScroll: true });
      return;
    }
    scrollInside(pane.current, target, 8);
    const addedTabIndex =
      target.tabIndex < 0 && !target.hasAttribute("tabindex");
    if (addedTabIndex) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    if (target.ownerDocument.activeElement !== target)
      heading.current?.focus({ preventScroll: true });
    target.setAttribute("data-mt-settings-highlight", "");
    const cleanup = () => {
      clearTimeout(timeout);
      target.removeAttribute("data-mt-settings-highlight");
      if (addedTabIndex && target.getAttribute("tabindex") === "-1")
        target.removeAttribute("tabindex");
      highlightCleanup.current = null;
    };
    const timeout = setTimeout(cleanup, 1600);
    highlightCleanup.current = cleanup;
  }, [currentValue, jump, showDetail]);

  React.useEffect(() => {
    if (currentValue === undefined) return;
    setVisited((previous) =>
      previous.has(currentValue)
        ? previous
        : new Set(previous).add(currentValue),
    );
  }, [currentValue]);

  function resetCompactView() {
    pendingSelection.current = null;
    pendingFocus.current = null;
    setDetail(false);
  }
  React.useEffect(() => {
    if (!compact || dialogProps.open === false) resetCompactView();
    if (dialogProps.open === false) {
      clearSearch();
      highlightCleanup.current?.();
    }
  }, [compact, dialogProps.open]);

  React.useLayoutEffect(() => {
    if (
      compact &&
      currentValue !== undefined &&
      pendingSelection.current === currentValue
    ) {
      pendingSelection.current = null;
      pendingFocus.current = "heading";
      setDetail(true);
    }
  }, [compact, currentValue]);

  React.useLayoutEffect(() => {
    if (!compact || currentValue === undefined) return;
    if (
      showDetail &&
      !jump &&
      pendingFocus.current === "heading" &&
      heading.current
    ) {
      pendingFocus.current = null;
      heading.current.focus();
    } else if (!showDetail && pendingFocus.current === "category") {
      const button = buttons.current.get(currentValue);
      if (button) {
        pendingFocus.current = null;
        button.focus();
      }
    }
  }, [compact, currentValue, showDetail, jump]);

  function selectCategory(next: string, viaSearch = false) {
    if (!categories.some((category) => category.value === next)) return;
    pendingSelection.current = null;
    if (compact) {
      if (viaSearch) {
        pendingFocus.current = null;
      } else if (next === currentValue || value === undefined) {
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

  function activateResult(entry: SettingsDialogSearchEntry) {
    setQuery("");
    setActive(-1);
    setJump({ entry, from: currentValue });
    selectCategory(entry.category, true);
  }

  const searchName = locale === "zh" ? "搜索设置" : "Search settings";
  const resultsName = locale === "zh" ? "搜索结果" : "Search results";
  const searchContent =
    typeof search === "function" ? search({ selectCategory }) : search;
  const categoryName =
    categoriesLabel ?? (locale === "zh" ? "设置分类" : "Settings categories");
  return (
    <Dialog
      {...dialogProps}
      className={cn("mt-settings-dialog", className)}
      onOpenChange={(open) => {
        if (!open && dialogProps.open === undefined) {
          resetCompactView();
          clearSearch();
          highlightCleanup.current?.();
        }
        onOpenChange?.(open);
      }}
    >
      <div
        className="mt-settings-dialog-layout"
        data-compact={compact || undefined}
      >
        {searchContent != null && searchContent !== false && (
          <div className="mt-settings-dialog-search">{searchContent}</div>
        )}
        <div className="mt-settings-dialog-columns">
          <nav
            ref={nav}
            id={navId}
            aria-label={categoryName}
            className="mt-settings-dialog-nav"
            hidden={compact && showDetail}
          >
            {builtIn && (
              <Input.Search
                wrapperClassName="mt-settings-dialog-search-input"
                aria-label={searchName}
                placeholder={searchName}
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={searching}
                aria-controls={searching ? listId : undefined}
                aria-activedescendant={
                  activeIndex >= 0 && searching
                    ? `${listId}-${activeIndex}`
                    : undefined
                }
                value={query}
                allowClear
                onClear={clearSearch}
                onChange={(event) => {
                  setQuery(event.currentTarget.value);
                  setActive(-1);
                  setJump(null);
                }}
                onCompositionStart={() => {
                  composing.current = true;
                }}
                onCompositionEnd={() => {
                  composing.current = false;
                }}
                onKeyDown={(event) => {
                  if (
                    composing.current ||
                    event.nativeEvent.isComposing ||
                    event.nativeEvent.keyCode === 229
                  )
                    return;
                  if (event.key === "Escape" && query) {
                    event.preventDefault();
                    event.stopPropagation();
                    clearSearch();
                  } else if (searching && results.length > 0) {
                    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                      event.preventDefault();
                      const direction = event.key === "ArrowDown" ? 1 : -1;
                      setActive(
                        activeIndex < 0
                          ? direction > 0
                            ? 0
                            : results.length - 1
                          : (activeIndex + direction + results.length) %
                              results.length,
                      );
                    } else if (event.key === "Enter") {
                      event.preventDefault();
                      activateResult(
                        results[activeIndex < 0 ? 0 : activeIndex].entry,
                      );
                    }
                  }
                }}
              />
            )}
            {searching ? (
              <>
                <div
                  className="mt-settings-dialog-results"
                  id={listId}
                  role="listbox"
                  aria-label={resultsName}
                >
                  {results.map(({ entry, categoryLabel }, index) => (
                    <div
                      key={JSON.stringify([entry.category, entry.id])}
                      ref={activeIndex === index ? activeOption : undefined}
                      id={`${listId}-${index}`}
                      role="option"
                      aria-selected={activeIndex === index}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => activateResult(entry)}
                    >
                      <span>{entry.label}</span>
                      <small>{categoryLabel}</small>
                    </div>
                  ))}
                </div>
              </>
            ) : (
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
                        onClick={() => {
                          setJump(null);
                          selectCategory(category);
                        }}
                      >
                        {label}
                      </NavItem>
                    ))}
                  </NavGroup>
                </NavSubmenuSelectionContext.Provider>
              </SidebarContext.Provider>
            )}
            {builtIn && (
              <div
                role="status"
                className={
                  searching && results.length === 0
                    ? "mt-settings-dialog-no-results"
                    : "mt-settings-dialog-result-status"
                }
              >
                {searching &&
                  (results.length > 0
                    ? locale === "zh"
                      ? `${results.length} 条搜索结果`
                      : `${results.length} search results`
                    : locale === "zh"
                      ? "无匹配结果"
                      : "No results")}
              </div>
            )}
          </nav>
          <section
            ref={pane}
            id={detailId}
            className="mt-settings-dialog-detail"
            hidden={!showDetail}
          >
            {current && (
              <>
                {compact && (
                  <button
                    type="button"
                    className="mt-settings-dialog-back"
                    aria-controls={navId}
                    onClick={() => {
                      setJump(null);
                      pendingSelection.current = null;
                      pendingFocus.current = "category";
                      setDetail(false);
                    }}
                  >
                    {locale === "zh" ? "返回分类" : "Back to categories"}
                  </button>
                )}
                <h3
                  ref={heading}
                  className="mt-settings-dialog-category-title"
                  tabIndex={-1}
                >
                  {current.label}
                </h3>
              </>
            )}
            {categories.map(
              ({ value: category, content }) =>
                (visited.has(category) || category === currentValue) && (
                  <div
                    key={category}
                    ref={category === currentValue ? activeContent : undefined}
                    hidden={category !== currentValue}
                  >
                    {content}
                  </div>
                ),
            )}
          </section>
        </div>
      </div>
    </Dialog>
  );
}
