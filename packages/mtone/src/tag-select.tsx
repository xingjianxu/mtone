import * as React from "react";
import { ChevronDown } from "lucide-react";
import { useFieldsetDisabled } from "./fieldset-context";

export interface TagSelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface TagSelectProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onChange"
> {
  options: readonly TagSelectOption[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  selectAll?: boolean;
  selectAllLabel?: string;
  expandable?: boolean;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  expandLabel?: string;
  collapseLabel?: string;
}

/** An inline group of multi-select tags with optional responsive row disclosure. */
export function TagSelect({
  options,
  value,
  defaultValue = [],
  onValueChange,
  disabled,
  selectAll = false,
  selectAllLabel = "全选",
  expandable = true,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  expandLabel = "展开",
  collapseLabel = "收起",
  className,
  ...props
}: TagSelectProps) {
  const isDisabled = useFieldsetDisabled(disabled);
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [internalExpanded, setInternalExpanded] =
    React.useState(defaultExpanded);
  const [visibleCount, setVisibleCount] = React.useState(
    options.length + Number(selectAll),
  );
  const [overflow, setOverflow] = React.useState(false);
  const isExpanded = expanded ?? internalExpanded;
  const selected = new Set(value ?? internalValue);
  const enabledValues = selectAll
    ? options.filter((option) => !option.disabled).map((option) => option.value)
    : [];
  const selectedEnabled = enabledValues.filter((item) =>
    selected.has(item),
  ).length;
  const allSelected =
    enabledValues.length > 0 && selectedEnabled === enabledValues.length;
  const commitSelection = (next: string[]) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };
  const list = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const id = React.useId();

  React.useLayoutEffect(() => {
    const row = list.current;
    if (!row || !expandable) return;
    const update = () => {
      const first = row.firstElementChild as HTMLElement | null;
      if (!first) {
        setVisibleCount(0);
        setOverflow(false);
        return;
      }
      const at = first.offsetTop;
      const children = Array.from(row.children) as HTMLElement[];
      const available = row.parentElement?.parentElement?.clientWidth ?? 0;
      setOverflow(
        available > 0 &&
          children.length > 1 &&
          children.reduce((sum, child) => {
            const rectWidth = child.getBoundingClientRect().width;
            return (
              sum +
              Math.min(
                available,
                child.scrollWidth > child.clientWidth
                  ? child.scrollWidth + 2
                  : rectWidth,
              )
            );
          }, 0) +
            (children.length - 1) *
              (parseFloat(getComputedStyle(row).columnGap) || 0) >
            available + 0.5,
      );
      const next = children.findIndex((child) => child.offsetTop > at + 1);
      const count = next < 0 ? children.length : next;
      const focused = children.indexOf(document.activeElement as HTMLElement);
      if (!isExpanded && focused >= count) {
        if (!isDisabled) trigger.current?.focus();
        else children.find((child) => !child.hasAttribute("disabled"))?.focus();
      }
      setVisibleCount(count);
    };
    update();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
    const observer = new ResizeObserver(update);
    observer.observe(row);
    for (const child of row.children) observer.observe(child);
    return () => observer.disconnect();
  }, [options, expandable, isExpanded, isDisabled, selectAll, selectAllLabel]);

  const hasOverflow = expandable && overflow;
  return (
    <div
      role="group"
      {...props}
      className={["mt-tag-select", className].filter(Boolean).join(" ")}
    >
      <div
        className="mt-tag-select-viewport"
        data-collapsed={hasOverflow && !isExpanded ? "" : undefined}
      >
        <div className="mt-tag-select-options" id={id} ref={list}>
          {selectAll && (
            <button
              type="button"
              className="mt-tag-select-option"
              aria-pressed={
                allSelected ? true : selectedEnabled > 0 ? "mixed" : false
              }
              disabled={isDisabled || enabledValues.length === 0}
              onClick={() => {
                const enabled = new Set(enabledValues);
                commitSelection(
                  allSelected
                    ? [...selected].filter((item) => !enabled.has(item))
                    : [...new Set([...selected, ...enabledValues])],
                );
              }}
            >
              {selectAllLabel}
            </button>
          )}
          {options.map((option, index) => {
            const checked = selected.has(option.value);
            const hidden =
              hasOverflow &&
              !isExpanded &&
              index + Number(selectAll) >= visibleCount;
            return (
              <button
                key={option.value}
                type="button"
                className="mt-tag-select-option"
                aria-pressed={checked}
                data-overflow={hidden ? "" : undefined}
                tabIndex={hidden ? -1 : undefined}
                disabled={isDisabled || option.disabled}
                onClick={() => {
                  const next = checked
                    ? Array.from(selected).filter(
                        (item) => item !== option.value,
                      )
                    : [...selected, option.value];
                  commitSelection(next);
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      {expandable && (
        <button
          ref={trigger}
          hidden={!hasOverflow}
          className="mt-tag-select-trigger"
          type="button"
          aria-controls={id}
          aria-expanded={isExpanded}
          disabled={isDisabled}
          onClick={() => {
            if (expanded === undefined) setInternalExpanded(!isExpanded);
            onExpandedChange?.(!isExpanded);
          }}
        >
          {isExpanded ? collapseLabel : expandLabel}
          <ChevronDown size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
