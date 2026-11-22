import { useState, type CSSProperties } from "react";
import { LayoutGrid, List, Table2 } from "lucide-react";
import { RadioGroup, Text } from "../../../packages/mtone/src";

const layouts = [
  { value: "list", label: "列表", Icon: List },
  { value: "card", label: "卡片", Icon: LayoutGrid },
  { value: "table", label: "表格", Icon: Table2 },
];
const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
  border: 0,
};

export default function Demo() {
  const [value, setValue] = useState("list");
  return (
    <div style={{ display: "grid", justifyItems: "start", gap: 12 }}>
      <RadioGroup
        variant="segmented"
        label="显示布局"
        options={layouts.map(({ value, label, Icon }) => ({
          value,
          label: (
            <>
              <Icon size={16} aria-hidden="true" />
              <span style={visuallyHidden}>{label}</span>
            </>
          ),
        }))}
        value={value}
        onValueChange={setValue}
      />
      <Text muted role="status">
        当前布局：{layouts.find((layout) => layout.value === value)?.label}
      </Text>
    </div>
  );
}
