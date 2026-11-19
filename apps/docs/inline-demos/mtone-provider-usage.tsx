import React from "react";
import * as M from "../../../packages/mtone/src";

const options = [
  { value: "design", label: "产品设计" },
  { value: "research", label: "研究笔记" },
  { value: "engineering", label: "技术文档" },
];
const rowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
};
const stackStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  width: "100%",
  maxWidth: 460,
};
export default function Demo() {

  return (
    <div style={stackStyle}>
      <M.MtoneProvider
        locale="en"
        density="comfortable"
        tokens={{ "--mt-primary": "#436653" }}
      >
        <div style={rowStyle}>
          <M.Button variant="solid">Save changes</M.Button>
          <M.Select label="Category" options={options} />
          <M.Empty />
        </div>
      </M.MtoneProvider>
      <M.Text muted>局部使用英文、舒适密度和自定义主题。</M.Text>
    </div>
  );
}
