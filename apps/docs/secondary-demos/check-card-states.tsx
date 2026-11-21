import { CheckCard } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <CheckCard
        title="可选卡片"
        description="小尺寸、无边框。"
        size="sm"
        bordered={false}
      />
      <CheckCard title="不可选套餐" description="当前账户无法使用。" disabled />
      <CheckCard
        title="正在核对配额"
        description="加载期间不可切换选中状态。"
        size="lg"
        loading
      />
    </div>
  );
}
