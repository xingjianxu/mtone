import * as React from "react";
import { Search, X, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useFieldsetDisabled } from "./fieldset-context";
import { useMtone } from "./basic";
import { InputOTP } from "./input-otp";

export type InputVariant = "outlined" | "filled" | "borderless" | "underlined";
export type InputControlSize = "sm" | "md" | "lg";
export interface InputAppearance {
  controlSize?: InputControlSize;
  variant?: InputVariant;
  status?: "error" | "warning";
  showCount?: boolean;
  countCharacters?: (value: string) => number;
}
export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix">,
    InputAppearance {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  allowClear?: boolean;
  onClear?: () => void;
  clearLabel?: string;
  /** Class on the stable wrapper. className/style still target the native input. */
  wrapperClassName?: string;
}
const classes = (...values: (string | false | undefined)[]) =>
  values.filter(Boolean).join(" ");
const stringValue = (value: unknown) => (value == null ? "" : String(value));
function useNativeValue<T extends HTMLInputElement | HTMLTextAreaElement>(
  value: unknown,
  defaultValue: unknown,
  forwarded: React.ForwardedRef<T>,
  formId?: string,
) {
  const ref = React.useRef<T>(null);
  React.useImperativeHandle(forwarded, () => ref.current!);
  const [local, setLocal] = React.useState(() => stringValue(defaultValue));
  const controlled = value !== undefined;
  React.useLayoutEffect(() => {
    if (!controlled && ref.current && local !== ref.current.value)
      setLocal(ref.current.value);
  });
  React.useEffect(() => {
    const form = ref.current?.form;
    let timer: ReturnType<typeof setTimeout>;
    const reset = (event: Event) => {
      timer = setTimeout(() => {
        if (!event.defaultPrevented && !controlled)
          setLocal(ref.current?.value ?? "");
      }, 0);
    };
    form?.addEventListener("reset", reset);
    return () => {
      form?.removeEventListener("reset", reset);
      clearTimeout(timer);
    };
  }, [controlled, formId]);
  return { ref, text: controlled ? stringValue(value) : local, setLocal };
}
export const InputRoot = React.forwardRef<HTMLInputElement, InputProps>(
  function InputRoot(
    {
      prefix,
      suffix,
      allowClear,
      onClear,
      clearLabel,
      wrapperClassName,
      controlSize = "md",
      variant = "outlined",
      status,
      showCount,
      countCharacters = (value) => value.length,
      className,
      value,
      defaultValue,
      onChange,
      disabled: disabledProp,
      readOnly,
      ...props
    },
    forwarded,
  ) {
    const disabled = useFieldsetDisabled(disabledProp);
    const { locale } = useMtone();
    const { ref, text, setLocal } = useNativeValue(
      value,
      defaultValue,
      forwarded,
      props.form,
    );
    const decorated =
      prefix != null || suffix != null || !!allowClear || !!showCount;
    const invalid =
      status === "error" ||
      props["aria-invalid"] === true ||
      props["aria-invalid"] === "true";
    const clear = () => {
      const input = ref.current;
      if (!input || disabled || readOnly) return;
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      setter?.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      setLocal("");
      onClear?.();
      input.focus();
    };
    return (
      <span
        className={classes(
          "mt-input-wrap",
          decorated && "mt-input-decorated",
          `mt-input-size-${controlSize}`,
          `mt-input-variant-${variant}`,
          wrapperClassName,
        )}
        data-disabled={disabled || undefined}
        data-status={invalid ? "error" : status}
      >
        {prefix != null && <span className="mt-input-prefix">{prefix}</span>}
        <input
          {...props}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={invalid || props["aria-invalid"]}
          className={classes("mt-input mt-input-control", className)}
          onChange={(event) => {
            setLocal(event.target.value);
            onChange?.(event);
          }}
        />
        {allowClear && text && !disabled && !readOnly && (
          <button
            type="button"
            className="mt-input-action"
            aria-label={
              clearLabel ?? (locale === "zh" ? "清除内容" : "Clear input")
            }
            onMouseDown={(event) => event.preventDefault()}
            onClick={clear}
          >
            <X size={13} />
          </button>
        )}
        {suffix != null && <span className="mt-input-suffix">{suffix}</span>}
        {showCount && (
          <span className="mt-input-count">
            {countCharacters(text)}
            {props.maxLength !== undefined ? ` / ${props.maxLength}` : ""}
          </span>
        )}
      </span>
    );
  },
);
export interface InputSearchProps extends InputProps {
  onSearch?: (value: string) => void;
  searchButton?: React.ReactNode;
  loading?: boolean;
}
const SearchInput = React.forwardRef<HTMLInputElement, InputSearchProps>(
  function SearchInput(
    {
      onSearch,
      searchButton,
      loading,
      prefix,
      suffix,
      disabled: disabledProp,
      onKeyDown,
      wrapperClassName,
      ...props
    },
    forwarded,
  ) {
    const ref = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(forwarded, () => ref.current!);
    const disabled = useFieldsetDisabled(disabledProp);
    const { locale } = useMtone();
    const composing = React.useRef(false);
    const search = () => {
      if (!disabled && !loading && !composing.current)
        onSearch?.(ref.current?.value ?? "");
    };
    return (
      <InputRoot
        {...props}
        ref={ref}
        disabled={disabled}
        wrapperClassName={classes(
          "mt-search mt-input-search",
          wrapperClassName,
        )}
        prefix={prefix ?? <Search size={15} aria-hidden="true" />}
        aria-busy={loading || props["aria-busy"]}
        onCompositionStart={(event) => {
          composing.current = true;
          props.onCompositionStart?.(event);
        }}
        onCompositionEnd={(event) => {
          composing.current = false;
          props.onCompositionEnd?.(event);
        }}
        suffix={
          suffix != null || loading || searchButton ? (
            <>
              {suffix}
              {loading && (
                <LoaderCircle
                  size={14}
                  className="mt-spin"
                  aria-hidden="true"
                />
              )}
              {searchButton && (
                <button
                  type="button"
                  className="mt-input-search-button"
                  disabled={disabled || loading}
                  onClick={search}
                >
                  {searchButton === true
                    ? locale === "zh"
                      ? "搜索"
                      : "Search"
                    : searchButton}
                </button>
              )}
            </>
          ) : undefined
        }
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            event.key === "Enter" &&
            !event.defaultPrevented &&
            !event.nativeEvent.isComposing &&
            event.nativeEvent.keyCode !== 229 &&
            !composing.current
          ) {
            if (onSearch) event.preventDefault();
            search();
          }
        }}
      />
    );
  },
);
export interface InputPasswordProps extends Omit<InputProps, "type"> {
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}
export const InputPassword = React.forwardRef<
  HTMLInputElement,
  InputPasswordProps
