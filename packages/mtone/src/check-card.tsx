import * as React from "react";
import { Check, LoaderCircle } from "lucide-react";
import { cn } from "./basic";
import { useFieldsetDisabled } from "./fieldset-context";

export type CheckCardSize = "sm" | "md" | "lg";

export interface CheckCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title" | "onChange"
> {
  value?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  name?: string;
  form?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  avatar?: React.ReactNode;
  cover?: React.ReactNode;
  extra?: React.ReactNode;
  size?: CheckCardSize;
  bordered?: boolean;
}

export type CheckCardOption = Omit<
  CheckCardProps,
  "value" | "checked" | "defaultChecked" | "onChange" | "name" | "form"
> & { value: string };

type CheckCardGroupCommon = Omit<
  React.FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "onChange" | "defaultValue"
> & {
  legend?: React.ReactNode;
  loading?: boolean;
  options?: readonly CheckCardOption[];
  size?: CheckCardSize;
  bordered?: boolean;
};

export type CheckCardGroupProps = CheckCardGroupCommon &
  (
    | {
        multiple?: false;
        value?: string;
        defaultValue?: string;
        onChange?: (value: string) => void;
        required?: boolean;
      }
    | {
        multiple: true;
        value?: readonly string[];
        defaultValue?: readonly string[];
        onChange?: (value: string[]) => void;
        required?: never;
      }
  );

interface CheckCardGroupState {
  multiple: boolean;
  name?: string;
  form?: string;
  disabled: boolean;
  loading: boolean;
  required: boolean;
  size?: CheckCardSize;
  bordered?: boolean;
  isChecked: (key: string) => boolean;
  change: (key: string, checked: boolean) => void;
  reset: (key: string) => boolean;
}
const GroupContext = React.createContext<CheckCardGroupState | null>(null);
const contains = (
  selection: string | readonly string[] | undefined,
  key: string,
) =>
  typeof selection === "string"
    ? selection === key
    : (selection?.includes(key) ?? false);

function CheckCardGroup(props: CheckCardGroupProps) {
  const {
    multiple = false,
    value,
    defaultValue,
    onChange: _onChange,
    name,
    form,
    disabled,
    loading = false,
    required,
    legend,
    options,
    size,
    bordered,
    children,
    className,
    ...attrs
  } = props;
  const id = React.useId();
  const groupDisabled = useFieldsetDisabled(disabled);
  const [initial] = React.useState(() =>
    typeof defaultValue === "string"
      ? defaultValue
      : [...new Set(defaultValue ?? [])],
  );
  const [local, setLocal] = React.useState<
    string | readonly string[] | undefined
  >(initial);
  const controlled = value !== undefined;
  const selection = controlled ? value : local;
  const state: CheckCardGroupState = {
    multiple,
    name: name || (multiple ? undefined : `mt-check-card-${id}`),
    form,
    disabled: groupDisabled,
    loading,
    required: !!required,
    size,
    bordered,
    isChecked: (key) => contains(selection, key),
    change(key, checked) {
      if (contains(selection, key) === checked) return;
      if (props.multiple) {
        const keys = new Set(
          typeof selection === "string" ? [selection] : selection,
        );
        if (checked) keys.add(key);
        else keys.delete(key);
        const next = [...keys];
        if (!controlled) setLocal(next);
        props.onChange?.(next);
      } else if (checked) {
        if (!controlled) setLocal(key);
        props.onChange?.(key);
      }
    },
    reset(key) {
      if (!controlled) setLocal(initial);
      return contains(controlled ? selection : initial, key);
    },
  };
  return (
    <GroupContext.Provider value={state}>
      <fieldset
        {...attrs}
        role={multiple ? undefined : "radiogroup"}
        name={name}
        form={form}
        aria-busy={loading || undefined}
        className={cn("mt-check-card-group", className)}
      >
        {legend != null && (
          <legend className="mt-check-card-legend">{legend}</legend>
        )}
        <div className="mt-check-card-group-items">
          {children ??
            options?.map((option) => (
              <CheckCardRoot key={option.value} {...option} />
            ))}
        </div>
      </fieldset>
    </GroupContext.Provider>
  );
}

