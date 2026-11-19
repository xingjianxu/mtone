import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";
import { Star } from "lucide-react";

export default function Demo() {
  const [checked, setChecked] = useState(true);

  return (
    <div style={{ width: 220 }}>
      <M.NavItem
        active={checked}
        icon={<Star size={15} />}
        onClick={() => setChecked(!checked)}
      >
        收藏夹
      </M.NavItem>
    </div>
  );
}
