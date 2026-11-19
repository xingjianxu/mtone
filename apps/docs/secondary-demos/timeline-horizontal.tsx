import { Timeline } from "../../../packages/mtone/src";
import { Check } from "lucide-react";

export default function Demo() {
  const items = [
    { title: "09:00", content: "创建项目", color: "green" },
    { title: "10:30", content: "完成代码审查", icon: <Check size={14} /> },
    { title: "现在", content: "正在运行测试", loading: true },
  ];
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <Timeline orientation="horizontal" mode="alternate" items={items} />
    </div>
  );
}
