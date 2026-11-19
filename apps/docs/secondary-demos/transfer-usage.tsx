import * as React from "react";
import { Transfer } from "../../../packages/mtone/src";
const items = Array.from({ length: 12 }, (_, i) => ({
  key: String(i),
  label: `资料 ${i + 1}`,
  description: i === 2 ? "不可移动的示例" : undefined,
  disabled: i === 2,
}));

export default function Demo() {
  const compact = false;
  const [value, setValue] = React.useState(["1", "5"]);
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 680 }}>
      <Transfer
        items={items}
        targetKeys={value}
        onChange={setValue}
        showSearch
        pagination={{ pageSize: 5 }}
        height={compact ? 120 : 180}
      />
    </div>
  );
}
