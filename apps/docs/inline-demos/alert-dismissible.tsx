import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";

const stackStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  width: "100%",
  maxWidth: 460,
};
export default function Demo() {
  const [visible, setVisible] = useState(true);

  return (
    <div style={stackStyle}>
      {visible ? (
        <M.Alert
          tone="success"
          title="保存成功"
          onClose={() => setVisible(false)}
        >
          你可以关闭这条提示。
        </M.Alert>
      ) : (
        <M.Button onClick={() => setVisible(true)}>重新显示</M.Button>
      )}
    </div>
  );
}
