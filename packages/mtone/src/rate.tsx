import * as React from "react";
import { Star } from "lucide-react";
import { Tooltip as BTooltip } from "@base-ui/react/tooltip";
import { cn, MtoneScope, useMtone } from "./basic";

export interface RateCharacterInfo {
  /** Zero-based character index. */
  index: number;
  /** Committed, normalized value (hover never changes this). */
  value: number;
  /** Value currently painted, including a pointer preview. */
  displayValue: number;
  count: number;
  disabled: boolean;
}
export interface RateProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "onChange" | "defaultValue" | "children"
> {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  count?: number;
  allowHalf?: boolean;
  allowClear?: boolean;
  disabled?: boolean;
  keyboard?: boolean;
  autoFocus?: boolean;
  size?: "small" | "medium" | "large";
  /** Display-only content; do not supply links, inputs or other interactive nodes. */
  character?: React.ReactNode | ((info: RateCharacterInfo) => React.ReactNode);
  tooltips?: readonly string[];
  /** undefined means pointer preview ended. */
  onHoverChange?: (value: number | undefined) => void;
}

function normalize(value: number, count: number, step: number) {
  if (!Number.isFinite(value))
    throw new RangeError("Rate value must be finite");
  return Math.round(Math.max(0, Math.min(count, value)) / step) * step;
}

type Preview = { value: number; count: number; step: number; selected: number };

