import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { docSections } from "../apps/docs/docs-app";

if (!window.PointerEvent)
  window.PointerEvent = MouseEvent as typeof PointerEvent;

const Demo = docSections.Tree[0].Demo!;
const tree = () => screen.getByRole("tree", { name: "树形配置预览" });
const item = (name: string) => within(tree()).getByRole("treeitem", { name });
const toggle = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name }));

test("Tree's first demo preserves its direct link and applies quick changes", () => {
  expect(docSections.Tree[0]).toMatchObject({
    id: "playground",
    playground: true,
  });
  render(<Demo />);
  expect(tree()).toHaveClass("mt-tree-lines");
  toggle("连接线");
  expect(tree()).not.toHaveClass("mt-tree-lines");

  expect(item("快速开始").querySelector(".mt-tree-icon")).not.toBeNull();
  toggle("节点图标");
  expect(item("快速开始").querySelector(".mt-tree-icon")).toBeNull();
  toggle("复选框");
  fireEvent.click(within(item("快速开始")).getByRole("checkbox"));
  expect(item("快速开始")).toHaveAttribute("aria-checked", "true");

  toggle("重置");
  expect(tree()).toHaveClass("mt-tree-lines");
  expect(item("快速开始").querySelector(".mt-tree-icon")).not.toBeNull();
  expect(within(tree()).queryByRole("checkbox")).not.toBeInTheDocument();
  expect(item("快速开始")).toHaveAttribute("aria-selected", "true");
});

test("Tree advanced settings are conditional and take effect immediately", () => {
  render(<Demo />);
  expect(screen.queryByRole("switch", { name: "父子独立勾选" })).toBeNull();
  toggle("更多设置");
  expect(screen.getByRole("switch", { name: "父子独立勾选" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  expect(screen.queryByRole("combobox", { name: "标题展开方式" })).toBeNull();
  fireEvent.click(screen.getByRole("switch", { name: "整行铺满" }));
  expect(tree()).toHaveClass("mt-tree-inline");
  fireEvent.keyDown(screen.getByRole("textbox", { name: "层级缩进（px）" }), {
    key: "ArrowUp",
  });
  expect(tree().style.getPropertyValue("--_mt-tree-indent")).toBe("21px");
  fireEvent.click(screen.getByRole("switch", { name: "禁用整棵树" }));
  expect(tree()).toHaveAttribute("aria-disabled", "true");
  toggle("重置");
  expect(tree()).not.toHaveClass("mt-tree-inline");
  expect(tree()).not.toHaveAttribute("aria-disabled");
  expect(tree().style.getPropertyValue("--_mt-tree-indent")).toBe("20px");
});
