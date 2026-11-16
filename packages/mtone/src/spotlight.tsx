"use client";
import React from "react";
import { Search } from "lucide-react";
import { Input, useMtone } from "./basic";
import { Dialog } from "./interactive";

export interface SpotlightAction {
  /** Unique within this Spotlight. */
  id: string;
  label: string;
  description?: string;
  keywords?: string | string[];
  group?: string;
  icon?: React.ReactNode;
  rightSection?: React.ReactNode;
  disabled?: boolean;
  onSelect?: () => void;
}
export interface SpotlightProps {
  actions: SpotlightAction[];
  trigger?: React.ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  /** Match a KeyboardEvent.key with Ctrl or Meta, e.g. k. false disables. */
  shortcut?: string | false;
  /** Shortcuts do not intercept text editing by default. */
  enableInInputs?: boolean;
  title?: string;
  placeholder?: string;
  nothingFound?: React.ReactNode;
  limit?: number;
  filter?: (query: string, action: SpotlightAction) => boolean;
  onActionSelect?: (action: SpotlightAction) => void;
  closeOnSelect?: boolean;
  resetQueryOnClose?: boolean;
  className?: string;
}
export function Spotlight({ actions, trigger, open, defaultOpen = false, onOpenChange,
  query, defaultQuery = "", onQueryChange, shortcut = "k", enableInInputs = false,
  title, placeholder, nothingFound, limit = 20, filter, onActionSelect,
  closeOnSelect = true, resetQueryOnClose = true, className }: SpotlightProps) {
  const { locale } = useMtone();
  const zh = locale === "zh";
  const [localOpen, setLocalOpen] = React.useState(defaultOpen);
  const [localQuery, setLocalQuery] = React.useState(defaultQuery);
  const [active, setActive] = React.useState<string | null>(null);
  const shown = open ?? localOpen;
  const search = query ?? localQuery;
  const input = React.useRef<HTMLInputElement>(null);
  const id = React.useId();
  const changeQuery = (next: string) => {
    if (query === undefined) setLocalQuery(next);
    onQueryChange?.(next);
    setActive(null);
  };
  const changeOpen = (next: boolean) => {
    if (open === undefined) setLocalOpen(next);
    onOpenChange?.(next);
    if (!next && resetQueryOnClose) changeQuery("");
  };
  React.useEffect(() => {
    if (!shortcut) return;
    const listener = (event: KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (event.defaultPrevented || event.repeat || event.isComposing || event.altKey || event.shiftKey || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== shortcut.toLowerCase()) return;
      if (!enableInInputs && target !== input.current && target?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
      event.preventDefault();
      changeOpen(!shown);
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  });
  React.useEffect(() => {
    if (!shown) return;
    const frame = requestAnimationFrame(() => input.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [shown]);
  const normalized = search.trim().toLocaleLowerCase();
  const matches = actions.filter(action => filter ? filter(search, action) :
    [action.label, action.description, ...(Array.isArray(action.keywords) ? action.keywords : [action.keywords])].filter(Boolean).join(" ").toLocaleLowerCase().includes(normalized))
    .slice(0, Math.max(0, Number.isFinite(limit) ? Math.floor(limit) : 20));
  const enabled = matches.filter(action => !action.disabled);
  const current = enabled.find(action => action.id === active)?.id ?? enabled[0]?.id;
  React.useEffect(() => {
    if (shown && current) document.getElementById(`${id}-${encodeURIComponent(current)}`)?.scrollIntoView({ block: "nearest" });
  }, [current, shown, id]);
  const select = (action: SpotlightAction) => {
    if (action.disabled) return;
    if (closeOnSelect) changeOpen(false);
    action.onSelect?.();
    onActionSelect?.(action);
  };
  // Preserve action order; repeated group labels form separate accessible groups.
  const groups: { label?: string; actions: SpotlightAction[] }[] = [];
  for (const action of matches) {
    const last = groups[groups.length - 1];
    if (last && last.label === action.group) last.actions.push(action);
    else groups.push({ label: action.group, actions: [action] });
  }
  return <Dialog title={title ?? (zh ? "快捷操作" : "Command palette")} trigger={trigger}
    open={shown} onOpenChange={changeOpen} modal={false} className={["mt-spotlight", className].filter(Boolean).join(" ")}>
    <div className="mt-spotlight-search"><Search size={18} aria-hidden="true" />
      <Input ref={input} value={search} onChange={event => changeQuery(event.target.value)}
        placeholder={placeholder ?? (zh ? "搜索操作或页面…" : "Search actions or pages…")}
        aria-label={placeholder ?? (zh ? "搜索操作" : "Search actions")} role="combobox"
        aria-autocomplete="list" aria-expanded={shown} aria-controls={`${id}-list`}
        aria-activedescendant={current ? `${id}-${encodeURIComponent(current)}` : undefined}
        onKeyDown={event => {
          if (event.nativeEvent.isComposing) return;
          if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
            event.preventDefault();
            const index = enabled.findIndex(action => action.id === current);
            const next = event.key === "Home" ? 0 : event.key === "End" ? enabled.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + enabled.length) % enabled.length;
            setActive(enabled[next]?.id ?? null);
          } else if (event.key === "Enter" && current) {
            event.preventDefault();
            const action = enabled.find(action => action.id === current);
            if (action) select(action);
          }
        }} />
    </div>
    <div id={`${id}-list`} role="listbox" aria-label={zh ? "搜索结果" : "Search results"} className="mt-spotlight-list">
      {groups.map((group, index) => <div role="group" aria-label={group.label} key={index}>
        {group.label && <div className="mt-spotlight-group" aria-hidden="true">{group.label}</div>}
        {group.actions.map(action => <div key={action.id} id={`${id}-${encodeURIComponent(action.id)}`}
          role="option" aria-selected={current === action.id} aria-disabled={action.disabled || undefined}
          className="mt-spotlight-option" onMouseDown={event => event.preventDefault()}
          onMouseMove={() => !action.disabled && setActive(action.id)} onClick={() => select(action)}>
          {action.icon && <span className="mt-spotlight-icon" aria-hidden="true">{action.icon}</span>}
          <span className="mt-spotlight-text"><span>{action.label}</span>{action.description && <small>{action.description}</small>}</span>
          {action.rightSection && <span className="mt-spotlight-right">{action.rightSection}</span>}
        </div>)}
      </div>)}
    </div>
    {!matches.length && <div role="status" className="mt-spotlight-empty">{nothingFound ?? (zh ? "没有找到相关操作" : "No actions found")}</div>}
    <div className="mt-spotlight-footer">{zh ? "↑ ↓ 选择 · Enter 执行 · Esc 关闭" : "↑ ↓ Navigate · Enter Select · Esc Close"}</div>
  </Dialog>;
}
