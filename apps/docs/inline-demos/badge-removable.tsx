import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";

const rowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
};
export default function Demo() {
  const [visible, setVisible] = useState(true);

  return (
    <div style={rowStyle}>
      {visible ? (
        <M.Badge onRemove={() => setVisible(false)}>可移除</M.Badge>
      ) : (
        <M.Button onClick={() => setVisible(true)}>恢复标签</M.Button>
      )}
    </div>
  );
}
