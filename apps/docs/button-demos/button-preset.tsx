import React, { useState } from "react";
import { Button, Text } from "../../../packages/mtone/src";

export default function Demo() {
  const [count, setCount] = useState(0);
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
      }}
    >
      <Button preset="dropdown" onClick={() => setCount((value) => value + 1)}>
        筛选方式
      </Button>
      <Text muted role="status">
        普通点击次数：{count}
      </Text>
    </div>
  );
}
