import { useState } from "react";

import { Rate, Text } from "../../../packages/mtone/src";

const hints = ["不满意", "一般", "还不错", "满意", "非常满意"];

export default function Demo() {
  const [value, setValue] = useState(3.5);
  const [hover, setHover] = useState<number>();
  return (
    <div style={{ display: "grid", gap: 24, minWidth: 0 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Rate
          aria-label="体验评分"
          value={value}
          onChange={setValue}
          allowHalf
          tooltips={hints}
          onHoverChange={setHover}
        />
        <Text data-testid="rate-value">{value} / 5</Text>
        <Text muted>
          {(hover ?? value) > 0
            ? hints[Math.ceil(hover ?? value) - 1]
            : "尚未评分"}
        </Text>
      </div>
      <p>
        点击选择；再次点击同一分数清除。方向键按半星调整，Home / End 跳到边界。
      </p>
    </div>
  );
}
