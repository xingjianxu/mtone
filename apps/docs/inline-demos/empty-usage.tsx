import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";
import { Plus } from "lucide-react";

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
      <M.Empty
        title="还没有文档"
        description="创建第一份文档，记录新的想法。"
        action={
          <M.Button
            icon={<Plus size={14} />}
            onClick={() => setNotice("点击了新建入口（演示）")}
          >
            新建文档
          </M.Button>
        }
      />
      {output}
    </div>
  );
}
