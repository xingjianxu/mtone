import React from "react";
import { Input } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {(["sm", "md", "lg"] as const).map((controlSize) => (
        <Input
          key={controlSize}
          controlSize={controlSize}
          aria-label={controlSize + "尺寸"}
          placeholder={controlSize + " 尺寸"}
        />
      ))}
    </div>
  );
}
