import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { Button, Spotlight } from "../packages/mtone/src";
const actions = [
  { id: "home", label: "首页", group: "页面", keywords: ["home"], description: "查看工作台" },
  { id: "locked", label: "禁用", disabled: true, group: "页面" },
  { id: "settings", label: "设置", group: "应用", keywords: "preferences" },
];
test("filters label, description and keywords, groups and empty state", async () => {
  render(<Spotlight defaultOpen actions={actions} />);
  const search = await screen.findByRole("combobox");
  expect(screen.getByRole("group", { name: "页面" })).toBeInTheDocument();
  for (const query of ["首页", "工作台", "HOME"]) {
    fireEvent.change(search, { target: { value: query } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option")).toHaveTextContent("首页");
  }
  fireEvent.change(search, { target: { value: "zzzz" } });
  expect(screen.queryAllByRole("option")).toHaveLength(0);
  expect(screen.getByRole("status")).toHaveTextContent("没有找到");
  expect(search).not.toHaveAttribute("aria-activedescendant");
});
test("keyboard skips disabled actions, wraps, and executes once", async () => {
  const select = vi.fn();
  render(<Spotlight defaultOpen actions={actions} onActionSelect={select} />);
  const input = await screen.findByRole("combobox");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(screen.getByRole("option", { name: "设置" })).toHaveAttribute("aria-selected", "true");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(screen.getByRole("option", { name: /首页/ })).toHaveAttribute("aria-selected", "true");
  fireEvent.keyDown(input, { key: "End" });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(select).toHaveBeenCalledExactlyOnceWith(actions[2]);
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
});
test("supports controlled state, custom filtering, limit and keeping open", async () => {
  const change = vi.fn(), selected = vi.fn();
  render(<Spotlight open query="server" onQueryChange={change} closeOnSelect={false}
    actions={actions} filter={() => true} limit={1} onActionSelect={selected} />);
  const input = await screen.findByRole("combobox");
  fireEvent.change(input, { target: { value: "new" } });
  expect(change).toHaveBeenCalledWith("new");
  expect(input).toHaveValue("server");
  expect(screen.getAllByRole("option")).toHaveLength(1);
  fireEvent.click(screen.getByRole("option"));
  expect(selected).toHaveBeenCalledOnce();
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});
test("trigger, shortcuts and reset behavior", async () => {
  render(<><input aria-label="Editor" /><Spotlight actions={actions} trigger={<Button>打开搜索</Button>} /></>);
  fireEvent.keyDown(screen.getByLabelText("Editor"), { key: "k", ctrlKey: true });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  fireEvent.keyDown(document, { key: "k", ctrlKey: true });
  const input = await screen.findByRole("combobox");
  fireEvent.keyDown(input, { key: "k", ctrlKey: true });
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  fireEvent.keyDown(document, { key: "k", metaKey: true });
  const reopened = await screen.findByRole("combobox");
  fireEvent.change(reopened, { target: { value: "home" } });
  fireEvent.click(screen.getByRole("button", { name: "关闭" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  fireEvent.click(screen.getByRole("button", { name: "打开搜索" }));
  expect(await screen.findByRole("combobox")).toHaveValue("");
});
test("disabled pointer actions and IME Enter do not execute", async () => {
  const selected = vi.fn();
  render(<Spotlight defaultOpen actions={actions} onActionSelect={selected} />);
  const input = await screen.findByRole("combobox");
  fireEvent.click(screen.getByRole("option", { name: "禁用" }));
  fireEvent.keyDown(input, { key: "Enter", isComposing: true });
  expect(selected).not.toHaveBeenCalled();
});
