import React from "react";
import { Table } from "../../../packages/mtone/src";
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
export default function Demo() {
  return (
    <Table
      dataSource={[
        { ...initial[0], title: "知识库", children: initial.slice(1, 3) },
        initial[3],
      ]}
      columns={basic}
      rowSelection={{ checkStrictly: false }}
      expandable={{ defaultExpandAllRows: true }}
    />
  );
}
