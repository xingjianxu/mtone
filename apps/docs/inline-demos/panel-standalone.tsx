import React from "react";
import { Panel } from "../../../packages/mtone/src";

export default function Demo() {
  return <div style={{ border: "1px solid var(--mt-border)", borderRadius: 6, overflow: "hidden" }}>
    <Panel storageKey="docs:panel:standalone" label="检查结果" items={[
      { value: "problems", label: "问题", content: "没有发现问题。" },
      { value: "output", label: "输出", content: <code>编译完成</code> },
    ]} />
  </div>;
}
