import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button, Menu, Text } from "../../../packages/mtone/src";

const items = [
  { key: "pdf", label: "导出 PDF" },
  { key: "markdown", label: "导出 Markdown" },
];

export default function Demo() {
  const [choice, setChoice] = useState("");
  const select = (name: string) => (key: string) =>
    setChoice(`${name}：${key}`);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Menu
        trigger="默认文字触发"
        items={items}
        onSelect={select("默认文字")}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Menu
          trigger={
            <Button variant="soft" preset="dropdown">
              预设按钮触发
            </Button>
          }
          items={items}
          onSelect={select("预设按钮")}
        />
        <Menu
          trigger={
            <Button
              variant="ghost"
              rightSection={<ChevronDown size={16} aria-hidden="true" />}
            >
              自定义元素触发
            </Button>
          }
          items={items}
          onSelect={select("自定义元素")}
        />
      </div>
      <Text muted role="status">
        {choice || "选择一项查看结果，不会真正导出文件。"}
      </Text>
    </div>
  );
}
