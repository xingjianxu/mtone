import React from "react";
import * as M from "../../../packages/mtone/src";
import { Search } from "lucide-react";

export default function Demo() {
  return (
    <M.Tooltip content="搜索当前知识库">
      <M.Button iconOnly aria-label="搜索">
        <Search size={16} />
      </M.Button>
    </M.Tooltip>
  );
}
