import React, { useState } from "react";
import { Progress } from "../../../packages/mtone/src";

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
      <div style={row}>
        <Progress type="circle" value={68} label="项目完成度" showInfo />
        <Progress
          type="circle"
          value={100}
          label="任务完成"
          status="success"
          showInfo
        />
        <Progress
          type="circle"
          value={45}
          label="任务失败"
          status="exception"
          showInfo
        />
      </div>
    </div>
  );
}
