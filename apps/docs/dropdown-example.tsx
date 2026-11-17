import React, { useState } from "react";
import { Dropdown, Button, Input, Text } from "../../packages/mtone/src";

export function DropdownExample() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("项目周报");
  const [saved, setSaved] = useState("");
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 460 }}>
      <Text muted>宽触发按钮不再撑宽弹层；默认按内容宽度，最小 160px。</Text>
      <Dropdown
        trigger={<Button>左侧对齐</Button>}
        align="left"
        label="文档信息"
        content={<div style={{ padding: 8 }}>最近编辑：今天 10:30</div>}
      />
      <Dropdown
        trigger={<Button>右侧对齐，固定宽度</Button>}
        align="right"
        width={240}
        label="编辑标题"
        open={open}
        onOpenChange={setOpen}
        content={
          <div style={{ display: "grid", gap: 8, padding: 8 }}>
            <label htmlFor="dropdown-demo-title">文档标题</label>
            <Input
              id="dropdown-demo-title"
              value={name}
              onChange={(event) => setName(event.target.value)}
              style={{ width: "100%", minWidth: 0 }}
            />
            <Button
              onClick={() => {
                setSaved(name);
                setOpen(false);
              }}
            >
              保存并关闭
            </Button>
          </div>
        }
      />
      {saved && <Text role="status">已保存：{saved}</Text>}
    </div>
  );
}
