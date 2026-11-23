import { Button, Tooltip } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Tooltip side="top" align="start" arrow content="优先在上方，对齐起始边">
        <Button>上方起始</Button>
      </Tooltip>
      <Tooltip side="bottom" align="end" arrow offset={10} content="优先在下方，对齐末端">
        <Button>下方末端</Button>
      </Tooltip>
      <Tooltip side="right" content="不显示箭头">
        <Button>右侧，无箭头</Button>
      </Tooltip>
    </div>
  );
}
