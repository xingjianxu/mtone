import React from "react";
import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { componentDocs } from "../apps/docs/catalog";
import { ComponentExample } from "../apps/docs/examples";
it("documents TreeSelect's independent selection and loading contract", () => {
  const doc = componentDocs.find((d) => d.name === "TreeSelect");
  expect(doc?.category).toBe("数据录入");
  expect(doc?.props.map((p) => p.name)).toEqual(
    expect.arrayContaining([
      "items",
      "multiple",
      "checkStrictly",
      "loadData",
      "showCheckedStrategy",
    ]),
  );
  expect(doc?.notes.join(" ")).toContain("null");
  expect(doc?.notes.join(" ")).toContain("items");
});
it("provides separate single, multiple, search, strict, lazy, and state examples", () => {
  render(<ComponentExample name="TreeSelect" />);
  for (const name of [
    "单选与清空",
    "多选与父子联动",
    "搜索节点",
    "独立勾选",
    "异步加载",
    "禁用与校验状态",
  ]) {
    expect(screen.getByRole("heading", { name })).toBeVisible();
  }
  expect(screen.getByRole("combobox", { name: "禁用树选择" })).toBeDisabled();
});
