import { expect, test } from "vitest";
import {
  normalizeTree,
  buildTreeIndex,
  flattenTree,
  getTreePath,
  expandTreeParents,
  conductTreeChecks,
  toggleTreeCheck,
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
