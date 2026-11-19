import * as React from "react";
import { Input, Tree, type TreeItem } from "../../../packages/mtone/src";

const documents: TreeItem[] = [
  {
    id: "root",
    label: "知识库",
    children: [
      {
        id: "design",
        label: "设计规范",
        children: [
          { id: "color", label: "色彩系统" },
          { id: "type", label: "字体规范" },
        ],
      },
      { id: "research", label: "研究笔记" },
      { id: "locked", label: "归档资料（禁用）", disabled: true },
    ],
  },
];

export default function Demo() {
  const [query, setQuery] = React.useState("");
  return (
    <div style={{ display: "grid", gap: 24, width: "100%", minWidth: 0 }}>
      <Input
        aria-label="搜索树节点"
        placeholder="输入“设计”或“字体”"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <Tree
        label="搜索结果高亮"
        style={{ marginTop: 8 }}
        items={documents}
        defaultExpandAll
        filterTreeNode={(node) =>
          !!query.trim() && String(node.label).includes(query.trim())
        }
      />
      <p>高亮只标记命中节点，不过滤数据；需要过滤时由应用生成新的 items。</p>
    </div>
  );
}
