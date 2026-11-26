import { useState } from "react";
import { Button, FloatingWindow, Status, Text } from "../../../packages/mtone/src";

export default function Demo() {
  const [remaining, setRemaining] = useState(3);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      <FloatingWindow
        storageKey="docs:floating-window:geometry"
        title="任务速记"
        initialSize={{ width: 360, height: 235 }}
        minWidth={240}
        minHeight={156}
        minimizable={false}
        trigger={<Button variant="solid">打开任务窗口</Button>}
      >
        <div style={{ display: "grid", gap: 8 }}>
          <Status tone="blue">本周待办</Status>
          <Text>整理接口说明、核对发布清单并更新示例。</Text>
        </div>
      </FloatingWindow>
      <Button onClick={() => setRemaining((count) => count + 1)}>添加待办</Button>
      <Text muted role="status">待办 {remaining} 项</Text>
    </div>
  );
}
