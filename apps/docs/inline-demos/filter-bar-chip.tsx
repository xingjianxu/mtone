import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";

export default function Demo() {
  const [visible, setVisible] = useState(true);

  return (
    <M.FilterBar>
      {visible && (
        <M.FilterChip onRemove={() => setVisible(false)}>
          状态：进行中
        </M.FilterChip>
      )}
    </M.FilterBar>
  );
}
