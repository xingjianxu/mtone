import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { componentDocs } from "../apps/docs/catalog";
import { ComponentExample } from "../apps/docs/examples";
import { secondaryDocSections } from "../apps/docs/secondary-demo-registry";

test("CheckCard is discoverable as input and documents selection versus layout", () => {
  const doc = componentDocs.find((entry) => entry.name === "CheckCard");
  expect(doc?.category).toBe("表单输入");
  expect(doc?.props.map((prop) => prop.name)).toContain(
    "CheckCard.Group.multiple",
  );
  const sections = secondaryDocSections.CheckCard;
  expect(sections.map((section) => section.id)).toEqual([
    "usage",
    "single",
    "multiple",
    "layout",
    "content",
    "states",
  ]);
  const layout = sections.find((section) => section.id === "layout");
  expect(layout?.source).toContain('from "@bixlab/mtone"');
  expect(layout?.source).toContain("<CardGroup");
  expect(layout?.source).toContain("<CheckCard.Group");
});

test("CheckCard gallery demonstrates a toggleable standalone card", () => {
  render(<ComponentExample name="CheckCard" />);
  const card = screen.getByRole("checkbox", { name: "接收项目动态" });
  expect(card).toBeChecked();
  fireEvent.click(card);
  expect(card).not.toBeChecked();
});

test("responsive CardGroup layout wraps actual radio options in CheckCard.Group", () => {
  const Demo = secondaryDocSections.CheckCard.find(
    (section) => section.id === "layout",
  )!.Demo!;
  render(<Demo />);
  const selection = screen.getByRole("radiogroup", { name: "选择工作区视图" });
  const first = within(selection).getByRole("radio", { name: "概览" });
  const second = within(selection).getByRole("radio", { name: "项目" });
  expect(first.closest(".mt-card-group")).toBe(
    second.closest(".mt-card-group"),
  );
  expect(first.closest(".mt-card-group")).toHaveStyle({
    "--mt-card-group-columns-xs": "1",
    "--mt-card-group-columns-sm": "2",
    "--mt-card-group-columns-md": "3",
  });
  expect(first).toBeChecked();
  fireEvent.click(second);
  expect(first).not.toBeChecked();
  expect(second).toBeChecked();
});

test("the content example action is independent of selecting the card", () => {
  const Demo = secondaryDocSections.CheckCard.find(
    (section) => section.id === "content",
  )!.Demo!;
  render(<Demo />);
  const card = screen.getByRole("checkbox", { name: "研究资料包" });
  expect(card).not.toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "查看内容" }));
  expect(card).not.toBeChecked();
  expect(screen.getByRole("status")).toHaveTextContent("含三类资料");
  fireEvent.click(card);
  expect(card).toBeChecked();
});

test("the multi-select example keeps previously selected options", () => {
  const Demo = secondaryDocSections.CheckCard.find(
    (section) => section.id === "multiple",
  )!.Demo!;
  render(<Demo />);
  const group = screen.getByRole("group", { name: "订阅提醒" });
  const weekly = within(group).getByRole("checkbox", { name: "每周简报" });
  const mentions = within(group).getByRole("checkbox", { name: "提及提醒" });
  expect(weekly).toBeChecked();
  fireEvent.click(mentions);
  expect(weekly).toBeChecked();
  expect(mentions).toBeChecked();
});

test("the states example displays disabled and loading options", () => {
  const Demo = secondaryDocSections.CheckCard.find(
    (section) => section.id === "states",
  )!.Demo!;
  render(<Demo />);
  expect(screen.getByRole("checkbox", { name: "可选卡片" })).toBeEnabled();
  expect(screen.getByRole("checkbox", { name: "不可选套餐" })).toBeDisabled();
  expect(screen.getByRole("checkbox", { name: "正在核对配额" })).toBeDisabled();
});
