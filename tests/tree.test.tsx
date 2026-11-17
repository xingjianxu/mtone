import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { test, expect, vi } from "vitest";
import { Tree, DirectoryTree, type TreeRef } from "../packages/mtone/src/tree";
if (!window.PointerEvent)
  window.PointerEvent = MouseEvent as typeof PointerEvent;
const items = [
  {
    id: "p",
    label: "Parent",
    children: [
      { id: "a", label: "Alpha" },
      { id: "b", label: "Beta" },
    ],
  },
  { id: "z", label: "Last" },
];
const row = (name: string) => screen.getByRole("treeitem", { name });
test("old single selection aliases and controlled empty expansion work", () => {
  const change = vi.fn();
  const { rerender } = render(
    <Tree items={items} defaultExpanded={["p"]} onValueChange={change} />,
  );
  fireEvent.click(row("Alpha"));
  expect(change).toHaveBeenCalledWith("a");
  expect(row("Alpha")).toHaveAttribute("aria-selected", "true");
  rerender(<Tree items={items} expanded={[]} />);
  expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
});
test("multiple selection and controlled selection report keys without mutating display", () => {
  const onSelect = vi.fn();
  render(
    <Tree
      items={items}
      defaultExpandAll
      multiple
      selectedKeys={["a"]}
      onSelect={onSelect}
    />,
  );
  fireEvent.click(row("Beta"));
  expect(onSelect.mock.calls[0][0]).toEqual(["a", "b"]);
  expect(row("Beta")).toHaveAttribute("aria-selected", "false");
});
test("cascaded checks derive mixed state, strict checks are independent", () => {
  const change = vi.fn();
  const { rerender } = render(
    <Tree items={items} defaultExpandAll checkable onCheck={change} />,
  );
  fireEvent.click(screen.getByRole("checkbox", { name: "Alpha" }));
  expect(row("Parent")).toHaveAttribute("aria-checked", "mixed");
  fireEvent.click(screen.getByRole("checkbox", { name: "Beta" }));
  expect(change.mock.calls.at(-1)?.[0]).toEqual(
    expect.arrayContaining(["p", "a", "b"]),
  );
  rerender(
    <Tree
      items={items}
      defaultExpandAll
      checkable
      checkStrictly
      checkedKeys={{ checked: ["a"], halfChecked: [] }}
    />,
  );
  expect(row("Parent")).toHaveAttribute("aria-checked", "false");
});
test("disabled and checkbox-disabled nodes do not change checks", () => {
  const change = vi.fn();
  render(
    <Tree
      items={[
        { id: "a", label: "Alpha", disableCheckbox: true },
        { id: "b", label: "Beta", disabled: true },
      ]}
      checkable
      onCheck={change}
    />,
  );
  fireEvent.click(screen.getByRole("checkbox", { name: "Alpha" }));
  fireEvent.keyDown(row("Beta"), { key: " " });
  expect(change).not.toHaveBeenCalled();
});
test("load deduplicates, reports failure, and permits retry", async () => {
  let fail: (e: Error) => void = () => {};
  const load = vi.fn(
    () =>
      new Promise<void>((_, reject) => {
        fail = reject;
      }),
  );
  const error = vi.fn();
  render(
    <Tree
      items={[{ id: "p", label: "Parent", isLeaf: false }]}
      loadData={load}
      onLoadError={error}
    />,
  );
  fireEvent.keyDown(row("Parent"), { key: "ArrowRight" });
  fireEvent.keyDown(row("Parent"), { key: "ArrowRight" });
  await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
  await act(async () => fail(new Error("offline")));
  expect(error).toHaveBeenCalled();
  fireEvent.keyDown(row("Parent"), { key: "ArrowRight" });
  await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
});
test("load success is cached and controlled loadedKeys is notified", async () => {
  const load = vi.fn().mockResolvedValue(undefined),
    onLoad = vi.fn();
  render(
    <Tree
      items={[{ id: "p", label: "Parent", isLeaf: false }]}
      loadData={load}
      onLoad={onLoad}
    />,
  );
  fireEvent.keyDown(row("Parent"), { key: "ArrowRight" });
  await waitFor(() => expect(onLoad).toHaveBeenCalled());
  fireEvent.keyDown(row("Parent"), { key: "ArrowLeft" });
  fireEvent.keyDown(row("Parent"), { key: "ArrowRight" });
  expect(load).toHaveBeenCalledTimes(1);
});
test("treeData aliases, icons and matching highlights render", () => {
  render(
    <Tree
      treeData={[
        { key: 1, title: "One", children: [{ key: 2, title: "Two" }] },
      ]}
      defaultExpandedKeys={[1]}
      showIcon
      icon={<i>icon</i>}
      titleRender={(n) => <b>{n.label}</b>}
      filterTreeNode={(n) => n.id === 2}
      showLine
    />,
  );
  expect(row("Two")).toHaveAttribute("data-match", "true");
  expect(row("Two")).toHaveAttribute("aria-level", "2");
});
test("keyboard skips disabled parents and recovers on removal", () => {
  const { rerender } = render(<Tree items={items} defaultExpandAll />);
  row("Alpha").focus();
  fireEvent.keyDown(row("Alpha"), { key: "End" });
  expect(row("Last")).toHaveFocus();
  rerender(<Tree items={items.slice(0, 1)} defaultExpandAll />);
  expect(row("Parent")).toHaveAttribute("tabindex", "0");
});
test("directory expands with configured action", () => {
  render(<DirectoryTree items={items} expandAction="doubleClick" />);
  fireEvent.click(row("Parent"));
  expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  fireEvent.doubleClick(row("Parent"));
  expect(row("Alpha")).toBeInTheDocument();
});
test("virtual list renders bounded rows and ref scrollTo reveals target", async () => {
  const ref = React.createRef<TreeRef>();
  render(
    <Tree
      ref={ref}
      items={Array.from({ length: 1000 }, (_, i) => ({
        id: String(i),
        label: `Node ${i}`,
      }))}
      height={120}
      itemHeight={30}
    />,
  );
  expect(screen.getAllByRole("treeitem").length).toBeLessThan(20);
  act(() => ref.current?.scrollTo({ key: "900", align: "top" }));
  await waitFor(() => expect(row("Node 900")).toBeInTheDocument());
});
test("scrollTo auto expands nested node only in uncontrolled mode", async () => {
  const ref = React.createRef<TreeRef>();
  render(<Tree ref={ref} items={items} height={100} />);
  act(() => ref.current?.scrollTo({ key: "a", autoExpand: true }));
  await waitFor(() => expect(row("Alpha")).toBeInTheDocument());
});
test("drop rejects own descendant and reports valid intent without mutating items", () => {
  const drop = vi.fn();
  render(<Tree items={items} defaultExpandAll draggable onDrop={drop} />);
  fireEvent.dragStart(row("Parent"));
  fireEvent.drop(row("Alpha"));
  expect(drop).not.toHaveBeenCalled();
  fireEvent.dragStart(row("Alpha"));
  fireEvent.drop(row("Last"));
  expect(drop).toHaveBeenCalled();
  expect(items[0].children).toHaveLength(2);
});

