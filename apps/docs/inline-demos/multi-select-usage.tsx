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
  const [multi, setMulti] = useState<string[]>(["design"]);

  return (
    <div style={stackStyle}>
      <M.MultiSelect
        label="文档标签"
        options={options}
        value={multi}
        onValueChange={setMulti}
      />
      <M.Text muted>已选 {multi.length} 项</M.Text>
    </div>
  );
}
