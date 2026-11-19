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
    <div style={stackStyle}>
      <M.Checkbox label="不可用" disabled />
    </div>
  );
}
