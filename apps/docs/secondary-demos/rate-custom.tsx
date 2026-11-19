import React from "react";
import { Heart } from "lucide-react";
import { Rate } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ display: "grid", gap: 24, minWidth: 0 }}>
      <div style={{ display: "grid", gap: 14 }}>
        <Rate
          aria-label="喜爱程度"
          character={<Heart fill="currentColor" strokeWidth={0} />}
          allowHalf
          defaultValue={2.5}
          style={{ "--mt-rate-color": "#a65e62" } as React.CSSProperties}
        />
        <Rate aria-label="推荐程度" character="好" count={3} defaultValue={2} />
        <Rate
          aria-label="自定义数字评分"
          character={({ index }) => index + 1}
          count={5}
          defaultValue={3}
        />
      </div>
      <p>字符是固定方形区域内的纯展示内容，请勿放入链接、按钮或输入框。</p>
    </div>
  );
}
