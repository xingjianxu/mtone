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
      {(["outlined", "filled", "borderless", "underlined"] as const).map(
        (variant) => (
          <Input
            key={variant}
            variant={variant}
            aria-label={variant}
            placeholder={variant}
          />
        ),
      )}
    </div>
  );
}
