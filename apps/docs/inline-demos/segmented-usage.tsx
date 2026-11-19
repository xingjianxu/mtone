import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";

const options = [
  { value: "design", label: "产品设计" },
  { value: "research", label: "研究笔记" },
  { value: "engineering", label: "技术文档" },
];
const stackStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  width: "100%",
  maxWidth: 460,
};
export default function Demo() {
  const [value, setValue] = useState<string | null>("design");

  return (
    <div style={stackStyle}>
      <M.Segmented
        label="视图模式"
        options={[
          { value: "design", label: "列表" },
          { value: "research", label: "卡片" },
        ]}
        value={value ?? "design"}
        onValueChange={setValue}
      />
      <M.Text muted>
        {value === "design" ? "当前列表视图" : "当前卡片视图"}
      </M.Text>
    </div>
  );
}
