import { Button, Popconfirm } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Popconfirm
        disabled
        trigger={<Button>不可操作</Button>}
        title="不会显示"
      />
    </div>
  );
}
