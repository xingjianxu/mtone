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
      <p>level 对应 h1 到 h6；请选择符合页面结构的层级，而不只按字号选择。</p>
      {([1, 2, 3, 4, 5, 6] as const).map((level) => (
        <Typography.Title key={level} level={level}>
          H{level} · 让内容清晰、有层次
        </Typography.Title>
      ))}
    </div>
  );
}
