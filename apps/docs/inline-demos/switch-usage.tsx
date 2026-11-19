import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";

const rowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
};
export default function Demo() {
  const [checked, setChecked] = useState(true);

  return (
    <div style={rowStyle}>
      <M.Switch
        label="自动保存（演示）"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <M.Text muted>{checked ? "已开启" : "已关闭"}</M.Text>
    </div>
  );
}
