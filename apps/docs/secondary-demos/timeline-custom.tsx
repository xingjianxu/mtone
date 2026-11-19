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
      <Timeline
        titleSpan="25%"
        pending="等待下一步"
        items={[
          { title: "2026-11-17", content: "记录时间和操作结果" },
          { content: "没有标题也保持对齐" },
        ]}
      />
    </div>
  );
}
