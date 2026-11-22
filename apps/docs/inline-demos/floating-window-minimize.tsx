import { useState } from "react";
import { StickyNote } from "lucide-react";
import { Button, FloatingWindow, Input } from "../../../packages/mtone/src";

function Draft() {
  const [text, setText] = useState("");
  return (
    <div style={{ display: "grid" }}>
      <Input.TextArea
        aria-label="发布备注草稿"
        placeholder="记录本次更新…"
        rows={4}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
    </div>
  );
}

export default function Demo() {
  return (
    <FloatingWindow
      title="发布备注"
      initialSize={{ width: 350, height: 235 }}
      trigger={<Button>打开草稿窗口</Button>}
      minimizedIcon={<StickyNote size={16} aria-hidden="true" />}
    >
      <Draft />
    </FloatingWindow>
  );
}
