import { Button, Tooltip } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Tooltip disabled content="此提示不会显示">
        <Button>只禁用提示</Button>
      </Tooltip>
      <Tooltip wrapDisabledTrigger content="此文档为只读，不能编辑">
        <button type="button" disabled>编辑文档</button>
      </Tooltip>
    </div>
  );
}
