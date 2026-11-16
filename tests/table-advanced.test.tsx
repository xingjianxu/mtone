import React from "react";
import {
  fireEvent,
  render as rtlRender,
  screen,
  within,
} from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { Table, MtoneProvider } from "../packages/mtone/src";
const render = (node: React.ReactNode) =>
  rtlRender(<MtoneProvider locale="en">{node}</MtoneProvider>);
const rows = [
  { key: 1, name: "Bob", age: 20 },
  { key: 2, name: "Ann", age: 30 },
  { key: 3, name: "Cat", age: 10 },
];
test("modern dataSource nested fields, groups and hidden columns", () => {
  render(
    <Table
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
    <Table
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
test("pagination defaults, size changer and remote data preserve table state", () => {
  const change = vi.fn();
  render(
    <Table
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
  fireEvent.change(screen.getByRole("combobox", { name: "Page size" }), {
    target: { value: "2" },
  });
  expect(change.mock.calls.at(-1)![0].pageSize).toBe(2);
});
test("expandable rows with expand-all, summary, title and footer", () => {
  render(
    <Table
      dataSource={rows}
      columns={[{ title: "Name", dataIndex: "name" }]}
      title={() => "Report"}
      footer={() => "End"}
      expandable={{
        expandedRowRender: (r) => <span>{r.name} details</span>,
        showExpandAll: true,
      }}
      summary={() => (
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={2}>
            Summary
          </Table.Summary.Cell>
        </Table.Summary.Row>
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
    <Table
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
    <Table dataSource={rows}>
      <Table.ColumnGroup title="People">
        <Table.Column title="Name" dataIndex="name" />
      </Table.ColumnGroup>
    </Table>,
  );
  expect(screen.getByText("People")).toBeTruthy();
  expect(screen.getByText("Ann")).toBeTruthy();
});
test("imperative ref exposes native element and scrollTo", () => {
  const ref = React.createRef<any>();
  render(
    <Table
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
    <Table dataSource={rows} columns={cols} onTableChange={onTableChange} />,
  );
  fireEvent.click(screen.getByRole("button", { name: /Age/ }));
  expect(screen.getAllByRole("cell")[0].textContent).toBe("20");
  expect(onTableChange.mock.calls[0][2].order).toBe("ascend");
  rerender(
    <MtoneProvider locale="en">
      <Table
        dataSource={rows}
        columns={[{ ...cols[0], sortOrder: "ascend" }]}
      />
    </MtoneProvider>,
  );
  expect(screen.getAllByRole("cell")[0].textContent).toBe("10");
});
test("selection and expansion markers preserve requested order", () => {
  render(
    <Table
      dataSource={rows}
      rowSelection={{}}
      expandable={{ expandedRowRender: (r) => r.name + " details" }}
      columns={[
        { title: "Name", dataIndex: "name" },
        Table.EXPAND_COLUMN,
        Table.SELECTION_COLUMN,
      ]}
    />,
  );
  const headers = screen.getAllByRole("columnheader");
  expect(headers[0].textContent).toBe("Name");
  expect(within(headers[2]).getByRole("checkbox")).toBeTruthy();
});
test("nested tree expansions and child selection remain reachable", () => {
  render(
    <Table
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
    <Table
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
      <Table
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
test("virtual table mounts bounded rows and imperative scroll is available", () => {
  const data = Array.from({ length: 1000 }, (_, key) => ({
    key,
    name: `Person ${key}`,
  }));
  const ref = React.createRef<any>();
  const { container } = render(
    <Table
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
    <Table
      dataSource={rows}
      rowSelection={{}}
      columns={[
        Table.SELECTION_COLUMN,
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
    <Table
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
    <Table
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
    <Table
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
    <Table
      dataSource={rows}
      onTableChange={fn}
      sort={{ key: "age", direction: "asc" }}
    >
      <Table.Column
        key="age"
        title="Age"
        dataIndex="age"
        sorter={(a: (typeof rows)[0], b: (typeof rows)[0]) => a.age - b.age}
      />
    </Table>,
  );
  expect(screen.getAllByRole("cell")[0]).toHaveTextContent("10");
  fireEvent.click(screen.getByRole("button", { name: /Age/ }));
  expect(fn.mock.calls[0][2].columnKey).toBe("age");
});
test("groups with all children hidden do not leave empty header columns", () => {
  render(
    <Table
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
    <Table
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
test('legacy expandable expandIcon remains usable alongside expand-all default icon',()=>{render(<Table dataSource={rows} columns={[{title:'Name',dataIndex:'name'}]} expandable={{showExpandAll:true,expandedRowRender:r=>r.name+' detail',expandIcon:({record,onExpand})=><button onClick={e=>onExpand(record,e)}>Custom expand {record.name}</button>}}/>);fireEvent.click(screen.getByRole('button',{name:'Custom expand Bob'}));expect(screen.getByText('Bob detail')).toBeTruthy();expect(screen.getByRole('button',{name:'Expand all rows'})).toBeTruthy()});

test("tree expand controls default to the first data column, not the selection column", () => {
  const { container } = render(<Table
    dataSource={[{ key: 1, name: "Parent", children: [{ key: 2, name: "Child" }] }]}
    columns={[{ title: "Group", children: [{ title: "Name", dataIndex: "name" }] }]}
    rowSelection={{ checkStrictly: false }}
    expandable={{ defaultExpandAllRows: true }}
  />);
  const row = container.querySelector('tbody tr[data-row-key="1"]')!;
  expect(row.querySelector('.mt-table-selection-column .mt-table-expand')).toBeNull();
  expect(within(row as HTMLElement).getByRole('button', { name: 'Collapse row' }).closest('td')?.textContent).toBe('Parent');
  expect(screen.getByText('Child').closest('td')?.querySelector('.indent-level-1')).toBeTruthy();
});

test("tree expand position honors explicit overrides and tables without selection", () => {
  const data = [{ key: 1, name: "Parent", age: 20, children: [{ key: 2, name: "Child", age: 10 }] }];
  const columns = [{ title: "Name", dataIndex: "name" }, { title: "Age", dataIndex: "age" }];
  const { rerender } = render(<Table dataSource={data} columns={columns} />);
  expect(screen.getByRole('button', { name: 'Expand row' }).closest('td')?.textContent).toBe('Parent');
  rerender(<MtoneProvider locale="en"><Table dataSource={data} columns={columns} rowSelection={{}}
    expandable={{ expandIconColumnIndex: 2 }} /></MtoneProvider>);
  expect(screen.getByRole('button', { name: 'Expand row' }).closest('td')?.textContent).toBe('20');
});
