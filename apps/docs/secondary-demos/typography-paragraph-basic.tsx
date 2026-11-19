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
      <Typography.Paragraph>
        Typography 沿用 mtone
        的中性色、紧凑间距与细边框，适合工作台、笔记与产品文档。
      </Typography.Paragraph>
    </div>
  );
}
