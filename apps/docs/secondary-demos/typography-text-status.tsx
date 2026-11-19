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
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <Typography.Text>普通文本</Typography.Text>
        <Typography.Text muted>次要说明</Typography.Text>
        <Typography.Text type="success">已完成</Typography.Text>
        <Typography.Text type="warning">待确认</Typography.Text>
        <Typography.Text type="danger">需要处理</Typography.Text>
        <Typography.Text disabled>不可用</Typography.Text>
      </div>
    </div>
  );
}
