import { useFieldsetDisabled } from "./fieldset-context";
import * as React from "react";
import { createPortal } from "react-dom";
import { X, LoaderCircle } from "lucide-react";
import { cn, useMtone } from "./basic";
import {
  findMention,
  insertMention,
  type MentionMatch,
} from "./mentions-model";
export { getMentions } from "./mentions-model";
export type MentionOption = {
  value: string;
  label?: React.ReactNode;
  key?: React.Key;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
};
export type MentionsSemantic =
  "root" | "textarea" | "popup" | "option" | "clear";
export type MentionsRef = {
  nativeElement: HTMLTextAreaElement | null;
  focus: (options?: FocusOptions) => void;
  blur: () => void;
};
export type MentionsProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "defaultValue" | "onChange" | "onSelect" | "prefix" | "children"
> & {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options?: MentionOption[];
  prefix?: string | string[];
  split?: string;
  onSearch?: (text: string, prefix: string) => void;
  onSelect?: (option: MentionOption, prefix: string) => void;
  filterOption?: false | ((input: string, option: MentionOption) => boolean);
  validateSearch?: (text: string, split: string) => boolean;
  loading?: boolean;
  notFoundContent?: React.ReactNode;
  placement?: "top" | "bottom";
  getPopupContainer?: () => HTMLElement;
  popupRender?: (menu: React.ReactElement) => React.ReactNode;
  onPopupScroll?: React.UIEventHandler<HTMLDivElement>;
  size?: "sm" | "md" | "lg";
  status?: "error" | "warning";
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  allowClear?:
    | boolean
    | { clearIcon?: React.ReactNode; label?: string; tabIndex?: number };
  onClear?: () => void;
  classNames?: Partial<Record<MentionsSemantic, string>>;
  styles?: Partial<Record<MentionsSemantic, React.CSSProperties>>;
};
const EMPTY_OPTIONS: MentionOption[] = [];
// A mirror follows the browser's actual line wrapping, padding and scroll offset.
function caretRect(input: HTMLTextAreaElement, caret: number) {
  const computed = getComputedStyle(input),
    rect = input.getBoundingClientRect();
  const mirror = document.createElement("div");
  for (const key of [
    "fontFamily",
    "fontSize",
    "fontWeight",
    "fontStyle",
    "letterSpacing",
    "lineHeight",
    "textIndent",
    "textTransform",
    "tabSize",
    "wordSpacing",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "boxSizing",
    "direction",
  ] as const)
    mirror.style[key] = computed[key];
  Object.assign(mirror.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    visibility: "hidden",
    whiteSpace: input.wrap === "off" ? "pre" : "pre-wrap",
    overflowWrap: "break-word",
    borderStyle: "solid",
    width: `${input.clientWidth ? input.clientWidth + parseFloat(computed.borderLeftWidth) + parseFloat(computed.borderRightWidth) : rect.width}px`,
  });
  mirror.textContent = input.value.slice(0, caret);
  const marker = document.createElement("span");
  marker.textContent = input.value.slice(caret) || "\u200b";
  mirror.append(marker);
  document.body.append(mirror);
  const markerRect =
      marker.getClientRects()[0] ?? marker.getBoundingClientRect(),
    mirrorRect = mirror.getBoundingClientRect();
  const left = rect.left + markerRect.left - mirrorRect.left - input.scrollLeft;
  const top = rect.top + markerRect.top - mirrorRect.top - input.scrollTop;
  mirror.remove();
  return {
    left: Math.min(rect.right, Math.max(rect.left, left)),
    top: Math.min(rect.bottom, Math.max(rect.top, top)),
    height: parseFloat(computed.lineHeight) || 20,
  };
}
export const Mentions = React.forwardRef<MentionsRef, MentionsProps>(
  function Mentions(
    {
      value: controlled,
      defaultValue = "",
      onChange,
      options = EMPTY_OPTIONS,
      prefix = "@",
      split = " ",
      onSearch,
      onSelect,
      filterOption,
      validateSearch,
      loading = false,
      notFoundContent,
      placement = "bottom",
      getPopupContainer,
      popupRender,
      onPopupScroll,
      size = "md",
      status,
      autoSize = false,
      allowClear = false,
      onClear,
      classNames,
      styles,
      className,
      style,
      disabled,
      readOnly,
      onFocus,
      onBlur,
      onKeyDown,
      onCompositionStart,
      onCompositionEnd,
      onClick,
      onKeyUp,
      onScroll,
      rows = 3,
      ...native
    },
    forwardedRef,
  ) {
    disabled = useFieldsetDisabled(disabled);
    const { locale, theme, tokens } = useMtone();
    const inputRef = React.useRef<HTMLTextAreaElement>(null),
      popupRef = React.useRef<HTMLDivElement>(null);
    const [internal, setInternal] = React.useState(defaultValue),
      text = controlled ?? internal;
    const [focused, setFocused] = React.useState(false),
      [composing, setComposing] = React.useState(false),
      [dismissed, setDismissed] = React.useState(false);
    const composingRef = React.useRef(false);
    const attemptedEdit = React.useRef<string | null>(null);
    const [selection, setSelection] = React.useState({
      start: text.length,
      end: text.length,
    });
    const [active, setActive] = React.useState(0),
      [position, setPosition] = React.useState({
        left: 0,
        top: 0,
        maxHeight: 240,
      });
    const listId = React.useId();
    const searchRef = React.useRef(onSearch);
    searchRef.current = onSearch;
    const match =
      focused &&
      !disabled &&
      !readOnly &&
      !composing &&
      (attemptedEdit.current === null || attemptedEdit.current === text) &&
      selection.start === selection.end
        ? findMention(text, selection.start, prefix, split, validateSearch)
        : null;
    const open = !!match && !dismissed;
    const filtered = match
      ? options.filter(
          (option) =>
            filterOption === false ||
            (filterOption
              ? filterOption(match.query, option)
              : option.value
                  .toLocaleLowerCase()
                  .includes(match.query.toLocaleLowerCase())),
        )
      : [];
    const enabled = filtered
      .map((option, index) => (option.disabled ? -1 : index))
      .filter((index) => index >= 0);
    const activeIndex = enabled.includes(active) ? active : (enabled[0] ?? -1);
    const activeId =
      open && !loading && activeIndex >= 0
        ? `${listId}-${activeIndex}`
        : undefined;
    React.useLayoutEffect(() => {
      if (attemptedEdit.current !== null && attemptedEdit.current !== text) {
        // React restores a refused controlled edit after the input event. Never
        // apply its old caret offsets to the parent's accepted value.
        setDismissed(true);
        setSelection({ start: text.length, end: text.length });
      }
      attemptedEdit.current = null;
    });
    React.useLayoutEffect(() => {
      const input = inputRef.current;
      if (input)
        setSelection({ start: input.selectionStart, end: input.selectionEnd });
    }, [text]);
    React.useImperativeHandle(
      forwardedRef,
      () => ({
        nativeElement: inputRef.current,
        focus: (options) => inputRef.current?.focus(options),
        blur: () => inputRef.current?.blur(),
      }),
      [],
    );
    React.useEffect(() => {
      if (open && match) searchRef.current?.(match.query, match.prefix);
    }, [open, match?.query, match?.prefix]);
    React.useEffect(() => {
      setActive(0);
    }, [match?.query, match?.prefix]);
    React.useEffect(() => {
      if (activeId)
        document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
    }, [activeId]);
    const measure = React.useCallback(() => {
      const input = inputRef.current,
        popup = popupRef.current;
      if (!input || !popup) return;
      const caret = caretRect(input, input.selectionStart),
        gap = 4;
      const width = popup.getBoundingClientRect().width,
        height = popup.scrollHeight;
      const below = Math.max(
          0,
          window.innerHeight - caret.top - caret.height - gap - 8,
        ),
        above = Math.max(0, caret.top - gap - 8);
      const preferTop = placement === "top";
      const topSide = preferTop
        ? above >= Math.min(height, 160) || above >= below
        : below < Math.min(height, 160) && above > below;
      const maxHeight = Math.min(240, topSide ? above : below);
      setPosition({
        left: Math.max(8, Math.min(caret.left, window.innerWidth - width - 8)),
        top: topSide
          ? Math.max(8, caret.top - gap - Math.min(height, maxHeight))
          : caret.top + caret.height + gap,
        maxHeight,
      });
    }, [placement]);
    React.useLayoutEffect(() => {
      if (!open) return;
      measure();
      const observer = new ResizeObserver(measure);
      if (inputRef.current) observer.observe(inputRef.current);
      if (popupRef.current) observer.observe(popupRef.current);
      window.addEventListener("resize", measure);
      window.addEventListener("scroll", measure, true);
      return () => {
        observer.disconnect();
        window.removeEventListener("resize", measure);
        window.removeEventListener("scroll", measure, true);
      };
    }, [open, text, selection.start, loading, filtered.length, measure]);
    React.useLayoutEffect(() => {
      const input = inputRef.current;
      if (!input || !autoSize) return;
      const resize = () => {
        const css = getComputedStyle(input),
          line = parseFloat(css.lineHeight) || 20;
        const extra =
          parseFloat(css.paddingTop) +
          parseFloat(css.paddingBottom) +
          parseFloat(css.borderTopWidth) +
          parseFloat(css.borderBottomWidth);
        const config = typeof autoSize === "object" ? autoSize : {};
        const min = Math.max(1, config.minRows ?? rows),
          max = Math.max(min, config.maxRows ?? Infinity);
        // Reset below the intrinsic rows height before measuring content, so
        // minRows can shrink a textarea whose native rows default is larger.
        input.style.height = "0px";
        const height = Math.min(
          line * max + extra,
          Math.max(
            line * min + extra,
            input.scrollHeight +
              parseFloat(css.borderTopWidth) +
              parseFloat(css.borderBottomWidth),
          ),
        );
        input.style.height = `${height}px`;
        input.style.overflowY = input.scrollHeight > height ? "auto" : "hidden";
      };
      resize();
      let width = input.clientWidth;
      const observer = new ResizeObserver(() => {
        if (input.clientWidth !== width) {
          width = input.clientWidth;
          resize();
        }
      });
      observer.observe(input);
      return () => {
        observer.disconnect();
        const height = styles?.textarea?.height;
        input.style.height =
          typeof height === "number" ? `${height}px` : (height ?? "");
        input.style.overflowY = styles?.textarea?.overflowY ?? "";
      };
    }, [
      autoSize,
      text,
      rows,
      styles?.textarea?.height,
      styles?.textarea?.overflowY,
    ]);
    React.useEffect(() => {
      const form = inputRef.current?.form;
      if (!form) return;
      const reset = (event: Event) => {
        queueMicrotask(() => {
          if (event.defaultPrevented) return;
          if (controlled === undefined) setInternal(defaultValue);
          setDismissed(true);
        });
      };
      form.addEventListener("reset", reset);
      return () => form.removeEventListener("reset", reset);
    }, [controlled, defaultValue, native.form]);
    function readSelection(reopen = false) {
      const input = inputRef.current;
      if (input) {
        setSelection({ start: input.selectionStart, end: input.selectionEnd });
        if (reopen) setDismissed(false);
      }
    }
    function update(next: string) {
      if (controlled === undefined) setInternal(next);
      onChange?.(next);
    }
    function select(option: MentionOption) {
      if (
        !match ||
        option.disabled ||
        disabled ||
        readOnly ||
        loading ||
        composingRef.current
      )
        return;
      const next = insertMention(text, match, option.value, split);
      if (
        native.maxLength !== undefined &&
        native.maxLength >= 0 &&
        next.value.length > native.maxLength
      )
        return;
      update(next.value);
      onSelect?.(option, match.prefix);
      setDismissed(true);
      requestAnimationFrame(() => {
        const input = inputRef.current;
        if (!input) return;
        input.focus();
        if (input.value === next.value) {
          input.setSelectionRange(next.caret, next.caret);
          readSelection();
        }
      });
    }
    const popup = open ? (
      <div
        ref={popupRef}
        className={cn("mt-scope", "mt-mentions-popup", classNames?.popup)}
        data-mt-theme={theme}
        style={{
          ...tokens,
          ...styles?.popup,
          position: "fixed",
          left: position.left,
          top: position.top,
          maxHeight: position.maxHeight,
        }}
        onMouseDown={(e) => e.preventDefault()}
        onScroll={onPopupScroll}
      >
        <div
          role="listbox"
          id={listId}
          aria-label={locale === "zh" ? "提及建议" : "Mention suggestions"}
          aria-busy={loading || undefined}
        >
          {loading ? (
            <div role="status" className="mt-mentions-message">
              <LoaderCircle aria-hidden size={14} />
              {locale === "zh" ? "加载中…" : "Loading…"}
            </div>
          ) : filtered.length ? (
            filtered.map((option, index) => (
              <div
                key={option.key ?? `${option.value}-${index}`}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                aria-disabled={option.disabled || undefined}
                className={cn(
                  "mt-mentions-option",
                  option.disabled && "is-disabled",
                  classNames?.option,
                  option.className,
                )}
                style={{ ...styles?.option, ...option.style }}
                onMouseMove={() => {
                  if (!option.disabled) setActive(index);
                }}
                onClick={() => select(option)}
              >
                {option.label ?? option.value}
              </div>
            ))
          ) : (
            <div role="status" className="mt-mentions-message">
              {notFoundContent === undefined
                ? locale === "zh"
                  ? "没有匹配项"
                  : "No matches"
                : notFoundContent}
            </div>
          )}
        </div>
      </div>
    ) : null;
    const clearConfig = typeof allowClear === "object" ? allowClear : {};
    return (
      <span
        className={cn(
          "mt-mentions",
          `mt-mentions-${size}`,
          status && `mt-mentions-${status}`,
          disabled && "is-disabled",
          className,
          classNames?.root,
        )}
        style={{ ...style, ...styles?.root }}
      >
        <textarea
          {...native}
          ref={inputRef}
          rows={rows}
          value={text}
          disabled={disabled}
          readOnly={readOnly}
          className={cn("mt-input", "mt-mentions-input", classNames?.textarea)}
          style={styles?.textarea}
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={activeId}
          aria-invalid={status === "error" ? true : native["aria-invalid"]}
          onFocus={(e) => {
            setFocused(true);
            readSelection(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            setDismissed(true);
            onBlur?.(e);
          }}
          onChange={(e) => {
            if (controlled !== undefined)
              attemptedEdit.current = e.target.value;
            update(e.target.value);
            readSelection(true);
          }}
          onSelect={() => readSelection()}
          onClick={(e) => {
            readSelection(true);
            onClick?.(e);
          }}
          onKeyUp={(e) => {
            readSelection();
            onKeyUp?.(e);
          }}
          onScroll={(e) => {
            measure();
            onScroll?.(e);
          }}
          onCompositionStart={(e) => {
            composingRef.current = true;
            setComposing(true);
            onCompositionStart?.(e);
          }}
          onCompositionEnd={(e) => {
            composingRef.current = false;
            setComposing(false);
            readSelection(true);
            onCompositionEnd?.(e);
          }}
          onKeyDown={(e) => {
            onKeyDown?.(e);
            if (
              e.defaultPrevented ||
              composingRef.current ||
              e.nativeEvent.isComposing ||
              e.keyCode === 229
            )
              return;
            if (e.key === "Escape" && open) {
              e.preventDefault();
              e.stopPropagation();
              setDismissed(true);
              return;
            }
            if (e.key === "Tab") {
              setDismissed(true);
              return;
            }
            if ((e.key === "ArrowDown" || e.key === "ArrowUp") && match) {
              e.preventDefault();
              if (!open) {
                setDismissed(false);
                return;
              }
              if (!loading && enabled.length) {
                const current = enabled.indexOf(activeIndex),
                  delta = e.key === "ArrowDown" ? 1 : -1;
                setActive(
                  enabled[(current + delta + enabled.length) % enabled.length],
                );
              }
            }
            if (e.key === "Enter" && open && !loading && activeIndex >= 0) {
              e.preventDefault();
              select(filtered[activeIndex]);
            }
          }}
        />
        {!!allowClear && !!text && !disabled && !readOnly && (
          <button
            type="button"
            className={cn("mt-mentions-clear", classNames?.clear)}
            style={styles?.clear}
            aria-label={
              clearConfig.label ?? (locale === "zh" ? "清空" : "Clear")
            }
            tabIndex={clearConfig.tabIndex}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              update("");
              setDismissed(true);
              onClear?.();
              inputRef.current?.focus();
            }}
          >
            {clearConfig.clearIcon ?? <X size={13} aria-hidden />}
          </button>
        )}
        {popup &&
          createPortal(
            popupRender ? popupRender(popup) : popup,
            getPopupContainer?.() ?? document.body,
          )}
      </span>
    );
  },
);
export const Mention = Mentions;
