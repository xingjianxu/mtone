import { useRef } from "react";
import { Button, Tooltip } from "../../../packages/mtone/src";

export default function Demo() {
  const container = useRef<HTMLDivElement>(null);

  return (
    <div style={{ width: "100%", maxWidth: 460 }}>
      <div
        ref={container}
        style={{
          position: "relative",
          minHeight: 136,
          padding: 8,
          border: "1px dashed var(--mt-border)",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-start",
        }}
      >
        <Tooltip container={container} side="top" align="end" shift arrow
          content="提示挂载在虚线区域的 DOM 内。">
          <Button>靠近边缘</Button>
        </Tooltip>
      </div>
    </div>
  );
}
