import * as React from "react";
import { Timeline, Button } from "../../packages/mtone/src";
import { Check } from "lucide-react";
export function TimelineExample({ compact = false }: { compact?: boolean }) {
  const [reverse, setReverse] = React.useState(false);
  const items = [
    { title: "09:00", content: "创建项目", color: "green" },
    { title: "10:30", content: "完成代码审查", icon: <Check size={14} /> },
    { title: "现在", content: "正在运行测试", loading: true },
  ];
  if (compact) return <Timeline items={items} />;
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <Button onClick={() => setReverse(!reverse)}>切换顺序</Button>
        <Timeline style={{ marginTop: 16 }} reverse={reverse} items={items} />
      </div>
      <div>
        <h3>交替排列</h3>
        <Timeline mode="alternate" items={items} />
      </div>
      <div>
        <h3>末端排列与实心节点</h3>
        <Timeline mode="end" variant="filled" items={items} />
      </div>
      <div style={{ minWidth: 0 }}>
        <h3>水平时间线</h3>
        <Timeline orientation="horizontal" mode="alternate" items={items} />
      </div>
      <div>
        <h3>自定义标题宽度与待办节点</h3>
        <Timeline
          titleSpan="25%"
          pending="等待下一步"
          items={[
            { title: "2026-11-17", content: "记录时间和操作结果" },
            { content: "没有标题也保持对齐" },
          ]}
        />
      </div>
    </div>
  );
}
