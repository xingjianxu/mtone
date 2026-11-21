import { useState } from "react";
import { Tabs, Button, type TabItem } from "../../../packages/mtone/src";
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
  const base = [
    { value: "overview", label: "概览", content: "项目内容概览" },
    { value: "history", label: "历史", content: "变更记录" },
    { value: "disabled", label: "未开放", content: "", disabled: true },
  ];
  return (
    <div style={{ display: "grid", gap: 24, minWidth: 0 }}>
      <p>标签项统一高 34px；线型标签默认相邻间距为 6px，文字两侧各留 6px，可用 gap 自定义标签项之间的间距。</p>
      <Tabs items={base} extraEnd={<Button size="sm">操作</Button>} />
    </div>
  );
}
