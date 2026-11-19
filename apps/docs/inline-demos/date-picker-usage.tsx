import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";

const stackStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  width: "100%",
  maxWidth: 460,
};
export default function Demo() {
  const [date, setDate] = useState("2026-11-15");

  return (
    <div style={stackStyle}>
      <M.DatePicker
        label="截止日期"
        value={date}
        onValueChange={setDate}
        clearable
      />
      <M.Text muted>日历由浏览器提供，当前值：{date || "未选择"}</M.Text>
    </div>
  );
}
