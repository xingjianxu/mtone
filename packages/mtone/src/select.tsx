"use client";
import React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Select as BSelect } from "@base-ui/react/select";
import { Combobox } from "@base-ui/react/combobox";
import { MtoneScope, cn, useMtone } from "./basic";
import { useFieldsetDisabled } from "./fieldset-context";
import type { OpenProps, Option } from "./interactive";

export interface SelectOption extends Option {
  /** Text to search when the visible label is not plain text. */
  searchText?: string;
}
export interface SelectOptionGroup {
  label: React.ReactNode;
  options: readonly SelectOption[];
}
interface SelectCommonProps extends OpenProps {
  options: readonly (SelectOption | SelectOptionGroup)[];
  placeholder?: string;
  clearable?: boolean;
  emptyContent?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  form?: string;
  label?: string;
  id?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
  "aria-busy"?: boolean;
  onBlur?: React.FocusEventHandler<HTMLElement>;
}
export interface SelectSingleProps extends SelectCommonProps {
  mode?: "single";
  searchable?: boolean;
  searchPlaceholder?: string;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
}
export interface SelectMultipleProps extends SelectCommonProps {
  mode: "multiple";
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}
export interface SelectTagsProps extends Omit<SelectMultipleProps, "mode"> {
  mode: "tags";
}
export type SelectProps = SelectSingleProps | SelectMultipleProps | SelectTagsProps;

/** @deprecated Use SelectMultipleProps and Select with mode="multiple". */
export type MultiSelectProps = Omit<SelectMultipleProps, "mode">;

const noValues: string[] = [];
type OptionSection = { items: readonly SelectOption[]; label?: React.ReactNode; grouped: boolean };
function useOptions(options: SelectCommonProps["options"]) {
  return React.useMemo(() => {
    const sections: OptionSection[] = [];
    let ungrouped: SelectOption[] = [];
    const flush = () => {
      if (ungrouped.length) sections.push({ items: ungrouped, grouped: false });
      ungrouped = [];
    };
    for (const option of options) {
      if ("options" in option) {
        flush();
        if (option.options.length) sections.push({ items: option.options, grouped: true, label: option.label });
      } else {
        ungrouped.push(option);
      }
    }
    flush();
    const items = sections.flatMap((section) => section.items);
    const comboItems = sections.some((section) => section.grouped)
      ? sections.map((section, index) => ({ section, index, items: section.items.map((item) => item.value) }))
      : items.map((item) => item.value);
    return { sections, items, comboItems, byValue: new Map(items.map((option) => [option.value, option])) };
  }, [options]);
}

function optionText(option: SelectOption | undefined, value: string) {
  return option?.searchText ??
    (typeof option?.label === "string" || typeof option?.label === "number"
      ? String(option.label) : value);
}

// The primitives handle native submission and validation. Keep the committed value
// controlled internally so clear and real form.reset() share the same selection.
function useSelection<T>(
  props: { value?: T; defaultValue?: T; onValueChange?: (value: T) => void; form?: string },
  empty: T,
  resetPopup: () => void,
) {
  const { value, defaultValue, onValueChange, form } = props;
  const initial = React.useRef(defaultValue === undefined ? empty : defaultValue);
  const [local, setLocal] = React.useState(initial.current);
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    const owner = inputRef.current?.form;
    if (!owner) return;
    const handleReset = (event: Event) => {
      // Let React's and any other reset listeners cancel the native reset first.
      queueMicrotask(() => {
        if (event.defaultPrevented || inputRef.current?.form !== owner) return;
        if (value === undefined) setLocal(initial.current);
        resetPopup();
      });
    };
    owner.addEventListener("reset", handleReset);
    return () => owner.removeEventListener("reset", handleReset);
  }, [value === undefined, form, resetPopup]);
  return {
    value: value === undefined ? local : value,
    inputRef,
    change(next: T) {
      if (value === undefined) setLocal(next);
      onValueChange?.(next);
    },
  };
}

function useSelectPopup({ open, defaultOpen, onOpenChange }: OpenProps, disabled: boolean) {
  const [local, setLocal] = React.useState(defaultOpen ?? false);
  const reset = React.useCallback(() => setLocal(false), []);
  React.useEffect(() => { if (disabled) reset(); }, [disabled, reset]);
  return {
    open: !disabled && (open ?? local),
    reset,
    change(next: boolean) {
      if (next && disabled) return;
      if (open === undefined) setLocal(next);
      onOpenChange?.(next);
    },
  };
}

