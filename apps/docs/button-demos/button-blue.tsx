import React from "react";
import { Button, Text } from "../../../packages/mtone/src";

export default function Demo() {
  const [clicked, setClicked] = React.useState(false);
  return (
    <div style={{ display: "grid", justifyItems: "start", gap: 8 }}>
      <Button variant="blue" onClick={() => setClicked(true)}>
        启用两步验证
      </Button>
      {clicked && (
        <Text role="status" muted>
          这是演示，未更改安全设置。
        </Text>
      )}
    </div>
  );
}
