import React from "react";
import { Select } from "../../../packages/mtone/src";

const options = [
  { value: "design", label: "产品设计" },
  { value: "research", label: "研究笔记", disabled: true },
  { value: "engineering", label: "技术文档" },
];

export default function Demo() {
  return <Select label="文档分类" options={options} placeholder="选择分类" />;
}
