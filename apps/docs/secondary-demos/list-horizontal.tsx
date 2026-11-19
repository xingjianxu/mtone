import { List } from "../../../packages/mtone/src";
const records = Array.from({ length: 10000 }, (_, id) => ({
  id,
  title: `记录 ${id + 1}`,
  group: `分组 ${Math.floor(id / 100) + 1}`,
}));
const getKey = (item: (typeof records)[number]) => item.id;

export default function Demo() {
  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <List
        aria-label="横向列表"
        items={records.slice(0, 100)}
        getKey={getKey}
        height={160}
        virtual
        contentWidth={900}
        renderItem={(item) => (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr",
              gap: 24,
            }}
          >
            <span>{item.title}</span>
            <span>项目资料与长内容展示</span>
            <span>已归档</span>
          </div>
        )}
      />
    </div>
  );
}
