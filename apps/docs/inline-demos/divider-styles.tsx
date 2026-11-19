import React from "react";
import * as M from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ width: "100%" }}>
      <M.Divider variant="dashed">虚线标题</M.Divider>
      <M.Divider variant="dotted" titlePlacement="end" plain>
        更多内容
      </M.Divider>
    </div>
  );
}