function ClearSelection({ locale, focus, clear }: {
  locale: string;
  focus: () => void;
  clear: () => void;
}) {
  return (
    <button type="button" className="mt-select-clear"
      aria-label={locale === "zh" ? "清除选择" : "Clear selection"}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => { focus(); clear(); }}>
      <X size={14} aria-hidden="true" />
    </button>
  );
}

const marker = <Check size={16} strokeWidth={1.5} aria-hidden="true" />;
function SelectSingle({ options, searchable = false, searchPlaceholder, clearable, emptyContent,
  placeholder, className, name, form, label, id, onBlur, required,
  "aria-invalid": invalid, "aria-busy": busy,
  "aria-describedby": describedBy, "aria-labelledby": labelledBy, ...props
}: SelectSingleProps) {
  const { locale } = useMtone();
  const disabled = useFieldsetDisabled(props.disabled);
  const popup = useSelectPopup(props, disabled);
  const selection = useSelection({ ...props, form }, null, popup.reset);
  const optionData = useOptions(options);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const empty = emptyContent ?? (locale === "zh" ? "无匹配结果" : "No results");
  const prompt = placeholder ?? (locale === "zh" ? "请选择" : "Select…");
  const searchName = locale === "zh" ? "搜索选项" : "Search options";
  const fallbackLabel = (v: string) => optionText(optionData.byValue.get(v), v);
  const selectedLabel = selection.value === null
    ? prompt : optionData.byValue.get(selection.value)?.label ?? selection.value;
  const rootProps = {
    value: selection.value, onValueChange: selection.change, inputRef: selection.inputRef,
    open: popup.open, onOpenChange: popup.change, disabled, name, form,
    // An explicitly chosen empty string is a value, not the unselected state.
    required: required && selection.value !== "",
  };
  const triggerProps = {
    id, ref: triggerRef, "aria-label": label, "aria-invalid": invalid, "aria-busy": busy,
    "aria-describedby": describedBy, "aria-labelledby": labelledBy, "aria-required": required || undefined,
    className: cn("mt-select", className),
  };
  const clear = clearable && !disabled && selection.value !== null && (
    <ClearSelection locale={locale} focus={() => triggerRef.current?.focus()} clear={() => selection.change(null)} />
  );
  const withClear = (trigger: React.ReactElement) => clearable
    ? <span className="mt-select-clearable">{trigger}{clear}</span> : trigger;
  if (searchable) {
    return (
      <Combobox.Root<string> items={optionData.comboItems} itemToStringLabel={fallbackLabel}
        autoHighlight {...rootProps}>
        {withClear(
          <Combobox.Trigger {...triggerProps} onBlur={(event) => {
            if (!popupRef.current?.contains(event.relatedTarget)) onBlur?.(event);
          }}>
            <span className="mt-select-value">{selectedLabel}</span>
            <Combobox.Icon className="mt-select-icon"><ChevronDown size={16} aria-hidden="true" /></Combobox.Icon>
          </Combobox.Trigger>,
        )}
        <ComboboxPopup data={optionData} empty={empty} popupRef={popupRef} label={label ?? searchName}>
          <Combobox.Input className="mt-select-search" aria-label={searchName}
            placeholder={searchPlaceholder ?? searchName}
            onBlur={(event) => {
              if (event.relatedTarget !== triggerRef.current && !popupRef.current?.contains(event.relatedTarget)) onBlur?.(event);
            }} />
        </ComboboxPopup>
      </Combobox.Root>
    );
  }
  const renderOption = (option: SelectOption) => (
    <BSelect.Item className="mt-option" key={option.value} value={option.value} disabled={option.disabled}>
      <BSelect.ItemText>{option.label}</BSelect.ItemText>
      <BSelect.ItemIndicator className="mt-select-item-indicator" aria-hidden="true">{marker}</BSelect.ItemIndicator>
    </BSelect.Item>
  );
  return (
    <BSelect.Root<string> items={optionData.items} {...rootProps}>
      {withClear(
        <BSelect.Trigger {...triggerProps} onBlur={onBlur}>
          <BSelect.Value className="mt-select-value" placeholder={prompt} />
          <BSelect.Icon className="mt-select-icon"><ChevronDown size={16} aria-hidden="true" /></BSelect.Icon>
        </BSelect.Trigger>,
      )}
      <BSelect.Portal>
        <MtoneScope>
          <BSelect.Positioner className="mt-positioner" sideOffset={4} alignItemWithTrigger={false}>
            <BSelect.Popup className="mt-popup">
              {!optionData.items.length && <div className="mt-combobox-empty" role="status">{empty}</div>}
              <BSelect.List>
                {optionData.sections.map((section, index) => section.grouped ? (
                  <BSelect.Group key={index}>
                    <BSelect.GroupLabel className="mt-select-group-label">{section.label}</BSelect.GroupLabel>
                    {section.items.map(renderOption)}
                  </BSelect.Group>
                ) : <React.Fragment key={index}>{section.items.map(renderOption)}</React.Fragment>)}
              </BSelect.List>
            </BSelect.Popup>
          </BSelect.Positioner>
        </MtoneScope>
      </BSelect.Portal>
    </BSelect.Root>
  );
}

