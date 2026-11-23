import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, expectTypeOf, test, vi } from "vitest";
import { DataTable, Table, type DataTableColumn, type DataTableProps, type DataTableSortOrder, type TableProps } from "../packages/mtone/src";

test("Table renders the supplied native table markup and forwards attributes, events and ref", () => {
  const ref = React.createRef<HTMLTableElement>();
  const clicked = vi.fn();
  const { container } = render(
    <Table ref={ref} id="budget" aria-label="Budget" className="custom-table" onClick={clicked}
      bordered striped highlightOnHover>
      <caption>Quarterly budget</caption>
      <thead><tr><th scope="col">Item</th><th scope="col">Value</th></tr></thead>
      <tbody><tr><th scope="row">Hosting</th><td>42</td></tr></tbody>
      <tfoot><tr><td colSpan={2}>All expenses recorded</td></tr></tfoot>
    </Table>,
  );
  const table = screen.getByRole("table", { name: "Budget" });
  expect(table).toBeInstanceOf(HTMLTableElement);
  expect(table).toBe(ref.current);
  expect(table).toBe(container.firstElementChild);
  expect(table).toHaveAttribute("id", "budget");
  expect(table).toHaveClass("mt-native-table", "custom-table");
  expect(table).toHaveAttribute("data-bordered");
  expect(table).toHaveAttribute("data-striped");
  expect(table).toHaveAttribute("data-highlight-on-hover");
  expect(table.querySelector("caption")).toHaveTextContent("Quarterly budget");
  expect(within(table).getByRole("columnheader", { name: "Item" })).toHaveAttribute("scope", "col");
  expect(within(table).getByRole("rowheader", { name: "Hosting" })).toHaveAttribute("scope", "row");
  expect(within(table).getByRole("cell", { name: "All expenses recorded" })).toHaveAttribute("colspan", "2");
  fireEvent.click(table);
  expect(clicked).toHaveBeenCalledOnce();
});

test("native styling variants are opt-in and advanced APIs belong only to DataTable", () => {
  const { container } = render(<Table><tbody><tr><td>Basic row</td></tr></tbody></Table>);
  const table = container.firstElementChild!;
  for (const flag of ["bordered", "striped", "highlight-on-hover"]) {
    expect(table).not.toHaveAttribute(`data-${flag}`);
  }
  for (const name of ["Column", "ColumnGroup", "Summary", "EXPAND_COLUMN", "SELECTION_COLUMN", "SELECTION_ALL", "SELECTION_INVERT", "SELECTION_NONE"]) {
    expect(Table).not.toHaveProperty(name);
    expect(DataTable).toHaveProperty(name);
  }
  expectTypeOf<TableProps>().toExtend<React.ComponentPropsWithoutRef<"table">>();
  expectTypeOf<DataTableProps<{ key: string }>["columns"]>().toEqualTypeOf<DataTableColumn<{ key: string }>[] | undefined>();
  expectTypeOf<DataTableSortOrder>().toEqualTypeOf<"ascend" | "descend" | null>();
});