/** Compact star rating, exposed as one keyboard-focusable slider. */
export const Rate = React.forwardRef<HTMLSpanElement, RateProps>(function Rate(
  {
    value,
    defaultValue = 0,
    onChange,
    count = 5,
    allowHalf = false,
    allowClear = true,
    disabled = false,
    keyboard = true,
    autoFocus = false,
    size = "medium",
    character,
    tooltips,
    onHoverChange,
    className,
    style,
    dir,
    tabIndex = 0,
    onKeyDown,
    onFocus,
    onBlur,
    onPointerLeave,
    onPointerCancel,
    ...rest
  },
  forwardedRef,
) {
  if (!Number.isInteger(count) || count < 1)
    throw new RangeError("Rate count must be a positive integer");
  const { locale } = useMtone();
  const step = allowHalf ? 0.5 : 1;
  const [innerValue, setInnerValue] = React.useState(defaultValue);
  const selected = normalize(
    value === undefined ? innerValue : value,
    count,
    step,
  );
  const [preview, setPreview] = React.useState<Preview>();
  const previewRef = React.useRef<Preview | undefined>(undefined);
  const [focused, setFocused] = React.useState(false);
  const [tooltipDismissed, setTooltipDismissed] = React.useState(false);
  const popup = React.useRef<HTMLDivElement>(null);
  const tooltipId = React.useId();
  const root = React.useRef<HTMLSpanElement | null>(null);
  const hoverCallback = React.useRef(onHoverChange);
  hoverCallback.current = onHoverChange;
  const hover =
    !disabled &&
    preview?.count === count &&
    preview.step === step &&
    preview.selected === selected
      ? preview.value
      : undefined;
  const displayValue = hover ?? selected;
  const tooltipIndex = Math.ceil(hover ?? (focused ? selected : 0)) - 1;
  const hint = tooltips?.[tooltipIndex];
  const tooltipOpen = !disabled && !tooltipDismissed && Boolean(hint);
  const selectedHint =
    selected > 0 ? tooltips?.[Math.ceil(selected) - 1] : undefined;
  const setRoot = React.useCallback(
    (node: HTMLSpanElement | null) => {
      root.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );
  const clearPreview = React.useCallback(() => {
    if (previewRef.current === undefined) return;
    previewRef.current = undefined;
    setPreview(undefined);
    hoverCallback.current?.(undefined);
  }, []);
  React.useEffect(() => {
    clearPreview();
  }, [disabled, count, step, selected, clearPreview]);
  React.useEffect(() => {
    if (autoFocus && !disabled) root.current?.focus();
  }, [autoFocus, disabled]);

  function isRtl() {
    // Computed style includes ancestors and stylesheet direction, not just this prop.
    return (
      root.current &&
      (getComputedStyle(root.current).direction === "rtl" || dir === "rtl")
    );
  }
  function pointValue(
    index: number,
    element: HTMLElement,
    clientX: number,
    syntheticClick = false,
  ) {
    if (!allowHalf || syntheticClick) return index + 1;
    const bounds = element.getBoundingClientRect();
    if (!bounds.width) return index + 1;
    const half = isRtl()
      ? clientX > bounds.left + bounds.width / 2
      : clientX < bounds.left + bounds.width / 2;
    return index + (half ? 0.5 : 1);
  }
  function commit(next: number) {
    if (disabled) return;
    next = normalize(next, count, step);
    clearPreview();
    setTooltipDismissed(false);
    if (next === selected) return;
    if (value === undefined) setInnerValue(next);
    onChange?.(next);
  }
  function handleKeyDown(event: React.KeyboardEvent<HTMLSpanElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled) return;
    if (event.key === "Escape" && tooltipOpen) {
      event.preventDefault();
      clearPreview();
      setTooltipDismissed(true);
      return;
    }
    if (
      event.defaultPrevented ||
      disabled ||
      !keyboard ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    let next: number;
    const min = allowClear ? 0 : step;
    switch (event.key) {
      case "ArrowRight":
        next = selected + (isRtl() ? -step : step);
        break;
      case "ArrowLeft":
        next = selected + (isRtl() ? step : -step);
        break;
      case "ArrowUp":
        next = selected + step;
        break;
      case "ArrowDown":
        next = selected - step;
        break;
      case "Home":
        next = min;
        break;
      case "End":
        next = count;
        break;
      case "Delete":
      case "Backspace":
        if (!allowClear) return;
        next = 0;
        break;
      default:
        return;
    }
    event.preventDefault();
    commit(Math.max(min, next));
  }
  return (
    <BTooltip.Provider>
      <BTooltip.Root
        open={tooltipOpen}
        onOpenChange={(open) => {
          if (!open) setTooltipDismissed(true);
        }}
      >
        <span
          {...rest}
          ref={setRoot}
          role="slider"
          className={cn("mt-rate", `mt-rate-${size}`, className)}
          style={style}
          dir={dir}
          tabIndex={disabled ? -1 : tabIndex}
          aria-label={
            rest["aria-label"] ??
            (rest["aria-labelledby"]
              ? undefined
              : locale === "zh"
                ? "评分"
                : "Rating")
          }
          aria-valuemin={0}
          aria-valuemax={count}
          aria-valuenow={selected}
          aria-valuetext={
            rest["aria-valuetext"] ??
            `${selected} / ${count}${selectedHint ? `${locale === "zh" ? "，" : ", "}${selectedHint}` : ""}`
          }
          aria-describedby={
            [rest["aria-describedby"], tooltipOpen ? tooltipId : undefined]
              .filter(Boolean)
              .join(" ") || undefined
          }
          aria-orientation="horizontal"
          aria-disabled={disabled || undefined}
          data-disabled={disabled || undefined}
          data-preview={hover}
          onKeyDown={handleKeyDown}
          onFocus={(event) => {
            setFocused(true);
            setTooltipDismissed(false);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            clearPreview();
            onBlur?.(event);
          }}
          onPointerLeave={(event) => {
            if (!(
              event.relatedTarget instanceof Node &&
              popup.current?.contains(event.relatedTarget)
            ))
              clearPreview();
            onPointerLeave?.(event);
          }}
          onPointerCancel={(event) => {
            clearPreview();
            onPointerCancel?.(event);
          }}
        >
          {Array.from({ length: count }, (_, index) => {
            const fill = Math.max(0, Math.min(1, displayValue - index));
            const content =
              typeof character === "function"
                ? character({
                    index,
                    value: selected,
                    displayValue,
                    count,
                    disabled,
                  })
                : (character ?? <Star fill="currentColor" strokeWidth={0} />);
            return (
              <span
                key={index}
                className="mt-rate-character"
                aria-hidden="true"
                data-fill={fill}
                onPointerMove={(event) => {
                  if (disabled || event.pointerType === "touch") return;
                  setTooltipDismissed(false);
                  const next = pointValue(
                    index,
                    event.currentTarget,
                    event.clientX,
                  );
                  if (previewRef.current?.value === next) return;
                  const updated = { value: next, count, step, selected };
                  previewRef.current = updated;
                  setPreview(updated);
                  onHoverChange?.(next);
                }}
                onClick={(event) => {
                  if (disabled) return;
                  root.current?.focus({ preventScroll: true });
                  const next = pointValue(
                    index,
                    event.currentTarget,
                    event.clientX,
                    event.detail === 0,
                  );
                  commit(allowClear && next === selected ? 0 : next);
                }}
              >
                <span className="mt-rate-empty">{content}</span>
                <span
                  className="mt-rate-fill"
                  style={{ width: `${fill * 100}%` }}
                >
                  <span className="mt-rate-filled-character">{content}</span>
                </span>
              </span>
            );
          })}
        </span>
        <BTooltip.Portal>
          <MtoneScope>
            <BTooltip.Positioner
              anchor={root}
              side="top"
              sideOffset={0}
              collisionPadding={8}
              className="mt-positioner"
            >
              <BTooltip.Popup
                ref={popup}
                id={tooltipId}
                className="mt-tooltip mt-rate-tooltip"
                role="tooltip"
                onPointerLeave={(event) => {
                  if (!(
                    event.relatedTarget instanceof Node &&
                    root.current?.contains(event.relatedTarget)
                  ))
                    clearPreview();
                }}
              >
                {hint}
              </BTooltip.Popup>
            </BTooltip.Positioner>
          </MtoneScope>
        </BTooltip.Portal>
      </BTooltip.Root>
    </BTooltip.Provider>
  );
});
