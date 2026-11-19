import { useState } from "react";
import {
  TreeSelect,
  type TreeItem,
  type TreeKey,
} from "../../../packages/mtone/src";

const items: TreeItem[] = [
  {
    id: "design",
    label: "设计资源",
    children: [
      { id: "colors", label: "色彩系统" },
      { id: "type", label: "字体规范" },
      { id: "archived", label: "归档资料（禁用）", disabled: true },
    ],
  },
  {
    id: "research",
    label: "研究资料",
    children: [
      { id: "notes", label: "研究笔记" },
      { id: "reports", label: "项目报告" },
    ],
  },
];

export default function Demo() {
  const [value, setValue] = useState<TreeKey | null>(null);
  const basic = (
    <TreeSelect
      items={items}
      value={value}
      onValueChange={setValue}
      aria-label="资料分类"
      placeholder="选择一个分类或资料"
      defaultExpandAll
      allowClear
    />
  );
  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 560, width: "100%" }}>
      {basic}
      <p>当前值：{value ?? "未选择"}。父节点和叶节点均可选择。</p>
    </div>
  );
}
