import * as React from "react";
import {
  Button,
  Tree,
  type TreeItem,
  type TreeRef,
} from "../../../packages/mtone/src";

const many: TreeItem[] = Array.from({ length: 1000 }, (_, i) => ({
  id: `doc-${i}`,
  label: `文档 ${String(i + 1).padStart(4, "0")}`,
}));

export default function Demo() {
  const treeRef = React.useRef<TreeRef>(null);
  return (
    <div style={{ display: "grid", gap: 24, width: "100%", minWidth: 0 }}>
      <Button
        onClick={() =>
          treeRef.current?.scrollTo({ key: "doc-899", align: "top" })
        }
      >
        定位第 900 条
      </Button>
      <Tree
        ref={treeRef}
        label="一千条文档"
        items={many}
        height={180}
        itemHeight={30}
        style={{
          marginTop: 8,
          border: "1px solid var(--mt-border, #e5e5e3)",
          borderRadius: 6,
        }}
      />
      <p>使用固定行高。方向键及 Home / End 可跨虚拟窗口移动。</p>
    </div>
  );
}
