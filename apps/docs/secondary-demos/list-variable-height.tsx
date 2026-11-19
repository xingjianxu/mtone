import { useState } from "react";
import { Button, List } from "../../../packages/mtone/src";
const records = Array.from({ length: 10000 }, (_, id) => ({
  id,
  title: `记录 ${id + 1}`,
  group: `分组 ${Math.floor(id / 100) + 1}`,
}));
const getKey = (item: (typeof records)[number]) => item.id;

export default function Demo() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <Button onClick={() => setExpanded((value) => !value)}>
        切换首行高度
      </Button>
      <List
        aria-label="可变行高列表"
        items={records.slice(0, 100)}
        getKey={getKey}
        height={160}
        virtual
        overscan={5}
        renderItem={(item) => (
          <div style={{ minHeight: item.id === 0 && expanded ? 100 : 18 }}>
            {item.title}
          </div>
        )}
      />
    </div>
  );
}
