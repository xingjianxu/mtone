import * as React from "react";
import { Autocomplete as A } from "@base-ui/react/autocomplete";
import { LoaderCircle, X } from "lucide-react";
import { cn, MtoneScope, useMtone } from "./basic";
export type AutoCompleteOption = {
  value: string;
  label?: React.ReactNode;
  disabled?: boolean;
  keywords?: string;
};
export type AutoCompleteGroup = {
  label: string;
  options: AutoCompleteOption[];
};
export type AutoCompleteProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  | "size"
  | "value"
  | "defaultValue"
  | "onChange"
  | "onSelect"
  | "prefix"
  | "children"
> & {
  options?: (AutoCompleteOption | AutoCompleteGroup)[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string, option: AutoCompleteOption) => void;
  onSearch?: (value: string) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  filterOption?:
    false | ((query: string, option: AutoCompleteOption) => boolean);
  autoHighlight?: boolean;
  backfill?: boolean;
  allowClear?: boolean;
  onClear?: () => void;
  loading?: boolean;
  notFoundContent?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  status?: "error" | "warning";
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  popupClassName?: string;
  popupStyle?: React.CSSProperties;
  placement?: "top" | "bottom";
  popupWidth?: number;
};
/** Free text input with optional suggestions; ref points to the native input. */
export const AutoComplete = React.forwardRef<
  HTMLInputElement,
  AutoCompleteProps
>(function AutoComplete(
  {
    options = [],
    value,
    defaultValue = "",
    onChange,
    onSelect,
    onSearch,
    open,
    defaultOpen = false,
    onOpenChange,
    filterOption,
    autoHighlight = false,
    backfill = false,
    allowClear = false,
    onClear,
    loading = false,
    notFoundContent,
    size = "md",
    status,
    prefix,
    suffix,
    popupClassName,
    popupStyle,
    placement = "bottom",
    popupWidth,
    className,
    style,
    disabled,
    readOnly,
    name,
    form,
    onCompositionStart,
    onCompositionEnd,
    ...inputProps
  },
  ref,
) {
  const { locale } = useMtone();
  const zh = locale === "zh";
  const composing = React.useRef(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [text, setText] = React.useState(defaultValue);
  const [localOpen, setLocalOpen] = React.useState(defaultOpen);
  React.useEffect(() => {
    if (disabled || readOnly) setLocalOpen(false);
  }, [disabled, readOnly]);
  React.useImperativeHandle(ref, () => inputRef.current!, []);
  React.useEffect(() => {
    const owner = inputRef.current?.form;
    const reset = () => {
      if (value === undefined) setText(defaultValue);
    };
    owner?.addEventListener("reset", reset);
    return () => owner?.removeEventListener("reset", reset);
  }, [value, defaultValue, form]);
  const groups = React.useMemo(
    () =>
      options.map((o) =>
        "options" in o
          ? { label: o.label, items: o.options }
          : { label: "", items: [o] },
      ),
    [options],
  );

  const filter = (item: AutoCompleteOption, query: string) =>
    filterOption === false ||
    (filterOption
      ? filterOption(query, item)
      : `${item.value} ${typeof item.label === "string" ? item.label : ""} ${item.keywords ?? ""}`
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()));
  return (
    <A.Root<typeof groups>
      items={groups}
      value={value ?? text}
      onValueChange={(next, details) => {
        if (value === undefined) setText(next);
        onChange?.(next);
        if (!composing.current && details.reason === "input-change")
          onSearch?.(next);
        if (details.reason === "clear-press") onClear?.();
      }}
      open={!(disabled || readOnly) && (open ?? localOpen)}
      onOpenChange={(next) => {
        setLocalOpen(next);
        onOpenChange?.(next);
      }}
      disabled={disabled}
      readOnly={readOnly}
      name={name}
      form={form}
      mode={
        backfill
          ? filterOption === false
            ? "inline"
            : "both"
          : filterOption === false
            ? "none"
            : "list"
      }
      filter={filter}
      itemToStringValue={(o) => o.value}
      autoHighlight={autoHighlight}
      openOnInputClick
    >
      <A.InputGroup
        className={cn("mt-auto-complete", className)}
        style={style}
        data-size={size}
        data-status={status}
        data-disabled={disabled || undefined}
      >
        {prefix && <span className="mt-auto-complete-adornment">{prefix}</span>}
        <A.Input
          {...inputProps}
          ref={inputRef}
          aria-busy={inputProps["aria-busy"] ?? (loading || undefined)}
          className="mt-auto-complete-input"
          aria-invalid={
            inputProps["aria-invalid"] ?? (status === "error" || undefined)
          }
          onCompositionStart={(e) => {
            composing.current = true;
            onCompositionStart?.(e);
          }}
          onCompositionEnd={(e) => {
            composing.current = false;
            onCompositionEnd?.(e);
          }}
        />
        {loading && (
          <LoaderCircle
            size={14}
            className="mt-auto-complete-spinner"
            aria-hidden="true"
          />
        )}
        {allowClear && !readOnly && (
          <A.Clear
            className="mt-auto-complete-clear"
            aria-label={zh ? "清除" : "Clear"}
          >
            <X size={13} />
          </A.Clear>
        )}
        {suffix && <span className="mt-auto-complete-adornment">{suffix}</span>}
      </A.InputGroup>
      <A.Portal>
        <MtoneScope>
          <A.Positioner
            className="mt-positioner"
            side={placement}
            sideOffset={4}
            style={popupWidth ? { width: popupWidth } : undefined}
          >
            <A.Popup
              className={cn("mt-popup mt-auto-complete-popup", popupClassName)}
              style={popupStyle}
            >
              {loading && (
                <A.Status className="mt-auto-complete-message">
                  {zh ? "加载中…" : "Loading…"}
                </A.Status>
              )}
              <A.Empty className="mt-auto-complete-message">
                {loading
                  ? null
                  : (notFoundContent ?? (zh ? "无匹配建议" : "No suggestions"))}
              </A.Empty>
              <A.List>
                {(
                  group: { label: string; items: AutoCompleteOption[] },
                  index: number,
                ) => (
                  <A.Group items={group.items} key={index}>
                    {group.label && (
                      <A.GroupLabel className="mt-auto-complete-message">
                        {group.label}
                      </A.GroupLabel>
                    )}
                    <A.Collection>
                      {(option: AutoCompleteOption) => (
                        <A.Item
                          key={option.value}
                          value={option}
                          disabled={option.disabled}
                          className="mt-option mt-auto-complete-option"
                          onClick={() => onSelect?.(option.value, option)}
                        >
                          {option.label ?? option.value}
                        </A.Item>
                      )}
                    </A.Collection>
                  </A.Group>
                )}
              </A.List>
            </A.Popup>
          </A.Positioner>
        </MtoneScope>
      </A.Portal>
    </A.Root>
  );
});
