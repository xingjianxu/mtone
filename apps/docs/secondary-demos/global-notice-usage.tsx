import { useEffect, useRef, useState } from "react";
import { Button, GlobalNotice } from "../../../packages/mtone/src";

export default function Demo() {
  const [visible, setVisible] = useState(true);
  const restoreRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!visible) restoreRef.current?.focus();
  }, [visible]);

  return (
    <div style={{ display: "grid", gap: 12, width: "100%" }}>
      {visible && (
        <GlobalNotice title="维护提醒" onAction={() => setVisible(false)}>
          今晚 22:00 起短暂维护。请提前保存正在编辑的内容。
        </GlobalNotice>
      )}
      <div>
        <Button
          ref={restoreRef}
          disabled={visible}
          onClick={() => setVisible(true)}
        >
          重新显示通知
        </Button>
      </div>
    </div>
  );
}
