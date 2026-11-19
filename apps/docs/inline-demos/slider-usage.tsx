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
      <M.Slider
        label="完成进度"
        min={0}
        max={100}
        step={5}
        value={number ?? 0}
        onValueChange={setNumber}
      />
      <M.Text muted>{number}%</M.Text>
    </div>
  );
}
