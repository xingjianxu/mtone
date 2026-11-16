export type FormValues = Record<string, unknown>;
export interface FormRule {
  required?: boolean;
  type?:
    "string" | "number" | "boolean" | "array" | "email" | "url" | "integer";
  min?: number;
  max?: number;
  len?: number;
  pattern?: RegExp;
  whitespace?: boolean;
  message?: string;
  validator?: (
    rule: FormRule,
    value: unknown,
    values: FormValues,
  ) => void | string | Promise<void | string>;
}
export interface FormFieldError {
  name: string;
  errors: string[];
}
export interface FormValidationError {
  values: FormValues;
  errorFields: FormFieldError[];
  outOfDate: boolean;
}
export interface FieldRegistration {
  rules?: FormRule[];
  initialValue?: unknown;
}
export interface FormInstance {
  getFieldValue(name: string): unknown;
  getFieldsValue(): FormValues;
  setFieldValue(name: string, value: unknown): void;
  setFieldsValue(values: FormValues): void;
  getFieldError(name: string): string[];
  getFieldsError(names?: string[]): FormFieldError[];
  isFieldValidating(name: string): boolean;
  validateFields(names?: string[]): Promise<FormValues>;
  resetFields(names?: string[]): void;
  subscribe(listener: () => void): () => void;
  getSnapshot(): number;
  register(name: string, config: FieldRegistration): () => void;
  /** Updates reset defaults; only absent values are initialized, never edited values. */
  setInitialValues(values: FormValues): void;
}
interface Field {
  token: symbol;
  rules: FormRule[];
  epoch: number;
  validating: boolean;
  errors: string[];
}
const own = (value: object, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);
const empty = (value: unknown) =>
  value == null || value === "" || (Array.isArray(value) && value.length === 0);

async function validateRule(
  name: string,
  rule: FormRule,
  value: unknown,
  values: FormValues,
): Promise<string | undefined> {
  const failure = (message: string) => rule.message ?? message;
  if (empty(value) && rule.required) return failure(`${name} is required`);
  if (!empty(value)) {
    if (rule.whitespace && typeof value === "string" && value.trim() === "")
      return failure(`${name} cannot be blank`);
    let typeValid = true;
    switch (rule.type) {
      case "string":
        typeValid = typeof value === "string";
        break;
      case "number":
        typeValid = typeof value === "number" && Number.isFinite(value);
        break;
      case "integer":
        typeValid = typeof value === "number" && Number.isInteger(value);
        break;
      case "boolean":
        typeValid = typeof value === "boolean";
        break;
      case "array":
        typeValid = Array.isArray(value);
        break;
      case "email":
        typeValid =
          typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
      case "url": {
        try {
          const url = new URL(typeof value === "string" ? value : "");
          typeValid = !!url.protocol && !!url.hostname;
        } catch {
          typeValid = false;
        }
        break;
      }
    }
    if (!typeValid) return failure(`${name} must be ${rule.type}`);
    const size =
      typeof value === "number"
        ? value
        : typeof value === "string" || Array.isArray(value)
          ? value.length
          : undefined;
    if (rule.len !== undefined && size !== rule.len)
      return failure(`${name} must have length ${rule.len}`);
    if (
      rule.min !== undefined &&
      (size === undefined || !Number.isFinite(size) || size < rule.min)
    )
      return failure(`${name} must be at least ${rule.min}`);
    if (
      rule.max !== undefined &&
      (size === undefined || !Number.isFinite(size) || size > rule.max)
    )
      return failure(`${name} must be at most ${rule.max}`);
    // Clone to avoid stateful /g or /y patterns changing subsequent validation results.
    if (
      rule.pattern &&
      (typeof value !== "string" ||
        !new RegExp(rule.pattern.source, rule.pattern.flags).test(value))
    )
      return failure(`${name} has an invalid format`);
  }
  if (rule.validator) {
    try {
      const result = await rule.validator(rule, value, { ...values });
      if (typeof result === "string") return failure(result);
    } catch (error) {
      return failure(
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : `${name} is invalid`,
      );
    }
  }
  return undefined;
}

