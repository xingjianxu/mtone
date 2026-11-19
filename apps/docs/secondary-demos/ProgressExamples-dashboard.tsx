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
        <Progress type="dashboard" value={75} label="容量" showInfo />
        <Progress
          type="dashboard"
          value={75}
          label="右侧缺口"
          gapDegree={120}
          gapPosition="right"
          showInfo
        />
        <Progress
          type="dashboard"
          value={75}
          label="顶部缺口"
          gapDegree={90}
          gapPosition="top"
          showInfo
        />
      </div>
      <p>
        默认底部保留 75° 缺口，可设为 top、bottom、left 或 right。gapDegree=0
        显示完整圆环。
      </p>
    </div>
  );
}