type OptionData = ReturnType<typeof useOptions>;
type ComboGroup = { items: string[]; section: OptionSection; index: number };
function ComboboxPopup({ data, empty, popupRef, label, children, createOption }: {
  data: OptionData;
  empty: React.ReactNode;
  popupRef?: React.Ref<HTMLDivElement>;
  label?: string;
  children?: React.ReactNode;
  createOption?: { value: string; label: string };
}) {
  const item = (value: string) => {
    const option = data.byValue.get(value);
    return (
      <Combobox.Item className="mt-option" key={value} value={value} disabled={option?.disabled}>
        <span className="mt-select-option-label">{option?.label ?? (value === createOption?.value ? createOption.label : value)}</span>
        <Combobox.ItemIndicator className="mt-select-item-indicator" aria-hidden="true">{marker}</Combobox.ItemIndicator>
      </Combobox.Item>
    );
  };
  return (
    <Combobox.Portal>
      <MtoneScope>
        <Combobox.Positioner className="mt-positioner" sideOffset={4}>
          <Combobox.Popup ref={popupRef} aria-label={label} className={cn("mt-popup", children != null && "mt-select-search-popup")}>
            {children}
            <Combobox.Empty className="mt-combobox-empty">{empty}</Combobox.Empty>
            <Combobox.List className={children != null ? "mt-select-search-list" : undefined}>
              {(entry: string | ComboGroup) => {
                if (typeof entry === "string") return item(entry);
                if (!entry.section.grouped) {
                  return (
                    <Combobox.Group key={entry.index} items={entry.items} role="presentation">
                      <Combobox.Collection>{item}</Combobox.Collection>
                    </Combobox.Group>
                  );
                }
                return (
                  <Combobox.Group key={entry.index} items={entry.items}>
                    <Combobox.GroupLabel className="mt-select-group-label">{entry.section.label}</Combobox.GroupLabel>
                    <Combobox.Collection>{item}</Combobox.Collection>
                  </Combobox.Group>
                );
              }}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </MtoneScope>
    </Combobox.Portal>
  );
}

