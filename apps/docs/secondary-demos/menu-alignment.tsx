import React, { useState } from "react";
import { FileText } from "lucide-react";
import * as M from "../../../packages/mtone/src";
const stackStyle: React.CSSProperties = { display: "grid", justifyItems: "start", gap: 12 };

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
      <M.Popover.Menu
        trigger={<M.Button>右对齐菜单，宽度 240px</M.Button>}
        width={240}
        align="right"
        items={menuItems}
        onSelect={setNotice}
      />
      {output}
    </div>
  );
}