function CheckCardRoot({
  value,
  checked,
  defaultChecked,
  onChange,
  name,
  form,
  required,
  disabled,
  loading: ownLoading = false,
  title,
  description,
  avatar,
  cover,
  extra,
  children,
  size,
  bordered,
  className,
  id,
  "aria-label": label,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  ...props
}: CheckCardProps) {
  const group = React.useContext(GroupContext);
  const generatedId = React.useId();
  const controlId = `${generatedId}-input`;
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;
  const input = React.useRef<HTMLInputElement>(null);
  const key = value ?? "on";
  const currentChecked = group ? group.isChecked(key) : checked;
  const formId = group ? group.form : form;
  const fieldsetDisabled = useFieldsetDisabled(disabled);
  const loading = ownLoading || !!group?.loading;
  const blocked = loading || fieldsetDisabled || !!group?.disabled;
  const controlSize = size ?? group?.size ?? "md";
  const hasBorder = bordered ?? group?.bordered ?? true;
  const descriptionIds =
    [description != null ? descriptionId : undefined, describedBy]
      .filter(Boolean)
      .join(" ") || undefined;

  const hasStateOwner = group !== null || checked !== undefined;
  const latestResetValue = React.useRef<() => boolean | undefined>(
    () => undefined,
  );
  React.useLayoutEffect(() => {
    latestResetValue.current = () => (group ? group.reset(key) : checked);
  }, [group, key, checked]);
  // Wait until the browser's uncanceled default reset has applied. The form's
  // own reset handler can also supply a newer controlled value in this event.
  React.useEffect(() => {
    const element = input.current;
    const owner = element?.form;
    if (!element || !owner || !hasStateOwner) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = (event: Event) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (
          event.defaultPrevented ||
          input.current !== element ||
          element.form !== owner
        )
          return;
        const next = latestResetValue.current();
        if (next !== undefined) element.checked = next;
      }, 0);
    };
    owner.addEventListener("reset", reset);
    return () => {
      owner.removeEventListener("reset", reset);
      clearTimeout(timer);
    };
  }, [formId, hasStateOwner]);

  return (
    <div
      {...props}
      id={id}
      className={cn("mt-check-card", className)}
      data-size={controlSize}
      data-bordered={hasBorder}
      data-loading={loading || undefined}
    >
      <input
        ref={input}
        className="mt-check-card-control"
        id={controlId}
        type={group && !group.multiple ? "radio" : "checkbox"}
        name={group ? group.name : name}
        form={formId}
        value={value}
        checked={currentChecked}
        defaultChecked={
          currentChecked === undefined ? defaultChecked : undefined
        }
        disabled={blocked}
        required={required || group?.required}
        aria-label={label}
        aria-labelledby={
          labelledBy ??
          (label === undefined && title != null ? titleId : undefined)
        }
        aria-describedby={descriptionIds}
        aria-busy={loading || undefined}
        onChange={(event) => {
          if (blocked) return;
          const next = event.currentTarget.checked;
          group?.change(key, next);
          onChange?.(next);
        }}
      />
      <label className="mt-check-card-label" htmlFor={controlId}>
        {cover != null && <span className="mt-check-card-cover">{cover}</span>}
        <span className="mt-check-card-main">
          {avatar != null && (
            <span className="mt-check-card-avatar">{avatar}</span>
          )}
          <span className="mt-check-card-text">
            {title != null && (
              <span id={titleId} className="mt-check-card-title">
                {title}
              </span>
            )}
            {description != null && (
              <span id={descriptionId} className="mt-check-card-description">
                {description}
              </span>
            )}
            {children != null && (
              <span className="mt-check-card-content">{children}</span>
            )}
          </span>
          <span className="mt-check-card-indicator" aria-hidden="true">
            {loading ? (
              <LoaderCircle className="mt-spin" size={14} />
            ) : group && !group.multiple ? (
              <span className="mt-check-card-radio-dot" />
            ) : (
              <Check
                className="mt-check-card-check"
                size={12}
                strokeWidth={2}
              />
            )}
          </span>
        </span>
      </label>
      {extra != null && <div className="mt-check-card-extra">{extra}</div>}
    </div>
  );
}

export const CheckCard = Object.assign(CheckCardRoot, {
  Group: CheckCardGroup,
});
