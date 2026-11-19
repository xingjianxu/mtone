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
      <M.ButtonGroup connected aria-label="危险操作">
        <M.Button danger variant="solid" onClick={() => setNotice("删除示例")}>
          删除
        </M.Button>
        <M.Button
          danger
          variant="solid"
          onClick={() => setNotice("永久删除示例")}
        >
          永久删除
        </M.Button>
      </M.ButtonGroup>
      {output}
    </div>
  );
}
