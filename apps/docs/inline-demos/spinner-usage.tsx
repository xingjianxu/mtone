import React from "react";
import * as M from "../../../packages/mtone/src";

const rowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
};
export default function Demo() {
  return (
    <div style={rowStyle}>
      <M.Spinner label="正在加载文档" />
      <M.Text muted>正在加载文档…</M.Text>
    </div>
  );
}
