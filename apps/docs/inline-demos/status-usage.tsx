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
      <M.Status>未开始</M.Status>
      <M.Status tone="orange">进行中</M.Status>
      <M.Status tone="green">已完成</M.Status>
    </div>
  );
}
