import React, { useState } from "react";
import {
  Button,
  Input,
  Select,
  ToastProvider,
  useToast,
} from "../../../packages/mtone/src";

const positions = [
  "top-right",
  "bottom-right",
  "top-left",
  "bottom-left",
  "top-center",
  "bottom-center",
  "center",
  "center-top",
] as const;
type Position = (typeof positions)[number];

function Actions() {
  const toast = useToast();
  const [position, setPosition] = useState<Position>("bottom-right");
  const [title, setTitle] = useState("更改已保存");
  const [body, setBody] = useState("文档已同步，可以继续编辑。");

  return (
    <div style={{ display: "grid", gap: 8, maxWidth: 360 }}>
      <label>
        标题 <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label>
        正文 <Input value={body} onChange={(e) => setBody(e.target.value)} />
      </label>
      <Select
        label="通知位置"
        value={position}
        onValueChange={(value) => {
          if (value && positions.includes(value as Position))
            setPosition(value as Position);
        }}
        options={positions.map((value) => ({ value, label: value }))}
      />
      <Button onClick={() => toast.info({ title, body, position })}>
        显示通知
      </Button>
    </div>
  );
}

export default function Demo() {
  return (
    <ToastProvider>
      <Actions />
    </ToastProvider>
  );
}
