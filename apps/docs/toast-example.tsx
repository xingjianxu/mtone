import React, { useState } from "react";
import {
  Button,
  Input,
  Select,
  Text,
  useToast,
} from "../../packages/mtone/src";

type Position =
  | "top-right"
  | "bottom-right"
  | "top-left"
  | "bottom-left"
  | "top-center"
  | "bottom-center"
  | "center"
  | "center-top";
const positions: { value: Position; label: string }[] = [
  { value: "top-right", label: "右上" },
  { value: "bottom-right", label: "右下" },
  { value: "top-left", label: "左上" },
  { value: "bottom-left", label: "左下" },
  { value: "top-center", label: "顶部居中" },
  { value: "bottom-center", label: "底部居中" },
  { value: "center", label: "正中" },
  { value: "center-top", label: "中间偏上" },
];
const row: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  alignItems: "center",
};

export function ToastAction({ compact = false }: { compact?: boolean }) {
  const toast = useToast();
  const [position, setPosition] = useState<Position>("bottom-right");
  const [title, setTitle] = useState("更改已保存");
  const [body, setBody] = useState("文档已同步，可以继续编辑。");
  const [id, setId] = useState<string>();
  const [notice, setNotice] = useState("");
  const show = (type: "success" | "error" | "info") => {
    const next = toast[type]({ title, body, position });
    setId(next);
    setNotice(
      `已添加${type === "success" ? "成功" : type === "error" ? "失败" : "普通"}通知，可更改位置后更新此条通知。`,
    );
  };
  return (
    <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 580 }}>
      {!compact && (
        <>
          <label style={{ display: "grid", gap: 4 }}>
            标题
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            正文
            <Input
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </label>
          <div style={row}>
            <Text>显示位置</Text>
            <Select
              label="通知位置"
              options={positions}
              value={position}
              onValueChange={(value) => value && setPosition(value as Position)}
            />
          </div>
        </>
      )}
      <div style={row}>
        <Button onClick={() => show("success")}>成功通知</Button>
        <Button onClick={() => show("error")}>失败通知</Button>
        <Button onClick={() => show("info")}>普通通知</Button>
      </div>
      {!compact && (
        <>
          <div style={row}>
            <Button
              disabled={!id}
              onClick={() => {
                if (!id) return;
                toast.update(id, { title, body, position, type: "info" });
                setNotice(
                  "已更新最后一条通知。通知若已自动关闭，请先重新添加。",
                );
              }}
            >
              更新最后一条
            </Button>
            <Button
              onClick={() => {
                setId(
                  toast.add({
                    title: "自定义内容",
                    position,
                    timeout: 0,
                    children: (
                      <div>
                        <Text>也可以放入自定义正文。</Text>
                        <br />
                        <strong>此通知需手动关闭。</strong>
                      </div>
                    ),
                  }),
                );
                setNotice("已添加持久通知，timeout: 0 不会自动关闭。");
              }}
            >
              自定义正文
            </Button>
            <Button
              onClick={() => {
                toast.close();
                setId(undefined);
                setNotice("已关闭此示例中的全部通知。");
              }}
            >
              关闭全部
            </Button>
          </div>
          <Text muted>
            预设消息只需 title 和 body；所有位置共用最多 3
            条可见通知。此示例不发送网络请求。
          </Text>
          <div
            role="status"
            style={{
              fontSize: 12,
              color: "var(--mt-muted, #787774)",
              minHeight: 18,
            }}
          >
            {notice}
          </div>
        </>
      )}
    </div>
  );
}
