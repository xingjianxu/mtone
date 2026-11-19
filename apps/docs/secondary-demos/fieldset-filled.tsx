import React from "react";
import { Fieldset, Checkbox } from "../../../packages/mtone/src";
const stack: React.CSSProperties = { display: "grid", gap: 10 };

export default function Demo() {
  return (
    <div style={{ ...stack, gap: 20, width: "100%", maxWidth: 480 }}>
      <Fieldset legend="通知设置" variant="filled" radius={8}>
        <Checkbox label="接收项目更新" defaultChecked />
      </Fieldset>
    </div>
  );
}
