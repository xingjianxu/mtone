import React from "react";
import { Button } from "../../../packages/mtone/src";

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
      <Button loading>保存中</Button>
      <Button disabled>不可用</Button>
      <Button variant="blue" loading>
        保存中
      </Button>
      <Button variant="blue" disabled>
        不可用
      </Button>
    </div>
  );
}
