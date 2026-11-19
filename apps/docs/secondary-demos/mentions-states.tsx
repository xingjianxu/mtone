import { useState } from "react";
import { Mentions, type MentionOption } from "../../../packages/mtone/src";
const people: MentionOption[] = [
  { value: "alice", label: "Alice · 产品设计" },
  { value: "bob", label: "Bob · 工程" },
  { value: "carol", label: "Carol · 内容" },
  { value: "archived", label: "已停用成员", disabled: true },
];

export default function Demo() {
  const [value, setValue] = useState("");
  return (
    <div style={{ display: "grid", gap: 22, width: "100%", maxWidth: 640 }}>
      <Mentions
        aria-label="小尺寸"
        size="sm"
        rows={2}
        options={people}
        placeholder="小尺寸：输入 @"
      />
      <Mentions
        aria-label="错误状态"
        status="error"
        rows={2}
        options={people}
        placeholder="错误状态"
      />
      <Mentions
        aria-label="大尺寸警告状态"
        size="lg"
        status="warning"
        autoSize={{ minRows: 2, maxRows: 4 }}
        options={people}
        placeholder="大尺寸警告状态；随输入增长至四行后滚动"
      />
    </div>
  );
}
