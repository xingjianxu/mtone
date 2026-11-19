import { Typography } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div
      style={{
        display: "grid",
        gap: 28,
        minWidth: 0,
        width: "100%",
        maxWidth: 640,
      }}
    >
      <div style={{ maxWidth: 300 }}>
        <Typography.Text ellipsis>
          单行内容会在容器宽度不足时省略，请为容器设置可用宽度。
        </Typography.Text>
      </div>
    </div>
  );
}
