import { List } from "../../../packages/mtone/src";
const records = Array.from({ length: 10000 }, (_, id) => ({
  id,
  title: `记录 ${id + 1}`,
  group: `分组 ${Math.floor(id / 100) + 1}`,
}));
const getKey = (item: (typeof records)[number]) => item.id;
const groupBy = (item: (typeof records)[number]) => item.group;

export default function Demo() {
  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <List
        aria-label="分组列表"
        tabIndex={0}
        items={records.slice(0, 400)}
        getKey={getKey}
        groupBy={groupBy}
        stickyGroups
        renderGroup={(key, items) => (
          <span>
            {key} · {items.length} 条
          </span>
        )}
        height={200}
        virtual
        renderItem={(item) => item.title}
      />
    </div>
  );
}
