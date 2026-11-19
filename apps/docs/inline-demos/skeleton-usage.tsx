import React from "react";
import * as M from "../../../packages/mtone/src";

const stackStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  width: "100%",
  maxWidth: 460,
};
export default function Demo() {
  return (
    <div style={stackStyle} aria-label="内容加载占位">
      <M.Skeleton style={{ height: 24, width: "45%" }} />
      <M.Skeleton style={{ height: 14, width: "100%" }} />
      <M.Skeleton style={{ height: 14, width: "75%" }} />
    </div>
  );
}
