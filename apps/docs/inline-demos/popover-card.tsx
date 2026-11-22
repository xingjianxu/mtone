import { useId } from "react";
import { Card, Input, Popover } from "../../../packages/mtone/src";

export default function Demo() {
  const nameId = useId();
  return (
    <Popover
      trigger="打开设置卡片"
      label="项目设置"
      width={272}
      align="start"
      content={
        <Card title="项目设置">
          <div style={{ display: "grid", gap: 8 }}>
            <label htmlFor={nameId}>项目名称</label>
            <Input
              id={nameId}
              defaultValue="研究笔记"
              style={{ width: "100%" }}
            />
          </div>
        </Card>
      }
    />
  );
}
