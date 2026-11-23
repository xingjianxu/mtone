/// <reference types="vite/client" />
import ToolbarTable from "./inline-demos/toolbar-table";
import toolbarTableSource from "./inline-demos/toolbar-table.tsx?raw";
import DataTableExample0 from "./table-demos/basic";
import tableSource0 from "./table-demos/basic.tsx?raw";
import DataTableExample1 from "./table-demos/selection";
import tableSource1 from "./table-demos/selection.tsx?raw";
import DataTableExample2 from "./table-demos/selection-menu";
import tableSource2 from "./table-demos/selection-menu.tsx?raw";
import DataTableExample3 from "./table-demos/radio";
import tableSource3 from "./table-demos/radio.tsx?raw";
import DataTableExample4 from "./table-demos/sorting";
import tableSource4 from "./table-demos/sorting.tsx?raw";
import DataTableExample5 from "./table-demos/filters";
import tableSource5 from "./table-demos/filters.tsx?raw";
import DataTableExample6 from "./table-demos/pagination";
import tableSource6 from "./table-demos/pagination.tsx?raw";
import DataTableExample7 from "./table-demos/tree";
import tableSource7 from "./table-demos/tree.tsx?raw";
import DataTableExample8 from "./table-demos/expand";
import tableSource8 from "./table-demos/expand.tsx?raw";
import DataTableExample9 from "./table-demos/fixed";
import tableSource9 from "./table-demos/fixed.tsx?raw";
import DataTableExample10 from "./table-demos/summary";
import tableSource10 from "./table-demos/summary.tsx?raw";
import DataTableExample11 from "./table-demos/virtual";
import tableSource11 from "./table-demos/virtual.tsx?raw";
import DataTableExample12 from "./table-demos/edit";
import tableSource12 from "./table-demos/edit.tsx?raw";
import React, { useRef, useState } from "react";
import { DataTable, Button, Tag, Text } from "../../packages/mtone/src";
import type { DataTableColumn, DataTableRef } from "../../packages/mtone/src";

