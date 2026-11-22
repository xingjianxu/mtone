import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";

const options = [
  { value: "design", label: "产品设计" },
  { value: "research", label: "研究笔记" },
  { value: "archived", label: "已归档", disabled: true },
];

export default function Demo() {
  const [tags, setTags] = useState<string[]>(["design"]);

  return (
    <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 460 }}>
      <M.Select mode="tags" label="主题标签" clearable
        placeholder="输入标签，例如「会议纪要」"
        options={options} value={tags} onValueChange={setTags} />
      <M.Text muted>已选 {tags.length} 项</M.Text>
    </div>
  );
}
