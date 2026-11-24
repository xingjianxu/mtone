import React from "react";
import { Tabs, type TabsSize } from "../../../packages/mtone/src";

const sizes: readonly [TabsSize, number][] = [["sm", 28], ["md", 32], ["lg", 36]];
const items = [
  { value: "first", label: "概览", content: "项目概览" },
  { value: "second", label: "活动", content: "最近活动" },
];

export default function Demo() {
  return <div style={{ display: "grid", gap: 14 }}>
    {sizes.map(([size, height]) => <div key={size}>
      <div style={{ color: "var(--mt-muted)", fontSize: 12 }}>{size} · {height}px</div>
      <Tabs size={size} label={`标签高度 ${height}px`} items={items} />
    </div>)}
  </div>;
}
