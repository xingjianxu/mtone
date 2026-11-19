import React from "react";
import { Button, Popconfirm } from "../../../packages/mtone/src";

export default function Demo() {
  const [status, setStatus] = React.useState("尚未执行操作");
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Popconfirm
        trigger={<Button danger>移除记录</Button>}
        title="移除这条记录？"
        description="此示例只更改本地提示，不会删除真实数据。"
        onConfirm={() => setStatus("已确认移除（本地示例）")}
        onCancel={() => setStatus("已取消")}
      />
      <output aria-live="polite">{status}</output>
    </div>
  );
}
