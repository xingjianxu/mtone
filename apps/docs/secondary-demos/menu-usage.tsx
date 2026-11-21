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
      <M.Menu
        trigger={<M.Button>文档操作</M.Button>}
        items={[
          {
            type: "group",
            key: "documents",
            label: "文档操作",
            children: menuItems,
          },
          { type: "divider", key: "divider" },
          {
            type: "group",
            key: "sharing",
            label: "共享与导出",
            children: [
              {
                key: "export",
                label: "导出",
                children: [
                  { key: "PDF", label: "PDF" },
                  { key: "Markdown", label: "Markdown" },
                  { key: "Word", label: "Word（不可用）", disabled: true },
                ],
              },
              {
                key: "share",
                label: "共享",
                children: [
                  { key: "copy-link", label: "复制链接" },
                  { key: "invite", label: "邀请成员" },
                ],
              },
            ],
          },
        ]}
        onSelect={setNotice}
      />
      {output}
    </div>
  );
}