type Row = {
  key: number;
  title: string;
  category: string;
  score: number;
  children?: Row[];
};
const initial: Row[] = Array.from({ length: 18 }, (_, i) => ({
  key: i + 1,
  title: ["组件规范", "研究笔记", "阅读清单", "会议记录"][i % 4] + ` ${i + 1}`,
  category: ["设计", "研究", "阅读"][i % 3],
  score: 60 + ((i * 7) % 40),
}));
const basic: DataTableColumn<Row>[] = [
  { key: "title", title: "标题", dataIndex: "title", width: 240 },
  { key: "category", title: "分类", dataIndex: "category", width: 140 },
  { key: "score", title: "完成度", dataIndex: "score", width: 120 },
];
const toolbar: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  alignItems: "center",
};
const modes = [
  "筛选与分页",
  "固定与分组",
  "树与展开",
  "合并与汇总",
  "虚拟列表",
  "编辑与拖拽",
] as const;
/** Demonstrations use local data only. Editing and drag sorting are application compositions. */
export function DataTableExample({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<(typeof modes)[number]>(modes[0]);
  return (
    <div style={{ width: "100%", minWidth: 0, display: "grid", gap: 12 }}>
      {!compact && (
        <div style={toolbar} aria-label="表格示例">
          {modes.map((item) => (
            <Button
              key={item}
              variant={mode === item ? "soft" : "ghost"}
              aria-pressed={mode === item}
              onClick={() => setMode(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      )}
      <TableDemo key={mode} mode={compact ? modes[0] : mode} />
    </div>
  );
}
function EditableScore({
  row,
  onSave,
}: {
  row: Row;
  onSave: (score: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(row.score));
  const finished = useRef(false);
  const save = () => {
    if (finished.current) return;
    finished.current = true;
    const score = Number(value);
    if (value.trim() && Number.isFinite(score) && score >= 0 && score <= 100)
      onSave(score);
    setEditing(false);
  };
  const start = () => {
    finished.current = false;
    setValue(String(row.score));
    setEditing(true);
  };
  return editing ? (
    <input
      autoFocus
      className="mt-input"
      aria-label={`编辑完成度 ${row.key}`}
      type="number"
      min={0}
      max={100}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={save}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          save();
        }
        if (event.key === "Escape") {
          event.preventDefault();
          finished.current = true;
          setEditing(false);
        }
      }}
    />
  ) : (
    <button
      type="button"
      className="mt-table-sort"
      aria-label={`编辑完成度 ${row.key}，当前 ${row.score}`}
      title="双击或按 Enter 编辑；0–100，Enter 或失焦保存，Escape 取消"
      onDoubleClick={start}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          start();
        }
      }}
    >
      {row.score}
    </button>
  );
}
function TableDemo({ mode }: { mode: (typeof modes)[number] }) {
  const [rows, setRows] = useState(initial);
  const [selected, setSelected] = useState<React.Key[]>([]);
  const [notice, setNotice] = useState(
    "示例仅在本页生效，不会提交或保存数据。",
  );
  const [radio, setRadio] = useState(false);
  const [handleOnly, setHandleOnly] = useState(false);
  const [edit, setEdit] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [columnOrder, setColumnOrder] = useState([
    "title",
    "category",
    "score",
  ]);
  const dragRow = useRef<number | null>(null);
  const dragColumn = useRef<string | null>(null);
  const ref = useRef<DataTableRef>(null);
  const move = (key: number, target: number) =>
    setRows((previous) => {
      const from = previous.findIndex((r) => r.key === key),
        to = previous.findIndex((r) => r.key === target);
      if (from < 0 || to < 0 || from === to) return previous;
      const next = [...previous];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  let demo: React.ReactNode;
  if (mode === "筛选与分页") {
    const columns: DataTableColumn<Row>[] = [
      {
        ...basic[0],
        sorter: {
          compare: (a, b) => a.title.localeCompare(b.title),
          multiple: 1,
        },
        filterDropdown: ({
          selectedKeys,
          setSelectedKeys,
          confirm,
          clearFilters,
        }) => (
          <div style={{ display: "grid", gap: 8, padding: 8 }}>
            <input
              className="mt-input"
              aria-label="搜索标题"
              placeholder="输入标题"
              value={String(selectedKeys[0] ?? "")}
              onChange={(e) =>
                setSelectedKeys(e.target.value ? [e.target.value] : [])
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") confirm();
              }}
            />
            <div style={toolbar}>
              <Button onClick={() => confirm()}>搜索</Button>
              <Button onClick={() => clearFilters()}>清空</Button>
            </div>
          </div>
        ),
        onFilter: (value, row) => row.title.includes(String(value)),
      },
      {
        ...basic[1],
        render: (value) => <Tag>{String(value)}</Tag>,
        filterMode: "tree",
        filterSearch: true,
        filters: [
          {
            text: "知识库",
            value: "all",
            children: ["设计", "研究", "阅读"].map((value) => ({
              text: value,
              value,
            })),
          },
        ],
        onFilter: (value, row) => value === "all" || row.category === value,
      },
      {
        ...basic[2],
        sorter: { compare: (a, b) => a.score - b.score, multiple: 2 },
      },
    ];
    demo = (
      <>
        <div style={toolbar}>
          <Button
            onClick={() => {
              setRadio((v) => !v);
              setSelected([]);
            }}
          >
            {radio ? "切换多选" : "切换单选"}
          </Button>
          <Button onClick={() => setSelected([])}>清除选择</Button>
          <Text muted>已选择 {selected.length} 行</Text>
        </div>
        <DataTable
          dataSource={rows}
          columns={columns}
          rowSelection={{
            type: radio ? "radio" : "checkbox",
            selectedRowKeys: selected,
            onChange: setSelected,
            selections: true,
            preserveSelectedRowKeys: true,
            getCheckboxProps: (row) => ({ disabled: row.key === 3 }),
          }}
          pagination={{
            defaultPageSize: 5,
            pageSizeOptions: [5, 10, 20],
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}–${range[1]} / ${total} 条`,
          }}
          onTableChange={(_, filters, sorter, extra) =>
            setNotice(
              `事件：${extra.action}；当前匹配 ${extra.currentDataSource.length} 行；筛选 ${JSON.stringify(filters)}；排序列 ${Array.isArray(sorter) ? sorter.length : (sorter.columnKey ?? "无")}`,
            )
          }
        />
        <Text muted>
          两个排序列可叠加，完成度优先。第 3
          行不可选；分类支持树筛选与搜索，标题使用自定义面板。
        </Text>
      </>
    );
  } else if (mode === "固定与分组") {
    demo = (
      <DataTable
        dataSource={rows}
        bordered
        scroll={{ x: 1000, y: 280 }}
        sticky
        columns={[
          { ...basic[0], fixed: "left" },
          {
            title: "资料属性",
            children: [
              basic[1],
              basic[2],
              {
                key: "description",
                title: "说明（省略）",
                width: 300,
                ellipsis: true,
                render: () => (
                  <span title="保持内容清晰，逐步完善资料结构和协作流程。">
                    保持内容清晰，逐步完善资料结构和协作流程。保持内容清晰，逐步完善资料结构。
                  </span>
                ),
              },
            ],
          },
          {
            key: "actions",
            title: "操作",
            width: 120,
            fixed: "right",
            render: (_, row) => (
              <Button
                variant="ghost"
                onClick={() => setNotice(`查看：${row.title}`)}
              >
                查看
              </Button>
            ),
          },
        ]}
        title={() => "固定首尾列、多级表头和滚动区域"}
        footer={() => "拖动横向滚动条检查固定列。"}
      />
    );
  } else if (mode === "树与展开") {
    const tree: Row[] = [
      {
        ...initial[0],
        title: "知识库",
        children: [
          { ...initial[1], title: "研究资料" },
          { ...initial[2], title: "阅读记录" },
        ],
      },
      initial[3],
    ];
    demo = (
      <>
        <DataTable
          dataSource={tree}
          columns={basic}
          rowSelection={{ checkStrictly: false }}
          expandable={{ defaultExpandAllRows: true }}
        />
        <Text muted>
          上表：树形层级与父子关联选择。下表：展开详情中嵌套表格。
        </Text>
        <DataTable
          dataSource={rows.slice(0, 3)}
          columns={basic}
          expandable={{
            showExpandAll: true,
            expandedRowRender: (row) => (
              <DataTable
                dataSource={[{ ...row, title: `${row.title} · 子记录` }]}
                columns={basic}
                size="small"
              />
            ),
            rowExpandable: (row) => row.key !== 3,
          }}
        />
      </>
    );
  } else if (mode === "合并与汇总") {
    demo = (
      <DataTable
        dataSource={rows.slice(0, 4)}
        bordered
        columns={[
          {
            ...basic[0],
            onCell: (_, index) => ({
              rowSpan: index === 0 ? 2 : index === 1 ? 0 : 1,
            }),
          },
          basic[1],
          basic[2],
        ]}
        summary={(data) => (
          <DataTable.Summary>
            <DataTable.Summary.Row>
              <DataTable.Summary.Cell index={0} colSpan={2}>
                当前数据合计
              </DataTable.Summary.Cell>
              <DataTable.Summary.Cell index={2}>
                {data.reduce((sum, row) => sum + row.score, 0)}
              </DataTable.Summary.Cell>
            </DataTable.Summary.Row>
          </DataTable.Summary>
        )}
      />
    );
  } else if (mode === "虚拟列表") {
    const large = Array.from({ length: 2000 }, (_, i) => ({
      ...initial[i % initial.length],
      key: i + 1,
      title: `资料 ${i + 1}`,
    }));
    demo = (
      <>
        <div style={toolbar}>
          <Button onClick={() => ref.current?.scrollTo({ key: 1000 })}>
            定位第 1000 行
          </Button>
          <Button onClick={() => ref.current?.scrollTo({ top: 0 })}>
            回到顶部
          </Button>
          <Tag>2000 行</Tag>
        </div>
        <DataTable
          ref={ref}
          virtual
          dataSource={large}
          columns={basic}
          scroll={{ x: 700, y: 300 }}
        />
        <Text muted>
          虚拟化仅挂载可见区域。使用明确的数字 scroll.x /
          scroll.y；复杂合并、展开和自定义行组合需要单独验证。
        </Text>
      </>
    );
  } else {
    const editableColumns: DataTableColumn<Row>[] = columnOrder.map((key) => ({
      ...basic.find((c) => c.key === key)!,
      onHeaderCell: () => ({
        draggable: true,
        title: "拖动调整列顺序",
        onDragStart: () => {
          dragColumn.current = key;
        },
        onDragOver: (e) => e.preventDefault(),
        onDrop: (e) => {
          e.preventDefault();
          const from = dragColumn.current;
          if (!from || from === key) return;
          setColumnOrder((order) => {
            const next = order.filter((c) => c !== from);
            next.splice(next.indexOf(key), 0, from);
            return next;
          });
          dragColumn.current = null;
        },
      }),
      ...(key === "score"
        ? {
            render: (_: unknown, row: Row) => (
              <EditableScore
                row={row}
                onSave={(score) => {
                  setRows((old) =>
                    old.map((item) =>
                      item.key === row.key ? { ...item, score } : item,
                    ),
                  );
                  setNotice("已在本页保存完成度。");
                }}
              />
            ),
          }
        : {}),
      ...(key === "title"
        ? {
            render: (_: unknown, row: Row) =>
              edit === row.key ? (
                <input
                  className="mt-input"
                  aria-label={`编辑标题 ${row.key}`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setEdit(null);
                  }}
                />
              ) : (
                row.title
              ),
          }
        : {}),
    }));
    if (handleOnly)
      editableColumns.unshift({
        key: "handle",
        title: "移动",
        width: 65,
        render: (_, row) => (
          <button
            type="button"
            className="mt-table-sort"
            aria-label={`拖动 ${row.title}`}
            title="拖动手柄移动行；也可使用右侧上下移按钮"
            draggable={edit === null}
            disabled={edit !== null}
            onDragStart={(event) => {
              event.stopPropagation();
              dragRow.current = row.key;
              event.dataTransfer.setData("text/plain", String(row.key));
              event.dataTransfer.effectAllowed = "move";
            }}
            onDragEnd={() => {
              dragRow.current = null;
            }}
          >
            ⠿
          </button>
        ),
      });
    editableColumns.push({
      key: "operation",
      title: "操作",
      width: 260,
      render: (_, row, index) => (
        <div style={toolbar}>
          {edit === row.key ? (
            <>
              <Button
                onClick={() => {
                  if (!draft.trim()) {
                    setNotice("标题不能为空。");
                    return;
                  }
                  setRows((old) =>
                    old.map((r) =>
                      r.key === row.key ? { ...r, title: draft.trim() } : r,
                    ),
                  );
                  setEdit(null);
                  setNotice("已在本页保存标题。");
                }}
              >
                保存
              </Button>
              <Button onClick={() => setEdit(null)}>取消</Button>
            </>
          ) : (
            <Button
              onClick={() => {
                setEdit(row.key);
                setDraft(row.title);
              }}
            >
              编辑
            </Button>
          )}
          <Button
            aria-label={`上移 ${row.title}`}
            disabled={index === 0}
            onClick={() => move(row.key, rows[index - 1].key)}
          >
            ↑
          </Button>
          <Button
            aria-label={`下移 ${row.title}`}
            disabled={index === 4}
            onClick={() => move(row.key, rows[index + 1].key)}
          >
            ↓
          </Button>
        </div>
      ),
    });
    demo = (
      <>
        <div style={toolbar}>
          <Button
            aria-pressed={handleOnly}
            onClick={() => {
              setHandleOnly((value) => !value);
              dragRow.current = null;
            }}
          >
            {handleOnly ? "切换整行拖动" : "仅手柄拖动"}
          </Button>
          <Button
            onClick={() =>
              setColumnOrder((order) => [...order.slice(1), order[0]])
            }
          >
            轮换列顺序
          </Button>
          <Button
            onClick={() => {
              setRows(initial);
              setHandleOnly(false);
              setColumnOrder(["title", "category", "score"]);
              setEdit(null);
            }}
          >
            重置
          </Button>
        </div>
        <DataTable
          dataSource={rows.slice(0, 5)}
          columns={editableColumns}
          onRow={(row) => ({
            draggable: !handleOnly && edit === null,
            onDragStart: (event) => {
              if (handleOnly) return;
              dragRow.current = row.key;
              event.dataTransfer.setData("text/plain", String(row.key));
              event.dataTransfer.effectAllowed = "move";
            },
            onDragEnd: () => {
              dragRow.current = null;
            },
            onDragOver: (e) => e.preventDefault(),
            onDrop: (e) => {
              e.preventDefault();
              if (dragRow.current !== null) move(dragRow.current, row.key);
              dragRow.current = null;
            },
          })}
        />
        <Text muted>
          通过 render / onRow / onHeaderCell
          组合编辑与原生拖拽，不是内置编辑或拖拽
          API。可拖动行和表头，也可切换仅手柄拖动；键盘或触屏可使用上下移与轮换按钮。完成度单元格双击或按
          Enter 编辑，Enter 或失焦保存，Escape 取消；无效值（空值或超出
          0–100）不保存。生产应用需自行处理校验、保存、冲突和拖拽库集成。
        </Text>
      </>
    );
  }
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {demo}
      <div role="status" style={{ fontSize: 12, overflowWrap: "anywhere" }}>
        {notice}
      </div>
    </div>
  );
}

function displayTableSource(source: string) {
  return source.replaceAll("../../../packages/mtone/src", "@bixlab/mtone");
}

export const dataTableDocSections = [
  {
    id: "basic",
    title: "基础用法",
    Demo: DataTableExample0,
    source: displayTableSource(tableSource0),
  },
  {
    id: "toolbar",
    title: "工具栏与表格",
    note: "用 DataTable 的 toolbar 插槽把 Toolbar 放进同一个表格外框。搜索、状态筛选和导出仍由应用控制。",
    Demo: ToolbarTable,
    source: displayTableSource(toolbarTableSource),
  },
  {
    id: "row-selection",
    title: "行选择",
    children: [
      {
        id: "selection",
        title: "复选",
        Demo: DataTableExample1,
        source: displayTableSource(tableSource1),
      },
      {
        id: "selection-menu",
        title: "表头选择菜单",
        Demo: DataTableExample2,
        source: displayTableSource(tableSource2),
      },
      {
        id: "radio",
        title: "单选",
        Demo: DataTableExample3,
        source: displayTableSource(tableSource3),
      },
    ],
  },
  {
    id: "sort-filter",
    title: "排序与筛选",
    children: [
      {
        id: "sorting",
        title: "多列排序",
        Demo: DataTableExample4,
        source: displayTableSource(tableSource4),
      },
      {
        id: "filters",
        title: "自定义与树形筛选",
        Demo: DataTableExample5,
        source: displayTableSource(tableSource5),
      },
    ],
  },
  {
    id: "pagination",
    title: "分页",
    Demo: DataTableExample6,
    source: displayTableSource(tableSource6),
  },
  {
    id: "tree-expand",
    title: "树形与展开",
    children: [
      {
        id: "tree",
        title: "树形与关联选择",
        Demo: DataTableExample7,
        source: displayTableSource(tableSource7),
      },
      {
        id: "expand",
        title: "展开详情",
        Demo: DataTableExample8,
        source: displayTableSource(tableSource8),
      },
    ],
  },
  {
    id: "fixed",
    title: "滚动与固定",
    Demo: DataTableExample9,
    source: displayTableSource(tableSource9),
  },
  {
    id: "summary",
    title: "合并与汇总",
    Demo: DataTableExample10,
    source: displayTableSource(tableSource10),
  },
  {
    id: "virtual",
    title: "虚拟列表",
    Demo: DataTableExample11,
    source: displayTableSource(tableSource11),
  },
  {
    id: "edit",
    title: "编辑与拖拽",
    Demo: DataTableExample12,
    source: displayTableSource(tableSource12),
  },
];
