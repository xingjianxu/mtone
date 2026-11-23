import React, { useRef, useState } from "react";
import { DataTable, Button } from "../../../packages/mtone/src";
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
  const [notice, setNotice] = useState("");
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <DataTable
        dataSource={initial}
        bordered
        scroll={{ x: 1000, y: 280 }}
        sticky
        title={() => "最近的资料"}
        footer={(rows) => `共 ${rows.length} 条`}
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
      />
      <div role="status" style={{ fontSize: 12, overflowWrap: "anywhere" }}>
        {notice}
      </div>
    </div>
  );
}
