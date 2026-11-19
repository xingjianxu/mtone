import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";
import { FileText } from "lucide-react";

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
  const menuItems: M.MenuItem[] = [
    { key: "open", label: "打开文档", icon: <FileText size={14} /> },
    { key: "favorite", label: "加入收藏", shortcut: "⌘D" },
    { key: "disabled", label: "不可用操作", disabled: true },
    { key: "delete", label: "移至回收站（演示）", danger: true },
  ];

  return (
    <div style={stackStyle}>
      <M.ContextMenu items={menuItems} onSelect={setNotice}>
        <div
          tabIndex={0}
          style={{
            padding: 32,
            border: "1px dashed var(--mt-border)",
            borderRadius: 4,
          }}
        >
          在这里点击右键或使用键盘菜单键
        </div>
      </M.ContextMenu>
      {output}
    </div>
  );
}
