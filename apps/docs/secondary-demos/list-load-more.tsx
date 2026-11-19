import { useEffect, useRef, useState } from "react";
import { List } from "../../../packages/mtone/src";
const records = Array.from({ length: 10000 }, (_, id) => ({
  id,
  title: `记录 ${id + 1}`,
  group: `分组 ${Math.floor(id / 100) + 1}`,
}));
const getKey = (item: (typeof records)[number]) => item.id;

export default function Demo() {
  const [count, setCount] = useState(30);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <p>示例最多加载 90 条；加载中和已通知状态不会重复请求。</p>
      <List
        aria-label="增量列表"
        tabIndex={0}
        items={records.slice(0, count)}
        getKey={getKey}
        height={180}
        virtual
        renderItem={(item) => item.title}
        loading={loading}
        onEndReached={
          count < 90
            ? () => {
                setLoading(true);
                timer.current = setTimeout(() => {
                  setCount((n) => Math.min(n + 30, 90));
                  setLoading(false);
                }, 400);
              }
            : undefined
        }
      />
      <small role="status">已加载 {count} 条</small>
    </div>
  );
}
