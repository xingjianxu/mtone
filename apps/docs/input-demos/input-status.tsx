import React from "react";
import { Input } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <Input status="error" aria-label="错误状态" placeholder="请填写标题" />
      <Input
        status="warning"
        aria-label="警告状态"
        placeholder="检查输入内容"
      />
      <Input disabled defaultValue="禁用输入" aria-label="禁用输入" />
    </div>
  );
}
