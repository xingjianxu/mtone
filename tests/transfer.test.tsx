import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, vi } from "vitest";
import { Transfer } from "../packages/mtone/src";
window.PointerEvent = window.MouseEvent as typeof PointerEvent;
const items = [
  { key: "a", label: "Alpha" },
  { key: "b", label: "Beta" },
  { key: "c", label: "Locked", disabled: true },
];
test("moves selected enabled items both ways and reports keys", async () => {
  const u = userEvent.setup(),
    change = vi.fn();
  render(<Transfer items={items} onChange={change} />);
  await u.click(screen.getByRole("checkbox", { name: "Alpha" }));
  await u.click(screen.getByRole("button", { name: "移入已选" }));
  expect(change).toHaveBeenLastCalledWith(["a"], "right", ["a"]);
  const target = screen.getByRole("region", { name: "已选项" });
  expect(within(target).getByText("Alpha")).toBeVisible();
  await u.click(within(target).getByRole("checkbox", { name: "Alpha" }));
  await u.click(screen.getByRole("button", { name: "移回待选" }));
  expect(change).toHaveBeenLastCalledWith([], "left", ["a"]);
});
test("controlled target never mutates and disabled items never move", async () => {
  const u = userEvent.setup(),
    change = vi.fn();
  render(<Transfer items={items} targetKeys={[]} onChange={change} />);
  await u.click(screen.getByRole("checkbox", { name: "全选待选项" }));
  await u.click(screen.getByRole("button", { name: "移入已选" }));
  expect(change).toHaveBeenCalledWith(["a", "b"], "right", ["a", "b"]);
  expect(
    within(screen.getByRole("region", { name: "待选项" })).getByText("Alpha"),
  ).toBeVisible();
});
test("search scopes select all while preserving hidden selection", async () => {
  const u = userEvent.setup();
  render(<Transfer items={items} showSearch />);
  await u.click(screen.getByRole("checkbox", { name: "Beta" }));
  await u.type(screen.getByRole("textbox", { name: "搜索待选项" }), "Alpha");
  await u.click(screen.getByRole("checkbox", { name: "全选待选项" }));
  await u.click(screen.getByRole("button", { name: "移入已选" }));
  const target = screen.getByRole("region", { name: "已选项" });
  expect(within(target).getByText("Alpha")).toBeVisible();
  expect(within(target).getByText("Beta")).toBeVisible();
});
test("pagination selection is page scoped and page clamps after transfer", async () => {
  const u = userEvent.setup();
  render(<Transfer items={items} pagination={{ pageSize: 1 }} />);
  await u.click(screen.getAllByRole("button", { name: "下一页" })[0]);
  await u.click(screen.getByRole("checkbox", { name: "全选待选项" }));
  await u.click(screen.getByRole("button", { name: "移入已选" }));
  expect(
    within(screen.getByRole("region", { name: "已选项" })).getByText("Beta"),
  ).toBeVisible();
});
test("one way removes individual targets but respects disabled", async () => {
  const u = userEvent.setup();
  render(<Transfer items={items} defaultTargetKeys={["a", "c"]} oneWay />);
  expect(screen.queryByRole("button", { name: "移回待选" })).toBeNull();
  await u.click(screen.getByRole("button", { name: "移除 Alpha" }));
  expect(
    within(screen.getByRole("region", { name: "待选项" })).getByText("Alpha"),
  ).toBeVisible();
  expect(screen.getByRole("button", { name: "移除 Locked" })).toBeDisabled();
});
test("preserves missing target keys and target ordering", async () => {
  const u = userEvent.setup(),
    change = vi.fn();
  render(
    <Transfer
      items={items}
      defaultTargetKeys={["missing", "b"]}
      onChange={change}
    />,
  );
  await u.click(screen.getByRole("checkbox", { name: "Alpha" }));
  await u.click(screen.getByRole("button", { name: "移入已选" }));
  expect(change).toHaveBeenCalledWith(["missing", "b", "a"], "right", ["a"]);
});
test("loading disables actions and offers status", () => {
  render(<Transfer items={items} loading defaultSelectedKeys={["a"]} />);
  expect(screen.getByRole("button", { name: "移入已选" })).toBeDisabled();
  expect(screen.getByRole("checkbox", { name: "Alpha" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
});
test("custom list selection guards unknown disabled and wrong-side keys", async () => {
  const change = vi.fn();
  render(
    <Transfer
      items={items}
      targetKeys={["b"]}
      onSelectChange={change}
      renderList={(p) => (
        <button onClick={() => p.select(["a", "b", "c", "unknown"], true)}>
          {p.direction}
        </button>
      )}
    />,
  );
  fireEvent.click(screen.getByText("left"));
  expect(change).toHaveBeenCalledWith(["a"], []);
});
test("fractional page size is clamped to one visible item", () => {
  render(<Transfer items={items} pagination={{ pageSize: 0.5 }} />);
  expect(screen.getByText("Alpha")).toBeVisible();
  expect(screen.queryByText("Beta")).toBeNull();
  expect(screen.getByText("1/3")).toBeVisible();
});
test("custom one-way list can remove only valid enabled target items", () => {
  const change = vi.fn();
  render(
    <Transfer
      items={items}
      oneWay
      defaultTargetKeys={["b", "c"]}
      onChange={change}
      renderList={(p) => (
        <button onClick={() => p.remove(["a", "b", "c", "unknown"])}>
          {p.direction}
        </button>
      )}
    />,
  );
  fireEvent.click(screen.getByText("right"));
  expect(change).toHaveBeenCalledWith(["c"], "left", ["b"]);
});
test("controlled selection waits for props and emits empty selection after move", async () => {
  const u = userEvent.setup(),
    select = vi.fn();
  const { rerender } = render(
    <Transfer items={items} selectedKeys={[]} onSelectChange={select} />,
  );
  await u.click(screen.getByRole("checkbox", { name: "Alpha" }));
  expect(select).toHaveBeenLastCalledWith(["a"], []);
  expect(screen.getByRole("checkbox", { name: "Alpha" })).not.toBeChecked();
  rerender(
    <Transfer items={items} selectedKeys={["a"]} onSelectChange={select} />,
  );
  await u.click(screen.getByRole("button", { name: "移入已选" }));
  expect(select).toHaveBeenLastCalledWith([], []);
  expect(
    within(screen.getByRole("region", { name: "已选项" })).getByRole(
      "checkbox",
      { name: "Alpha" },
    ),
  ).toBeChecked();
});
test("removing the last source page clamps back to the previous page", async () => {
  const u = userEvent.setup();
  render(<Transfer items={items.slice(0, 2)} pagination={{ pageSize: 1 }} />);
  const left = screen.getByRole("region", { name: "待选项" });
  await u.click(within(left).getByRole("button", { name: "下一页" }));
  await u.click(screen.getByRole("checkbox", { name: "Beta" }));
  await u.click(screen.getByRole("button", { name: "移入已选" }));
  expect(within(left).getByText("Alpha")).toBeVisible();
  expect(within(left).getByText("1/1")).toBeVisible();
  expect(within(left).getByRole("button", { name: "上一页" })).toBeDisabled();
});
