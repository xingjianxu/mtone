import { Rate } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 24, minWidth: 0 }}>
      <Rate aria-label="从右向左评分" dir="rtl" allowHalf defaultValue={2.5} />
      <p>半星命中区域与左右方向键跟随阅读方向；上下方向键始终增减分数。</p>
    </div>
  );
}
