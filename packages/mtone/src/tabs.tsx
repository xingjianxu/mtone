import React, { useEffect, useRef, useState } from "react";
import {
  DirectionProvider,
  useDirection,
} from "@base-ui/react/direction-provider";
import { Tabs as BTabs } from "@base-ui/react/tabs";
import { Menu } from "@base-ui/react/menu";
import { Plus, X, Ellipsis } from "lucide-react";
import { cn, useMtone, MtoneScope } from "./basic";

export interface TabItem {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  closable?: boolean;
  closeLabel?: string;
  forceRender?: boolean;
  destroyOnHidden?: boolean;
}
export interface TabsProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "defaultValue" | "onChange" | "children"
> {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  placement?: "top" | "bottom" | "start" | "end";
  variant?: "line" | "card" | "editable-card";
  size?: "small" | "medium" | "large";
  centered?: boolean;
  gap?: number;
  extraStart?: React.ReactNode;
  extraEnd?: React.ReactNode;
  activateOnFocus?: boolean;
  destroyOnHidden?: boolean;
  hideAdd?: boolean;
  addIcon?: React.ReactNode;
  addLabel?: string;
  moreLabel?: string;
  onEdit?: (action: "add" | "remove", value?: string) => void;
  onTabClick?: (
    value: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  reorderable?: boolean;
  onOrderChange?: (values: string[]) => void;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    items,
    value,
    defaultValue,
    onValueChange,
    label,
    placement = "top",
    variant = "line",
    size = "medium",
    centered = false,
    gap,
    extraStart,
    extraEnd,
    activateOnFocus = false,
    destroyOnHidden = true,
    hideAdd = false,
    addIcon,
    addLabel,
    moreLabel,
    onEdit,
    onTabClick,
    reorderable = false,
    onOrderChange,
    className,
    style,
    ...props
  },
  ref,
) {
  const { locale } = useMtone();
  const zh = locale === "zh";
  const inheritedDirection = useDirection();
  const direction =
    props.dir === "rtl" || props.dir === "ltr" ? props.dir : inheritedDirection;
  const [internal, setInternal] = useState<string | null>(
    () => defaultValue ?? items.find((i) => !i.disabled)?.value ?? null,
  );
  const controlled = value !== undefined;
  const selected = controlled ? value : internal;
  const [visited, setVisited] = useState<Set<string>>(
    () => new Set(selected == null ? [] : [selected]),
  );
  const listRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);
  const dragValue = useRef<string | null>(null);
  const vertical = placement === "start" || placement === "end";
  const focusAfterRemove = useRef<{
    key: string;
    trigger: Element | null;
  } | null>(null);
  const addRef = useRef<HTMLButtonElement>(null);
  const menuSelection = useRef(false);
  const select = (next: string | null) => {
    if (!controlled) setInternal(next);
    if (next !== null && next !== selected) onValueChange?.(next);
  };
  useEffect(() => {
    if (
      !controlled &&
      !items.some((item) => item.value === internal && !item.disabled)
    ) {
      const next = items.find((item) => !item.disabled)?.value ?? null;
      if (next !== internal) {
        setInternal(next);
        if (next !== null) onValueChange?.(next);
      }
    }
  }, [items, internal, controlled, onValueChange]);
  useEffect(() => {
    if (selected !== null && selected !== undefined) {
      setVisited((previous) =>
        previous.has(selected) ? previous : new Set([...previous, selected]),
      );
    }
  }, [selected]);
  // Prune removed keys so re-added panels start with a fresh lifecycle.
  useEffect(() => {
    setVisited(
      (previous) =>
        new Set(
          [...previous].filter((key) => items.some((i) => i.value === key)),
        ),
    );
  }, [items]);
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () =>
      setOverflow(
        vertical
          ? list.scrollHeight > list.clientHeight + 1
          : list.scrollWidth > list.clientWidth + 1,
      );
    measure();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(list);
    Array.from(list.children).forEach((child) => observer?.observe(child));
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [items, vertical, size, extraStart, extraEnd]);
  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLButtonElement>(
      '[role="tab"][aria-selected="true"]',
    );
    // Scroll only the tab strip, never a containing document or dialog.
    const list = listRef.current;
    if (active && list) {
      const a = active.getBoundingClientRect(),
        b = list.getBoundingClientRect();
      if (vertical) {
        if (a.top < b.top) list.scrollTop -= b.top - a.top;
        else if (a.bottom > b.bottom) list.scrollTop += a.bottom - b.bottom;
      } else {
        if (a.left < b.left) list.scrollLeft -= b.left - a.left;
        else if (a.right > b.right) list.scrollLeft += a.right - b.right;
      }
    }
    const pending = focusAfterRemove.current;
    if (pending && !items.some((item) => item.value === pending.key)) {
      if (!active && items.some((item) => !item.disabled) && !controlled)
        return;
      focusAfterRemove.current = null;
      if (
        document.activeElement === document.body ||
        document.activeElement === pending.trigger
      ) {
        (active ?? addRef.current)?.focus({ preventScroll: true });
      }
    }
  }, [selected, items, vertical]);
  const requestRemove = (item: TabItem) => {
    if (!item.disabled && onEdit) {
      focusAfterRemove.current = {
        key: item.value,
        trigger: document.activeElement,
      };
      onEdit("remove", item.value);
    }
  };
  const reorder = (from: string, to: string) => {
    if (!reorderable || !onOrderChange || from === to) return;
    const values = items.map((i) => i.value),
      source = values.indexOf(from),
      target = values.indexOf(to);
    if (
      source < 0 ||
      target < 0 ||
      items[source].disabled ||
      items[target].disabled
    )
      return;
    values.splice(source, 1);
    values.splice(target, 0, from);
    onOrderChange(values);
  };
  return (
    <DirectionProvider direction={direction}>
      <BTabs.Root
        {...props}
        ref={ref}
        dir={direction}
        className={cn("mt-tabs", className)}
        style={
          {
            ...style,
            ...(gap !== undefined
              ? { "--mt-tabs-gap": `${Math.max(0, gap)}px` }
              : {}),
          } as React.CSSProperties
        }
        data-placement={placement}
        data-variant={variant}
        data-size={size}
        data-centered={centered || undefined}
        orientation={vertical ? "vertical" : "horizontal"}
        value={selected}
        onValueChange={(next) => select(next == null ? null : String(next))}
      >
        <div className="mt-tab-bar">
          {extraStart != null && (
            <div className="mt-tab-extra">{extraStart}</div>
          )}
          <BTabs.List
            ref={listRef}
            className="mt-tab-list"
            aria-label={label ?? (zh ? "标签页" : "Tabs")}
            activateOnFocus={activateOnFocus}
          >
            {items.map((item) => (
              <div
                className="mt-tab-item"
                key={item.value}
                data-active={selected === item.value || undefined}
                onDragOver={(event) => {
                  if (reorderable && dragValue.current && !item.disabled)
                    event.preventDefault();
                }}
                onDrop={(event) => {
                  if (dragValue.current) {
                    event.preventDefault();
                    reorder(dragValue.current, item.value);
                    dragValue.current = null;
                  }
                }}
              >
                <BTabs.Tab
                  className="mt-tab"
                  value={item.value}
                  disabled={item.disabled}
                  draggable={reorderable && !!onOrderChange && !item.disabled}
                  onDragStart={(event) => {
                    dragValue.current = item.value;
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", item.value);
                  }}
                  onDragEnd={() => {
                    dragValue.current = null;
                  }}
                  onClick={(event) => onTabClick?.(item.value, event)}
                  onKeyDown={(event) => {
                    if (
                      reorderable &&
                      event.altKey &&
                      event.shiftKey &&
                      [
                        "ArrowLeft",
                        "ArrowRight",
                        "ArrowUp",
                        "ArrowDown",
                      ].includes(event.key)
                    ) {
                      event.preventDefault();
                      event.stopPropagation();
                      const rtl =
                        getComputedStyle(event.currentTarget).direction ===
                        "rtl";
                      let delta =
                        event.key === "ArrowLeft" || event.key === "ArrowUp"
                          ? -1
                          : 1;
                      if (!vertical && rtl) delta *= -1;
                      const target = items[items.indexOf(item) + delta];
                      if (target) reorder(item.value, target.value);
                    }
                    if (
                      event.key === "Delete" &&
                      variant === "editable-card" &&
                      item.closable !== false
                    ) {
                      event.preventDefault();
                      requestRemove(item);
                    }
                  }}
                >
                  {item.icon != null && (
                    <span className="mt-tab-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className="mt-tab-label">{item.label}</span>
                </BTabs.Tab>
                {variant === "editable-card" && item.closable !== false && (
                  <button
                    type="button"
                    className="mt-tab-close"
                    disabled={item.disabled || !onEdit}
                    aria-label={
                      item.closeLabel ??
                      `${zh ? "关闭" : "Close"} ${typeof item.label === "string" ? item.label : item.value}`
                    }
                    onClick={() => requestRemove(item)}
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </BTabs.List>
          {overflow && (
            <Menu.Root>
              <Menu.Trigger
                className="mt-tab-more"
                aria-label={moreLabel ?? (zh ? "更多标签" : "More tabs")}
              >
                <Ellipsis size={16} />
              </Menu.Trigger>
              <Menu.Portal>
                <MtoneScope>
                  <Menu.Positioner
                    sideOffset={4}
                    className="mt-popover-positioner"
                  >
                    <Menu.Popup
                      className="mt-menu mt-tabs-menu"
                      finalFocus={() => {
                        if (menuSelection.current) {
                          menuSelection.current = false;
                          return (
                            listRef.current?.querySelector<HTMLButtonElement>(
                              '[role="tab"][aria-selected="true"]',
                            ) ?? true
                          );
                        }
                        return true;
                      }}
                    >
                      {items.map((item) => (
                        <Menu.Item
                          key={item.value}
                          className="mt-menu-item"
                          disabled={item.disabled}
                          onClick={() => {
                            select(item.value);
                            menuSelection.current = true;
                          }}
                        >
                          {item.label}
                        </Menu.Item>
                      ))}
                    </Menu.Popup>
                  </Menu.Positioner>
                </MtoneScope>
              </Menu.Portal>
            </Menu.Root>
          )}
          {variant === "editable-card" && !hideAdd && (
            <button
              type="button"
              className="mt-tab-add"
              ref={addRef}
              disabled={!onEdit}
              aria-label={addLabel ?? (zh ? "添加标签" : "Add tab")}
              onClick={() => onEdit?.("add")}
            >
              {addIcon ?? <Plus size={16} aria-hidden="true" />}
            </button>
          )}
          {extraEnd != null && <div className="mt-tab-extra">{extraEnd}</div>}
        </div>
        {items.map((item) => (
          <BTabs.Panel
            className="mt-tab-panel"
            key={item.value}
            value={item.value}
            keepMounted={
              !!item.forceRender ||
              (!(item.destroyOnHidden ?? destroyOnHidden) &&
                (visited.has(item.value) || selected === item.value))
            }
          >
            {item.content}
          </BTabs.Panel>
        ))}
      </BTabs.Root>
    </DirectionProvider>
  );
});
