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
  const [multiple, setMultiple] = useState<TreeKey[]>(["colors"]);
  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 560, width: "100%" }}>
      <TreeSelect
        items={items}
        multiple
        checkStrictly
        aria-label="独立选择资料"
        defaultExpandAll
        allowClear
        defaultValue={["design"]}
      />
      <p>父子节点互不影响，适合每个层级都是独立选项的场景。</p>
    </div>
  );
}
