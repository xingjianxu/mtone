import React, { useState } from "react";
import { Progress } from "../../../packages/mtone/src";

const stack: React.CSSProperties = { display: "grid", gap: 14, minWidth: 0 };

export default function Demo() {
  const [value, setValue] = useState(60);
  return (
    <div style={{ ...stack, gap: 28, width: "100%", maxWidth: 640 }}>
      <div style={stack}>
        <Progress
          value={80}
          success={{ value: 35 }}
          label="处理进度"
          showInfo
          format={(n, successValue) => `${n}% / 已验证 ${successValue}%`}
        />
        <Progress
          type="circle"
          value={75}
          label="存储使用量"
          showInfo
          format={(n) => `${n / 10} GB`}
          aria-valuetext="已使用 7.5 GB，共 10 GB"
        />
      </div>
      <p>
        format
        优先于默认百分比和状态图标。自定义文字只用于视觉显示；含单位或业务含义时，请同时提供
        aria-valuetext。
      </p>
    </div>
  );
}
