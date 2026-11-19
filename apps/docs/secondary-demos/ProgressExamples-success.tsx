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
          label="已处理 80%，已验证 35%"
          showInfo
        />
        <Progress
          type="circle"
          value={80}
          success={{ value: 35 }}
          label="已处理 80%，已验证 35%"
          showInfo
        />
      </div>
      <p>
        success.value
        表示总量中的已成功百分比，不是当前进度的百分比；显示值不会超过 value。
      </p>
    </div>
  );
}
