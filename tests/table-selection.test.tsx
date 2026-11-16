import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { useTableSelection } from "../packages/mtone/src/table-selection";
import type {
  TableRowSelection,
  TableLocale,
} from "../packages/mtone/src/table-types";
type Row = { id: number; disabled?: boolean; children?: Row[] };
const data: Row[] = [{ id: 1 }, { id: 2, disabled: true }, { id: 3 }];
function Harness({
  rows = data,
  page = rows,
  selection,
  selectedKeys,
  legacyChange,
  locale,
}: {
  rows?: Row[];
  page?: Row[];
  selection?: TableRowSelection<Row>;
  selectedKeys?: React.Key[];
  legacyChange?: (keys: React.Key[]) => void;
  locale?: TableLocale;
}) {
  const result = useTableSelection({
    data: rows,
    pageData: page,
    getRowKey: (r: Row) => r.id,
    childrenColumnName: "children",
    rowSelection: selection,
    selectedKeys,
    selectable: !selection,
    onSelectionChange: legacyChange,
    zh: false,
    locale,
  });
  const flat = (rs: Row[]): Row[] =>
    rs.flatMap((r) => [r, ...flat(r.children ?? [])]);
  return (
    <>
      <div>{result.column?.title as React.ReactNode}</div>
      {flat(page).map((r, i) => (
        <div key={r.id}>
          {result.column?.render?.(undefined, r, i) as React.ReactNode}
        </div>
      ))}
      <output data-testid="keys">{JSON.stringify(result.selectedKeys)}</output>
    </>
  );
}
test("checkbox selection preserves numeric keys and disabled rows with mixed page header", () => {
  const change = vi.fn();
  render(
    <Harness
      selection={{
        getCheckboxProps: (r) => ({ disabled: r.disabled }),
        onChange: change,
      }}
    />,
  );
  fireEvent.click(screen.getByLabelText("Select row 1"));
  expect(screen.getByLabelText("Select all rows")).toBePartiallyChecked();
  fireEvent.click(screen.getByLabelText("Select all rows"));
  expect(screen.getByTestId("keys")).toHaveTextContent("[1,3]");
  expect(screen.getByLabelText("Select row 2")).not.toBeChecked();
  expect(change.mock.lastCall?.[0]).toEqual([1, 3]);
  expect(change.mock.lastCall?.[2]).toEqual({ type: "all" });
});
test("controlled selection emits but does not mutate and radio never selects disabled", () => {
  const change = vi.fn();
  const { rerender } = render(
    <Harness
      selection={{
        type: "radio",
        selectedRowKeys: [1],
        onChange: change,
        getCheckboxProps: (r) => ({ disabled: r.disabled }),
      }}
    />,
  );
  fireEvent.click(screen.getByLabelText("Select row 3"));
  expect(change.mock.lastCall?.[0]).toEqual([3]);
  expect(screen.getByLabelText("Select row 1")).toBeChecked();
  rerender(
    <Harness
      selection={{
        type: "radio",
        selectedRowKeys: [3],
        getCheckboxProps: (r) => ({ disabled: r.disabled }),
      }}
    />,
  );
  expect(screen.getByLabelText("Select row 3")).toBeChecked();
  expect(screen.queryByLabelText("Select all rows")).toBeNull();
});
test("preserved keys and records survive data replacement, default removes stale keys", () => {
  const change = vi.fn();
  const { rerender } = render(
    <Harness
      rows={[{ id: 1 }]}
      selection={{ preserveSelectedRowKeys: true, onChange: change }}
    />,
  );
  fireEvent.click(screen.getByLabelText("Select row 1"));
  rerender(
    <Harness
      rows={[{ id: 3 }]}
      selection={{ preserveSelectedRowKeys: true, onChange: change }}
    />,
  );
  fireEvent.click(screen.getByLabelText("Select row 3"));
  expect(change.mock.lastCall?.[0]).toEqual([1, 3]);
  expect(change.mock.lastCall?.[1]).toEqual([{ id: 1 }, { id: 3 }]);
  rerender(
    <Harness
      rows={[{ id: 3 }]}
      selection={{ preserveSelectedRowKeys: false, onChange: change }}
    />,
  );
  expect(screen.getByTestId("keys")).toHaveTextContent("[3]");
});
test("tree conduction selects descendants, derives half checks and stops at disabled boundaries", () => {
  const tree: Row[] = [
    {
      id: 1,
      children: [
        { id: 2 },
        { id: 3 },
        { id: 4, disabled: true, children: [{ id: 5 }] },
      ],
    },
  ];
  render(
    <Harness
      rows={tree}
      selection={{
        checkStrictly: false,
        getCheckboxProps: (r) => ({ disabled: r.disabled }),
      }}
    />,
  );
  fireEvent.click(screen.getByLabelText("Select row 2"));
  expect(screen.getByLabelText("Select row 1")).toBePartiallyChecked();
  fireEvent.click(screen.getByLabelText("Select row 3"));
  expect(screen.getByLabelText("Select row 1")).toBeChecked();
  expect(screen.getByLabelText("Select row 5")).not.toBeChecked();
  fireEvent.click(screen.getByLabelText("Select row 2"));
  expect(screen.getByLabelText("Select row 1")).not.toBeChecked();
  expect(screen.getByLabelText("Select row 3")).toBeChecked();
});
test("all invert none and custom selection commands are available and exclude disabled rows", () => {
  const custom = vi.fn();
  render(
    <Harness
      selection={{
        getCheckboxProps: (r) => ({ disabled: r.disabled }),
        selections: [
          "all",
          "invert",
          "none",
          { key: "custom", text: "Odd", onSelect: custom },
        ],
      }}
    />,
  );
  const actions = screen.getByLabelText("Selection actions");
  fireEvent.change(actions, { target: { value: "0" } });
  expect(screen.getByTestId("keys")).toHaveTextContent("[1,3]");
  fireEvent.change(actions, { target: { value: "1" } });
  expect(screen.getByTestId("keys")).toHaveTextContent("[]");
  fireEvent.change(actions, { target: { value: "3" } });
  expect(custom).toHaveBeenCalledWith([1, 3]);
});
test("shift range selection skips disabled and emits multiple callback", () => {
  const change = vi.fn();
  render(
    <Harness
      rows={[{ id: 1 }, { id: 2, disabled: true }, { id: 3 }, { id: 4 }]}
      selection={{
        getCheckboxProps: (r) => ({ disabled: r.disabled }),
        onSelectMultiple: change,
      }}
    />,
  );
  fireEvent.click(screen.getByLabelText("Select row 1"));
  fireEvent.click(screen.getByLabelText("Select row 4"), { shiftKey: true });
  expect(screen.getByTestId("keys")).toHaveTextContent("[1,3,4]");
  expect(change).toHaveBeenCalledOnce();
});
test("renderCell, columnTitle, callbacks and legacy selection contract remain available", () => {
  const legacy = vi.fn();
  const { rerender } = render(
    <Harness selectedKeys={[1]} legacyChange={legacy} />,
  );
  fireEvent.click(screen.getByLabelText("Select row 3"));
  expect(legacy).toHaveBeenCalledWith([1, 3]);
  rerender(
    <Harness
      selection={{
        columnTitle: (node) => <span title="custom header">{node}</span>,
        renderCell: (_c, r, _i, node) => (
          <span title={`custom ${r.id}`}>{node}</span>
        ),
      }}
    />,
  );
  expect(screen.getByTitle("custom header")).toBeTruthy();
  expect(screen.getByTitle("custom 1")).toBeTruthy();
});

