import { useId, useState } from "react";
import { Button, Input, LoadingOverlay } from "../../../packages/mtone/src";

export default function Demo() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("项目周报");
  const inputId = useId();
  return (
    <div style={{ display: "grid", gap: 16, width: "100%", maxWidth: 460 }}>
      <div
        style={{
          position: "relative",
          border: "1px solid var(--mt-border, #e5e5e3)",
          borderRadius: 6,
        }}
      >
        <div
          aria-busy={visible}
          style={{ padding: 16, display: "grid", gap: 8 }}
        >
          <label htmlFor={inputId}>项目名称</label>
          <Input
            id={inputId}
            disabled={visible}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Button disabled={visible}>保存项目</Button>
        </div>
        <LoadingOverlay visible={visible} label="正在保存" blur={1} />
      </div>
      <Button onClick={() => setVisible((value) => !value)}>
        {visible ? "隐藏遮罩" : "显示遮罩"}
      </Button>
    </div>
  );
}
