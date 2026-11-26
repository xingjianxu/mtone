import * as React from "react";
import {
  Switch,
  Tree,
  moveTreeItem,
  type TreeItem,
  type TreeKey,
} from "../../../packages/mtone/src";

const sample: TreeItem[] = [
  { id: "draft", label: "草稿" },
  {
    id: "review",
    label: "评审",
    children: [
      { id: "design", label: "设计评审" },
      { id: "code", label: "代码评审" },
    ],
  },
  { id: "done", label: "完成" },
];

export default function Demo() {
  const [items, setItems] = React.useState(sample);
  const [allowReparent, setAllowReparent] = React.useState(false);
  const [expandedKeys, setExpandedKeys] = React.useState<TreeKey[]>([]);
  return (
    <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
      <Switch
        label="允许跨层拖动"
        checked={allowReparent}
        onCheckedChange={setAllowReparent}
      />
      <Tree
        label="拖动调整流程"
        items={items}
        draggable
        allowReparent={allowReparent}
        expandedKeys={expandedKeys}
        onExpand={setExpandedKeys}
        onDrop={(info) => {
          setItems((current) => moveTreeItem(current, info));
          if (info.dropPosition === 0)
            setExpandedKeys((current) => [
              ...new Set([...current, info.node.id]),
            ]);
        }}
      />
      <p>
        {allowReparent
          ? "拖到行的边缘可插入前后；拖到行的中间可移入节点。"
          : "拖到同组节点的上半部或下半部可调整顺序。"}
      </p>
    </div>
  );
}
