import { useRef } from "react";
import { Button, List, type ListHandle } from "../../../packages/mtone/src";
const records = Array.from({ length: 10000 }, (_, id) => ({
  id,
  title: `记录 ${id + 1}`,
  group: `分组 ${Math.floor(id / 100) + 1}`,
}));
const getKey = (item: (typeof records)[number]) => item.id;

export default function Demo() {
  const ref = useRef<ListHandle>(null);
  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button onClick={() => ref.current?.scrollTo({ key: 4999 })}>
          跳至第 5000 条
        </Button>
        <Button onClick={() => ref.current?.scrollTo(0)}>回到顶部</Button>
      </div>
      <List
        ref={ref}
        aria-label="虚拟列表"
        tabIndex={0}
        items={records}
        getKey={getKey}
        renderItem={(item) => item.title}
        height={240}
        virtual
        estimatedItemHeight={36}
      />
    </div>
  );
}
