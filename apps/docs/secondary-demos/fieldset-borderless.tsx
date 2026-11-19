import React from "react";
import { Fieldset, Input } from "../../../packages/mtone/src";
const stack: React.CSSProperties = { display: "grid", gap: 10 };

export default function Demo() {
  return (
    <div style={{ ...stack, gap: 20, width: "100%", maxWidth: 480 }}>
      <Fieldset legend="附加信息" variant="unstyled">
        <Input aria-label="备注" placeholder="添加备注" />
      </Fieldset>
    </div>
  );
}
