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
  const [multiple, setMultiple] = useState<TreeKey[]>(["colors"]);
  return (
    <div style={{ display: "grid", gap: 20, maxWidth: 560, width: "100%" }}>
      <TreeSelect
        items={items}
        multiple
        value={multiple}
        onValueChange={setMultiple}
        aria-label="多选资料"
        defaultExpandAll
        allowClear
        showCheckedStrategy="parent"
        maxTagCount={3}
      />
      <p>
        选中父节点会勾选其可用后代，禁用节点不参与联动。标签合并展示父级，不改变回调中的全部勾选键。
      </p>
      <small>勾选键：{JSON.stringify(multiple)}</small>
    </div>
  );
}
