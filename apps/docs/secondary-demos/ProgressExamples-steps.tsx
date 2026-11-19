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
      <div style={stack}>
        <Progress value={60} steps={10} size={8} label="六步已完成" showInfo />
        <div style={row}>
          <Progress
            type="circle"
            value={60}
            steps={{ count: 10, gap: 3 }}
            strokeLinecap="butt"
            label="圆环步骤"
            showInfo
          />
          <Progress
            type="dashboard"
            value={60}
            steps={10}
            success={{ value: 30 }}
            strokeLinecap="butt"
            label="仪表盘步骤"
            showInfo
          />
        </div>
      </div>
      <p>
        按最接近的完整步骤显示。gap 单位为 px，默认
        2；圆环会按直径换算。圆环步骤过密时自动使用 butt 端点，避免端帽重叠。
      </p>
    </div>
  );
}
