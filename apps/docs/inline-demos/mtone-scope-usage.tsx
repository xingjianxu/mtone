import React from "react";
import * as M from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <M.MtoneScope
      style={{
        padding: 16,
        border: "1px solid var(--mt-border)",
        borderRadius: 4,
      }}
    >
      <M.Text>此区域继承当前 Provider 的主题与密度。</M.Text>
      <M.Divider />
      <M.Button>局部区域按钮</M.Button>
    </M.MtoneScope>
  );
}
