import React from "react";
import { Input } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <Input.TextArea
      aria-label="备注"
      placeholder="输入多行备注"
      autoSize={{ minRows: 2, maxRows: 5 }}
      showCount
      maxLength={200}
    />
  );
}
