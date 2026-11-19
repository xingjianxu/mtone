import { useRef, useState } from "react";
import { Button, List } from "../../../packages/mtone/src";
export default function Demo() {
  const [order, setOrder] = useState(["设计规范", "研究笔记", "项目归档"]);
  const dragged = useRef<string | null>(null);
  const move = (from: number, to: number) =>
    setOrder((previous) => {
      if (from < 0 || to < 0 || to >= previous.length || from === to)
        return previous;
      const next = [...previous];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <p>拖动条目左侧的手柄，或使用上移、下移按钮，排序由外部状态维护。</p>
      <List
        aria-label="排序列表"
        items={order}
        getKey={(item) => item}
        renderItem={(item, index) => (
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (dragged.current !== null)
                move(order.indexOf(dragged.current), index);
              dragged.current = null;
            }}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <List.SortHandle
              onDragStart={(event) => {
                dragged.current = item;
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", item);
              }}
              onDragEnd={() => {
                dragged.current = null;
              }}
            />
            <span style={{ flex: 1 }}>{item}</span>
            <Button
              size="sm"
              disabled={!index}
              aria-label={`${item}上移`}
              onClick={() => move(index, index - 1)}
            >
              上移
            </Button>
            <Button
              size="sm"
              disabled={index === order.length - 1}
              aria-label={`${item}下移`}
              onClick={() => move(index, index + 1)}
            >
              下移
            </Button>
          </div>
        )}
      />
    </div>
  );
}
