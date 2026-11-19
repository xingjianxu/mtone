import React, { useState } from "react";
import { Progress } from "../../../packages/mtone/src";

const stack: React.CSSProperties = { display: "grid", gap: 14, minWidth: 0 };

export default function Demo() {
  const [value, setValue] = useState(60);
  return (
    <div style={{ ...stack, gap: 28, width: "100%", maxWidth: 640 }}>
      <div style={stack}>
        <Progress value={60} label="处理中" status="active" showInfo />
        <Progress value={100} label="已完成" status="success" showInfo />
        <Progress value={45} label="上传失败" status="exception" showInfo />
      </div>
      <p>
        active 为连续线性条增加轻量动画；减少动态效果偏好会关闭动画。状态不改变
        value，100% 也不会自动切换状态。
      </p>
    </div>
  );
}
