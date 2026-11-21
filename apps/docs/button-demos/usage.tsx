import React from "react";
import { Button, Text } from "../../../packages/mtone/src";

export default function Demo() {
  const [notice, setNotice] = React.useState("");
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {(["blue", "solid", "outline", "soft", "ghost"] as const).map(
          (variant) => (
            <Button
              key={variant}
              variant={variant}
              onClick={() => setNotice("点击了 " + variant)}
            >
              {variant}
            </Button>
          ),
        )}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Button size="small">小</Button>
        <Button size="normal">标准</Button>
        <Button size="large">大</Button>
      </div>
      {notice && (
        <Text role="status" muted>
          {notice}
        </Text>
      )}
    </div>
  );
}
