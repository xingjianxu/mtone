import { useState } from "react";

import { Typography } from "../../../packages/mtone/src";

export default function Demo() {
  const [text, setText] = useState("点击铅笔，记录下一步工作。");
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <div
      style={{
        display: "grid",
        gap: 28,
        minWidth: 0,
        width: "100%",
        maxWidth: 640,
      }}
    >
      <Typography.Paragraph
        copyable={{
          onCopy: () => setMessage("已复制到剪贴板"),
          onError: () => setMessage("无法访问剪贴板，请手动选择文字复制。"),
        }}
      >
        团队空间 / 产品设计 / 发布计划
      </Typography.Paragraph>
      <Typography.Paragraph
        editable={{
          text,
          editing,
          onEditingChange: setEditing,
          onChange: setText,
          maxLength: 100,
        }}
      >
        {text}
      </Typography.Paragraph>
      <p>
        Enter 保存，Shift + Enter 换行，Escape
        取消；失去焦点保存。这里只更新当前页面，不发送到服务器。
      </p>
      <div role="status" style={{ minHeight: 24 }}>
        {message}
      </div>
    </div>
  );
}
