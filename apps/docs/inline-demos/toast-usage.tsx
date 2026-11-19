import React from "react";
import { Button, ToastProvider, useToast } from "../../../packages/mtone/src";

function Actions() {
  const toast = useToast();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Button
        onClick={() => toast.success({ title: "已保存", body: "文档已同步。" })}
      >
        成功通知
      </Button>
      <Button
        onClick={() => toast.error({ title: "未保存", body: "请重试。" })}
      >
        失败通知
      </Button>
      <Button
        onClick={() =>
          toast.info({ title: "同步中", body: "后台任务正在运行。" })
        }
      >
        普通通知
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
