import { describe, expect, it, vi } from "vitest";
import { createFormStore } from "../packages/mtone/src/form-store";
const deferred = () => {
  let resolve!: (value: void | string) => void;
  const promise = new Promise<void | string>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};
describe("form store", () => {
  it("validates synchronous rules in order and does not coerce numbers", async () => {
    const store = createFormStore({ age: "20", name: "", tags: [] });
    store.register("age", {
      rules: [{ type: "number", message: "Numeric only" }, { min: 18 }],
    });
    store.register("name", {
      rules: [{ required: true, message: "Name required" }],
    });
    store.register("tags", { rules: [{ required: true }] });
    await expect(store.validateFields()).rejects.toMatchObject({
      outOfDate: false,
      errorFields: [
        { name: "age", errors: ["Numeric only"] },
        { name: "name", errors: ["Name required"] },
        { name: "tags", errors: ["tags is required"] },
      ],
    });
    store.setFieldsValue({ age: 20, name: "Alice", tags: ["one"] });
    await expect(store.validateFields()).resolves.toEqual({
      age: 20,
      name: "Alice",
      tags: ["one"],
    });
  });
  it("skips optional empty values and validates format, whitespace and lengths", async () => {
    const store = createFormStore();
    const optional = vi.fn();
    store.register("optional", {
      rules: [{ type: "email", validator: optional }],
    });
    await store.validateFields();
    expect(optional).toHaveBeenCalledOnce();
    for (const [value, rule] of [
      [" ", { whitespace: true }],
      ["x", { type: "email" }],
      ["wrong", { type: "url" }],
      [1.2, { type: "integer" }],
      ["ab", { min: 3 }],
      [[1, 2], { len: 1 }],
      ["abc", { pattern: /^z/ }],
    ] as const) {
      store.register("test", { rules: [rule] });
      store.setFieldValue("test", value);
      await expect(store.validateFields(["test"])).rejects.toMatchObject({
        outOfDate: false,
      });
    }
  });
  it("does not let an old async error replace a newer validation", async () => {
    const old = deferred();
    const store = createFormStore({ name: "old" });
    store.register("name", {
      rules: [
        {
          validator: (_, value) => (value === "old" ? old.promise : undefined),
        },
      ],
    });
    const pending = store.validateFields();
    const rejected = expect(pending).rejects.toMatchObject({ outOfDate: true });
    expect(store.isFieldValidating("name")).toBe(true);
    store.setFieldValue("name", "new");
    expect(store.isFieldValidating("name")).toBe(false);
    await store.validateFields();
    old.resolve("Old error");
    await rejected;
    expect(store.getFieldError("name")).toEqual([]);
  });
  it("rejects stale submit when an unrelated value changes", async () => {
    const gate = deferred();
    const store = createFormStore({ a: 1, b: 2 });
    store.register("a", { rules: [{ validator: () => gate.promise }] });
    const pending = store.validateFields();
    const rejected = expect(pending).rejects.toMatchObject({ outOfDate: true });
    store.setFieldValue("b", 3);
    gate.resolve();
    await rejected;
  });
  it("reset invalidates pending validation and restores initial values", async () => {
    const gate = deferred();
    const store = createFormStore({ name: "initial" });
    store.register("name", {
      initialValue: "field",
      rules: [{ validator: () => gate.promise }],
    });
    store.setFieldValue("name", "edited");
    const pending = store.validateFields();
    const rejected = expect(pending).rejects.toMatchObject({ outOfDate: true });
    store.resetFields();
    gate.resolve("Late error");
    await rejected;
    expect(store.getFieldValue("name")).toBe("initial");
    expect(store.getFieldError("name")).toEqual([]);
  });
  it("preserves edits on registration updates and ignores stale unregister handles", async () => {
    const store = createFormStore();
    const removeOld = store.register("name", {
      initialValue: "initial",
      rules: [],
    });
    store.setFieldValue("name", "edited");
    store.register("name", { initialValue: "other", rules: [{ min: 10 }] });
    removeOld();
    expect(store.getFieldValue("name")).toBe("edited");
    await expect(store.validateFields()).rejects.toMatchObject({
      errorFields: [{ name: "name" }],
    });
    store.resetFields();
    expect(store.getFieldValue("name")).toBe("initial");
  });
  it("unregister cancels results but preserves values", async () => {
    const gate = deferred();
    const store = createFormStore({ name: "value" });
    const remove = store.register("name", {
      rules: [{ validator: () => gate.promise }],
    });
    const pending = store.validateFields();
    const rejected = expect(pending).rejects.toMatchObject({ outOfDate: true });
    remove();
    gate.resolve("Late");
    await rejected;
    expect(store.getFieldError("name")).toEqual([]);
    expect(store.getFieldValue("name")).toBe("value");
    await expect(store.validateFields()).resolves.toEqual({ name: "value" });
  });
  it("notifies subscribers and returns defensive shallow snapshots", () => {
    const store = createFormStore({ a: 1 });
    const listener = vi.fn();
    const stop = store.subscribe(listener);
    const version = store.getSnapshot();
    store.setFieldValue("a", 2);
    expect(store.getSnapshot()).toBeGreaterThan(version);
    expect(listener).toHaveBeenCalledOnce();
    const values = store.getFieldsValue();
    values.a = 99;
    expect(store.getFieldValue("a")).toBe(2);
    store.setInitialValues({ a: 3, b: 4 });
    expect(store.getFieldsValue()).toEqual({ a: 2, b: 4 });
    store.resetFields();
    expect(store.getFieldsValue()).toEqual({ a: 3, b: 4 });
    stop();
    listener.mockClear();
    store.setFieldValue("a", 5);
    expect(listener).not.toHaveBeenCalled();
  });
});
it("uses updated rules getters without reinitializing values", async () => {
  const store = createFormStore({ a: "ab" });
  let rules = [{ min: 1 }];
  store.register("a", {
    get rules() {
      return rules;
    },
  });
  await store.validateFields();
  rules = [{ min: 4 }];
  await expect(store.validateFields()).rejects.toMatchObject({
    errorFields: [{ name: "a" }],
  });
  expect(store.getFieldValue("a")).toBe("ab");
});
it("supersedes earlier concurrent validations even when values did not change", async () => {
  const gate = deferred();
  const store = createFormStore({ a: "value" });
  let calls = 0;
  store.register("a", {
    rules: [{ validator: () => (++calls === 1 ? gate.promise : undefined) }],
  });
  const pending = store.validateFields();
  const rejected = expect(pending).rejects.toMatchObject({ outOfDate: true });
  await store.validateFields();
  gate.resolve("late");
  await rejected;
  expect(store.getFieldError("a")).toEqual([]);
});
it("partially resets and returns copied errors for every registered field", async () => {
  const store = createFormStore({ a: "", b: 1 });
  store.register("a", { rules: [{ required: true }] });
  store.register("b", {});
  await expect(store.validateFields()).rejects.toMatchObject({
    outOfDate: false,
  });
  const errors = store.getFieldsError();
  expect(errors).toHaveLength(2);
  errors[0].errors.length = 0;
  expect(store.getFieldError("a")).toHaveLength(1);
  store.setFieldsValue({ a: "valid", b: 2 });
  store.resetFields(["a"]);
  expect(store.getFieldsValue()).toEqual({ a: "", b: 2 });
});
it("does not mutate stateful regexes and supports false and zero values", async () => {
  const store = createFormStore({ a: "abc", b: false, c: 0 });
  const pattern = /abc/g;
  store.register("a", { rules: [{ pattern }] });
  store.register("b", { rules: [{ required: true, type: "boolean" }] });
  store.register("c", {
    rules: [{ required: true, type: "integer", min: 0, max: 2 }],
  });
  await store.validateFields();
  await store.validateFields();
  expect(pattern.lastIndex).toBe(0);
});
it("treats prototype-like field names as ordinary own fields", async () => {
  const store = createFormStore({ ["__proto__"]: "initial" });
  store.register("toString", { rules: [{ required: true }] });
  await expect(store.validateFields()).rejects.toMatchObject({
    errorFields: [{ name: "toString" }],
  });
  store.setFieldValue("__proto__", "edit");
  store.resetFields(["__proto__"]);
  expect(store.getFieldValue("__proto__")).toBe("initial");
});

it("runs custom validators for optional empty values", async () => {
  const store = createFormStore();
  store.register("a", {
    rules: [
      {
        type: "email",
        min: 4,
        pattern: /x/,
        validator: (_, value) => (value ? undefined : "Custom required"),
      },
    ],
  });
  await expect(store.validateFields()).rejects.toMatchObject({
    errorFields: [{ name: "a", errors: ["Custom required"] }],
  });
});
