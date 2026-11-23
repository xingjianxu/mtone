import React, { useState } from "react";
import { Button, Input, ShortcutsProvider, ShortcutScope, formatShortcut, useShortcut } from "../../../packages/mtone/src";

const saveKey = "Shift+F2";

function Editor() {
  const [armed, setArmed] = useState(false);
  const [editing, setEditing] = useState(true);
  const [notice, setNotice] = useState("尚未保存");

  useShortcut(saveKey, () => setNotice("已保存工作区"), { enabled: armed });

  return (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Button aria-pressed={armed} onClick={() => setArmed((value) => !value)}>演示快捷键</Button>
        <Button aria-pressed={editing} onClick={() => setEditing((value) => !value)}>编辑器作用域</Button>
      </div>
      <p>开启演示后按 <kbd>{formatShortcut(saveKey)}</kbd>，比较打开和关闭编辑器作用域的结果。</p>
      <ShortcutScope active={editing}>
        <Draft onSave={() => setNotice("已保存草稿")} enabled={armed} />
      </ShortcutScope>
      <p role="status">{notice}</p>
    </div>
  );
}

function Draft({ onSave, enabled }: { onSave: () => void; enabled: boolean }) {
  useShortcut(saveKey, onSave, { enabled });
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Input aria-label="草稿名称" placeholder="在此输入时不触发快捷键" />
      <Button onClick={onSave} rightSection={<kbd>{formatShortcut(saveKey)}</kbd>}>保存草稿</Button>
    </div>
  );
}

export default function Demo() {
  return <ShortcutsProvider><Editor /></ShortcutsProvider>;
}
