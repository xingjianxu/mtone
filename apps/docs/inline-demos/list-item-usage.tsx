import React from "react";
import * as M from "../../../packages/mtone/src";
import { FileText } from "lucide-react";

export default function Demo() {
  return (
    <M.List>
      <M.ListItem
        icon={<FileText size={16} />}
        description="今天更新"
        actions={<M.Tag>设计</M.Tag>}
      >
        组件规范
      </M.ListItem>
      <M.ListItem icon={<FileText size={16} />} description="昨天更新">
        研究笔记
      </M.ListItem>
    </M.List>
  );
}
