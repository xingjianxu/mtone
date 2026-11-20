import React from "react";
import Group0 from "./secondary-demos/card-group-responsive";
import Group1 from "./secondary-demos/card-group-span";
import Group2 from "./secondary-demos/card-group-divided";
import Group3 from "./secondary-demos/card-group-vertical";

export function CardGroupExample() {
  return (
    <div style={{ display: "grid", gap: 20, width: "100%", minWidth: 0 }}>
      <section aria-label="默认响应式卡片组">
        <h3>默认响应式排列</h3>
        <p>默认随视口从 1 列变为 2 列、3 列；间距为 12px。</p>
        <Group0 />
      </section>
      <section>
        <h3>移动端两列与跨列</h3>
        <p>小屏仍展示 2 列，768px 起为 3 列；跨列项不会超过当前总列数。</p>
        <Group1 />
      </section>
      <section aria-label="带分隔线卡片组">
        <h3>行列之间的分隔线</h3>
        <Group2 />
      </section>
      <section aria-label="纵向卡片组">
        <h3>纵向排列</h3>
        <Group3 />
      </section>
    </div>
  );
}
