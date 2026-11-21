import { useState } from "react";
import { Popover, Button, Input, Text } from "../../../packages/mtone/src";

export default function Demo() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("项目周报");
  const [saved, setSaved] = useState("");
  return (
    <div style={{ display: "grid", gap: 16, justifyItems: "start", width: "100%", maxWidth: 460 }}>
      <Popover
        trigger="右侧对齐，固定宽度"
        align="right"
        width={240}
        label="编辑标题"
        open={open}
        onOpenChange={setOpen}
        content={
          <div style={{ display: "grid", gap: 8 }}>
            <label htmlFor="popover-demo-title">文档标题</label>
            <Input
              id="popover-demo-title"
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