test("header only toggles the current page while keeping other selected pages", () => {
  const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const { rerender } = render(
    <Harness rows={rows} page={[rows[0]]} selection={{}} />,
  );
  fireEvent.click(screen.getByLabelText("Select all rows"));
  rerender(<Harness rows={rows} page={[rows[2]]} selection={{}} />);
  expect(screen.getByLabelText("Select all rows")).not.toBeChecked();
  fireEvent.click(screen.getByLabelText("Select all rows"));
  expect(screen.getByTestId("keys")).toHaveTextContent("[1,3]");
  fireEvent.click(screen.getByLabelText("Select all rows"));
  expect(screen.getByTestId("keys")).toHaveTextContent("[1]");
});

test("removed unpreserved keys do not reappear when data returns", () => {
  const { rerender } = render(<Harness rows={[{ id: 1 }]} selection={{}} />);
  fireEvent.click(screen.getByLabelText("Select row 1"));
  rerender(<Harness rows={[]} selection={{}} />);
  rerender(<Harness rows={[{ id: 1 }]} selection={{}} />);
  expect(screen.getByLabelText("Select row 1")).not.toBeChecked();
});

test("disabled-only header is disabled and hideSelectAll hides actions too", () => {
  const { rerender } = render(
    <Harness
      rows={[{ id: 1, disabled: true }]}
      selection={{ getCheckboxProps: (r) => ({ disabled: r.disabled }) }}
    />,
  );
  expect(screen.getByLabelText("Select all rows")).toBeDisabled();
  rerender(<Harness selection={{ hideSelectAll: true, selections: true }} />);
  expect(screen.queryByLabelText("Select all rows")).toBeNull();
  expect(screen.queryByLabelText("Selection actions")).toBeNull();
});

test("selection locale customizes header, rows and action labels while explicit aria labels win", () => {
  render(
    <Harness
      locale={{
        selectionAll: "Tout cocher",
        selectAll: "Tout",
        selectInvert: "Inverser",
        selectNone: "Aucun",
        selectionActions: "Actions",
        selectionPlaceholder: "Choisir",
        selectRow: (key) => `Ligne ${key}`,
      }}
      selection={{
        selections: true,
        getCheckboxProps: (r) =>
          r.id === 3 ? { "aria-label": "Custom row" } : {},
      }}
    />,
  );
  expect(screen.getByLabelText("Tout cocher")).toBeTruthy();
  expect(screen.getByLabelText("Ligne 1")).toBeTruthy();
  expect(screen.getByLabelText("Custom row")).toBeTruthy();
  expect(screen.getByLabelText("Actions")).toBeTruthy();
  expect(screen.getByRole("option", { name: "Tout" })).toBeTruthy();
  expect(screen.getByRole("option", { name: "Inverser" })).toBeTruthy();
  expect(screen.getByRole("option", { name: "Aucun" })).toBeTruthy();
  expect(screen.getByRole("option", { name: "Choisir" })).toBeTruthy();
});

test("switching from checkbox to radio retains at most one selected row", () => {
  const { rerender } = render(
    <Harness selection={{ defaultSelectedRowKeys: [1, 3] }} />,
  );
  rerender(<Harness selection={{ type: "radio" }} />);
  expect(screen.getByTestId("keys")).toHaveTextContent("[1]");
  expect(screen.getByLabelText("Select row 1")).toBeChecked();
  expect(screen.getByLabelText("Select row 3")).not.toBeChecked();
});
