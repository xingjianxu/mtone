import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { secondaryDocSections } from "../apps/docs/secondary-demo-registry";

if (!window.PointerEvent)
  window.PointerEvent = MouseEvent as typeof PointerEvent;

test("the Tree playground changes live options and restores the sample", () => {
  const section = secondaryDocSections.Tree.find(
    ({ id }) => id === "playground",
  );
  expect(section).toBeDefined();
  expect(section?.source).toContain('from "@bixlab/mtone"');
  const Demo = section!.Demo!;
  render(<Demo />);
  const tree = () => screen.getByRole("tree", { name: "树形配置预览" });
  const item = (name: string) => within(tree()).getByRole("treeitem", { name });
  const toggle = (name: string) =>
    fireEvent.click(screen.getByRole("switch", { name }));

  expect(tree().style.getPropertyValue("--_mt-tree-row-height")).toBe("32px");
  expect(tree().style.getPropertyValue("--_mt-tree-row-gap")).toBe("2px");
  expect(tree()).not.toHaveClass("mt-tree-lines");
  toggle("连接线");
  expect(tree()).toHaveClass("mt-tree-lines");
  expect(item("快速开始").querySelector(".mt-tree-guide")).not.toBeNull();

  expect(item("快速开始").querySelector(".mt-tree-icon")).not.toBeNull();
  toggle("节点图标");
  expect(item("快速开始").querySelector(".mt-tree-icon")).toBeNull();
  toggle("复选框");
  fireEvent.click(within(item("快速开始")).getByRole("checkbox"));
  expect(item("快速开始")).toHaveAttribute("aria-checked", "true");
  toggle("多选");
  expect(tree()).toHaveAttribute("aria-multiselectable", "true");
  fireEvent.click(item("快速开始"));
  fireEvent.click(item("样式规范"));
  expect(
    within(tree()).getAllByRole("treeitem", { selected: true }),
  ).toHaveLength(2);
  toggle("多选");
  expect(
    within(tree()).getAllByRole("treeitem", { selected: true }),
  ).toHaveLength(1);

  fireEvent.click(screen.getByRole("button", { name: "恢复默认" }));
  expect(tree()).not.toHaveClass("mt-tree-lines");
  expect(item("快速开始").querySelector(".mt-tree-icon")).not.toBeNull();
  expect(within(tree()).queryByRole("checkbox")).not.toBeInTheDocument();
  expect(
    within(tree()).queryAllByRole("treeitem", { selected: true }),
  ).toHaveLength(0);
  expect(tree().style.getPropertyValue("--_mt-tree-row-height")).toBe("32px");
  expect(tree().style.getPropertyValue("--_mt-tree-row-gap")).toBe("2px");
});

test("the Tree playground exposes selection, strict checks, layout and directory options", () => {
  const Demo = secondaryDocSections.Tree.find(
    ({ id }) => id === "playground",
  )!.Demo!;
  render(<Demo />);
  const tree = () => screen.getByRole("tree", { name: "树形配置预览" });
  const item = (name: string) => within(tree()).getByRole("treeitem", { name });
  const toggle = (name: string) =>
    fireEvent.click(screen.getByRole("switch", { name }));
  const size = (name: string) => screen.getByRole("textbox", { name });

  expect(screen.getByRole("switch", { name: "独立勾选" })).toHaveAttribute("aria-disabled", "true");
  toggle("整行铺满");
  expect(tree()).toHaveClass("mt-tree-inline");
  toggle("允许选择");
  fireEvent.click(item("快速开始"));
  expect(item("快速开始")).not.toHaveAttribute("aria-selected", "true");
  toggle("禁用树");
  expect(tree()).toHaveAttribute("aria-disabled", "true");
  toggle("禁用树");
  toggle("复选框");
  toggle("独立勾选");
  fireEvent.click(within(item("组件设计")).getByRole("checkbox"));
  expect(item("组件设计")).toHaveAttribute("aria-checked", "true");
  expect(item("样式规范")).toHaveAttribute("aria-checked", "false");
  toggle("目录模式");
  expect(tree()).toHaveClass("mt-tree-directory");
  expect(screen.getByRole("combobox", { name: "标题展开方式" })).toBeEnabled();

  const increment = (name: string) =>
    fireEvent.keyDown(size(name), { key: "ArrowUp" });
  increment("缩进（px）");
  increment("可视高度（px）");
  expect(tree().style.getPropertyValue("--_mt-tree-indent")).toBe("21px");
  expect(tree()).toHaveStyle({ height: "225px" });

  fireEvent.click(screen.getByRole("button", { name: "恢复默认" }));
  expect(tree()).not.toHaveClass("mt-tree-inline", "mt-tree-directory");
  expect(tree()).not.toHaveAttribute("aria-disabled");
  expect(tree().style.getPropertyValue("--_mt-tree-indent")).toBe("20px");
  expect(tree()).toHaveStyle({ height: "224px" });
  expect(screen.getByRole("combobox", { name: "标题展开方式" })).toBeDisabled();
});
