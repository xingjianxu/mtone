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
        searchable
        multiple
        aria-label="搜索资料"
        placeholder="搜索并勾选资料"
        allowClear
        showCheckedStrategy="leaf"
      />
      <p>
        搜索保留匹配节点及祖先。筛选期间勾选父级仍按完整数据联动，不会只选择当前可见结果。
      </p>
    </div>
  );
}
