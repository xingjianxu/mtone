import { useState } from "react";
import { Button, List } from "../../../packages/mtone/src";
export default function Demo() {
  const [order, setOrder] = useState(["设计规范", "研究笔记", "项目归档"]);
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
      <p>从条目起始侧的六点手柄拖动，整行沿列表移动，相邻条目会让出插入位置。松手才提交排序；也可用上移、下移按钮。</p>
      <List
        aria-label="排序列表"
        items={order}
        getKey={(item) => item}
        onReorder={move}
        renderItem={(item, index) => (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <List.SortHandle />
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
