import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button, Popover, Text, type MenuItem } from "../../../packages/mtone/src";

const items: MenuItem[] = [
  { key: "open", label: "打开文档" },
  {
    key: "export",
    label: "导出",
    children: [
      { key: "pdf", label: "PDF" },
      { key: "markdown", label: "Markdown" },
    ],
  },
];

export default function Demo() {
  const [selected, setSelected] = useState("");

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Popover.Menu
          trigger={
            <Button rightSection={<ChevronDown size={14} />}>点击打开</Button>
          }
          items={items}
          onSelect={(key) => setSelected(`点击菜单：${key}`)}
        />
        <Popover.Menu
          triggerMode="hover"
          trigger={
            <Button rightSection={<ChevronDown size={14} />}>悬停打开</Button>
          }
          items={items}
          onSelect={(key) => setSelected(`悬停菜单：${key}`)}
        />
      </div>
      <Text muted role="status">
        {selected || "操作结果仅显示在此示例中。"}
      </Text>
    </div>
  );
}