function SelectMultiple({ mode, options, clearable, emptyContent, placeholder, className, name, form, label, id, onBlur,
  required, "aria-invalid": invalid, "aria-busy": busy,
  "aria-describedby": describedBy, "aria-labelledby": labelledBy, ...props
}: SelectMultipleProps | SelectTagsProps) {
  const tags = mode === "tags";
  const { locale } = useMtone();
  const disabled = useFieldsetDisabled(props.disabled);
  const popup = useSelectPopup(props, disabled);
  const [inputValue, setInputValue] = React.useState("");
  const [composing, setComposing] = React.useState(false);
  const composingRef = React.useRef(false);
  const resetPopup = React.useCallback(() => {
    popup.reset();
    setInputValue("");
  }, [popup.reset]);
  const selection = useSelection({ ...props, form }, noValues, tags ? resetPopup : popup.reset);
  const optionData = useOptions(options);
  const draft = tags ? inputValue.trim() : "";
  const exactValues = React.useMemo(() => {
    const values = new Set<string>();
    if (!draft) return values;
    for (const option of optionData.items) {
      if (option.value === draft ||
        ((typeof option.label === "string" || typeof option.label === "number") && String(option.label).trim() === draft)) {
        values.add(option.value);
      }
    }
    return values;
  }, [draft, optionData]);
  // Use the actual draft as the option value: it is disjoint from every known
  // or selected value, so no marker string can leak into form data or collide.
  const createValue = draft && !composing && !exactValues.size && !selection.value.includes(draft) ? draft : undefined;
  const items = React.useMemo(() => {
    if (createValue === undefined) return optionData.comboItems;
    if (optionData.sections.some((section) => section.grouped)) {
      const section = { items: [], grouped: false };
      const createGroup: ComboGroup = { items: [createValue], section, index: -1 };
      return [createGroup, ...optionData.comboItems];
    }
    return [createValue, ...optionData.comboItems];
  }, [optionData, createValue]);
  const { contains } = Combobox.useFilter({ multiple: true });
  const tagsFilter = (value: string, query: string, getLabel?: (value: string) => string) => {
    const trimmed = query.trim();
    if (trimmed && trimmed === draft && exactValues.size) return exactValues.has(value);
    return value === createValue || contains(value, query, getLabel);
  };
  const locked = selection.value.filter((value) => optionData.byValue.get(value)?.disabled);
  const labelFor = (value: string) => optionText(optionData.byValue.get(value), value);
  return (
    <Combobox.Root<string, true> multiple items={items} itemToStringLabel={labelFor}
      {...(tags ? { inputValue, onInputValueChange: setInputValue, filter: tagsFilter, autoHighlight: true } : {})}
      value={selection.value} inputRef={selection.inputRef} name={name} form={form} disabled={disabled} required={required}
      onValueChange={(next, details) => {
        if (tags && details.reason === "item-press") {
          const event = details.event;
          const repeat = "key" in event && event.key === "Enter" &&
            selection.value.some((value) => exactValues.has(value) && !next.includes(value));
          if (composingRef.current || repeat) {
            details.cancel();
            return;
          }
          setInputValue("");
        }
        if (details.reason === "clear-press") {
          if (locked.length < selection.value.length) selection.change(locked);
        } else if (locked.some((value) => !next.includes(value))) {
          details.cancel();
        } else selection.change(next);
      }}
      open={popup.open} onOpenChange={popup.change}>
      <Combobox.Chips aria-invalid={invalid} className={cn("mt-multiselect", className)}>
        {selection.value.map((value) => {
          const option = optionData.byValue.get(value);
          return (
            <Combobox.Chip className="mt-chip" key={value}>
              <span>{option?.label ?? value}</span>
              {!option?.disabled && (
                <Combobox.ChipRemove aria-label={`${locale === "zh" ? "移除" : "Remove"} ${labelFor(value)}`}
                  className="mt-chip-remove">×</Combobox.ChipRemove>
              )}
            </Combobox.Chip>
          );
        })}
        <Combobox.Input id={id} onBlur={onBlur}
          {...(tags ? {
            onCompositionStart: () => { composingRef.current = true; setComposing(true); },
            onCompositionEnd: () => { composingRef.current = false; setComposing(false); },
          } : {})}
          onKeyDown={tags ? (event) => {
            if (event.key !== "Enter") return;
            if (composingRef.current || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) {
              // Let the platform confirm the composition, but do not let Base UI
              // convert this keystroke into an option click.
              event.preventBaseUIHandler();
            } else if (inputValue && (popup.open || !draft)) {
              // Typed text is a draft, not an implicit submit. Leave an enabled
              // active option to Base UI; do not toggle it when retyping its label.
              event.preventDefault();
              if (!draft || (!exactValues.size && selection.value.includes(draft))) event.preventBaseUIHandler();
            }
          } : undefined}
          aria-invalid={invalid} aria-describedby={describedBy} aria-labelledby={labelledBy}
          aria-busy={busy} aria-label={label} aria-required={required || undefined}
          placeholder={placeholder ?? (tags
            ? (locale === "zh" ? "搜索或创建标签…" : "Search or create tags…")
            : (locale === "zh" ? "搜索…" : "Search…"))}
          className="mt-combobox-input" />
        <span className="mt-select-action-slot">
          {clearable && !disabled && locked.length < selection.value.length && (
            <Combobox.Clear className="mt-select-clear" tabIndex={popup.open ? -1 : 0}
              aria-label={locale === "zh" ? "清除选择" : "Clear selection"}>
              <X size={14} aria-hidden="true" />
            </Combobox.Clear>
          )}
          <Combobox.Trigger className="mt-combobox-trigger" aria-label={locale === "zh" ? "展开选项" : "Show options"}>
            <ChevronDown size={16} aria-hidden="true" />
          </Combobox.Trigger>
        </span>
      </Combobox.Chips>
      <ComboboxPopup data={optionData} empty={emptyContent ?? (locale === "zh" ? "无匹配结果" : "No results")}
        createOption={createValue === undefined ? undefined : {
          value: createValue, label: locale === "zh" ? `创建“${createValue}”` : `Create “${createValue}”`,
        }} />
    </Combobox.Root>
  );
}

export function Select(props: SelectProps) {
  return props.mode === "multiple" || props.mode === "tags" ? <SelectMultiple {...props} /> : <SelectSingle {...props} />;
}
Select.formValueType = (props: { mode?: unknown }) => props.mode === "multiple" || props.mode === "tags" ? "array" : "select-single";

/** @deprecated Use <Select mode="multiple" />. */
export function MultiSelect(props: MultiSelectProps) {
  return <Select {...props} mode="multiple" />;
}
MultiSelect.formValueType = "array" as const;
