import React from "react";
import { Fieldset, FormField, Input } from "../../../packages/mtone/src";
const stack: React.CSSProperties = { display: "grid", gap: 10 };

export default function Demo() {
  return (
    <div style={{ ...stack, gap: 20, width: "100%", maxWidth: 480 }}>
      <Fieldset legend="个人信息">
        <div style={stack}>
          <FormField label="姓名">
            <Input placeholder="请输入姓名" />
          </FormField>
          <FormField label="邮箱">
            <Input type="email" placeholder="name@example.com" />
          </FormField>
        </div>
      </Fieldset>
    </div>
  );
}
