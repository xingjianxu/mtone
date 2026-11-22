import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";

const stackStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  width: "100%",
  maxWidth: 460,
};
export default function Demo() {
  const [value, setValue] = useState("list");

  return (
    <div style={stackStyle}>
      <M.RadioGroup
        variant="segmented"
        label="视图模式"
        options={[
          { value: "list", label: "列表" },
          { value: "card", label: "卡片" },
        ]}
        value={value}
        onValueChange={setValue}
      />
      <M.Text muted>
        {value === "list" ? "当前列表视图" : "当前卡片视图"}
      </M.Text>
    </div>
  );
}
