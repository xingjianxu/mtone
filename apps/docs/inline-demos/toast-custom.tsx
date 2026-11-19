import React, { useState } from "react";
import { Button, ToastProvider, useToast } from "../../../packages/mtone/src";

function Actions() {
  const toast = useToast();
  const [id, setId] = useState<string>();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Button
        onClick={() =>
          setId(
            toast.add({
              title: "持久通知",
              timeout: 0,
              children: <strong>需要手动关闭。</strong>,
            }),
          )
        }
      >
        自定义正文
      </Button>
      <Button
        disabled={!id}
        onClick={() =>
          id &&
          toast.update(id, {
            title: "已更新",
            type: "success",
            position: "top-right",
          })
        }
      >
        更新最后一条
      </Button>
      <Button
        onClick={() => {
          toast.close();
          setId(undefined);
        }}
      >
        关闭全部
      </Button>
    </div>
  );
}

export default function Demo() {
  return (
    <ToastProvider limit={3}>
      <Actions />
    </ToastProvider>
  );
}
