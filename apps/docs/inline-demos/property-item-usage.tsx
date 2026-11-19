import React from "react";
import * as M from "../../../packages/mtone/src";

export default function Demo() {
  const properties = (
    <M.PropertyList>
      <M.PropertyItem label="类型">文档</M.PropertyItem>
      <M.PropertyItem label="标签">
        <M.Badge tone="green">研究</M.Badge>
      </M.PropertyItem>
      <M.PropertyItem label="负责人">
        <M.Avatar name="林" />
      </M.PropertyItem>
    </M.PropertyList>
  );

  return properties;
}
