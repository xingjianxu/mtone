import React, { useState } from "react";
import { AutoComplete } from "../../packages/mtone/src";
export function AutoCompleteExample({
  compact = false,
}: {
  compact?: boolean;
}) {
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
      {!compact && (
        <>
          <AutoComplete
            aria-label="邮箱"
            placeholder="输入邮箱名以获取建议"
            options={
              value
                ? [
                    { value: `${value}@example.com` },
                    { value: `${value}@mail.com` },
                  ]
                : []
            }
            filterOption={false}
            onSearch={setValue}
          />
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
          <AutoComplete
            aria-label="只读示例"
            readOnly
            defaultValue="只读文本"
          />
        </>
      )}
    </div>
  );
}
