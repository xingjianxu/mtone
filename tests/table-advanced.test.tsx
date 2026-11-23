import React from "react";
import {
  fireEvent,
  render as rtlRender,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { DataTable, MtoneProvider, Toolbar, type DataTableProps } from "../packages/mtone/src";
const render = (node: React.ReactNode) =>
  rtlRender(<MtoneProvider locale="en">{node}</MtoneProvider>);
const rows = [
  { key: 1, name: "Bob", age: 20 },
  { key: 2, name: "Ann", age: 30 },
  { key: 3, name: "Cat", age: 10 },
];
test("modern dataSource nested fields, groups and hidden columns", () => {
  render(
    <DataTable
      dataSource={[{ key: 1, profile: { name: "Ann" } }]}
      columns={[
        {
          title: "Group",
          children: [{ title: "Name", dataIndex: ["profile", "name"] }],
        },
        { title: "Hidden", hidden: true },
      ]}
    />,
  );
  expect(screen.getByText("Ann")).toBeTruthy();
  expect(screen.getByText("Group")).toBeTruthy();
  expect(screen.queryByText("Hidden")).toBeNull();
});
test("modern sorting calls distinct callback while preserving legacy state callback", () => {
  const old = vi.fn(),
    modern = vi.fn();
  render(
    <DataTable
      dataSource={rows}
      onChange={old}
      onTableChange={modern}
      columns={[
        {
          key: "age",
          title: "Age",
          dataIndex: "age",
          sorter: (a, b) => a.age - b.age,
        },
      ]}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: /Age/ }));
  expect(old.mock.calls[0][0].sort).toEqual({ key: "age", direction: "asc" });
  expect(modern.mock.calls[0][2]).toMatchObject({
    columnKey: "age",
    order: "ascend",
  });
  expect(modern.mock.calls[0][3].currentDataSource[0].age).toBe(10);
});
test("pagination defaults, size changer and remote data preserve table state", async () => {
  const change = vi.fn();
  render(
    <DataTable
      dataSource={rows}
      pagination={{
        defaultPageSize: 1,
        showSizeChanger: true,
        pageSizeOptions: [1, 2],
      }}
      onTableChange={change}
      columns={[{ title: "Name", dataIndex: "name" }]}
    />,
  );
  expect(screen.queryByText("Ann")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Next page" }));
  expect(screen.getByText("Ann")).toBeTruthy();
  const size = screen.getByRole("combobox", { name: "Page size" });
  expect(size).toHaveClass("mt-select");
  await userEvent.click(size);
  await userEvent.click(
    await screen.findByRole("option", { name: "2 / page" }),
  );
  expect(size).toHaveTextContent("2 / page");
  expect(screen.getByText("Bob")).toBeTruthy();
  expect(change.mock.calls.at(-1)![0].pageSize).toBe(2);
});
test("expandable rows with expand-all, summary, title and footer", () => {
  render(
    <DataTable
      dataSource={rows}
      columns={[{ title: "Name", dataIndex: "name" }]}
      title={() => "Report"}
      footer={() => "End"}
      expandable={{
        expandedRowRender: (r) => <span>{r.name} details</span>,
        showExpandAll: true,
      }}
      summary={() => (
        <DataTable.Summary.Row>
          <DataTable.Summary.Cell index={0} colSpan={2}>
            Summary
          </DataTable.Summary.Cell>
        </DataTable.Summary.Row>
      )}
    />,
  );
  expect(screen.getByText("Report")).toBeTruthy();
  expect(screen.getByText("Summary")).toBeTruthy();
  fireEvent.click(screen.getAllByRole("button", { name: "Expand row" })[0]);
  expect(screen.getByText("Bob details")).toBeTruthy();
});
test("row/cell event overrides, merged cells and semantic styling", () => {
  const click = vi.fn();
  const { container } = render(
    <DataTable
      dataSource={rows}
      bordered
      classNames={{ root: "custom-root", body: { row: "custom-row" } }}
      onRow={() => ({ onClick: click })}
      columns={[
        {
          title: "Name",
          dataIndex: "name",
          onCell: (_, i) => ({ rowSpan: i === 0 ? 2 : i === 1 ? 0 : 1 }),
        },
      ]}
    />,
  );
  fireEvent.click(screen.getByText("Bob"));
  expect(click).toHaveBeenCalled();
  expect(container.querySelector('td[rowspan="2"]')).toBeTruthy();
  expect(container.querySelector(".custom-root")).toBeTruthy();
});
test("JSX Column and ColumnGroup support", () => {
  render(
    <DataTable dataSource={rows}>
      <DataTable.ColumnGroup title="People">
        <DataTable.Column title="Name" dataIndex="name" />
      </DataTable.ColumnGroup>
    </DataTable>,
  );
  expect(screen.getByText("People")).toBeTruthy();
  expect(screen.getByText("Ann")).toBeTruthy();
});
test("imperative ref exposes native element and scrollTo", () => {
  const ref = React.createRef<any>();
  render(
    <DataTable
      ref={ref}
      dataSource={rows}
      columns={[{ title: "Name", dataIndex: "name" }]}
    />,
  );
  expect(ref.current.nativeElement).toBeInstanceOf(HTMLElement);
  expect(ref.current.scrollTo).toBeTypeOf("function");
});
test("controlled sort and filters emit requests without changing rows until parent rerenders", () => {
  const onTableChange = vi.fn();
  const cols = [
    {
      key: "age",
      title: "Age",
      dataIndex: "age",
      sorter: (a: (typeof rows)[0], b: (typeof rows)[0]) => a.age - b.age,
      sortOrder: null,
    },
  ];
  const { rerender } = render(
    <DataTable dataSource={rows} columns={cols} onTableChange={onTableChange} />,
  );
  fireEvent.click(screen.getByRole("button", { name: /Age/ }));
  expect(screen.getAllByRole("cell")[0].textContent).toBe("20");
  expect(onTableChange.mock.calls[0][2].order).toBe("ascend");
  rerender(
    <MtoneProvider locale="en">
      <DataTable
        dataSource={rows}
        columns={[{ ...cols[0], sortOrder: "ascend" }]}
      />
    </MtoneProvider>,
  );
  expect(screen.getAllByRole("cell")[0].textContent).toBe("10");
});
test("selection and expansion markers preserve requested order", () => {
  render(
    <DataTable
      dataSource={rows}
      rowSelection={{}}
      expandable={{ expandedRowRender: (r) => r.name + " details" }}
      columns={[
        { title: "Name", dataIndex: "name" },
        DataTable.EXPAND_COLUMN,
        DataTable.SELECTION_COLUMN,
      ]}
    />,
  );
  const headers = screen.getAllByRole("columnheader");
  expect(headers[0].textContent).toBe("Name");
  expect(within(headers[2]).getByRole("checkbox")).toBeTruthy();
});
test("nested tree expansions and child selection remain reachable", () => {
  render(
    <DataTable
      dataSource={[
        {
          key: "parent",
          name: "Parent",
          children: [{ key: "child", name: "Child" }],
        },
      ]}
      rowSelection={{ checkStrictly: false }}
      columns={[{ title: "Name", dataIndex: "name" }]}
    />,
  );
  expect(screen.queryByText("Child")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Expand row" }));
  expect(screen.getByText("Child")).toBeTruthy();
  fireEvent.click(screen.getByRole("checkbox", { name: "Select row parent" }));
  expect(
    screen.getByRole("checkbox", { name: "Select row child" }),
  ).toBeChecked();
});
test("loading delay, hide single page and page placement", async () => {
  const { rerender } = render(
    <DataTable
      dataSource={rows}
      columns={[{ title: "Name", dataIndex: "name" }]}
      loading={{ spinning: true, delay: 5, tip: "Fetching" }}
      pagination={{ pageSize: 10, hideOnSinglePage: true }}
    />,
  );
  expect(screen.queryByRole("navigation")).toBeNull();
  expect(await screen.findByRole("status")).toHaveTextContent("Fetching");
  rerender(
    <MtoneProvider locale="en">
      <DataTable
        dataSource={rows}
        columns={[{ title: "Name", dataIndex: "name" }]}
        loading={false}
        pagination={{ pageSize: 1, placement: ["topStart", "bottomEnd"] }}
      />
    </MtoneProvider>,
  );
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.getAllByRole("navigation")).toHaveLength(2);
});
test("renders one toolbar inside the table frame before top pagination and keeps actions working", () => {
  const action = vi.fn();
  const selected = vi.fn();
  const { container } = render(
    <DataTable
      bordered
      dataSource={rows}
      columns={[{ title: "Name", dataIndex: "name" }]}
      toolbar={<Toolbar aria-label="Table tools" end={<button onClick={action}>Refresh</button>} />}
      pagination={{ pageSize: 1, placement: ["topStart", "bottomEnd"] }}
      rowSelection={{ onChange: selected }}
    />,
  );

  const wrapper = container.querySelector(".mt-table-wrap")!;
  const [slot, topPagination, body, bottomPagination] = Array.from(wrapper.children);
  expect(wrapper).toHaveClass("mt-table-bordered");
  expect(wrapper.querySelectorAll(".mt-table-toolbar")).toHaveLength(1);
  expect(slot).toHaveClass("mt-table-toolbar");
  expect(slot).toContainElement(screen.getByRole("group", { name: "Table tools" }));
  expect(topPagination).toBe(screen.getAllByRole("navigation", { name: "Pagination" })[0]);
  expect(body).toHaveClass("mt-table-container");
  expect(bottomPagination).toBe(screen.getAllByRole("navigation", { name: "Pagination" })[1]);

  fireEvent.click(within(slot as HTMLElement).getByRole("button", { name: "Refresh" }));
  expect(action).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole("checkbox", { name: "Select row 1" }));
  expect(selected.mock.calls[0][0]).toEqual([1]);
  fireEvent.click(within(topPagination as HTMLElement).getByRole("button", { name: "Next page" }));
  expect(screen.getByText("Ann")).toBeVisible();
});

