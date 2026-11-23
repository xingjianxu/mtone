import { Button, Tooltip } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Tooltip content="使用主题配色" tone="teal" arrow>
        <Button>颜色预设</Button>
      </Tooltip>
      <Tooltip
        arrow
        content={<><strong>同步时间</strong><br />每天 08:00 更新副本，不影响本地草稿。</>}
        styles={{ popup: { maxWidth: 190, textAlign: "start", lineHeight: 1.5 } }}
      >
        <Button>自定义内容</Button>
      </Tooltip>
    </div>
  );
}
