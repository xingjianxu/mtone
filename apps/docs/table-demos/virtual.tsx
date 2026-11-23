import React, { useRef } from "react";
import { DataTable, Button, Tag, Text } from "../../../packages/mtone/src";
import type { DataTableColumn, DataTableRef } from "../../../packages/mtone/src";

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
export default function Demo() {
  const ref = useRef<DataTableRef>(null);
  const large = Array.from({ length: 2000 }, (_, i) => ({
    ...initial[i % initial.length],
    key: i + 1,
    title: `资料 ${i + 1}`,
  }));
  return (
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
}
