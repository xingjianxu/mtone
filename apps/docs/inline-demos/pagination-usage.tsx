import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";

const stackStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  width: "100%",
  maxWidth: 460,
};
export default function Demo() {
  const [page, setPage] = useState(1);

  return (
    <div style={stackStyle}>
      <M.Pagination
        total={85}
        pageSize={10}
        page={page}
        onPageChange={setPage}
      />
      <M.Text muted>当前第 {page} 页</M.Text>
    </div>
  );
}
