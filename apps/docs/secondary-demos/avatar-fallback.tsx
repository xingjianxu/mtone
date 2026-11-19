import React from "react";

import { Avatar } from "../../../packages/mtone/src";
const row: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 12,
};

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={row}>
        <Avatar size={44}>RESEARCH</Avatar>
        <Avatar size={44} gap={8}>
          研究团队
        </Avatar>
        <Avatar src="data:image/png;base64,invalid" name="加载失败" size={44} />
      </div>
    </div>
  );
}
