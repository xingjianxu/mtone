import React from "react";
import { Plus } from "lucide-react";
import { Button, Text } from "../../../packages/mtone/src";

export default function Demo() {
  const [checked, setChecked] = React.useState(true);
  const [count, setCount] = React.useState(0);
  const addLabel = React.useId();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        alignItems: "center",
      }}
    >
      <Button
        iconOnly
        aria-label="收藏文档"
        toggle={{ mode: "icon", preset: "star" }}
        pressed={checked}
        onPressedChange={setChecked}
      />
      <Text muted>{checked ? "已收藏" : "未收藏"}</Text>
      <Button
        iconOnly
        aria-labelledby={addLabel}
        onClick={() => setCount(count + 1)}
      >
        <Plus size={16} aria-hidden="true" />
      </Button>
      <span id={addLabel}>添加文档</span>
      <Text muted role="status">
        已添加 {count} 个
      </Text>
    </div>
  );
}