export function createFormStore(initialValues: FormValues = {}): FormInstance {
  let baseline: FormValues = { ...initialValues };
  let values: FormValues = { ...initialValues };
  const fieldDefaults = new Map<string, unknown>();
  const fields = new Map<string, Field>();
  const listeners = new Set<() => void>();
  let version = 0;
  let revision = 0;
  const publish = () => {
    version++;
    for (const listener of [...listeners]) listener();
  };
  const invalidate = () => {
    revision++;
    for (const field of fields.values()) {
      field.epoch++;
      field.validating = false;
    }
  };
  const getFieldsError = (names = [...fields.keys()]): FormFieldError[] =>
    [...new Set(names)].map((name) => ({
      name,
      errors: [...(fields.get(name)?.errors ?? [])],
    }));
  const setFieldsValue = (next: FormValues) => {
    invalidate();
    values = { ...values, ...next };
    for (const name of Object.keys(next)) {
      const field = fields.get(name);
      if (field) field.errors = [];
    }
    publish();
  };
  return {
    getFieldValue: (name) => (own(values, name) ? values[name] : undefined),
    getFieldsValue: () => ({ ...values }),
    setFieldValue: (name, value) => setFieldsValue({ [name]: value }),
    setFieldsValue,
    getFieldError: (name) => [...(fields.get(name)?.errors ?? [])],
    getFieldsError,
    isFieldValidating: (name) => fields.get(name)?.validating ?? false,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => version,
    register(name, config) {
      invalidate();
      const previous = fields.get(name);
      if (!fieldDefaults.has(name) && own(config, "initialValue"))
        fieldDefaults.set(name, config.initialValue);
      if (!own(values, name)) {
        if (own(baseline, name)) values = { ...values, [name]: baseline[name] };
        else if (fieldDefaults.has(name))
          values = { ...values, [name]: fieldDefaults.get(name) };
      }
      const field: Field = {
        token: Symbol(name),
        get rules() {
          return config.rules ?? [];
        },
        epoch: 0,
        validating: false,
        errors: previous?.errors ?? [],
      };
      fields.set(name, field);
      publish();
      return () => {
        if (fields.get(name)?.token !== field.token) return;
        invalidate();
        fields.delete(name);
        publish();
      };
    },
    setInitialValues(next) {
      invalidate();
      baseline = { ...next };
      for (const name of Object.keys(next))
        if (!own(values, name)) values = { ...values, [name]: next[name] };
      publish();
    },
    resetFields(names) {
      invalidate();
      const targets = names
        ? [...new Set(names)]
        : [
            ...new Set([
              ...Object.keys(values),
              ...Object.keys(baseline),
              ...fieldDefaults.keys(),
              ...fields.keys(),
            ]),
          ];
      const next = { ...values };
      for (const name of targets) {
        if (own(baseline, name))
          Object.defineProperty(next, name, {
            value: baseline[name],
            enumerable: true,
            configurable: true,
            writable: true,
          });
        else if (fieldDefaults.has(name))
          Object.defineProperty(next, name, {
            value: fieldDefaults.get(name),
            enumerable: true,
            configurable: true,
            writable: true,
          });
        else delete next[name];
        const field = fields.get(name);
        if (field) field.errors = [];
      }
      values = next;
      publish();
    },
    async validateFields(names) {
      const snapshot = { ...values };
      const startedRevision = revision;
      const targets = [...new Set(names ?? [...fields.keys()])].flatMap(
        (name) => {
          const field = fields.get(name);
          if (!field) return [];
          field.epoch++;
          field.validating = true;
          return [{ name, field, epoch: field.epoch }];
        },
      );
      if (targets.length) publish();
      const stale = (target: (typeof targets)[number]) =>
        revision !== startedRevision ||
        fields.get(target.name) !== target.field ||
        target.field.epoch !== target.epoch;
      const results = await Promise.all(
        targets.map(async (target) => {
          let error: string | undefined;
          for (const rule of target.field.rules) {
            if (stale(target)) break;
            error = await validateRule(
              target.name,
              rule,
              own(snapshot, target.name) ? snapshot[target.name] : undefined,
              snapshot,
            );
            if (error !== undefined) break;
          }
          if (!stale(target)) {
            target.field.errors = error === undefined ? [] : [error];
            target.field.validating = false;
            publish();
          }
          return {
            name: target.name,
            errors: error === undefined ? [] : [error],
          };
        }),
      );
      const outOfDate = revision !== startedRevision || targets.some(stale);
      const errorFields = results.filter((result) => result.errors.length > 0);
      if (outOfDate || errorFields.length)
        throw {
          values: snapshot,
          errorFields,
          outOfDate,
        } satisfies FormValidationError;
      return snapshot;
    },
  };
}
