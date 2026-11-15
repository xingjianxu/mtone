import * as React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import {
  Table,
  Tree,
  DatePicker,
  Upload,
  Pagination,
} from "../packages/mtone/src/data";
import { MtoneProvider } from "../packages/mtone/src/basic";
afterEach(cleanup);
const en = (x: React.ReactNode) =>
  render(<MtoneProvider locale="en">{x}</MtoneProvider>);
test("table sorts filters selects and paginates locally", () => {
  en(
    <Table
      data={[
        { id: "b", name: "Beta" },
        { id: "a", name: "Alpha" },
      ]}
      rowKey="id"
      columns={[
        {
          key: "name",
          title: "Name",
          dataIndex: "name",
          sortable: true,
          filterable: true,
        },
      ]}
      selectable
      pagination={{ pageSize: 1 }}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Name" }));
  expect(screen.getByText("Alpha")).toBeTruthy();
  fireEvent.click(screen.getByLabelText("Select row a"));
  expect(
    (screen.getByLabelText("Select row a") as HTMLInputElement).checked,
  ).toBe(true);
  fireEvent.change(screen.getByLabelText("Filter Name"), {
    target: { value: "Beta" },
  });
  expect(screen.getByText("Beta")).toBeTruthy();
});
test("manual table reports sorting without reordering supplied rows", () => {
  const change = vi.fn();
  en(
    <Table
      manual
      onChange={change}
      data={[
        { id: "b", name: "Beta" },
        { id: "a", name: "Alpha" },
      ]}
      rowKey="id"
      columns={[
        { key: "name", title: "Name", dataIndex: "name", sortable: true },
      ]}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Name" }));
  expect(screen.getAllByRole("row")[1].textContent).toContain("Beta");
  expect(change.mock.calls[0][0].sort).toEqual({
    key: "name",
    direction: "asc",
  });
});
test("tree expands and navigates with arrows", () => {
  en(
    <Tree
      items={[
        { id: "p", label: "Parent", children: [{ id: "c", label: "Child" }] },
        { id: "z", label: "Last" },
      ]}
    />,
  );
  const parent = screen.getByRole("treeitem", { name: "Parent" });
  parent.focus();
  fireEvent.keyDown(parent, { key: "ArrowRight" });
  fireEvent.keyDown(parent, { key: "ArrowDown" });
  expect(document.activeElement?.textContent).toContain("Child");
  fireEvent.keyDown(document.activeElement!, { key: "End" });
  expect(document.activeElement?.textContent).toContain("Last");
});
test("date validates bounds and disabled dates before notifying and supports clear", () => {
  const change = vi.fn();
  en(
    <DatePicker
      label="Date"
      min="2026-01-01"
      max="2026-12-31"
      disabledDate={(d) => d === "2026-06-01"}
      defaultValue="2026-02-01"
      onValueChange={change}
    />,
  );
  fireEvent.change(screen.getByLabelText("Date"), {
    target: { value: "2026-06-01" },
  });
  expect(change).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Date"), {
    target: { value: "2026-07-01" },
  });
  expect(change).toHaveBeenLastCalledWith("2026-07-01");
  fireEvent.click(screen.getByRole("button", { name: "Clear date" }));
  expect(change).toHaveBeenLastCalledWith("");
});
test("upload cancellation ignores stale completion and retries with new signal", async () => {
  let resolve!: () => void;
  const signals: AbortSignal[] = [];
  const upload = (_: File, c: { signal: AbortSignal }) => {
    signals.push(c.signal);
    return new Promise<void>((r) => (resolve = r));
  };
  en(<Upload upload={upload} />);
  fireEvent.change(screen.getByLabelText("Choose files"), {
    target: { files: [new File(["x"], "a.txt")] },
  });
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(signals[0].aborted).toBe(true);
  await act(async () => resolve());
  expect(screen.getByText("Cancelled")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(signals.length).toBe(2);
  await act(async () => resolve());
  expect(screen.getByText("Uploaded")).toBeTruthy();
});
test("upload validates type and size without sending", () => {
  const upload = vi.fn();
  en(<Upload upload={upload} accept=".png" maxSize={2} />);
  fireEvent.change(screen.getByLabelText("Choose files"), {
    target: { files: [new File(["xxx"], "a.txt")] },
  });
  expect(upload).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toBeTruthy();
});
test("pagination disables boundary controls", () => {
  en(<Pagination total={10} pageSize={10} page={1} onPageChange={() => {}} />);
  expect(
    (screen.getByRole("button", { name: "Next page" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
});
test("table preserves numeric row keys in selection", () => {
  const change = vi.fn();
  const { rerender } = en(
    <Table
      data={[{ id: 1, name: "One" }]}
      rowKey="id"
      columns={[{ key: "name", title: "Name" }]}
      selectable
      selectedKeys={[1]}
      onSelectionChange={change}
    />,
  );
  expect(
    (screen.getByLabelText("Select row 1") as HTMLInputElement).checked,
  ).toBe(true);
  fireEvent.click(screen.getByLabelText("Select row 1"));
  expect(change).toHaveBeenLastCalledWith([]);
  rerender(
    <MtoneProvider locale="en">
      <Table
        data={[{ id: 1, name: "One" }]}
        rowKey="id"
        columns={[{ key: "name", title: "Name" }]}
        selectable
        selectedKeys={[]}
        onSelectionChange={change}
      />
    </MtoneProvider>,
  );
  fireEvent.click(screen.getByLabelText("Select row 1"));
  expect(change).toHaveBeenLastCalledWith([1]);
});
test("explicit null clears a previously controlled table sort", () => {
  const data = [
    { id: 2, name: "Beta" },
    { id: 1, name: "Alpha" },
  ];
  const columns = [
    { key: "name", title: "Name", dataIndex: "name" as const, sortable: true },
  ];
  const { rerender } = en(
    <Table
      data={data}
      rowKey="id"
      columns={columns}
      sort={{ key: "name", direction: "asc" }}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Name" }));
  rerender(
    <MtoneProvider locale="en">
      <Table data={data} rowKey="id" columns={columns} sort={null} />
    </MtoneProvider>,
  );
  expect(screen.getAllByRole("row")[1].textContent).toContain("Beta");
  expect(
    screen.getAllByRole("columnheader")[0].getAttribute("aria-sort"),
  ).toBeNull();
});
test("invalid upload cannot retry after locale changes", () => {
  const upload = vi.fn();
  const { rerender } = en(<Upload upload={upload} accept=".png" />);
  fireEvent.change(screen.getByLabelText("Choose files"), {
    target: { files: [new File(["x"], "a.txt")] },
  });
  rerender(
    <MtoneProvider locale="zh">
      <Upload upload={upload} accept=".png" />
    </MtoneProvider>,
  );
  const retry = screen.getByRole("button", {
    name: "重试",
  }) as HTMLButtonElement;
  expect(retry.disabled).toBe(true);
  fireEvent.click(retry);
  expect(upload).not.toHaveBeenCalled();
});
test("loading table preserves headers and announces loading", () => {
  en(
    <Table
      loading
      data={[]}
      rowKey="id"
      columns={[{ key: "id", title: "ID" }]}
    />,
  );
  expect(screen.getByRole("table").getAttribute("aria-busy")).toBe("true");
  expect(screen.getByRole("columnheader", { name: "ID" })).toBeTruthy();
  expect(screen.getByRole("status").textContent).toContain("Loading");
});
test("pagination renders compact numbered pages and ellipses", () => {
  const change = vi.fn();
  en(<Pagination total={200} pageSize={10} page={10} onPageChange={change} />);
  expect(
    screen
      .getByRole("button", { name: "Page 10" })
      .getAttribute("aria-current"),
  ).toBe("page");
  expect(screen.getAllByText("…").length).toBe(2);
  fireEvent.click(screen.getByRole("button", { name: "Page 11" }));
  expect(change).toHaveBeenCalledWith(11);
});
test("tree never focuses disabled parent via ArrowLeft", () => {
  en(
    <Tree
      defaultExpanded={["p"]}
      items={[
        {
          id: "p",
          label: "Disabled parent",
          disabled: true,
          children: [{ id: "c", label: "Child" }],
        },
      ]}
    />,
  );
  const child = screen.getByRole("treeitem", { name: "Child" });
  child.focus();
  fireEvent.keyDown(child, { key: "ArrowLeft" });
  expect(document.activeElement).toBe(child);
});

test("date picker adds a decorative Select-style arrow without replacing its native input", () => {
  en(<DatePicker label="Native date" defaultValue="2026-02-01" disabled min="2026-01-01" max="2026-12-31" name="due" />);
  const input = screen.getByLabelText("Native date");
  expect(input).toHaveAttribute("type", "date");
  expect(input).toBeDisabled();
  expect(input).toHaveAttribute("name", "due");
  expect(input).toHaveAttribute("min", "2026-01-01");
  const icon = input.parentElement?.querySelector(".mt-date-icon");
  expect(icon).toHaveAttribute("aria-hidden", "true");
  expect(icon?.querySelector("svg")).toHaveClass("lucide-chevron-down");
  expect(icon?.querySelector("svg")).toHaveAttribute("width", "16");
  expect(icon?.querySelector("svg")).toHaveAttribute("stroke-width", "2");
});
