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
        <Progress value={60} size="small" label="细线进度" />
        <Progress value={60} size={10} strokeLinecap="butt" label="平直端点" />
        <div style={row}>
          <Progress
            type="circle"
            value={60}
            size="small"
            label="小圆环"
            showInfo
          />
          <Progress
            type="circle"
            value={60}
            size={80}
            strokeWidth={10}
            label="自定义圆环"
            showInfo
          />
          <Progress
            type="dashboard"
            value={60}
            size={80}
            strokeLinecap="square"
            label="方形端点"
            showInfo
          />
        </div>
      </div>
      <p>
        数字 size
        在线性条中表示高度（px），在圆形和仪表盘中表示直径（px）。圆环的
        strokeWidth 以 100×100 画布为单位，与直径成比例。
      </p>
    </div>
  );
}
