import React from "react";
import { UserRound } from "lucide-react";
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
        <Avatar name="林" />
        <Avatar name="Alex" size="md" />
        <Avatar icon={<UserRound size={20} />} size="lg" />
        <Avatar name="方" shape="square" size={40} />
      </div>
    </div>
  );
}
