import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";

export default function Demo() {
  const [value, setValue] = useState<string | null>("design");

  return (
    <div style={{ width: 220 }}>
      <M.NavGroup label="个人空间">
        <M.NavItem
          active={value === "design"}
          onClick={() => setValue("design")}
        >
          设计资料
        </M.NavItem>
        <M.NavItem
          active={value === "research"}
          onClick={() => setValue("research")}
        >
          研究资料
        </M.NavItem>
      </M.NavGroup>
    </div>
  );
}
