import React, { useRef, useState } from "react";
import { Table, Button, Text } from "../../../packages/mtone/src";
import type { TableColumn } from "../../../packages/mtone/src";

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
const basic: TableColumn<Row>[] = [
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
export default function Demo() {
  const [rows, setRows] = useState(initial);
  const [notice, setNotice] = useState("");
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
  const editableColumns: TableColumn<Row>[] = columnOrder.map((key) => ({
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
  return (
    <div style={{ display: "grid", gap: 12 }}>
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
        <Table
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
      <div role="status" style={{ fontSize: 12, overflowWrap: "anywhere" }}>
        {notice}
      </div>
    </div>
  );
}
