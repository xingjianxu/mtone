import { useId, useState, type ReactNode } from "react";
import {
  Button,
  Input,
  NumberInput,
  Select,
  Switch,
} from "../../../packages/mtone/src";

import { PlaygroundFrame } from "./toolbar-frame";

type Value = boolean | number | string;
type Settings = Record<string, Value>;
type Choice = readonly [string, string];

interface Field<T extends Value, C extends Settings = Settings> {
  label: string;
  initial: T;
  choices?: readonly Choice[];
  min?: number;
  max?: number;
  step?: number;
  when?: (config: C) => boolean;
  disabled?: (config: C) => boolean;
  advanced?: boolean;
  hidden?: boolean;
}
type Fields = Record<string, Field<Value>>;
type Inferred<F extends Fields> = { [K in keyof F]: F[K]["initial"] };

export const flag = (
  label: string,
  initial = false,
  advanced = false,
): Field<boolean> => ({ label, initial, advanced });
export const number = (
  label: string,
  initial: number,
  min: number,
  max: number,
  advanced = false,
  step = 1,
): Field<number> => ({ label, initial, min, max, step, advanced });
export const text = (
  label: string,
  initial: string,
  advanced = false,
): Field<string> => ({ label, initial, advanced });
export function choice<const T extends string>(
  label: string,
  initial: NoInfer<T>,
  choices: readonly (T | readonly [T, string])[],
  advanced = false,
): Field<T> {
  return {
    label,
    initial,
    choices: choices.map((c) => (typeof c === "string" ? [c, c] : c)),
    advanced,
  };
}
export const sizes = ["sm", "md", "lg"] as const;
export const sides = ["top", "bottom", "left", "right"] as const;
export const alignments = ["start", "center", "end"] as const;

function Control({
  field,
  value,
  update,
  disabled,
  popover,
}: {
  field: Field<Value>;
  value: Value;
  update: (v: Value) => void;
  disabled: boolean;
  popover: boolean;
}) {
  const id = useId();
  if (typeof value === "boolean") {
    return popover ? (
      <Switch
        label={field.label}
        checked={value}
        disabled={disabled}
        onCheckedChange={update}
      />
    ) : (
      <Button
        toggle
        pressed={value}
        variant="outline"
        disabled={disabled}
        onPressedChange={update}
      >
        {field.label}
      </Button>
    );
  }
  if (field.choices) {
    return (
      <div className="docs-playground-control">
        {popover && <span id={id}>{field.label}</span>}
        <Select
          label={field.label}
          value={String(value)}
          disabled={disabled}
          options={field.choices.map(([value, label]) => ({
            value,
            label: popover ? label : `${field.label}：${label}`,
          }))}
          onValueChange={(next) => {
            if (next !== null) update(next);
          }}
        />
      </div>
    );
  }
  return (
    <div className="docs-playground-control">
      <span id={id}>{field.label}</span>
      {typeof value === "number" ? (
        <NumberInput
          label={field.label}
          aria-labelledby={id}
          value={value}
          disabled={disabled}
          min={field.min}
          max={field.max}
          step={field.step}
          onValueChange={(v) => {
            if (v !== null) update(v);
          }}
        />
      ) : (
        <Input
          aria-labelledby={id}
          value={value}
          disabled={disabled}
          onChange={(event) => update(event.target.value)}
        />
      )}
    </div>
  );
}

export function playground<F extends Fields>(
  name: string,
  fields: F,
  render: (config: Inferred<F>) => ReactNode,
  options?: {
    remountOn?: readonly (keyof F)[];
    actions?: (apply: (patch: Partial<Inferred<F>>) => void) => ReactNode;
  },
) {
  const entries = Object.entries(fields);
  const defaults = Object.fromEntries(
    entries.map(([key, field]) => [key, field.initial]),
  ) as Settings;
  return function Playground() {
    const [values, setValues] = useState(defaults);
    const [resetCount, setResetCount] = useState(0);
    const controls = (advanced: boolean) =>
      entries
        .filter(
          ([, field]) =>
            !field.hidden &&
            !!field.advanced === advanced &&
            (!field.when || field.when(values)),
        )
        .map(([key, field]) => (
          <Control
            key={key}
            field={field}
            value={values[key]}
            popover={advanced}
            disabled={field.disabled?.(values) ?? false}
            update={(value) =>
              setValues((current) => ({ ...current, [key]: value }))
            }
          />
        ));
    const extraActions = options?.actions?.((patch) => {
      setValues((current) => ({ ...current, ...patch }) as Settings);
      setResetCount((n) => n + 1);
    });
    const advanced = controls(true);
    const key = JSON.stringify([
      resetCount,
      ...(options?.remountOn?.map((k) => values[String(k)]) ?? []),
    ]);
    return (
      <PlaygroundFrame
        name={name}
        start={controls(false)}
        advanced={
          advanced.length || extraActions ? (
            <>
              {advanced}
              {extraActions}
            </>
          ) : undefined
        }
        onReset={() => {
          setValues(defaults);
          setResetCount((n) => n + 1);
        }}
      >
        <div className="docs-playground-sample" key={key}>
          {render(values as Inferred<F>)}
        </div>
      </PlaygroundFrame>
    );
  };
}
