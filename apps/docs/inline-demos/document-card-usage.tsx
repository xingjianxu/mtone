import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";

const stackStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  width: "100%",
  maxWidth: 460,
};
export default function Demo() {
  const [notice, setNotice] = useState("");
  const output = notice ? (
    <M.Text role="status" muted>
      {notice}
    </M.Text>
  ) : null;
  const documents: M.DocumentItem[] = [
    {
      id: "guide",
      title: "知识库使用指南",
      description: "从一个想法开始",
      updatedAt: "今天",
      onClick: () => setNotice("已选择：知识库使用指南"),
    },
    {
      id: "notes",
      title: "项目研究笔记",
      description: "值得保留的观察",
      updatedAt: "昨天",
      onClick: () => setNotice("已选择：项目研究笔记"),
    },
  ];

  return (
    <div style={stackStyle}>
      <M.DocumentCard {...documents[0]} />
      {output}
    </div>
  );
}
