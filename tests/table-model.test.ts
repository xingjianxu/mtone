import { expect, test } from "vitest";
import {
  getColumnKey,
  getValue,
  flattenColumns,
  processTableData,
} from "../packages/mtone/src/table-model";
const columns = [
  { key: "name", dataIndex: ["profile", "name"], title: "Name" },
  {
    key: "score",
    dataIndex: "score",
    sorter: { compare: (a: any, b: any) => a.score - b.score, multiple: 2 },
  },
  {
    key: "age",
    dataIndex: "age",
    sorter: { compare: (a: any, b: any) => a.age - b.age, multiple: 1 },
  },
];
const data = [
  { key: 1, profile: { name: "Z" }, score: 2, age: 10 },
  { key: 2, profile: { name: "A" }, score: 1, age: 30 },
  { key: 3, profile: { name: "B" }, score: 1, age: 20 },
];
test("column paths and nested groups", () => {
  expect(getValue(data[0], columns[0])).toBe("Z");
  expect(getColumnKey({ dataIndex: ["a", "b"] }, 0)).toBe("a.b");
  expect(flattenColumns([{ title: "Group", children: columns }])).toHaveLength(
    3,
  );
});
test("priority sorting is stable and immutable", () => {
  expect(
    processTableData(
      data,
      columns,
      [
        { key: "score", order: "ascend" },
        { key: "age", order: "descend" },
      ],
      {},
      {},
      false,
    ).map((r) => r.key),
  ).toEqual([2, 3, 1]);
  expect(data.map((r) => r.key)).toEqual([1, 2, 3]);
});
test("legacy text filtering and nested filtering", () => {
  expect(
    processTableData(data, columns, [], {}, { name: "a" }, false).map(
      (r) => r.key,
    ),
  ).toEqual([2]);
  const cols = [{ key: "score", onFilter: (v: any, r: any) => r.score === v }];
  expect(
    processTableData(data, cols, [], { score: [1] }, {}, false),
  ).toHaveLength(2);
});
test("manual mode preserves incoming order and filter data", () => {
  expect(
    processTableData(
      data,
      columns,
      [{ key: "score", order: "ascend" }],
      {},
      { name: "nothing" },
      true,
    ),
  ).toEqual(data);
});
test("tree data is filtered and sorted recursively without mutation", () => {
  const tree = [{ ...data[0], children: [data[1], data[2]] }];
  const result = processTableData(
    tree,
    columns,
    [{ key: "age", order: "ascend" }],
    {},
    {},
    false,
  );
  expect(result[0].children?.map((r: any) => r.key)).toEqual([3, 2]);
  expect(tree[0].children.map((r) => r.key)).toEqual([2, 3]);
});
