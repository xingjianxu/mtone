import React, { useRef, useState } from "react";
import { Table, Button, Badge } from "../../../packages/mtone/src";
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
export default function Demo() {
  const [notice, setNotice] = useState("");
  const columns: TableColumn<Row>[] = [
    {
      ...basic[0],
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
      render: (value) => <Badge>{String(value)}</Badge>,
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
    basic[2],
  ];
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Table
        dataSource={initial.slice(0, 6)}
        columns={columns}
        onTableChange={(_, filters, _sorter, extra) =>
          setNotice(
            `匹配 ${extra.currentDataSource.length} 行；${JSON.stringify(filters)}`,
          )
        }
      />
      <div role="status" style={{ fontSize: 12, overflowWrap: "anywhere" }}>
        {notice}
      </div>
    </div>
  );
}
