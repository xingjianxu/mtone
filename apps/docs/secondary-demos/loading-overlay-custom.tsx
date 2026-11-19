import { useState } from "react";
import { LoadingOverlay } from "../../../packages/mtone/src";

export default function Demo() {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 460 }}>
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
