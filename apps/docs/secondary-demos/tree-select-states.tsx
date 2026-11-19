import { TreeSelect, type TreeItem } from "../../../packages/mtone/src";

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
  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 560, width: "100%" }}>
      <div style={{ display: "grid", gap: 8 }}>
        <TreeSelect
          items={items}
          aria-label="禁用树选择"
          disabled
          defaultValue="colors"
        />
        <TreeSelect
          items={items}
          aria-label="只读树选择"
          readOnly
          defaultValue="notes"
        />
        <TreeSelect
          items={items}
          aria-label="错误状态树选择"
          status="error"
          placeholder="请选择资料"
        />
        <TreeSelect
          items={items}
          aria-label="小尺寸树选择"
          size="sm"
          placeholder="小尺寸"
        />
      </div>
    </div>
  );
}
