import React from "react";
import { Button, Text } from "../../../packages/mtone/src";

export default function Demo() {
  const [clicked, setClicked] = React.useState(false);
  return (
    <div style={{ display: "grid", justifyItems: "start", gap: 8 }}>
      <Button danger onClick={() => setClicked(true)}>
        删除
      </Button>
      {clicked && (
        <Text role="status" muted>
          这是演示，未删除任何内容。
        </Text>
      )}
    </div>
  );
}
