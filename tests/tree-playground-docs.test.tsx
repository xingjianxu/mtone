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