>(function InputPassword(
  {
    visible,
    defaultVisible = false,
    onVisibleChange,
    suffix,
    disabled: disabledProp,
    ...props
  },
  forwarded,
) {
  const [local, setLocal] = React.useState(defaultVisible);
  const shown = visible ?? local;
  const ref = React.useRef<HTMLInputElement>(null);
  React.useImperativeHandle(forwarded, () => ref.current!);
  const disabled = useFieldsetDisabled(disabledProp);
  const { locale } = useMtone();
  return (
    <InputRoot
      {...props}
      ref={ref}
      disabled={disabled}
      type={shown ? "text" : "password"}
      suffix={
        <>
          {suffix}
          <button
            type="button"
            className="mt-input-action"
            disabled={disabled}
            aria-label={
              locale === "zh"
                ? shown
                  ? "隐藏密码"
                  : "显示密码"
                : shown
                  ? "Hide password"
                  : "Show password"
            }
            aria-pressed={shown}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              if (visible === undefined) setLocal(!shown);
              onVisibleChange?.(!shown);
              ref.current?.focus();
            }}
          >
            {shown ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </>
      }
    />
  );
});
export interface InputTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, InputAppearance {
  autoSize?: boolean | { minRows?: number; maxRows?: number };
}
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  InputTextAreaProps
>(function Textarea(
  {
    autoSize,
    controlSize = "md",
    variant = "outlined",
    status,
    showCount,
    countCharacters = (value) => value.length,
    className,
    value,
    defaultValue,
    onChange,
    disabled: disabledProp,
    style,
    ...props
  },
  forwarded,
) {
  const disabled = useFieldsetDisabled(disabledProp);
  const { ref, text, setLocal } = useNativeValue(
    value,
    defaultValue,
    forwarded,
    props.form,
  );
  const resize = React.useCallback(() => {
    const element = ref.current;
    if (!element) return;
    if (!autoSize) {
      element.style.height =
        typeof style?.height === "number"
          ? `${style.height}px`
          : (style?.height ?? "");
      element.style.overflowY = style?.overflowY ?? "";
      return;
    }
    const computed = getComputedStyle(element);
    const lineHeight =
      parseFloat(computed.lineHeight) ||
      parseFloat(computed.fontSize) * 1.5 ||
      20;
    const padding =
      (parseFloat(computed.paddingTop) || 0) +
      (parseFloat(computed.paddingBottom) || 0);
    const border =
      (parseFloat(computed.borderTopWidth) || 0) +
      (parseFloat(computed.borderBottomWidth) || 0);
    const minRows = Math.max(
      1,
      typeof autoSize === "object"
        ? (autoSize.minRows ?? props.rows ?? 2)
        : (props.rows ?? 2),
    );
    const maxRows = Math.max(
      minRows,
      typeof autoSize === "object" ? (autoSize.maxRows ?? Infinity) : Infinity,
    );
    element.style.height = "0px";
    const height = Math.max(
      minRows * lineHeight + padding + border,
      Math.min(
        element.scrollHeight + border,
        maxRows * lineHeight + padding + border,
      ),
    );
    element.style.height = `${height}px`;
    element.style.overflowY =
      element.scrollHeight + border > height ? "auto" : "hidden";
  }, [autoSize, props.rows, ref, style?.height, style?.overflowY]);
  React.useLayoutEffect(resize, [resize, text]);
  React.useEffect(() => {
    if (!autoSize || !ref.current || typeof ResizeObserver === "undefined")
      return;
    let width = ref.current.clientWidth;
    const observer = new ResizeObserver(() => {
      if (ref.current && ref.current.clientWidth !== width) {
        width = ref.current.clientWidth;
        resize();
      }
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [autoSize, resize, ref]);
  const invalid =
    status === "error" ||
    props["aria-invalid"] === true ||
    props["aria-invalid"] === "true";
  return (
    <span
      className={classes(
        "mt-input-wrap mt-textarea-wrap",
        `mt-input-size-${controlSize}`,
        `mt-input-variant-${variant}`,
      )}
      data-status={invalid ? "error" : status}
      data-disabled={disabled || undefined}
    >
      <textarea
        {...props}
        ref={ref}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        aria-invalid={invalid || props["aria-invalid"]}
        className={classes("mt-input mt-textarea", className)}
        style={{
          ...style,
          ...(autoSize ? { minHeight: 0, resize: "none" } : {}),
        }}
        onChange={(event) => {
          setLocal(event.target.value);
          onChange?.(event);
        }}
      />
      {showCount && (
        <span className="mt-input-count">
          {countCharacters(text)}
          {props.maxLength !== undefined ? ` / ${props.maxLength}` : ""}
        </span>
      )}
    </span>
  );
});
export const Input = Object.assign(InputRoot, {
  Search: SearchInput,
  TextArea: Textarea,
  Password: InputPassword,
  OTP: InputOTP,
});
export type { InputOTPProps } from "./input-otp";
