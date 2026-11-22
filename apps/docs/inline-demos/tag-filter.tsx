import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";

const conditions = [
  { key: "design", label: "分类：设计" },
  { key: "ongoing", label: "状态：进行中" },
] as const;
type Condition = (typeof conditions)[number]["key"];
const records: { title: string; matches: Condition[] }[] = [
  { title: "图标规范", matches: ["design"] },
  { title: "页面模板", matches: ["design", "ongoing"] },
  { title: "接口清单", matches: ["ongoing"] },
];

export default function Demo() {
  const [applied, setApplied] = useState<Condition[]>(["design"]);
  const next = conditions.find(({ key }) => !applied.includes(key));
  const results = records.filter(({ matches }) =>
    applied.every((key) => matches.includes(key)),
  );

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        {applied.map((key) => (
          <M.Tag
            key={key}
            variant="filter"
            onRemove={() => setApplied((current) => current.filter((item) => item !== key))}
          >
            {conditions.find((condition) => condition.key === key)?.label}
          </M.Tag>
        ))}
        <M.Button
          disabled={!next}
          onClick={() => next && setApplied((current) => [...current, next.key])}
        >
          添加筛选
        </M.Button>
      </div>
      <ul aria-label="筛选结果">
        {results.map(({ title }) => <li key={title}>{title}</li>)}
      </ul>
    </div>
  );
}
