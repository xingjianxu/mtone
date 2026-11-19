import React from "react";
import { Input, Text, Button } from "../../../packages/mtone/src";

export default function Demo() {
  const [code, setCode] = React.useState("");
  return (
    <div style={{ display: "grid", justifyItems: "start", gap: 8 }}>
      <Input.OTP
        aria-label="演示验证码"
        value={code}
        onValueChange={setCode}
        length={6}
      />
      <Text muted>已输入 {Array.from(code).length} / 6 位</Text>
      <Button onClick={() => setCode("")}>清空验证码</Button>
    </div>
  );
}
