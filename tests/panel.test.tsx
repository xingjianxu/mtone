import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { Panel } from "../packages/mtone/src";

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
