import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";

const stackStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  width: "100%",
  maxWidth: 460,
};
export default function Demo() {
  const [notice, setNotice] = useState("");
  const output = notice ? (
    <M.Text role="status" muted>
      {notice}
    </M.Text>
  ) : null;

  return (
    <div style={stackStyle}>
      <M.ConfirmDialog
        title="确认归档这份示例文档？"
        description="这是本地演示，不会修改真实文档。"
        trigger={<M.Button danger>归档文档</M.Button>}
        confirmText="确认归档"
        onConfirm={() => setNotice("已确认示例操作")}
      />
      {output}
    </div>
  );
}
