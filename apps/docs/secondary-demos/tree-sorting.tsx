import * as React from "react";
import { Tree, type TreeItem } from "../../../packages/mtone/src";

export default function Demo() {
  const [dragItems, setDragItems] = React.useState<TreeItem[]>([
    { id: "draft", label: "草稿" },
    { id: "review", label: "评审" },
    { id: "done", label: "完成" },
  ]);
  const [dropMessage, setDropMessage] =
    React.useState("拖到条目前后可调整顺序。");
  return (
    <div style={{ display: "grid", gap: 24, width: "100%", minWidth: 0 }}>
      <Tree
        label="拖动调整流程"
        items={dragItems}
        draggable
        allowDrop={({ dropPosition }) => dropPosition !== 0}
        onDrop={({ dragNode, node, dropPosition }) => {
          setDragItems((current) => {
            const moving = current.find((item) => item.id === dragNode.id);
            if (!moving) return current;
            const next = current.filter((item) => item.id !== dragNode.id);
            const at = next.findIndex((item) => item.id === node.id);
            if (at < 0) return current;
            next.splice(at + (dropPosition === 1 ? 1 : 0), 0, moving);
            return next;
          });
          setDropMessage(
            `已将“${dragNode.label}”移到“${node.label}”${dropPosition === -1 ? "前" : "后"}。`,
          );
        }}
      />
      <p aria-live="polite">{dropMessage}</p>
      <p>此例由 onDrop 更新 items；Tree 只报告拖放意图，不修改传入数据。</p>
    </div>
  );
}
