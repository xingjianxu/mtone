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
      <M.Select
        label="选择知识库"
        options={options}
        value={value}
        onValueChange={setValue}
      />
      <M.Text muted>选中值：{value ?? "无"}</M.Text>
    </div>
  );
}
