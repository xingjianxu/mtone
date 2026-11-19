import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";
import { Star } from "lucide-react";

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
      <M.IconButton
        aria-label="收藏文档"
        aria-pressed={checked}
        variant={checked ? "soft" : "outline"}
        onClick={() => setChecked(!checked)}
      >
        <Star size={16} fill={checked ? "currentColor" : "none"} />
      </M.IconButton>
      <M.Text muted>{checked ? "已收藏" : "未收藏"}</M.Text>
    </div>
  );
}
