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
        <M.FilterChip onRemove={() => setVisible(false)}>
          分类：设计
        </M.FilterChip>
      ) : (
        <M.Button onClick={() => setVisible(true)}>重新添加筛选</M.Button>
      )}
    </div>
  );
}
