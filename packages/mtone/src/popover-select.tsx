import React from "react";
import { Check, Search } from "lucide-react";
import { useMtone } from "./basic";
import { Input } from "./input";
import type { PopoverProps } from "./interactive";

export interface PopoverSelectItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface PopoverSelectProps extends Omit<PopoverProps, "content" | "unstyled"> {
  items: readonly PopoverSelectItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  searchPlaceholder?: string;
}

export function PopoverSelectContent({ items, value, searchPlaceholder, select, open, inputRef }: {
  items: readonly PopoverSelectItem[];
  value: string | null | undefined;
  searchPlaceholder?: string;
  select: (value: string) => void;
  open: boolean;
  inputRef: React.Ref<HTMLInputElement>;
}) {
  const { locale } = useMtone();
  const searchLabel = locale === "zh" ? "搜索选项" : "Search options";
  const listId = React.useId();
  const listRef = React.useRef<HTMLDivElement>(null);
  const composing = React.useRef(false);
  const [query, setQuery] = React.useState("");
  const [activeValue, setActiveValue] = React.useState<string | null>(null);
  const needle = query.trim().toLocaleLowerCase();
  const filtered = items.filter((item) => item.label.toLocaleLowerCase().includes(needle));
  const enabled = filtered.filter((item) => !item.disabled);
  const active = enabled.find((item) => item.value === activeValue) ??
    enabled.find((item) => item.value === value) ?? enabled[0];
  const activeIndex = active ? filtered.indexOf(active) : -1;
  const optionId = (index: number) => `${listId}-option-${index}`;
  const activeId = activeIndex < 0 ? undefined : optionId(activeIndex);
  const hasIcons = items.some((item) => item.icon != null && item.icon !== false);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveValue(null);
      composing.current = false;
      if (listRef.current) listRef.current.scrollTop = 0;
    }
  }, [open]);

  React.useLayoutEffect(() => {
    const list = listRef.current;
    const row = activeId ? list?.ownerDocument.getElementById(activeId) : undefined;
    if (!open || !list || !row) return;
    const bounds = list.getBoundingClientRect();
    const option = row.getBoundingClientRect();
    if (option.top < bounds.top) list.scrollTop += option.top - bounds.top;
    else if (option.bottom > bounds.bottom) list.scrollTop += option.bottom - bounds.bottom;
  }, [activeId, open, query]);

  return (
    <div className="mt-popover-select">
      <Input ref={inputRef} role="combobox" aria-label={searchLabel} aria-autocomplete="list"
        aria-expanded={open} aria-controls={listId} aria-activedescendant={open ? activeId : undefined}
        autoComplete="off" placeholder={searchPlaceholder ?? searchLabel}
        prefix={<Search size={16} aria-hidden="true" />} value={query}
        onCompositionStart={() => { composing.current = true; }}
        onCompositionEnd={() => { composing.current = false; }}
        onChange={(event) => {
          setQuery(event.currentTarget.value);
          setActiveValue(null);
          if (listRef.current) listRef.current.scrollTop = 0;
        }}
        onKeyDown={(event) => {
          if (composing.current || event.nativeEvent.isComposing) {
            if (event.key === "Escape") event.stopPropagation();
            return;
          }
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!active) return;
            const index = enabled.indexOf(active) + (event.key === "ArrowDown" ? 1 : -1);
            setActiveValue(enabled[Math.max(0, Math.min(index, enabled.length - 1))].value);
          } else if (event.key === "Enter" && active) {
            event.preventDefault();
            select(active.value);
          }
        }} />
      <div className="mt-popover-select-body">
        <div ref={listRef} id={listId} role="listbox" aria-label={locale === "zh" ? "选项" : "Options"}
          className="mt-popover-select-list">
          {filtered.map((item, index) => (
            <div key={item.value} id={optionId(index)} role="option"
              aria-selected={item.value === value} aria-disabled={item.disabled || undefined}
              data-highlighted={item === active || undefined} className="mt-popover-select-option"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => { if (!item.disabled) select(item.value); }}>
              <span aria-hidden="true" className="mt-popover-select-mark">
                {item.value === value && <Check size={16} />}
              </span>
              {hasIcons && <span aria-hidden="true" className="mt-popover-select-icon">{item.icon}</span>}
              <span className="mt-popover-select-label">{item.label}</span>
            </div>
          ))}
        </div>
        {!filtered.length && (
          <div role="status" className="mt-popover-select-empty">
            {locale === "zh" ? "没有匹配的选项" : "No matching options"}
          </div>
        )}
      </div>
    </div>
  );
}
