import { useState } from "react";
import { Select, Text } from "../../../packages/mtone/src";

const options = [
  { label: "研究资料", options: [
    { value: "paper", label: <strong>论文草稿</strong>, searchText: "论文草稿 paper" },
    { value: "notes", label: "会议纪要" },
  ] },
  { label: "归档资料", options: [
    { value: "archive", label: "已归档项目", disabled: true },
  ] },
];

export default function Demo() {
  const [selected, setSelected] = useState<string | null>("paper");
  return (
    <div style={{ display: "grid", justifyItems: "start", gap: 8 }}>
      <Select label="选择资料" options={options} searchable clearable
        searchPlaceholder="按资料名称搜索" emptyContent="没有找到相关资料"
        value={selected} onValueChange={setSelected} />
      <Text muted>已选：{selected ?? "无"}</Text>
    </div>
  );
}
