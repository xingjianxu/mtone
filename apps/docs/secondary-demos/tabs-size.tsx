import React, { useState } from "react";
import { Button, ButtonGroup, Tabs, type TabsSize } from "../../../packages/mtone/src";

const sizes: readonly [TabsSize, number][] = [["sm", 28], ["md", 32], ["lg", 36]];
const items = [
  { value: "first", label: "概览", content: "项目概览" },
  { value: "second", label: "活动", content: "最近活动" },
];

export default function Demo() {
  const [size, setSize] = useState<TabsSize>("md");
  return <div style={{ display: "grid", gap: 14, justifyItems: "start" }}>
    <ButtonGroup connected aria-label="标签高度">
      {sizes.map(([preset, height]) => <Button key={preset} size="sm" toggle
        pressed={size === preset} onClick={() => setSize(preset)}>{preset} · {height}px</Button>)}
    </ButtonGroup>
    <Tabs size={size} label="示例标签" items={items} style={{ width: "100%" }} />
  </div>;
}
