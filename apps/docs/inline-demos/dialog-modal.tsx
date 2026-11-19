import React, { useState } from "react";
import * as M from "../../../packages/mtone/src";

export default function Demo() {
  const [text, setText] = useState("设计规范");
  const [checked, setChecked] = useState(true);
  const [open, setOpen] = useState(false);
  const field = (
    <M.FormField
      label="名称"
      description="示例仅修改当前页面，不保存到服务器。"
    >
      <M.Input value={text} onChange={(e) => setText(e.target.value)} />
    </M.FormField>
  );

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <M.Checkbox
        checked={checked}
        onCheckedChange={setChecked}
        label="阻止点击对话框外部关闭（modal）"
      />
      <M.Dialog
        modal={checked}
        title="新建知识库"
        description="此示例只更新当前页面状态。"
        open={open}
        onOpenChange={setOpen}
        trigger={<M.Button>打开弹窗</M.Button>}
        footer={
          <>
            <M.Button onClick={() => setOpen(false)}>取消</M.Button>
            <M.Button variant="solid" onClick={() => setOpen(false)}>
              完成
            </M.Button>
          </>
        }
      >
        {field}
      </M.Dialog>
    </div>
  );
}
