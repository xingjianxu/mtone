import { Button, HoverCard } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <HoverCard
        trigger={<Button>延迟显示</Button>}
        openDelay={700}
        closeDelay={400}
        content="悬停 700ms 后显示，离开 400ms 后隐藏。快速划过不会弹出。"
      />
    </div>
  );
}
