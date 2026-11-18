import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { test, expect, vi } from "vitest";
import { TreeSelect, MtoneProvider, Fieldset } from "../packages/mtone/src";
if (!window.PointerEvent)
  window.PointerEvent = MouseEvent as typeof PointerEvent;
const items = [
  {
    id: "team",
    label: "Team",
    children: [
      { id: "alice", label: "Alice" },
      { id: "bob", label: "Bob" },
      { id: "off", label: "Disabled", disabled: true },
    ],
  },
];
const mount = (node: React.ReactNode) =>
  render(<MtoneProvider locale="en">{node}</MtoneProvider>);
test("TreeSelect selects a node and clears", async () => {
  const u = userEvent.setup(),
    change = vi.fn();
  mount(
    <TreeSelect
      items={items}
      defaultExpandAll
      allowClear
      onValueChange={change}
    />,
  );
  await u.click(screen.getByRole("combobox"));
  await u.click(screen.getByText("Alice"));
  expect(change.mock.lastCall?.[0]).toBe("alice");
  expect(screen.getByRole("combobox")).toHaveTextContent("Alice");
  await u.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(change.mock.lastCall?.[0]).toBe(null);
});
test("TreeSelect checkbox conduction uses full tree during search", async () => {
  const u = userEvent.setup(),
    change = vi.fn();
  mount(
    <TreeSelect
      items={items}
      multiple
      searchable
      defaultExpandAll
      onValueChange={change}
    />,
  );
  await u.click(screen.getByRole("combobox"));
  await u.type(screen.getByRole("searchbox"), "Alice");
  await u.click(screen.getByRole("checkbox", { name: "Team" }));
  expect(change.mock.lastCall?.[0]).toEqual(["team", "alice", "bob"]);
  expect(screen.queryByText("Disabled")).not.toBeInTheDocument();
});
test("TreeSelect respects controlled values and Fieldset disabled", async () => {
  const u = userEvent.setup(),
    change = vi.fn();
  const { rerender } = mount(
    <TreeSelect
      items={items}
      value="bob"
      defaultExpandAll
      onValueChange={change}
    />,
  );
  await u.click(screen.getByRole("combobox"));
  await u.click(screen.getByText("Alice"));
  expect(change.mock.lastCall?.[0]).toBe("alice");
  expect(screen.getByRole("combobox")).toHaveTextContent("Bob");
  rerender(
    <Fieldset disabled>
      <TreeSelect items={items} />
    </Fieldset>,
  );
  expect(screen.getByRole("combobox")).toBeDisabled();
});
test("TreeSelect supports keyboard open select and Escape focus restoration", async () => {
  const u = userEvent.setup();
  mount(<TreeSelect items={items} defaultExpandAll />);
  await u.tab();
  await u.keyboard("{ArrowDown}");
  await waitFor(() =>
    expect(screen.getByRole("treeitem", { name: "Team" })).toHaveFocus(),
  );
  await u.keyboard("{ArrowDown}{Enter}");
  expect(screen.getByRole("combobox")).toHaveTextContent("Alice");
  await waitFor(() => expect(screen.getByRole("combobox")).toHaveFocus());
  await u.keyboard("{Enter}{Escape}");
  await waitFor(() =>
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "false",
    ),
  );
});
test("strict checks do not cascade and parent display removes descendants", async () => {
  const u = userEvent.setup(),
    change = vi.fn();
  const { unmount } = mount(
    <TreeSelect
      items={items}
      multiple
      checkStrictly
      defaultExpandAll
      onValueChange={change}
    />,
  );
  await u.click(screen.getByRole("combobox"));
  await u.click(screen.getByRole("checkbox", { name: "Team" }));
  expect(change.mock.lastCall?.[0]).toEqual(["team"]);
  unmount();
  mount(
    <TreeSelect
      items={items}
      multiple
      defaultValue={["team"]}
      showCheckedStrategy="parent"
      onValueChange={change}
    />,
  );
  expect(screen.getByRole("combobox")).toHaveTextContent("1 selected");
  await u.click(screen.getByRole("button", { name: "Remove Team" }));
  expect(change.mock.lastCall?.[0]).toEqual([]);
});
test("disabled and readonly prevent edits, hidden values serialize", async () => {
  const u = userEvent.setup();
  const { container, rerender } = mount(
    <TreeSelect
      items={items}
      value="alice"
      name="person"
      readOnly
      allowClear
    />,
  );
  await u.click(screen.getByRole("combobox"));
  expect(screen.queryByRole("tree")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Clear selection" }),
  ).not.toBeInTheDocument();
  expect(container.querySelector('input[name="person"]')).toHaveValue("alice");
  rerender(
    <TreeSelect items={items} multiple value={["alice"]} name="people" />,
  );
  expect(container.querySelector('input[name="people"]')).toHaveValue(
    '["alice"]',
  );
});
test("search retains ancestors and restores expansion after query cleared", async () => {
  const u = userEvent.setup();
  mount(<TreeSelect items={items} searchable />);
  await u.click(screen.getByRole("combobox"));
  expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  await u.type(screen.getByRole("searchbox"), "Alice");
  expect(screen.getByRole("treeitem", { name: "Team" })).toBeInTheDocument();
  expect(screen.getByText("Alice")).toBeInTheDocument();
  expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  await u.clear(screen.getByRole("searchbox"));
  expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  await u.type(screen.getByRole("searchbox"), "missing");
  expect(screen.getByRole("status")).toHaveTextContent("No matching nodes");
});
test("lazy load expands updated items and selection works", async () => {
  const u = userEvent.setup(),
    load = vi.fn();
  function Demo() {
    const [data, setData] = React.useState([
      { id: "root", label: "Root", isLeaf: false },
    ] as import("../packages/mtone/src").TreeItem[]);
    return (
      <TreeSelect
        items={data}
        loadData={async () => {
          load();
          setData([
            {
              id: "root",
              label: "Root",
              children: [{ id: "loaded", label: "Loaded" }],
            },
          ]);
        }}
      />
    );
  }
  mount(<Demo />);
  await u.click(screen.getByRole("combobox"));
  await u.keyboard("{ArrowRight}");
  await waitFor(() => expect(screen.getByText("Loaded")).toBeInTheDocument());
  expect(load).toHaveBeenCalledTimes(1);
  await u.click(screen.getByText("Loaded"));
  expect(screen.getByRole("combobox")).toHaveTextContent("Loaded");
});
test("controlled open cannot bypass disabled and supports external value updates", async () => {
  const { rerender } = mount(<TreeSelect items={items} open disabled />);
  expect(screen.queryByRole("tree")).not.toBeInTheDocument();
  rerender(<TreeSelect items={items} value="alice" />);
  expect(screen.getByRole("combobox")).toHaveTextContent("Alice");
  rerender(<TreeSelect items={items} value={null} />);
  expect(screen.getByRole("combobox")).toHaveTextContent("请选择");
});
test("numeric and string keys stay distinct; collapsed tags do not change value", async () => {
  const u = userEvent.setup(),
    change = vi.fn();
  mount(
    <TreeSelect
      items={[
        { id: 1, label: "Number" },
        { id: "1", label: "String" },
      ]}
      multiple
      maxTagCount={1}
      onValueChange={change}
    />,
  );
  await u.click(screen.getByRole("combobox"));
  await u.click(screen.getByRole("checkbox", { name: "Number" }));
  await u.click(screen.getByRole("checkbox", { name: "String" }));
  expect(change.mock.lastCall?.[0]).toEqual([1, "1"]);
  expect(screen.getByText("+1")).toBeInTheDocument();
});
test("multiple rows toggle on click and Enter without closing", async () => {
  const u = userEvent.setup(),
    change = vi.fn();
  mount(
    <TreeSelect
      items={items}
      multiple
      defaultExpandAll
      onValueChange={change}
    />,
  );
  await u.click(screen.getByRole("combobox"));
  await u.click(screen.getByText("Alice"));
  expect(change.mock.lastCall?.[0]).toEqual(["alice"]);
  await u.keyboard("{Enter}");
  expect(change.mock.lastCall?.[0]).toEqual([]);
  expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "true");
});
test("lazy loaded keys survive popup close and reopen", async () => {
  const u = userEvent.setup(),
    load = vi.fn(async () => {});
  mount(
    <TreeSelect
      items={[{ id: "r", label: "Root", isLeaf: false }]}
      loadData={load}
    />,
  );
  await u.click(screen.getByRole("combobox"));
  await u.keyboard("{ArrowRight}");
  await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
  await u.keyboard("{Escape}");
  await u.click(screen.getByRole("combobox"));
  await u.keyboard("{ArrowLeft}{ArrowRight}");
  expect(load).toHaveBeenCalledTimes(1);
});
test("unloaded selected keys survive checks and can be removed", async () => {
  const u = userEvent.setup(),
    change = vi.fn();
  const { container } = mount(
    <TreeSelect
      items={items}
      multiple
      defaultValue={["remote"]}
      defaultExpandAll
      onValueChange={change}
      name="keys"
    />,
  );
  expect(container.querySelector('input[name="keys"]')).toHaveValue(
    '["remote"]',
  );
  await u.click(screen.getByRole("combobox"));
  await u.click(screen.getByText("Alice"));
  expect(change.mock.lastCall?.[0]).toEqual(["alice", "remote"]);
  await u.keyboard("{Escape}");
  await u.click(screen.getByRole("button", { name: "Remove remote" }));
  expect(change.mock.lastCall?.[0]).toEqual(["alice"]);
});
test("strict row clicks cannot bypass checkbox restrictions", async () => {
  const u = userEvent.setup(),
    change = vi.fn();
  mount(
    <TreeSelect
      multiple
      checkStrictly
      items={[
        { id: "no", label: "No check", disableCheckbox: true },
        { id: "hidden", label: "Not checkable", checkable: false },
      ]}
      onValueChange={change}
    />,
  );
  await u.click(screen.getByRole("combobox"));
  await u.click(screen.getByText("No check"));
  await u.keyboard("{Enter}");
  await u.click(screen.getByText("Not checkable"));
  await u.keyboard("{Enter}");
  expect(change).not.toHaveBeenCalled();
});
