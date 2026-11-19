import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";
import { BookOpen, Folder } from "lucide-react";

export default function Demo() {
  const [value, setValue] = useState<string | null>("design");

  return (
    <M.Sidebar collapsible aria-label="工作空间导航" style={{ maxWidth: 240 }}>
      <M.NavGroup label="工作空间">
        <M.NavItem
          active={value === "design"}
          icon={<Folder size={15} />}
          onClick={() => setValue("design")}
        >
          产品设计
        </M.NavItem>
        <M.NavItem
          active={value === "research"}
          icon={<BookOpen size={15} />}
          onClick={() => setValue("research")}
        >
          研究笔记
        </M.NavItem>
      </M.NavGroup>
    </M.Sidebar>
  );
}
