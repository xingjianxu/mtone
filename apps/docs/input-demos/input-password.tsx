import React from "react";
import { Input } from "../../../packages/mtone/src";
import { UserRound } from "lucide-react";

export default function Demo() {
  return (
    <Input.Password
      aria-label="密码"
      placeholder="输入密码"
      autoComplete="new-password"
      prefix={<UserRound size={14} />}
      allowClear
    />
  );
}
