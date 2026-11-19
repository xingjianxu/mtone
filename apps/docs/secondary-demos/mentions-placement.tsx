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
        aria-label="禁用提及"
        disabled
        defaultValue="@alice 当前不可编辑"
      />
      <Mentions
        aria-label="只读提及"
        readOnly
        defaultValue="请 @bob 审阅文档"
      />
      <Mentions
        aria-label="上方候选"
        placement="top"
        options={people}
        allowClear={{ label: "清空上方候选示例" }}
        placeholder="输入 @，优先从光标上方展示候选"
      />
    </div>
  );
}