test("does not insert a toolbar or change the pagination order without a rendered slot", () => {
  const configuration = {
    dataSource: rows,
    columns: [{ title: "Name", dataIndex: "name" }],
    pagination: { pageSize: 1, placement: ["topStart"] },
  } satisfies DataTableProps<(typeof rows)[number]>;
  const { container, rerender } = render(<DataTable {...configuration} />);
  const assertNoToolbar = () => {
    const wrapper = container.querySelector(".mt-table-wrap")!;
    expect(wrapper.querySelector(".mt-table-toolbar")).toBeNull();
    expect(wrapper.firstElementChild).toBe(screen.getByRole("navigation", { name: "Pagination" }));
  };
  assertNoToolbar();
  for (const toolbar of [false, [], " ", <>{false}{null}</>]) {
    rerender(
      <MtoneProvider locale="en">
        <DataTable {...configuration} toolbar={toolbar} />
      </MtoneProvider>,
    );
    assertNoToolbar();
  }
});

test("virtual table mounts bounded rows and imperative scroll is available", () => {
  const data = Array.from({ length: 1000 }, (_, key) => ({
    key,
    name: `Person ${key}`,
  }));
  const ref = React.createRef<any>();
  const { container } = render(
    <DataTable
      ref={ref}
      virtual
      scroll={{ x: 600, y: 200 }}
      dataSource={data}
      columns={[{ title: "Name", dataIndex: "name", width: 600 }]}
    />,
  );
  expect(container.querySelectorAll(".mt-table-row").length).toBeLessThan(50);
  expect(screen.getByText("Person 0")).toBeTruthy();
  expect(screen.queryByText("Person 999")).toBeNull();
  expect(ref.current.scrollTo).toBeTypeOf("function");
});
test("anonymous sortable column after selection marker uses the same key throughout pipeline", () => {
  render(
    <DataTable
      dataSource={rows}
      rowSelection={{}}
      columns={[
        DataTable.SELECTION_COLUMN,
        {
          title: "Computed",
          render: (_, r) => r.age,
          sorter: (a, b) => a.age - b.age,
        },
      ]}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: /Computed/ }));
  expect(screen.getAllByRole("row")[1]).toHaveTextContent("10");
});
test("filter callback reports total for the newly filtered data", () => {
  const fn = vi.fn();
  render(
    <DataTable
      dataSource={rows}
      onTableChange={fn}
      columns={[
        { key: "name", title: "Name", dataIndex: "name", filterable: true },
      ]}
      pagination={{ pageSize: 1 }}
    />,
  );
  fireEvent.change(screen.getByRole("textbox", { name: "Filter Name" }), {
    target: { value: "Ann" },
  });
  expect(fn.mock.calls[0][0].total).toBe(1);
  expect(fn.mock.calls[0][3].currentDataSource).toEqual([rows[1]]);
});
test("hidden columns remain available for controlled sorting without rendering", () => {
  render(
    <DataTable
      dataSource={rows}
      columns={[
        { title: "Name", dataIndex: "name" },
        {
          title: "Age",
          dataIndex: "age",
          key: "age",
          hidden: true,
          sorter: (a, b) => a.age - b.age,
          sortOrder: "ascend",
        },
      ]}
    />,
  );
  expect(screen.queryByText("Age")).toBeNull();
  expect(screen.getAllByRole("cell")[0]).toHaveTextContent("Cat");
});
test("custom pagination content retains navigation behavior", () => {
  render(
    <DataTable
      dataSource={rows}
      columns={[{ title: "Name", dataIndex: "name" }]}
      pagination={{
        pageSize: 1,
        itemRender: (_, type, node) =>
          type === "next" ? <span>More records</span> : node,
      }}
    />,
  );
  fireEvent.click(screen.getByText("More records"));
  expect(screen.getByText("Ann")).toBeTruthy();
});
test("JSX explicit keys are not rewritten in sort state and callbacks", () => {
  const fn = vi.fn();
  render(
    <DataTable
      dataSource={rows}
      onTableChange={fn}
      sort={{ key: "age", direction: "asc" }}
    >
      <DataTable.Column
        key="age"
        title="Age"
        dataIndex="age"
        sorter={(a: (typeof rows)[0], b: (typeof rows)[0]) => a.age - b.age}
      />
    </DataTable>,
  );
  expect(screen.getAllByRole("cell")[0]).toHaveTextContent("10");
  fireEvent.click(screen.getByRole("button", { name: /Age/ }));
  expect(fn.mock.calls[0][2].columnKey).toBe("age");
});
test("groups with all children hidden do not leave empty header columns", () => {
  render(
    <DataTable
      dataSource={rows}
      columns={[
        {
          title: "Empty group",
          children: [{ title: "Hidden", dataIndex: "age", hidden: true }],
        },
        { title: "Name", dataIndex: "name" },
      ]}
    />,
  );
  expect(screen.queryByText("Empty group")).toBeNull();
  expect(screen.getAllByRole("columnheader")).toHaveLength(1);
});
test("sorter tooltip targets only the icon and accepts rich content", () => {
  const { container } = render(
    <DataTable
      dataSource={rows}
      columns={[
        {
          title: "Age",
          dataIndex: "age",
          sorter: true,
          showSorterTooltip: {
            target: "sorter-icon",
            title: <strong>Rich hint</strong>,
          },
        },
      ]}
    />,
  );
  const button = screen.getByRole("button", { name: /Age/ });
  expect(button).not.toHaveAttribute("title");
  expect(container.querySelector(".mt-table-sort-icon")).toHaveAttribute(
    "aria-describedby",
  );
});
test('legacy expandable expandIcon remains usable alongside expand-all default icon',()=>{render(<DataTable dataSource={rows} columns={[{title:'Name',dataIndex:'name'}]} expandable={{showExpandAll:true,expandedRowRender:r=>r.name+' detail',expandIcon:({record,onExpand})=><button onClick={e=>onExpand(record,e)}>Custom expand {record.name}</button>}}/>);fireEvent.click(screen.getByRole('button',{name:'Custom expand Bob'}));expect(screen.getByText('Bob detail')).toBeTruthy();expect(screen.getByRole('button',{name:'Expand all rows'})).toBeTruthy()});

