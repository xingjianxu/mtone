import React from "react";
import * as M from "../../../packages/mtone/src";
import { Search } from "lucide-react";

export default function Demo() {
  return (
    <M.Tooltip content="搜索当前知识库">
      <M.IconButton aria-label="搜索">
        <Search size={16} />
      </M.IconButton>
    </M.Tooltip>
  );
}
