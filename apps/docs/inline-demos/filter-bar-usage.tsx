import React from "react";
import * as M from "../../../packages/mtone/src";

const options = [
  { value: "design", label: "产品设计" },
  { value: "research", label: "研究笔记" },
  { value: "engineering", label: "技术文档" },
];
export default function Demo() {

  return (
    <M.FilterBar>
      <M.SearchInput aria-label="按名称筛选" placeholder="筛选名称" />
      <M.Select label="分类筛选" options={options} defaultValue="design" />
    </M.FilterBar>
  );
}
