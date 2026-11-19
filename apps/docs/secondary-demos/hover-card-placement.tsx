import { Button, HoverCard } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <HoverCard
        trigger={<Button>右侧说明</Button>}
        side="right"
        align="start"
        width={220}
        content="也可以使用 Tab 聚焦触发元素，再按 Escape 关闭。浮层不会抢走焦点。"
      />
    </div>
  );
}