test("tree expand controls default to the first data column, not the selection column", () => {
  const { container } = render(<DataTable
    dataSource={[{ key: 1, name: "Parent", children: [{ key: 2, name: "Child" }] }]}
    columns={[{ title: "Group", children: [{ title: "Name", dataIndex: "name" }] }]}
    rowSelection={{ checkStrictly: false }}
    expandable={{ defaultExpandAllRows: true }}
  />);
  const row = container.querySelector('tbody tr[data-row-key="1"]')!;
  expect(row.querySelector('.mt-table-selection-column .mt-table-expand')).toBeNull();
  expect(within(row as HTMLElement).getByRole('button', { name: 'Collapse row' }).closest('td')?.textContent).toBe('Parent');
  expect(screen.getByText('Child').closest('td')?.querySelector('.indent-level-1')).toHaveStyle({ paddingLeft: '15px' });
});

test("tree expand position honors explicit overrides and tables without selection", () => {
  const data = [{ key: 1, name: "Parent", age: 20, children: [{ key: 2, name: "Child", age: 10 }] }];
  const columns = [{ title: "Name", dataIndex: "name" }, { title: "Age", dataIndex: "age" }];
  const { rerender } = render(<DataTable dataSource={data} columns={columns} />);
  expect(screen.getByRole('button', { name: 'Expand row' }).closest('td')?.textContent).toBe('Parent');
  rerender(<MtoneProvider locale="en"><DataTable dataSource={data} columns={columns} rowSelection={{}}
    expandable={{ expandIconColumnIndex: 2 }} /></MtoneProvider>);
  expect(screen.getByRole('button', { name: 'Expand row' }).closest('td')?.textContent).toBe('20');
});

