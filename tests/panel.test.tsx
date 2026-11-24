import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { Panel } from "../packages/mtone/src";
import PanelIde from "../apps/docs/inline-demos/panel-ide";

const items = [
  { value: "problems", label: "Problems", content: <p>No problems</p> },
  { value: "terminal", label: "Terminal", content: <input aria-label="Command" /> },
];

it("renders a real tab interface and only its header while initially collapsed on the server", () => {
  const markup = renderToStaticMarkup(<Panel label="Workbench" items={items} defaultCollapsed />);
  expect(markup).toMatch(/role="tablist"/);
  expect(markup).toMatch(/aria-expanded="false"/);
  expect(markup).toMatch(/hidden=""[^>]*role="tabpanel"|role="tabpanel"[^>]*hidden=""/);
});

it("preserves tab content across selection and collapse while keeping header actions available", async () => {
  const user = userEvent.setup();
  const info = vi.fn();
  const collapse = vi.fn();
  render(<Panel label="Workbench" items={items} onCollapsedChange={collapse} actions={<button onClick={info}>Info</button>} />);
  const list = screen.getByRole("tablist", { name: "Workbench" });
  await user.click(within(list).getByRole("tab", { name: "Terminal" }));
  const input = screen.getByRole("textbox", { name: "Command" });
  await user.type(input, "npm run dev");
  await user.click(within(list).getByRole("tab", { name: "Problems" }));
  await user.click(within(list).getByRole("tab", { name: "Terminal" }));
  expect(screen.getByRole("textbox", { name: "Command" })).toBe(input);
  await user.click(screen.getByRole("button", { name: "收起面板" }));
  expect(collapse).toHaveBeenLastCalledWith(true);
  expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
  expect(input.isConnected).toBe(true);
  await user.click(screen.getByRole("button", { name: "Info" }));
  expect(info).toHaveBeenCalledOnce();
  await user.click(screen.getByRole("button", { name: "展开面板" }));
  expect(collapse).toHaveBeenLastCalledWith(false);
  expect(input).toHaveValue("npm run dev");
});

it("keeps controlled selection and collapse until the parent accepts each request", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  const onCollapsedChange = vi.fn();
  const ref = React.createRef<HTMLDivElement>();
  const common = { items, onValueChange, onCollapsedChange, ref };
  const view = render(<Panel {...common} id="workbench" value="problems" collapsed={false} />);
  const problems = screen.getByRole("tab", { name: "Problems" });
  problems.focus();
  await user.keyboard("{ArrowRight}{Enter}");
  expect(onValueChange).toHaveBeenLastCalledWith("terminal");
  expect(problems).toHaveAttribute("aria-selected", "true");
  const collapse = screen.getByRole("button", { name: "收起面板" });
  await user.click(collapse);
  expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
  expect(screen.getByRole("tabpanel")).toBeVisible();
  view.rerender(<Panel {...common} id="workbench" value="terminal" collapsed />);
  expect(screen.getByRole("tab", { name: "Terminal" })).toHaveAttribute("aria-selected", "true");
  expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
  expect(ref.current).toBe(document.getElementById("workbench"));
});

it("supports a physically left tab rail under RTL without remounting visited contents", async () => {
  const user = userEvent.setup();
  const railItems = [
    { ...items[0], icon: <svg /> },
    items[1],
  ];
  const view = render(<Panel label="Workbench" dir="rtl" items={railItems} tabPlacement="left" />);
  const list = screen.getByRole("tablist", { name: "Workbench" });
  expect(list).toHaveAttribute("aria-orientation", "vertical");
  const problems = within(list).getByRole("tab", { name: "Problems" });
  expect(problems).toHaveAttribute("title", "Problems");
  problems.focus();
  await user.keyboard("{ArrowDown}{Enter}");
  const input = screen.getByRole("textbox", { name: "Command" });
  await user.type(input, "npm run dev");
  view.rerender(<Panel label="Workbench" dir="rtl" items={railItems} tabPlacement="bottom" />);
  expect(list).not.toHaveAttribute("aria-orientation", "vertical");
  expect(input).toHaveValue("npm run dev");
  expect(input).toBe(screen.getByRole("textbox", { name: "Command" }));
  expect(problems).not.toHaveAttribute("title");
});

it("toggles the docked panel from its separator without losing the command", () => {
  render(<PanelIde />);
  const separator = screen.getByRole("separator");
  const input = screen.getByRole("textbox", { name: "输入命令" });
  fireEvent.change(input, { target: { value: "npm run dev" } });

  const tabBar = screen.getByRole("tablist", { name: "工作区标签" });
  expect(tabBar.closest(".mt-tabs")).toHaveAttribute("data-size", "md");
  fireEvent.click(within(screen.getByRole("group", { name: "标签高度" })).getByRole("button", { name: "lg" }));
  fireEvent.click(within(screen.getByRole("group", { name: "标签位置" })).getByRole("button", { name: "右侧" }));
  expect(tabBar.closest(".mt-tabs")).toHaveAttribute("data-size", "lg");
  expect(tabBar).toHaveAttribute("aria-orientation", "vertical");
  expect(screen.getByRole("textbox", { name: "输入命令" })).toBe(input);

  fireEvent.doubleClick(separator);
  expect(screen.getByRole("button", { name: "展开面板" })).toBeVisible();
  expect(screen.queryByRole("textbox", { name: "输入命令" })).not.toBeInTheDocument();

  fireEvent.keyDown(separator, { key: "Enter" });
  expect(screen.getByRole("textbox", { name: "输入命令" })).toHaveValue("npm run dev");
});
