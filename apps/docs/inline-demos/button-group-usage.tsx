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
      <M.ButtonGroup aria-label="文档操作">
        <M.Button onClick={() => setNotice("已选择新建")}>新建</M.Button>
        <M.Button onClick={() => setNotice("已选择复制")}>复制</M.Button>
        <M.Button onClick={() => setNotice("已选择归档")}>归档</M.Button>
      </M.ButtonGroup>
      {output}
    </div>
  );
}
