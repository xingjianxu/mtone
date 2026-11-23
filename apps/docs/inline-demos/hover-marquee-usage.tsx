import React from "react";
import { HoverMarquee } from "../../../packages/mtone/src";

export default function Demo() {
  return <div style={{ display: "grid", gap: 12, width: "min(100%, 15rem)" }}>
    <div><HoverMarquee>研究笔记</HoverMarquee></div>
    <div><HoverMarquee>面向多模态教学数据的人工智能实验记录与阶段性研究报告</HoverMarquee></div>
  </div>;
}
