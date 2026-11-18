import React from "react";
import { Button, HoverCard } from "../../packages/mtone/src";

export function HoverCardExample() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <HoverCard
        trigger={<Button>作者预览</Button>}
        title="mtone"
        withArrow
        content={
          <>
            <p style={{ margin: "0 0 8px" }}>
              简约、紧凑的 React
              组件库。将鼠标移入卡片后，可以继续阅读或使用链接。
            </p>
            <a href="#/components/Button">浏览 Button 文档</a>
          </>
        }
      />
      <HoverCard
        trigger={<Button>延迟显示</Button>}
        openDelay={700}
        closeDelay={400}
        content="悬停 700ms 后显示，离开 400ms 后隐藏。快速划过不会弹出。"
      />
      <HoverCard
        trigger={<Button>右侧说明</Button>}
        side="right"
        align="start"
        width={220}
        content="也可以使用 Tab 聚焦触发元素，再按 Escape 关闭。浮层不会抢走焦点。"
      />
      <HoverCard
        disabled
        trigger={<Button>已禁用预览</Button>}
        content="不会显示"
      />
    </div>
  );
}
