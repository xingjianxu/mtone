import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";

const stackStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  width: "100%",
  maxWidth: 460,
};
export default function Demo() {
  const [checked, setChecked] = useState(true);

  return (
    <div style={stackStyle}>
      <M.Checkbox
        label="接收更新提醒"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <M.Text muted>{checked ? "提醒已开启" : "提醒已关闭"}</M.Text>
    </div>
  );
}
