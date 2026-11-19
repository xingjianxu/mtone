import * as React from "react";
import {
  Button,
  Tree,
  type TreeItem,
  type TreeKey,
} from "../../../packages/mtone/src";

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
  const [checked, setChecked] = React.useState<TreeKey[]>(["color"]);
  const [strict, setStrict] = React.useState(false);
  return (
    <div style={{ display: "grid", gap: 24, width: "100%", minWidth: 0 }}>
      <Button
        onClick={() => {
          setStrict(!strict);
          setChecked([]);
        }}
      >
        切换为{strict ? "级联" : "独立"}勾选
      </Button>
      <Tree
        style={{ marginTop: 8 }}
        label="勾选资料"
        items={documents}
        defaultExpandAll
        checkable
        checkStrictly={strict}
        checkedKeys={checked}
        onCheck={(keys) =>
          setChecked(Array.isArray(keys) ? keys : keys.checked)
        }
      />
      <p>
        {strict
          ? "父子节点分别勾选。"
          : "父子节点自动关联，部分选中时显示半选。"}
        已勾选：{checked.join("、") || "无"}。
      </p>
    </div>
  );
}