test("page size Select preserves controlled values and numeric callbacks", async () => {
  const onChange = vi.fn(),
    onShowSizeChange = vi.fn(),
    onTableChange = vi.fn();
  const { rerender } = render(
    <DataTable
      dataSource={rows}
      columns={[{ dataIndex: "name" }]}
      pagination={{
        current: 2,
        pageSize: 1,
        showSizeChanger: true,
        pageSizeOptions: ["2", 2, 0],
        onChange,
        onShowSizeChange,
      }}
      onTableChange={onTableChange}
    />,
  );
  const trigger = screen.getByRole("combobox", { name: "Page size" });
  await userEvent.click(trigger);
  expect(await screen.findAllByRole("option")).toHaveLength(2);
  await userEvent.click(screen.getByRole("option", { name: "2 / page" }));
  expect(onChange).toHaveBeenCalledExactlyOnceWith(1, 2);
  expect(onShowSizeChange).toHaveBeenCalledExactlyOnceWith(1, 2);
  expect(onTableChange.mock.calls[0][0]).toMatchObject({
    current: 1,
    pageSize: 2,
  });
  expect(trigger).toHaveTextContent("1 / page");
  expect(screen.queryByText("Bob")).toBeNull();
  rerender(
    <MtoneProvider locale="en">
      <DataTable
        dataSource={rows}
        columns={[{ dataIndex: "name" }]}
        pagination={{ current: 1, pageSize: 2, showSizeChanger: true }}
      />
    </MtoneProvider>,
  );
  expect(trigger).toHaveTextContent("2 / page");
  expect(screen.getByText("Bob")).toBeTruthy();
});

test("page size Select localizes, disables and hides with pagination settings", async () => {
  const onChange = vi.fn();
  const { rerender } = rtlRender(
    <MtoneProvider locale="zh">
      <DataTable
        dataSource={rows}
        columns={[{ dataIndex: "name" }]}
        pagination={{
          pageSize: 1,
          disabled: true,
          showSizeChanger: true,
          onChange,
        }}
      />
    </MtoneProvider>,
  );
  const trigger = screen.getByRole("combobox", { name: "每页条数" });
  expect(trigger).toHaveTextContent("1 条/页");
  expect(trigger).toBeDisabled();
  await userEvent.click(trigger);
  expect(screen.queryByRole("listbox")).toBeNull();
  expect(onChange).not.toHaveBeenCalled();
  rerender(
    <DataTable
      dataSource={rows}
      columns={[]}
      pagination={{ showSizeChanger: false }}
    />,
  );
  expect(screen.queryByRole("combobox")).toBeNull();
});
