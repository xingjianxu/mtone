import React from "react";
import { Affix, Button } from "../../../packages/mtone/src";

export default function Demo() {
  const compact = false;
  const target = React.useRef<HTMLDivElement>(null);
  const [affixed, setAffixed] = React.useState(false);
  const getTarget = React.useCallback(() => target.current, []);
  return (
    <div style={{ width: "100%", maxWidth: 600 }}>
      <div style={{ width: "100%", maxWidth: 600 }}>
        <p>滚动此区域：{affixed ? "已固定" : "未固定"}</p>
        <div
          ref={target}
          style={{
            height: compact ? 160 : 240,
            overflow: "auto",
            border: "1px solid var(--mt-border, #e5e5e5)",
            borderRadius: 6,
            padding: 12,
          }}
        >
          <div style={{ height: 90 }}>向下滚动，操作栏固定在容器顶部。</div>
          <Affix target={getTarget} offsetTop={12} onChange={setAffixed}>
            <div
              style={{
                padding: 8,
                background: "var(--mt-bg, white)",
                border: "1px solid #ddd",
                borderRadius: 6,
              }}
            >
              <Button>保存更改</Button>
            </div>
          </Affix>
          <div style={{ height: 280, paddingTop: 20 }}>
            原位置保留占位，避免内容跳动。
          </div>
        </div>
        {!compact && (
          <p>
            底部固定使用 offsetBottom；省略 target 时以窗口为目标。不要用于有
            transform 的祖先或横向滚动布局。
          </p>
        )}
      </div>
    </div>
  );
}
