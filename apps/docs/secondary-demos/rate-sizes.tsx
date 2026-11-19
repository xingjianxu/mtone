import { Rate } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 24, minWidth: 0 }}>
      <div style={{ display: "grid", gap: 12 }}>
        <Rate aria-label="小号评分" size="small" defaultValue={3} />
        <Rate aria-label="中号评分" size="medium" defaultValue={3} />
        <Rate aria-label="大号评分" size="large" defaultValue={3} />
      </div>
    </div>
  );
}
