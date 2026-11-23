import * as React from "react";
import { Checkbox, Tree, type TreeItem, type TreeKey } from "../../../packages/mtone/src";
import { FileText, Folder } from "lucide-react";

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
  const [selected, setSelected] = React.useState<TreeKey[]>(["research"]);
  const [dense, setDense] = React.useState(false);
  return (
    <div style={{ display: "grid", gap: 24, width: "100%", minWidth: 0 }}>
      <Checkbox label="取消默认 2px 行间距" checked={dense} onCheckedChange={setDense} />
      <Tree
        label="多选知识库"
        items={documents}
        defaultExpandAll
        multiple
        selectedKeys={selected}
        onSelect={setSelected}
        gap={dense ? 0 : undefined}
        showLine
        showIcon
        icon={({ node }) =>
          node.children ? <Folder size={15} /> : <FileText size={15} />
        }
      />
      <p>
        已选：{selected.join("、") || "无"}。普通 Tree 多选时点击切换选中状态。
      </p>
    </div>
  );
}
