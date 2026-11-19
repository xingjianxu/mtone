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
        <Typography.Text strong>重点</Typography.Text>
        <Typography.Text italic>备注</Typography.Text>
        <Typography.Text underline>下划线</Typography.Text>
        <Typography.Text delete>旧内容</Typography.Text>
        <Typography.Text mark>标记</Typography.Text>
        <Typography.Text code>npm install @bixlab/mtone</Typography.Text>
        <Typography.Text keyboard>⌘ K</Typography.Text>
      </div>
    </div>
  );
}
