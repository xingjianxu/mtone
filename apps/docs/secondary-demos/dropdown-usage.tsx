import { Dropdown, Button } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 460 }}>
      <Dropdown
        trigger={<Button>左侧对齐</Button>}
        align="left"
        label="文档信息"
        content={<div style={{ padding: 8 }}>最近编辑：今天 10:30</div>}
      />
    </div>
  );
}
