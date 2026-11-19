import { useEffect, useRef, useState } from "react";
import {
  Mentions,
  Text,
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

/** Simulates an endpoint locally; no request or message leaves this page. */
function AsyncMentionsExample() {
  const [value, setValue] = useState("");
  const [options, setOptions] = useState<MentionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cancel = () => {
    generation.current += 1;
    clearTimeout(timer.current);
    setLoading(false);
  };
  useEffect(
    () => () => {
      generation.current += 1;
      clearTimeout(timer.current);
    },
    [],
  );
  return (
    <Mentions
      aria-label="异步搜索"
      value={value}
      options={options}
      loading={loading}
      filterOption={false}
      prefix={["@", "#"]}
      placeholder="输入 @al 或 #de，本地模拟延迟 400ms"
      onChange={(next) => {
        cancel();
        setValue(next);
        setOptions([]);
      }}
      onBlur={cancel}
      onSearch={(query, prefix) => {
        cancel();
        const current = generation.current;
        setLoading(true);
        timer.current = setTimeout(() => {
          if (current !== generation.current) return;
          setOptions(
            (prefix === "@" ? people : topics).filter((option) =>
              option.value.includes(query.toLowerCase()),
            ),
          );
          setLoading(false);
        }, 400);
      }}
    />
  );
}

export default function Demo() {
  const [value, setValue] = useState("");
  return (
    <div style={{ display: "grid", gap: 22, width: "100%", maxWidth: 640 }}>
      <AsyncMentionsExample />
      <Text muted>
        此处只模拟查询，不访问网络。每次编辑、失焦或卸载都会取消旧结果；真实接口也需使用
        AbortController 或请求序号防止过期响应覆盖。
      </Text>
    </div>
  );
}
