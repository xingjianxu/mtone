import { useState } from "react";
import { Tabs, type TabItem } from "../../../packages/mtone/src";
import { FileText, Settings } from "lucide-react";

export default function Demo() {
  const [items, setItems] = useState<TabItem[]>([
    {
      value: "notes",
      label: "笔记",
      icon: <FileText />,
      content: <input className="mt-input" placeholder="切换后保留输入" />,
    },
    {
      value: "settings",
      label: "设置",
      icon: <Settings />,
      content: "设置面板",
    },
    { value: "locked", label: "只读", content: "不可关闭", closable: false },
  ]);
  const [value, setValue] = useState("notes");
  return (
    <div style={{ display: "grid", gap: 24, minWidth: 0 }}>
      <Tabs
        items={Array.from({ length: 16 }, (_, n) => ({
          value: String(n),
          label: `文档 ${n + 1}`,
          content: `第 ${n + 1} 个文档`,
        }))}
      />
    </div>
  );
}
