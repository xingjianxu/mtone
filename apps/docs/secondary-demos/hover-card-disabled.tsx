import { Button, HoverCard } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <HoverCard
        disabled
        trigger={<Button>已禁用预览</Button>}
        content="不会显示"
      />
    </div>
  );
}
