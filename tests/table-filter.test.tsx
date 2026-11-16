import React from "react";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import {
  TableFilter,
  type TableFilterProps,
} from "../packages/mtone/src/table-filter";
import type { TableColumn } from "../packages/mtone/src/table-types";
const column: TableColumn<{ status: string }> = {
  key: "status",
  title: "Status",
  filters: [
    { text: "Open", value: "open" },
    { text: "Closed", value: "closed" },
  ],
};
function draw(extra: Partial<TableFilterProps<{ status: string }>> = {}) {
  const onChange = vi.fn();
  const result = render(
    <TableFilter
      column={column}
      columnKey="status"
      value={null}
      onChange={onChange}
      zh={false}
      {...extra}
    />,
  );
  return { ...result, onChange };
}
test("filter menu defers multi selection until confirm and returns original value types", async () => {
  const user = userEvent.setup();
  const { onChange } = draw({
    column: {
      ...column,
      filters: [
        { text: "One", value: 1 },
        { text: "True", value: true },
      ],
    },
  });
  await user.click(screen.getByRole("button", { name: "Filter Status" }));
  await user.click(screen.getByRole("checkbox", { name: "One" }));
  await user.click(screen.getByRole("checkbox", { name: "True" }));
  expect(onChange).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "OK" }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith([1, true]);
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
});
test("single-selection filter uses radio and commits only the latest value", async () => {
  const user = userEvent.setup();
  const { onChange } = draw({ column: { ...column, filterMultiple: false } });
  await user.click(screen.getByRole("button", { name: "Filter Status" }));
  await user.click(screen.getByRole("radio", { name: "Open" }));
  await user.click(screen.getByRole("radio", { name: "Closed" }));
  await user.click(screen.getByRole("button", { name: "OK" }));
  expect(onChange).toHaveBeenCalledWith(["closed"]);
});
test("search supports nested tree values and custom matching", async () => {
  const user = userEvent.setup();
  const { onChange } = draw({
    column: {
      ...column,
      filterMode: "tree",
      filterSearch: (query, item) => String(item.value).includes(query),
      filters: [
        {
          text: "Region",
          value: "region",
          children: [
            { text: "North", value: "n" },
            { text: "South", value: "s" },
          ],
        },
      ],
    },
  });
  await user.click(screen.getByRole("button", { name: "Filter Status" }));
  await user.type(screen.getByRole("searchbox"), "n");
  expect(screen.getByRole("checkbox", { name: "North" })).toBeInTheDocument();
  expect(
    screen.queryByRole("checkbox", { name: "South" }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("checkbox", { name: "North" }));
  await user.click(screen.getByRole("button", { name: "OK" }));
  expect(onChange).toHaveBeenCalledWith(["n"]);
});
test("reset restores default values when configured", async () => {
  const user = userEvent.setup();
  const { onChange } = draw({
    value: ["closed"],
    column: {
      ...column,
      defaultFilteredValue: ["open"],
      filterResetToDefaultFilteredValue: true,
    },
  });
  await user.click(screen.getByRole("button", { name: "Filter Status" }));
  await user.click(screen.getByRole("button", { name: "Reset" }));
  expect(onChange).toHaveBeenCalledWith(["open"]);
});
test("escape applies pending values by default and returns focus to trigger", async () => {
  const user = userEvent.setup();
  const { onChange } = draw();
  const trigger = screen.getByRole("button", { name: "Filter Status" });
  await user.click(trigger);
  await user.click(screen.getByRole("checkbox", { name: "Open" }));
  await user.keyboard("{Escape}");
  expect(onChange).toHaveBeenCalledWith(["open"]);
  await waitFor(() => expect(trigger).toHaveFocus());
});
test("filterOnClose false discards unconfirmed edits on reopening", async () => {
  const user = userEvent.setup();
  const { onChange } = draw({ column: { ...column, filterOnClose: false } });
  const trigger = screen.getByRole("button", { name: "Filter Status" });
  await user.click(trigger);
  await user.click(screen.getByRole("checkbox", { name: "Open" }));
  await user.keyboard("{Escape}");
  expect(onChange).not.toHaveBeenCalled();
  await user.click(trigger);
  expect(screen.getByRole("checkbox", { name: "Open" })).not.toBeChecked();
});
test("custom dropdown exposes selection, nonclosing confirm and reset controls", async () => {
  const user = userEvent.setup();
  const { onChange } = draw({
    column: {
      ...column,
      filterDropdown: ({
        selectedKeys,
        setSelectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div>
          <button onClick={() => setSelectedKeys(["open"])}>Pick</button>
          <output>{selectedKeys.join(",")}</output>
          <button onClick={() => confirm({ closeDropdown: false })}>
            Apply
          </button>
          <button
            onClick={() => clearFilters({ confirm: true, closeDropdown: true })}
          >
            Clear
          </button>
        </div>
      ),
    },
  });
  await user.click(screen.getByRole("button", { name: "Filter Status" }));
  await user.click(screen.getByText("Pick"));
  await user.click(screen.getByText("Apply"));
  expect(onChange).toHaveBeenLastCalledWith(["open"]);
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  await user.click(screen.getByText("Clear"));
  expect(onChange).toHaveBeenLastCalledWith(null);
});
test("controlled open requests changes without forcing visibility and uses requested portal", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  const portal = document.createElement("div");
  document.body.append(portal);
  const { rerender } = draw({
    column: {
      ...column,
      filterDropdownProps: { open: false, onOpenChange: changed },
    },
    getPopupContainer: () => portal,
  });
  await user.click(screen.getByRole("button", { name: "Filter Status" }));
  expect(changed).toHaveBeenCalledWith(true);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  rerender(
    <TableFilter
      column={{
        ...column,
        filterDropdownProps: { open: true, onOpenChange: changed },
      }}
      columnKey="status"
      value={null}
      onChange={() => {}}
      zh={false}
      getPopupContainer={() => portal}
    />,
  );
  expect(await within(portal).findByRole("dialog")).toBeInTheDocument();
  portal.remove();
});
test("tree parent selection cascades and removing one child clears parent value", async () => {
  const user = userEvent.setup();
  const { onChange } = draw({
    column: {
      ...column,
      filterMode: "tree",
      filters: [
        {
          text: "Group",
          value: "g",
          children: [
            { text: "Alpha", value: "a" },
            { text: "Beta", value: "b" },
          ],
        },
      ],
    },
  });
  await user.click(screen.getByRole("button", { name: "Filter Status" }));
  await user.click(screen.getByRole("checkbox", { name: "Group" }));
  expect(screen.getByRole("checkbox", { name: "Alpha" })).toBeChecked();
  expect(screen.getByRole("checkbox", { name: "Beta" })).toBeChecked();
  await user.click(screen.getByRole("checkbox", { name: "Alpha" }));
  expect(
    screen.getByRole("checkbox", { name: "Group" }),
  ).toBePartiallyChecked();
  await user.click(screen.getByRole("button", { name: "OK" }));
  expect(onChange).toHaveBeenCalledWith(["b"]);
});
test("outside click applies pending filter once", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <>
      <TableFilter
        column={column}
        columnKey="status"
        value={null}
        onChange={onChange}
        zh={false}
      />
      <button>Outside</button>
    </>,
  );
  await user.click(screen.getByRole("button", { name: "Filter Status" }));
  await user.click(screen.getByRole("checkbox", { name: "Open" }));
  await user.click(screen.getByRole("button", { name: "Outside" }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith(["open"]);
});
test("custom filter can set keys and confirm within the same event", async () => {
  const user = userEvent.setup();
  const { onChange } = draw({
    column: {
      ...column,
      filterDropdown: ({ setSelectedKeys, confirm }) => (
        <button
          onClick={() => {
            setSelectedKeys([false]);
            confirm();
          }}
        >
          Pick and confirm
        </button>
      ),
    },
  });
  await user.click(screen.getByRole("button", { name: "Filter Status" }));
  await user.click(screen.getByText("Pick and confirm"));
  expect(onChange).toHaveBeenCalledExactlyOnceWith([false]);
});
