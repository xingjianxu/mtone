import React from "react";
import { Button, Popconfirm } from "../../../packages/mtone/src";

export default function Demo() {
  const [status, setStatus] = React.useState("尚未执行操作");
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Popconfirm
        open={open}
        onOpenChange={setOpen}
        trigger={<Button>受控确认</Button>}
        title="确认归档？"
        icon={null}
        okText="归档"
        cancelText="保留"
        okButtonProps={{ variant: "blue" }}
        onConfirm={() => setStatus("已归档（本地示例）")}
      />
      <output aria-live="polite">{status}</output>
    </div>
  );
}
