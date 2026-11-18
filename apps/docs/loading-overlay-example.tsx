import React, { useId, useState } from "react";
import { Button, Input, LoadingOverlay, Text } from "../../packages/mtone/src";

export function LoadingOverlayExample() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("项目周报");
  const inputId = useId();
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 460 }}>
      <Text muted>
        局部遮罩保留原布局。表单在加载时单独禁用，切换按钮留在遮罩外。
      </Text>
      <div
        style={{
          position: "relative",
          border: "1px solid var(--mt-border, #e5e5e3)",
          borderRadius: 6,
        }}
      >
        <div
          aria-busy={visible}
          style={{ padding: 16, display: "grid", gap: 8 }}
        >
          <label htmlFor={inputId}>项目名称</label>
          <Input
            id={inputId}
            disabled={visible}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Button disabled={visible}>保存项目</Button>
        </div>
        <LoadingOverlay visible={visible} label="正在保存" blur={1} />
      </div>
      <Button onClick={() => setVisible((value) => !value)}>
        {visible ? "隐藏遮罩" : "显示遮罩"}
      </Button>
      <Text muted>自定义加载内容、遮罩颜色与模糊：</Text>
      <div
        style={{
          position: "relative",
          minHeight: 112,
          borderRadius: 6,
          padding: 16,
          border: "1px solid var(--mt-border, #e5e5e3)",
        }}
      >
        文档内容
        <LoadingOverlay
          visible
          opacity={0.85}
          overlayColor="var(--mt-subtle, #f7f7f5)"
          blur={2}
          loader={<span style={{ fontSize: 12 }}>正在同步文档…</span>}
          label="同步中"
        />
      </div>
    </div>
  );
}
