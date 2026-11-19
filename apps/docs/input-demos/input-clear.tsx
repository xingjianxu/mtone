import React from "react";
import { Input } from "../../../packages/mtone/src";
import { Mail } from "lucide-react";

export default function Demo() {
  return (
    <Input
      aria-label="文档标题"
      placeholder="输入文档标题"
      prefix={<Mail size={14} />}
      suffix=".md"
      allowClear
      showCount
      maxLength={40}
    />
  );
}
