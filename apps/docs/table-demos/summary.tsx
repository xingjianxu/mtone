import React, { useRef } from "react";
import { DataTable } from "../../../packages/mtone/src";
import type { DataTableColumn } from "../../../packages/mtone/src";

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
export default function Demo() {
  return (
    <DataTable
      dataSource={initial.slice(0, 4)}
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
}
