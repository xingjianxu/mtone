import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";

const stackStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  width: "100%",
  maxWidth: 460,
};
export default function Demo() {
  const [number, setNumber] = useState<number | null>(40);

  return (
    <div style={stackStyle}>
      <M.NumberInput
        label="每页数量"
        min={1}
        max={100}
        value={number}
        onValueChange={setNumber}
      />
      <M.Text muted>允许 1–100；当前值：{number ?? "空"}</M.Text>
    </div>
  );
}
