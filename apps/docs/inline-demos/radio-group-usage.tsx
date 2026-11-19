import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";

const options = [
  { value: "design", label: "产品设计" },
  { value: "research", label: "研究笔记" },
  { value: "engineering", label: "技术文档" },
];
export default function Demo() {
  const [value, setValue] = useState<string | null>("design");

  return (
    <M.RadioGroup
      label="文档分类"
      options={options}
      value={value ?? "design"}
      onValueChange={setValue}
    />
  );
}
