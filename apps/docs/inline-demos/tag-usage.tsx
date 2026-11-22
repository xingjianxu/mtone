import React from "react";
import * as M from "../../../packages/mtone/src";

const rowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
};
export default function Demo() {
  return (
    <div style={rowStyle}>
      {(["neutral", "blue", "green", "orange", "red", "purple"] as const).map(
        (tone) => (
          <M.Tag key={tone} tone={tone}>
            {tone}
          </M.Tag>
        ),
      )}
    </div>
  );
}
