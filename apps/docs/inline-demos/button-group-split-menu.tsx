import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";
import { ChevronDown } from "lucide-react";

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
      <M.ButtonGroup connected aria-label="导出文档">
        <M.Button onClick={() => setNotice("已选择导出 PDF")}>
          导出 PDF
        </M.Button>
        <M.Menu
          trigger={
            <M.Button iconOnly aria-label="更多导出格式">
              <ChevronDown size={14} />
            </M.Button>
          }
          items={[
            {
              key: "markdown",
              label: "导出 Markdown",
              onSelect: () => setNotice("已选择导出 Markdown"),
            },
            {
              key: "html",
              label: "导出 HTML",
              onSelect: () => setNotice("已选择导出 HTML"),
            },
          ]}
        />
      </M.ButtonGroup>
      {output}
    </div>
  );
}
