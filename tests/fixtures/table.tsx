import React from "react";
import { createRoot } from "react-dom/client";
import { Table, Button, MtoneProvider } from "../../packages/mtone/src";
import type { TableColumn, TableRef } from "../../packages/mtone/src";
import { TableExample } from "../../apps/docs/table-example";
import "../../packages/mtone/dist/styles.css";
type Row = {
  key: number;
  name: string;
  city: string;
  age: number;
  children?: Row[];
};
const rows: Row[] = Array.from({ length: 24 }, (_, i) => ({
  key: i,
  name: `Person ${i}`,
  city: i % 2 ? "Paris" : "London",
  age: 20 + i,
}));
const columns: TableColumn<Row>[] = [
  { key: "name", title: "Name", dataIndex: "name", width: 180 },
  { key: "city", title: "City", dataIndex: "city", width: 180 },
  { key: "age", title: "Age", dataIndex: "age", width: 100 },
];
function Demo() {
  const [selection, setSelection] = React.useState<React.Key[]>([]),
    [treeSelection, setTreeSelection] = React.useState<React.Key[]>([]),
    [radio, setRadio] = React.useState(false);
  const virtual = React.useRef<TableRef>(null);
  return (
    <MtoneProvider locale="en">
      <main
        style={{
          maxWidth: 900,
          minWidth: 0,
          margin: "auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: 24,
        }}
      >
        <section data-testid="fixed">
          <h2>Fixed columns, header and summary</h2>
          <Table
            dataSource={rows}
            bordered
            scroll={{ x: 1100, y: 230 }}
            columns={[
              { ...columns[0], fixed: "left" },
              { ...columns[1], width: 400 },
              { ...columns[2], width: 400 },
              {
                key: "action",
                title: "Action",
                width: 120,
                fixed: "right",
                render: (_, row) => <span>Open {row.key}</span>,
              },
            ]}
            summary={(data) => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={3}>
                    {data.length} records
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </section>
        <section data-testid="controls">
          <h2>Filter and selection</h2>
          <Button
            onClick={() => {
              setRadio((v) => !v);
              setSelection([]);
            }}
          >
            Toggle radio
          </Button>
          <Button>Outside filter</Button>
          <output aria-label="Selected keys">{selection.join(",")}</output>
          <Table
            dataSource={rows}
            rowSelection={{
              selectedRowKeys: selection,
              onChange: setSelection,
              selections: true,
              type: radio ? "radio" : "checkbox",
              preserveSelectedRowKeys: true,
              getCheckboxProps: (r) => ({ disabled: r.key === 2 }),
            }}
            pagination={{
              defaultPageSize: 4,
              pageSizeOptions: [4, 8],
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            columns={[
              { ...columns[0], sortable: true, filterable: true },
              {
                ...columns[1],
                filters: [
                  { text: "Paris", value: "Paris" },
                  { text: "London", value: "London" },
                ],
                filterSearch: true,
                onFilter: (v, r) => r.city === v,
              },
              columns[2],
            ]}
          />
        </section>
        <section data-testid="tree">
          <h2>Tree and association</h2>
          <output aria-label="Tree selected keys">
            {treeSelection.join(",")}
          </output>
          <Table
            dataSource={[
              {
                ...rows[0],
                name: "Parent",
                children: [
                  { ...rows[1], name: "Child one" },
                  { ...rows[2], name: "Child two" },
                ],
              },
              rows[3],
            ]}
            columns={columns}
            rowSelection={{ checkStrictly: false, onChange: setTreeSelection }}
          />
        </section>
        <section data-testid="expanded">
          <h2>Expansion</h2>
          <Table
            dataSource={rows.slice(0, 3)}
            columns={columns}
            expandable={{
              showExpandAll: true,
              expandedRowRender: (r) => <p>Details for {r.name}</p>,
              rowExpandable: (r) => r.key !== 2,
            }}
          />
        </section>
        <section data-testid="merged">
          <h2>Grouped headers and merged cells</h2>
          <Table
            dataSource={rows.slice(0, 4)}
            bordered
            columns={[
              {
                ...columns[0],
                onCell: (_, i) => ({ rowSpan: i === 0 ? 2 : i === 1 ? 0 : 1 }),
              },
              { title: "Details", children: [columns[1], columns[2]] },
            ]}
            summary={(data) => (
              <Table.Summary>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    Combined total
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    {data.reduce((s, r) => s + r.age, 0)}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </section>
        <section data-testid="virtual">
          <h2>Virtual rows</h2>
          <Button onClick={() => virtual.current?.scrollTo({ key: 500 })}>
            Scroll to 500
          </Button>
          <Button onClick={() => virtual.current?.scrollTo({ top: 0 })}>
            Virtual top
          </Button>
          <Table
            ref={virtual}
            virtual
            dataSource={Array.from({ length: 1000 }, (_, i) => ({
              ...rows[i % 24],
              key: i,
              name: `Virtual ${i}`,
            }))}
            columns={[{ ...columns[0], fixed: "left" }, columns[1], columns[2]]}
            scroll={{ x: 700, y: 240 }}
          />
        </section>
        <section data-testid="responsive">
          <h2>Responsive</h2>
          <Table
            dataSource={rows.slice(0, 2)}
            columns={[
              columns[0],
              { ...columns[1], responsive: ["lg"] },
              columns[2],
            ]}
          />
        </section>
        <section data-testid="dark">
          <h2>Dark tokens</h2>
          <MtoneProvider
            locale="en"
            tokens={{
              "--mt-bg": "#202020",
              "--mt-fg": "#ededed",
              "--mt-muted": "#aaaaaa",
              "--mt-subtle": "#292929",
              "--mt-hover": "#333333",
              "--mt-border": "#444444",
              "--mt-focus": "#a1bbdd",
              "--mt-primary": "#ededed",
            }}
          >
            <Table
              dataSource={rows.slice(0, 3)}
              columns={columns}
              rowSelection={{}}
            />
          </MtoneProvider>
        </section>
        {(["left", "center", "right"] as const).flatMap((align) =>
          (["ltr", "rtl"] as const).map((direction) => (
            <section
              key={align + direction}
              data-testid={"selection-" + align + "-" + direction}
            >
              <Table
                dataSource={rows.slice(0, 3)}
                columns={columns}
                direction={direction}
                size={align === "right" ? "large" : "small"}
                rowSelection={{ selections: true, align, fixed: true }}
                scroll={{ x: 1100, y: 160 }}
              />
            </section>
          )),
        )}
        <section data-testid="composition">
          <h2>Editing and drag demos</h2>
          <TableExample />
        </section>
      </main>
    </MtoneProvider>
  );
}
createRoot(document.getElementById("root")!).render(<Demo />);
