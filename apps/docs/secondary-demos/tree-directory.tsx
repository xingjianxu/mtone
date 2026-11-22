import { Tree, type TreeItem } from "../../../packages/mtone/src";

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
  return (
    <div style={{ display: "grid", gap: 24, width: "100%", minWidth: 0 }}>
      <Tree directory
        label="目录选择"
        items={documents}
        multiple
        defaultExpandedKeys={["root"]}
        expandAction="doubleClick"
      />
      <p>双击目录展开；Ctrl / Command 点击追加选择，Shift 点击选择可见区间。</p>
    </div>
  );
}
