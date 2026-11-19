import React, { useState } from "react";
import { Progress } from "../../../packages/mtone/src";

const stack: React.CSSProperties = { display: "grid", gap: 14, minWidth: 0 };

export default function Demo() {
  const [value, setValue] = useState(60);
  return (
    <div style={{ ...stack, gap: 28, width: "100%", maxWidth: 640 }}>
      <div style={stack}>
        <Progress value={68} label="上传进度（无文字）" />
        <Progress value={68} label="上传进度" showInfo />
      </div>
      <p>
        默认保留 mtone 的 5px 细进度条，不显示文字。showInfo
        开启百分比或状态图标。
      </p>
    </div>
  );
}
