import { Avatar } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Avatar name="响应" size={{ xs: 24, sm: 32, md: 40, lg: 56 }} />
      <p>随页面宽度改变尺寸；文字会自动缩小以适应头像。</p>
    </div>
  );
}
