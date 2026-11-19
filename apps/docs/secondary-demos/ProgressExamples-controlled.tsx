import React, { useState } from "react";
import { Button, Progress } from "../../../packages/mtone/src";

const stack: React.CSSProperties = { display: "grid", gap: 14, minWidth: 0 };
const row: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 20,
};

export default function Demo() {
  const [value, setValue] = useState(60);
  return (
    <div style={{ ...stack, gap: 28, width: "100%", maxWidth: 640 }}>
      <div style={stack}>
        <Progress value={value} label="动态线性进度" showInfo />
        <div style={row}>
          <Progress
            type="circle"
            value={value}
            label="动态圆环进度"
            size="small"
            showInfo
          />
          <Button
            disabled={value === 0}
            onClick={() => setValue((n) => Math.max(0, n - 10))}
          >
            减少
          </Button>
          <Button
            disabled={value === 100}
            onClick={() => setValue((n) => Math.min(100, n + 10))}
          >
            增加
          </Button>
          <Button onClick={() => setValue(0)}>重置</Button>
        </div>
      </div>
    </div>
  );
}
