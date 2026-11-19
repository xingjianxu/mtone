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
      <Typography.Link href="#/components/Button">
        查看 Button 文档
      </Typography.Link>
      {" · "}
      <Typography.Link href="#/components/Typography" disabled>
        暂不可用
      </Typography.Link>
    </div>
  );
}
