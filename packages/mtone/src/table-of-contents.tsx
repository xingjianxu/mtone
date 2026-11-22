import React, {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export interface TableOfContentsItem {
  id: string;
  label: string;
  level: number;
}
export interface TableOfContentsHandle {
  refresh: () => void;
}
export interface TableOfContentsProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "title" | "onSelect"
> {
  /** Heading scope. null means not ready; omitted means document. */
  root?: HTMLElement | null | (() => HTMLElement | null);
  /** Scroller containing the headings. Omitted means window. */
  scrollContainer?: HTMLElement | null | (() => HTMLElement | null);
  selector?: string;
  title?: React.ReactNode;
  initialItems?: TableOfContentsItem[];
  /** Explicit ordered items, instead of discovering headings from the DOM. */
  items?: readonly TableOfContentsItem[];
  listStyle?: "flat" | "nested";
  /** A supplied href uses native link navigation instead of scrolling in JS. */
  getHref?: (item: TableOfContentsItem) => string | undefined;
  fallbackActiveId?: string;
  highlightLastAtEnd?: boolean;
  /** At this viewport width or below, use a native collapsed disclosure. */
  collapseBelow?: number;
  observe?: boolean;
  offset?: number | (() => number);
  behavior?: ScrollBehavior;
  indent?: number;
  variant?: "default" | "subtle";
  emptyContent?: React.ReactNode;
  getLabel?: (element: HTMLElement) => string;
  getLevel?: (element: HTMLElement) => number;
  renderLabel?: (item: TableOfContentsItem, active: boolean) => React.ReactNode;
  onActiveChange?: (id: string | null) => void;
  onItemClick?: (
    item: TableOfContentsItem,
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => void;
}
type Entry = TableOfContentsItem & { node?: HTMLElement };
type Branch = { entry: Entry; children: Branch[] };
function nest(entries: readonly Entry[]): Branch[] {
  const roots: Branch[] = [];
  const stack: Branch[] = [];
  for (const entry of entries) {
    while (stack.length && stack.at(-1)!.entry.level >= entry.level)
      stack.pop();
    const branch = { entry, children: [] };
    (stack.at(-1)?.children ?? roots).push(branch);
    stack.push(branch);
  }
  return roots;
}
const defaultLabel = (node: HTMLElement) => node.textContent?.trim() || "";
const defaultLevel = (node: HTMLElement) => Number(node.tagName.slice(1)) || 1;
const resolve = (value: TableOfContentsProps["root"]) =>
  typeof value === "function" ? value() : value;

const normalizeLevel = (level: number) =>
  Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1;
const readOffset = (offset: NonNullable<TableOfContentsProps["offset"]>) => {
  const value = typeof offset === "function" ? offset() : offset;
  return Number.isFinite(value) ? value : 0;
};

/** An accessible on-page heading index, independent of router hash state. */
export const TableOfContents = forwardRef<
  TableOfContentsHandle,
  TableOfContentsProps
>(function TableOfContents(
  {
    root,
    scrollContainer,
    selector = "h2, h3, h4",
    title = "目录",
    initialItems = [],
    items,
    listStyle = "flat",
    getHref,
    fallbackActiveId,
    highlightLastAtEnd = false,
    collapseBelow,
    observe = true,
    offset = 0,
    behavior = "smooth",
    indent = 12,
    variant = "default",
    emptyContent = null,
    getLabel = defaultLabel,
    getLevel = defaultLevel,
    renderLabel,
    onActiveChange,
    onItemClick,
    className = "",
    style,
    ...props
  },
  ref,
) {
  const prefix = useId().replace(/:/g, "");
  const counter = useRef(0);
  const [entries, setEntries] = useState<Entry[]>(() => [
    ...(items ?? initialItems),
  ]);
  const entriesRef = useRef<Entry[]>(entries);
  const [active, setActive] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);
  const callback = useRef(onActiveChange);
  callback.current = onActiveChange;
  const [revision, forceRefresh] = useState(0);
  const binding = useRef<{ values: unknown[]; cleanup: () => void } | null>(
    null,
  );
  const disclosure = useRef<HTMLDetailsElement>(null);
  const [compact, setCompact] = useState(false);
  const responsive =
    collapseBelow !== undefined &&
    Number.isFinite(collapseBelow) &&
    collapseBelow >= 0;
  useEffect(() => {
    if (!responsive || typeof window.matchMedia !== "function") {
      setCompact(false);
      return;
    }
    const media = window.matchMedia(`(max-width: ${collapseBelow}px)`);
    const change = () => setCompact(media.matches);
    change();
    media.addEventListener?.("change", change);
    return () => media.removeEventListener?.("change", change);
  }, [collapseBelow, responsive]);
  const updateActive = useCallback((id: string | null) => {
    if (activeRef.current === id) return;
    activeRef.current = id;
    setActive(id);
    callback.current?.(id);
  }, []);
  useImperativeHandle(
    ref,
    () => ({ refresh: () => forceRefresh((revision) => revision + 1) }),
    [],
  );

  useEffect(() => {
    const scope = root === undefined ? document : resolve(root);
    const container = resolve(scrollContainer);
    const values = [
      scope,
      container,
      selector,
      observe,
      getLabel,
      getLevel,
      offset,
      items,
      fallbackActiveId,
      highlightLastAtEnd,
      revision,
    ];
    if (
      binding.current?.values.every((value, index) =>
        Object.is(value, values[index]),
      )
    )
      return;
    binding.current?.cleanup();
    const nodes = () =>
      entriesRef.current.filter((entry) => entry.node?.isConnected);
    let frame = 0;
    const track = () => {
      const targets = nodes();
      const top =
        (container
          ? container.getBoundingClientRect().top + container.clientTop
          : 0) + readOffset(offset);
      if (highlightLastAtEnd) {
        const height = container ? container.clientHeight : window.innerHeight;
        const scrollHeight = (container ?? document.documentElement)
          .scrollHeight;
        const scrollTop = container ? container.scrollTop : window.scrollY;
        if (scrollHeight > height && scrollTop + height >= scrollHeight - 2) {
          updateActive(targets.at(-1)?.id ?? null);
          return;
        }
      }
      const fallback =
        fallbackActiveId === undefined
          ? undefined
          : targets.find((item) => item.id === fallbackActiveId)?.id;
      let current = fallback ?? targets[0]?.id ?? null;
      for (const item of targets) {
        if (item.node!.getBoundingClientRect().top <= top + 1)
          current = item.id;
      }
      updateActive(current);
    };
    const schedule = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          track();
        });
    };
    const resize =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(schedule)
        : null;
    const collect = () => {
      let headings: HTMLElement[] = [];
      try {
        headings = scope
          ? Array.from(
              scope.querySelectorAll<HTMLElement>(items ? "[id]" : selector),
            )
          : [];
      } catch {
        /* Invalid selector produces an empty list. */
      }
      const seen = new Set<string>();
      const next: Entry[] = [];
      const visible = (node: HTMLElement) =>
        !node.closest("[data-mt-toc]") && !node.closest("[hidden]");
      if (items) {
        const byId = new Map<string, HTMLElement>();
        for (const node of headings) {
          if (visible(node) && !byId.has(node.id)) byId.set(node.id, node);
        }
        for (const item of items) {
          if (!item.id || !item.label.trim() || seen.has(item.id)) continue;
          seen.add(item.id);
          next.push({
            ...item,
            level: normalizeLevel(item.level),
            node: byId.get(item.id),
          });
        }
      } else
        for (const node of headings) {
          if (!visible(node)) continue;
          const label = getLabel(node);
          if (!label.trim()) continue;
          if (!node.id) {
            let id: string;
            do {
              id = `mt-toc-${prefix}-${++counter.current}`;
            } while (document.getElementById(id));
            node.id = id;
          }
          // Duplicate authored IDs are invalid HTML; keep only the first target.
          if (seen.has(node.id)) continue;
          seen.add(node.id);
          const level = getLevel(node);
          next.push({
            id: node.id,
            label,
            level: normalizeLevel(level),
            node,
          });
        }
      entriesRef.current = next;
      setEntries((old) =>
        old.length === next.length &&
        old.every((entry, index) => {
          const other = next[index];
          return (
            entry.id === other.id &&
            entry.label === other.label &&
            entry.level === other.level &&
            entry.node === other.node
          );
        })
          ? old
          : next,
      );
      resize?.disconnect();
      if (scope instanceof HTMLElement) resize?.observe(scope);
      next.forEach((entry) => {
        if (entry.node) resize?.observe(entry.node);
      });
      track();
    };
    collect();
    const mutation =
      observe && scope && typeof MutationObserver !== "undefined"
        ? new MutationObserver((records) => {
            if (
              records.some(
                (record) =>
                  !(
                    record.target instanceof Element
                      ? record.target
                      : record.target.parentElement
                  )?.closest("[data-mt-toc]"),
              )
            )
              collect();
          })
        : null;
    mutation?.observe(scope!, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });
    const target = container ?? window;
    target.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Capture resource loads (e.g. images) that move headings without resizing them.
    scope?.addEventListener("load", schedule, true);
    binding.current = {
      values,
      cleanup: () => {
        mutation?.disconnect();
        resize?.disconnect();
        cancelAnimationFrame(frame);
        target.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        scope?.removeEventListener("load", schedule, true);
      },
    };
  }); // Check targets after every commit; retain bindings unless targets/options changed.
  useEffect(
    () => () => {
      binding.current?.cleanup();
      binding.current = null;
    },
    [],
  );

  const navigate = (
    entry: Entry,
    event: React.MouseEvent<HTMLAnchorElement>,
    nativeLink: boolean,
  ) => {
    onItemClick?.(entry, event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    if (compact && disclosure.current) disclosure.current.open = false;
    if (nativeLink) return;
    event.preventDefault();
    const node = entry.node ?? document.getElementById(entry.id);
    if (!node?.isConnected) return;
    const container = resolve(scrollContainer);
    const top =
      node.getBoundingClientRect().top -
      (container
        ? container.getBoundingClientRect().top + container.clientTop
        : 0) +
      (container ? container.scrollTop : window.scrollY) -
      readOffset(offset);
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    (container ?? window).scrollTo({
      top,
      behavior: reduced ? "auto" : behavior,
    });
    // Programmatic focus improves keyboard navigation, without leaving a permanent tab stop.
    if (!node.hasAttribute("tabindex")) {
      node.setAttribute("tabindex", "-1");
      node.addEventListener(
        "blur",
        () => {
          if (node.getAttribute("tabindex") === "-1")
            node.removeAttribute("tabindex");
        },
        { once: true },
      );
    }
    node.focus({ preventScroll: true });
    updateActive(entry.id);
  };
  const minLevel = entries.length
    ? Math.min(...entries.map((entry) => entry.level))
    : 1;
  const safeIndent = Number.isFinite(indent) ? Math.max(0, indent) : 12;
  const nested = listStyle === "nested";
  const branches = nested
    ? nest(entries)
    : entries.map((entry) => ({ entry, children: [] }));
  function renderList(branches: readonly Branch[], depth = 0) {
    return (
      <ol
        className="mt-toc-list"
        style={depth ? { paddingInlineStart: safeIndent } : undefined}
      >
        {branches.map(({ entry, children }) => {
          const href = getHref?.(entry);
          const selected = active === entry.id;
          return (
            <li key={entry.id} className="mt-toc-item">
              <a
                className="mt-toc-link"
                href={href ?? `#${encodeURIComponent(entry.id)}`}
                aria-current={selected ? "location" : undefined}
                style={
                  nested
                    ? undefined
                    : {
                        paddingInlineStart:
                          8 +
                          Math.min(12, Math.max(0, entry.level - minLevel)) *
                            safeIndent,
                      }
                }
                onClick={(event) => navigate(entry, event, href !== undefined)}
              >
                {renderLabel ? renderLabel(entry, selected) : entry.label}
              </a>
              {children.length ? renderList(children, depth + 1) : null}
            </li>
          );
        })}
      </ol>
    );
  }
  const label = props["aria-label"] ?? "目录";
  const nav = (
    <nav
      {...props}
      data-mt-toc=""
      aria-label={label}
      className={`mt-toc mt-toc-${variant} ${className}`}
      style={style}
    >
      {!compact && title != null && <div className="mt-toc-title">{title}</div>}
      {entries.length ? renderList(branches) : emptyContent}
    </nav>
  );
  return responsive ? (
    <details
      ref={disclosure}
      data-mt-toc=""
      className="mt-toc-disclosure"
      data-collapsible={compact ? "" : undefined}
      open={compact ? undefined : true}
    >
      <summary>{label}</summary>
      {nav}
    </details>
  ) : (
    nav
  );
});
