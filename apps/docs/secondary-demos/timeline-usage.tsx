import * as React from "react";
import { Timeline, Button } from "../../../packages/mtone/src";
import { Check } from "lucide-react";

export default function Demo() {
  const [reverse, setReverse] = React.useState(false);
  const items = [
    { title: "09:00", content: "创建项目", color: "green" },
    { title: "10:30", content: "完成代码审查", icon: <Check size={14} /> },
    { title: "现在", content: "正在运行测试", loading: true },
  ];
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <Button onClick={() => setReverse(!reverse)}>切换顺序</Button>
        <Timeline style={{ marginTop: 16 }} reverse={reverse} items={items} />
      </div>
    </div>
  );
}
