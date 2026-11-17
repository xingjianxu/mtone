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
  observe?: boolean;
  offset?: number;
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
const defaultLabel = (node: HTMLElement) => node.textContent?.trim() || "";
const defaultLevel = (node: HTMLElement) => Number(node.tagName.slice(1)) || 1;
const resolve = (value: TableOfContentsProps["root"]) =>
  typeof value === "function" ? value() : value;

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
  const [entries, setEntries] = useState<Entry[]>(initialItems);
  const entriesRef = useRef<Entry[]>(initialItems);
  const [active, setActive] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);
  const callback = useRef(onActiveChange);
  callback.current = onActiveChange;
  const [revision, forceRefresh] = useState(0);
  const binding = useRef<{ values: unknown[]; cleanup: () => void } | null>(
    null,
  );
  const safeOffset = Number.isFinite(offset) ? offset : 0;
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
      safeOffset,
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
      const items = nodes();
      const top =
        (container
          ? container.getBoundingClientRect().top + container.clientTop
          : 0) + safeOffset;
      let current = items[0]?.id ?? null;
      for (const item of items) {
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
          ? Array.from(scope.querySelectorAll<HTMLElement>(selector))
          : [];
      } catch {
        /* Invalid selector produces an empty list. */
      }
      const seen = new Set<string>();
      const next: Entry[] = [];
      for (const node of headings) {
        if (
          node.closest("[data-mt-toc]") ||
          node.hidden ||
          node.closest("[hidden]")
        )
          continue;
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
          level: Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1,
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
      next.forEach((entry) => resize?.observe(entry.node!));
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
      safeOffset;
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
  return (
    <nav
      {...props}
      data-mt-toc=""
      aria-label={props["aria-label"] ?? "目录"}
      className={`mt-toc mt-toc-${variant} ${className}`}
      style={style}
    >
      {title != null && <div className="mt-toc-title">{title}</div>}
      {entries.length ? (
        <ol className="mt-toc-list">
          {entries.map((entry) => (
            <li key={entry.id} className="mt-toc-item">
              <a
                className="mt-toc-link"
                href={`#${encodeURIComponent(entry.id)}`}
                aria-current={active === entry.id ? "location" : undefined}
                style={{
                  paddingInlineStart:
                    8 +
                    Math.min(12, Math.max(0, entry.level - minLevel)) *
                      (Number.isFinite(indent) ? Math.max(0, indent) : 12),
                }}
                onClick={(event) => navigate(entry, event)}
              >
                {renderLabel
                  ? renderLabel(entry, active === entry.id)
                  : entry.label}
              </a>
            </li>
          ))}
        </ol>
      ) : (
        emptyContent
      )}
    </nav>
  );
});
