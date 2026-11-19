import { useState } from "react";
import {
  Mentions,
  Text,
  getMentions,
  type MentionOption,
} from "../../../packages/mtone/src";
const people: MentionOption[] = [
  { value: "alice", label: "Alice · 产品设计" },
  { value: "bob", label: "Bob · 工程" },
  { value: "carol", label: "Carol · 内容" },
  { value: "archived", label: "已停用成员", disabled: true },
];
const topics: MentionOption[] = [
  { value: "design", label: "设计" },
  { value: "engineering", label: "工程" },
  { value: "release", label: "版本发布" },
];

export default function Demo() {
  const compact = false;
  const [value, setValue] = useState("");
  const [activePrefix, setActivePrefix] = useState("@");
  return (
    <div style={{ display: "grid", gap: 22, width: "100%", maxWidth: 640 }}>
      <Mentions
        aria-label="评论"
        value={value}
        onChange={setValue}
        prefix={["@", "#"]}
        options={activePrefix === "@" ? people : topics}
        onSearch={(_, prefix) => setActivePrefix(prefix)}
        allowClear
        autoSize={{ minRows: 2, maxRows: 5 }}
        placeholder="输入 @ 提及成员，输入 # 关联主题"
      />
      <Text muted>
        ↑ ↓ 切换，Enter 选择，Esc 关闭；Tab 正常移动焦点。选项仅以灰色背景高亮。
      </Text>
      {!compact && (
        <Text data-testid="mentions-value">
          当前纯文本：{value || "（空）"} · 检测到{" "}
          {getMentions(value, { prefix: ["@", "#"] }).length} 个提及
        </Text>
      )}
    </div>
  );
}
