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

  return (
    <M.Drawer
      title="文档属性"
      description="在不离开当前页面的情况下查看信息。"
      trigger={<M.Button>打开属性抽屉</M.Button>}
    >
      {properties}
    </M.Drawer>
  );
}
