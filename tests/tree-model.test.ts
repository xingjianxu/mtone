import { expect, test } from "vitest";
import {
  normalizeTree,
  buildTreeIndex,
  flattenTree,
  getTreePath,
  expandTreeParents,
  conductTreeChecks,
  toggleTreeCheck,
  moveTreeItem,
} from "../packages/mtone/src/tree-model";
import type { TreeItem } from "../packages/mtone/src/tree-types";
const items: TreeItem[] = [
  {
    id: "p",
    label: "Parent",
    children: [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
      {
        id: "d",
        label: "Disabled",
        disabled: true,
        children: [{ id: "e", label: "E" }],
      },
    ],
  },
];
test("normalizes legacy and mapped data without losing numeric keys or mutating input", () => {
  const data = [
    { code: 0, name: "Zero", nodes: [{ code: 1, name: "One" }], custom: 42 },
  ];
  const result = normalizeTree(undefined, data, {
    key: "code",
    title: "name",
    children: "nodes",
  });
  expect(result[0].id).toBe(0);
  expect(result[0].children?.[0].label).toBe("One");
  expect(result[0].custom).toBe(42);
  expect(data[0]).not.toHaveProperty("id");
  expect(normalizeTree(items)[0]).not.toBe(items[0]);
});
test("rejects missing and duplicate keys rather than silently targeting the wrong node", () => {
  expect(() => normalizeTree(undefined, [{ title: "Missing" }])).toThrow();
  expect(() =>
    normalizeTree([
      { id: "a", label: "A" },
      { id: "a", label: "Again" },
    ]),
  ).toThrow();
});
test("index and flatten preserve hierarchy and sibling metadata", () => {
  const index = buildTreeIndex(items);
  expect(getTreePath(index, "e")).toEqual(["p", "d", "e"]);
  expect(getTreePath(index, "missing")).toEqual([]);
  expect(expandTreeParents(index, ["e"])).toEqual(["e", "p", "d"]);
  const visible = flattenTree(items, new Set(["p"]));
  expect(visible.map((x) => x.item.id)).toEqual(["p", "a", "b", "d"]);
  expect(visible[2]).toMatchObject({
    parent: "p",
    level: 2,
    setSize: 3,
    posInSet: 2,
  });
});
test("checking a parent cascades and stops at disabled boundaries", () => {
  expect(conductTreeChecks(items, ["p"])).toEqual({
    checked: ["p", "a", "b"],
    halfChecked: [],
  });
  expect(conductTreeChecks(items, ["a"])).toEqual({
    checked: ["a"],
    halfChecked: ["p"],
  });
  expect(conductTreeChecks(items, ["a", "b"])).toEqual({
    checked: ["p", "a", "b"],
    halfChecked: [],
  });
});
test("disabled states are preserved and descendants can independently change below boundaries", () => {
  expect(conductTreeChecks(items, ["d"])).toEqual({
    checked: ["d"],
    halfChecked: [],
  });
  expect(toggleTreeCheck(items, ["p", "d"], "a", false)).toEqual({
    checked: ["b", "d"],
    halfChecked: ["p"],
  });
  expect(toggleTreeCheck(items, [], "e", true)).toEqual({
    checked: ["e"],
    halfChecked: [],
  });
  expect(toggleTreeCheck(items, [], "d", true)).toEqual({
    checked: [],
    halfChecked: [],
  });
});
test("unchecking parent clears descendants without changing the original array", () => {
  const checked = ["p"];
  expect(toggleTreeCheck(items, checked, "p", false)).toEqual({
    checked: [],
    halfChecked: [],
  });
  expect(checked).toEqual(["p"]);
});
test("disableCheckbox and hidden checkboxes are conduction boundaries", () => {
  const nodes: TreeItem[] = [
    {
      id: "p",
      label: "P",
      children: [
        { id: "a", label: "A" },
        { id: "b", label: "B", disableCheckbox: true },
        {
          id: "c",
          label: "C",
          checkable: false,
          children: [{ id: "d", label: "D" }],
        },
      ],
    },
  ];
  expect(conductTreeChecks(nodes, ["p"])).toEqual({
    checked: ["p", "a"],
    halfChecked: [],
  });
  expect(conductTreeChecks(nodes, ["d"])).toEqual({
    checked: ["d"],
    halfChecked: [],
  });
});

test("moveTreeItem reorders siblings using the already-adjusted drop index", () => {
  const a = { id: "a", label: "A" },
    b = { id: "b", label: "B" },
    c = { id: "c", label: "C" };
  const root = [a, b, c];
  Object.freeze(root);
  const result = moveTreeItem(root, {
    dragNode: a,
    targetParentKey: null,
    targetIndex: 2,
  });
  expect(result).toEqual([b, c, a]);
  expect(result[2]).toBe(a);
  expect(root).toEqual([a, b, c]);
  expect(
    moveTreeItem(result, {
      dragNode: a,
      targetParentKey: null,
      targetIndex: 0,
    }),
  ).toEqual(root);
});

test("moveTreeItem reparents the actual subtree and preserves untouched references", () => {
  const child = { id: "c", label: "Child" };
  const moved = { id: "m", label: "Latest", children: [child], custom: 123 };
  const sibling = { id: "s", label: "Sibling" };
  const left = { id: "l", label: "Left", children: [moved] };
  const right = { id: 0, label: "Right", children: [sibling] };
  const untouched = { id: "u", label: "Untouched" };
  const root = [left, right, untouched];
  for (const value of [root, left, right, left.children, right.children, moved])
    Object.freeze(value);
  const result = moveTreeItem(root, {
    dragNode: { id: "m" },
    targetParentKey: 0,
    targetIndex: 1,
  });
  expect(result[0].children).toEqual([]);
  expect(result[1].children).toEqual([sibling, moved]);
  expect(result[1].children?.[1]).toBe(moved);
  expect(result[1].children?.[1].children?.[0]).toBe(child);
  expect(result[2]).toBe(untouched);
  expect(left.children).toEqual([moved]);
  const atRoot = moveTreeItem(result, {
    dragNode: moved,
    targetParentKey: null,
    targetIndex: 1,
  });
  expect(atRoot[1]).toBe(moved);
  expect(atRoot[2].children).toEqual([sibling]);
});

test("moveTreeItem returns the original array for impossible and unchanged moves", () => {
  const root: TreeItem[] = [
    { id: "p", label: "Parent", children: [{ id: "c", label: "Child" }] },
    { id: "leaf", label: "Leaf", isLeaf: true },
  ];
  for (const [id, targetParentKey, targetIndex] of [
    ["p", "p", 0],
    ["p", "c", 0],
    ["p", "missing", 0],
    ["p", "leaf", 0],
    ["missing", null, 0],
    ["p", null, 0],
    ["p", null, -1],
    ["p", null, 2],
    ["p", null, NaN],
    ["p", null, 0.5],
  ] as const) {
    expect(
      moveTreeItem(root, { dragNode: { id }, targetParentKey, targetIndex }),
    ).toBe(root);
  }
});
