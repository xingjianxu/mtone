import React, { useState } from "react";
import { Progress } from "../../../packages/mtone/src";

const stack: React.CSSProperties = { display: "grid", gap: 14, minWidth: 0 };

export default function Demo() {
  const [value, setValue] = useState(60);
  return (
    <div style={{ ...stack, gap: 28, width: "100%", maxWidth: 640 }}>
      <div style={stack}>
        <Progress
          value={70}
          color="#5378aa"
          trackColor="#eef2f7"
          label="自定义颜色"
          showInfo
        />
        <Progress
          value={70}
          color={{ from: "#7d9c84", to: "#5378aa" }}
          label="渐变线条"
          showInfo
        />
        <Progress
          type="circle"
          value={70}
          color={{ from: "#7d9c84", to: "#5378aa" }}
          label="渐变圆环"
          showInfo
        />
      </div>
      <p>渐变从左到右；圆环使用画布方向的线性渐变，不是沿圆周的锥形渐变。</p>
    </div>
  );
}
