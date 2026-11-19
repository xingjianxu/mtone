import { useState } from "react";
import { AutoComplete } from "../../../packages/mtone/src";

export default function Demo() {
  const [value, setValue] = useState("");
  const options = [
    {
      label: "文档",
      options: [
        { value: "getting-started", label: "快速开始" },
        { value: "components", label: "组件列表" },
      ],
    },
    {
      label: "支持",
      options: [
        { value: "github", label: "GitHub" },
        { value: "unavailable", label: "暂不可用", disabled: true },
      ],
    },
  ];
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 480 }}>
      <AutoComplete
        aria-label="搜索文档"
        placeholder="输入文档关键词或任意文本"
        options={options}
        value={value}
        onChange={setValue}
        allowClear
      />
      <small>当前输入：{value || "（空）"}</small>
    </div>
  );
}
