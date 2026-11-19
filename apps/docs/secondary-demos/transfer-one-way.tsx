import { Transfer } from "../../../packages/mtone/src";
const items = Array.from({ length: 12 }, (_, i) => ({
  key: String(i),
  label: `资料 ${i + 1}`,
  description: i === 2 ? "不可移动的示例" : undefined,
  disabled: i === 2,
}));

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 680 }}>
      <p>单向选择：右侧可逐项移除；禁用项不参与移动。</p>
      <Transfer
        items={items.slice(0, 4)}
        defaultTargetKeys={["1", "2"]}
        oneWay
        height={120}
      />
    </div>
  );
}
