import { Typography } from "../../../packages/mtone/src";

const source = `const options = {
  output: "artifacts/docs/typography/website/previews/latest/dark-mode/index.html",
  pretty: true,
};`;

export default function Demo() {
  return (
    <div style={{ minWidth: 0, width: "100%" }}>
      <Typography.Paragraph>在项目目录执行 <Typography.Code>npm test</Typography.Code>。</Typography.Paragraph>
      <Typography.Code block aria-label="配置示例">{source}</Typography.Code>
    </div>
  );
}
