import * as React from "react";
import { useFieldsetDisabled } from "./fieldset-context";

export interface InputOTPProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  /** Number of cells, clamped to 1–32. */
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  form?: string;
  mask?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  controlSize?: "sm" | "md" | "lg";
  separator?: React.ReactNode;
  autoFocus?: boolean;
  autoComplete?: string;
}

const normalize = (value: string, length: number) =>
  Array.from(value.replace(/\s/g, "")).slice(0, length).join("");

/** Segmented input with a continuous string value. Deletion shifts later characters left. */
const InputOTPRoot = React.forwardRef<HTMLInputElement, InputOTPProps>(
  function InputOTP(
    {
      length: requestedLength = 6,
      value,
      defaultValue = "",
      onValueChange,
      onComplete,
      disabled: disabledProp,
      readOnly,
      name,
      id,
      form,
      mask,
      inputMode = "numeric",
      controlSize = "md",
      separator,
      autoFocus,
      autoComplete = "one-time-code",
      className,
      "aria-label": ariaLabel = "验证码",
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
      "aria-invalid": invalid,
      ...props
    },
    forwardedRef,
  ) {
    const length = Number.isFinite(requestedLength)
      ? Math.max(1, Math.min(32, Math.floor(requestedLength)))
      : 6;
    const disabled = useFieldsetDisabled(disabledProp);
    const [localValue, setLocalValue] = React.useState(() =>
      normalize(defaultValue, length),
    );
    const current = normalize(value ?? localValue, length);
    const chars = Array.from(current);
    const inputs = React.useRef<(HTMLInputElement | null)[]>([]);
    const [composition, setComposition] = React.useState<{
      index: number;
      value: string;
    } | null>(null);
    const composing = React.useRef<number | null>(null);
    // Read only the rendered value. Controlled changes are never optimistically accepted.
    const commit = (next: string) => {
      next = normalize(next, length);
      if (next === current) return;
      if (value === undefined) setLocalValue(next);
      onValueChange?.(next);
      if (Array.from(next).length === length) onComplete?.(next);
    };
    React.useEffect(() => {
      if (value === undefined)
        setLocalValue((previous) => normalize(previous, length));
    }, [length, value]);
    React.useEffect(() => {
      const element = inputs.current[0];
      const owner = element?.form;
      if (!owner || value !== undefined) return;
      let timer: ReturnType<typeof setTimeout>;
      const reset = (event: Event) => {
        timer = setTimeout(() => {
          if (event.defaultPrevented) return;
          setLocalValue(normalize(defaultValue, length));
          setComposition(null);
          composing.current = null;
        }, 0);
      };
      owner.addEventListener("reset", reset);
      return () => {
        owner.removeEventListener("reset", reset);
        clearTimeout(timer);
      };
    }, [value, defaultValue, length, form]);
    const focus = (index: number) => {
      const element = inputs.current[Math.max(0, Math.min(length - 1, index))];
      element?.focus();
      element?.select();
    };
    const insert = (index: number, text: string) => {
      if (disabled || readOnly) return;
      const incoming = Array.from(normalize(text, length));
      if (!incoming.length) {
        if (index < chars.length)
          commit(chars.filter((_, i) => i !== index).join(""));
        return;
      }
      // Clicking an empty cell must not create a value with invisible holes.
      const start = Math.min(index, chars.length);
      const result = [...chars];
      result.splice(start, incoming.length, ...incoming);
      commit(result.slice(0, length).join(""));
      focus(start + incoming.length);
    };
    return (
      <div
        {...props}
        role={props.role ?? "group"}
        className={["mt-input-otp", `mt-input-otp-${controlSize}`, className]
          .filter(Boolean)
          .join(" ")}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        data-disabled={disabled || undefined}
      >
        {Array.from({ length }, (_, index) => (
          <React.Fragment key={index}>
            {index > 0 && separator != null && (
              <span className="mt-input-otp-separator" aria-hidden="true">
                {separator}
              </span>
            )}
            <input
              ref={(element) => {
                inputs.current[index] = element;
                if (index === 0) {
                  if (typeof forwardedRef === "function") forwardedRef(element);
                  else if (forwardedRef) forwardedRef.current = element;
                }
              }}
              id={index === 0 ? id : undefined}
              className="mt-input mt-input-otp-cell"
              type={mask ? "password" : "text"}
              inputMode={inputMode}
              autoComplete={index === 0 ? autoComplete : "off"}
              autoFocus={autoFocus && index === 0}
              form={form}
              disabled={disabled}
              readOnly={readOnly}
              aria-label={`${ariaLabel} ${index + 1} / ${length}`}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              value={
                composition?.index === index
                  ? composition.value
                  : (chars[index] ?? "")
              }
              onFocus={(event) => event.currentTarget.select()}
              onChange={(event) => {
                if (composing.current === index) {
                  setComposition({ index, value: event.currentTarget.value });
                  return;
                }
                insert(index, event.currentTarget.value);
              }}
              onCompositionStart={(event) => {
                composing.current = index;
                setComposition({ index, value: event.currentTarget.value });
              }}
              onCompositionEnd={(event) => {
                const text = event.currentTarget.value;
                composing.current = null;
                setComposition(null);
                insert(index, text);
              }}
              onPaste={(event) => {
                event.preventDefault();
                insert(index, event.clipboardData.getData("text"));
              }}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing || composing.current !== null)
                  return;
                if (
                  event.key === "ArrowLeft" ||
                  event.key === "ArrowRight" ||
                  event.key === "Home" ||
                  event.key === "End"
                ) {
                  event.preventDefault();
                  focus(
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? length - 1
                        : index + (event.key === "ArrowLeft" ? -1 : 1),
                  );
                } else if (
                  !disabled &&
                  !readOnly &&
                  (event.key === "Backspace" || event.key === "Delete")
                ) {
                  event.preventDefault();
                  const target =
                    event.key === "Backspace" && !chars[index]
                      ? index - 1
                      : index;
                  if (target >= 0 && target < chars.length)
                    commit(chars.filter((_, i) => i !== target).join(""));
                  if (event.key === "Backspace") focus(index - 1);
                }
              }}
            />
          </React.Fragment>
        ))}
        {name && (
          <input
            type="hidden"
            name={name}
            form={form}
            disabled={disabled}
            value={current}
          />
        )}
      </div>
    );
  },
);

export const InputOTP = Object.assign(InputOTPRoot, {
  formValueType: "string",
});
