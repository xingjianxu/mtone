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
        aria-label="加载示例"
        loading
        placeholder="远程搜索加载状态"
      />
      <AutoComplete
        aria-label="错误示例"
        status="error"
        defaultValue="请检查输入"
      />
      <AutoComplete aria-label="只读示例" readOnly defaultValue="只读文本" />
    </div>
  );
}
