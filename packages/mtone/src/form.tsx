"use client";
import React from "react";
import { createFormStore, emptyStringIsValue, type FormInstance, type FormRule, type FormValues, type FormValidationError } from "./form-store";
export type { FormInstance, FormRule, FormValues, FormValidationError } from "./form-store";
export type FormValidateTrigger = "onChange" | "onBlur" | ("onChange" | "onBlur")[] | false;
const Context = React.createContext<{ form: FormInstance; validateTrigger: FormValidateTrigger; onValuesChange?: (changed: FormValues, values: FormValues) => void } | null>(null);
const emptySubscribe = () => () => {};
const emptySnapshot = () => 0;
function useForm(): [FormInstance] {
  const [form] = React.useState(() => createFormStore());
  return [form];
}
export interface FormFieldProps {
  label: React.ReactNode;
  error?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  children: React.ReactElement;
  /** Flat field key. Omit to retain manual error/controlled-value behavior. */
  name?: string;
  rules?: FormRule[];
  initialValue?: unknown;
  validateTrigger?: FormValidateTrigger;
  valuePropName?: string;
  trigger?: string;
  getValueFromEvent?: (...args: any[]) => unknown;
}
function FormField({ label, error, description, required, children, name, rules, initialValue,
  validateTrigger, valuePropName = "value", trigger: triggerProp, getValueFromEvent }: FormFieldProps) {
  const context = React.useContext(Context);
  const form = name !== undefined ? context?.form : undefined;
  React.useSyncExternalStore(form?.subscribe ?? emptySubscribe, form?.getSnapshot ?? emptySnapshot, emptySnapshot);
  const generatedId = React.useId();
  const child = children as React.ReactElement<Record<string, any>>;
  const inputId = child.props.id || generatedId;
  const valueType = (child.type as unknown as {
    formValueType?: string | ((props: Readonly<{ mode?: unknown }>) => string);
  }).formValueType;
  const kind = typeof valueType === "function" ? valueType(child.props) : valueType;
  const trigger = triggerProp ?? (kind ? "onValueChange" : "onChange");
  const preserveEmptyString = kind === "select-single" && valuePropName === "value";
  const rulesRef = React.useRef({ rules, required, preserveEmptyString });
  rulesRef.current = { rules, required, preserveEmptyString };
  // Registration lifetime is independent of inline rule-array identities.
  React.useEffect(() => {
    if (!form || name === undefined) return;
    return form.register(name, {
      get rules() {
        const latest = rulesRef.current;
        return latest.required && !latest.rules?.some(rule => rule.required)
          ? [{ required: true }, ...(latest.rules ?? [])] : latest.rules ?? [];
      },
      get [emptyStringIsValue]() { return rulesRef.current.preserveEmptyString; },
      initialValue,
    });
  }, [form, name]);
  const messages = form && name !== undefined ? form.getFieldError(name) : [];
  const managedError = messages.length ? messages.join(" ") : undefined;
  const shownError = error !== undefined ? error : managedError;
  const invalid = !!shownError;
  const busy = form && name !== undefined ? form.isFieldValidating(name) : false;
  const help = shownError || description;
  const helpId = `${generatedId}-help`;
  const requiredValue = required ?? rules?.some(rule => rule.required) ?? child.props.required;
  const props: Record<string, any> = {
    id: inputId,
    required: requiredValue,
    "aria-invalid": invalid || (error === undefined && !form ? child.props["aria-invalid"] : false),
    "aria-describedby": [child.props["aria-describedby"], help ? helpId : undefined].filter(Boolean).join(" ") || undefined,
    "aria-busy": busy || undefined,
  };
  if (form && name !== undefined) {
    const value = form.getFieldValue(name);
    props[valuePropName] = value ?? (valuePropName === "checked" ? false : trigger === "onValueChange" ? (kind === "array" || (kind !== "select-single" && Array.isArray(initialValue)) ? [] : null) : "");
    props.name = name;
    const modes = validateTrigger ?? context?.validateTrigger ?? "onChange";
    const shouldValidate = (mode: "onChange" | "onBlur") => modes !== false && (Array.isArray(modes) ? modes.includes(mode) : modes === mode);
    const validate = () => { void form.validateFields([name]).catch(() => {}); };
    props[trigger] = (...args: any[]) => {
      const event = args[0];
      const next = getValueFromEvent ? getValueFromEvent(...args) : event?.target ? event.target[valuePropName] : event;
      form.setFieldValue(name, next);
      child.props[trigger]?.(...args);
      context?.onValuesChange?.({ [name]: next }, form.getFieldsValue());
      if (trigger !== "onBlur" && shouldValidate("onChange")) validate();
    };
    const changeHandler = props[trigger];
    props.onBlur = (...args: any[]) => {
      if (trigger === "onBlur") changeHandler(...args);
      else child.props.onBlur?.(...args);
      if (shouldValidate("onBlur")) validate();
    };
  }
  return <div className="mt-field" data-field-name={name}>
    <label htmlFor={inputId}>{label}{requiredValue && <span aria-hidden="true"> *</span>}</label>
    {React.cloneElement(child, props)}
    {help && <div id={helpId} className={`mt-help${invalid ? " mt-error" : ""}`} aria-live="polite">{help}</div>}
  </div>;
}
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  form?: FormInstance;
  initialValues?: FormValues;
  validateTrigger?: FormValidateTrigger;
  onFinish?: (values: FormValues) => void;
  onFinishFailed?: (error: FormValidationError) => void;
  onValuesChange?: (changed: FormValues, values: FormValues) => void;
}
function FormRoot({ form: supplied, initialValues, validateTrigger = "onChange", onFinish, onFinishFailed, onValuesChange,
  className, onSubmit, onReset, noValidate, children, ...props }: FormProps) {
  const [local] = useForm();
  const form = supplied ?? local;
  const initialised = React.useRef<FormInstance | null>(null);
  if (initialised.current !== form) {
    form.setInitialValues(initialValues ?? {});
    initialised.current = form;
  }
  React.useSyncExternalStore(form.subscribe, form.getSnapshot, emptySnapshot);
  const managed = !!supplied || !!onFinish || form.getFieldsError().length > 0;
  const revision = React.useRef(0);
  React.useEffect(() => () => { revision.current++; }, []);
  return <Context.Provider value={{ form, validateTrigger, onValuesChange }}>
    <form {...props} className={["mt-form", className].filter(Boolean).join(" ")} noValidate={noValidate ?? (managed || undefined)}
      onReset={event => { onReset?.(event); if (!event.defaultPrevented && managed) { revision.current++; form.resetFields(); } }}
      onSubmit={event => {
        onSubmit?.(event);
        if (!managed || event.defaultPrevented) return;
        event.preventDefault();
        const attempt = ++revision.current;
        void form.validateFields().then(values => {
          if (attempt === revision.current) onFinish?.(values);
        }, (error: FormValidationError) => {
          if (attempt !== revision.current || error.outOfDate) return;
          onFinishFailed?.(error);
        });
      }}>{children}</form>
  </Context.Provider>;
}
export const Form = Object.assign(FormRoot, { useForm, Item: FormField });