test("virtual list remains keyboard reachable after scrolling away from active row", () => {
  render(
    <Tree
      items={Array.from({ length: 100 }, (_, i) => ({
        id: String(i),
        label: `N ${i}`,
      }))}
      height={120}
    />,
  );
  const tree = screen.getByRole("tree");
  fireEvent.scroll(tree, { target: { scrollTop: 900 } });
  expect(tree).toHaveAttribute("tabindex", "0");
  fireEvent.focus(tree);
  expect(
    screen.getAllByRole("treeitem").some((el) => el === document.activeElement),
  ).toBe(true);
});

test("checkbox click returns focus to its tree row for arrow navigation", () => {
  render(<Tree items={items} checkable defaultExpandAll />);
  const checkbox = screen.getByRole("checkbox", { name: "Alpha" });
  checkbox.focus();
  fireEvent.click(checkbox);
  expect(row("Alpha")).toHaveFocus();
  fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
  expect(row("Beta")).toHaveFocus();
});
test("pending load does not block collapse and re-expansion", async () => {
  const load = vi.fn(() => new Promise(() => {}));
  render(
    <Tree
      items={[{ id: "p", label: "Parent", isLeaf: false }]}
      loadData={load}
    />,
  );
  fireEvent.keyDown(row("Parent"), { key: "ArrowRight" });
  await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
  fireEvent.keyDown(row("Parent"), { key: "ArrowLeft" });
  expect(row("Parent")).toHaveAttribute("aria-expanded", "false");
  fireEvent.keyDown(row("Parent"), { key: "ArrowRight" });
  expect(row("Parent")).toHaveAttribute("aria-expanded", "true");
  expect(load).toHaveBeenCalledTimes(1);
});

test("removed loading keys invalidate old completion before key reuse", async () => {
  let resolve: () => void = () => {};
  const load = vi.fn(() => new Promise<void>((r) => (resolve = r)));
  const onLoad = vi.fn();
  const { rerender } = render(
    <Tree
      items={[{ id: "p", label: "Old", isLeaf: false }]}
      loadData={load}
      onLoad={onLoad}
    />,
  );
  fireEvent.keyDown(row("Old"), { key: "ArrowRight" });
  await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
  rerender(<Tree items={[]} loadData={load} onLoad={onLoad} />);
  rerender(
    <Tree
      items={[{ id: "p", label: "New", isLeaf: false }]}
      loadData={load}
      onLoad={onLoad}
    />,
  );
  await act(async () => resolve());
  expect(onLoad).not.toHaveBeenCalled();
});

test("numeric and string keys coexist without React duplicate keys", () => {
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  render(
    <Tree
      treeData={[
        { key: 1, title: "Numeric" },
        { key: "1", title: "String" },
      ]}
    />,
  );
  expect(screen.getAllByRole("treeitem")).toHaveLength(2);
  expect(spy).not.toHaveBeenCalled();
  spy.mockRestore();
});

test("connector ancestry continues when parent has later siblings", () => {
  render(
    <Tree
      showLine
      defaultExpandAll
      items={[
        {
          id: "r",
          label: "Root",
          children: [
            {
              id: "p",
              label: "Parent",
              children: [{ id: "a", label: "Alpha" }],
            },
            { id: "b", label: "Sibling" },
          ],
        },
      ]}
    />,
  );
  expect(row("Alpha").querySelector(".mt-tree-guide")).toHaveStyle({
    borderInlineStartStyle: "solid",
  });
});
