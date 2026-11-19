import { Button, List, ListItem, Badge } from "../../../packages/mtone/src";
const records = Array.from({ length: 10000 }, (_, id) => ({
  id,
  title: `记录 ${id + 1}`,
  group: `分组 ${Math.floor(id / 100) + 1}`,
}));
const getKey = (item: (typeof records)[number]) => item.id;

export default function Demo() {
  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <List aria-label="基础列表">
        <ListItem
          description="现有 children 和 ListItem 继续可用"
          actions={<Badge>文档</Badge>}
        >
          设计规范
        </ListItem>
        <ListItem description="用 actions 组合按钮">研究笔记</ListItem>
      </List>
      <List
        aria-label="富内容列表"
        items={records.slice(0, 3)}
        getKey={getKey}
        renderItem={(item, index) => (
          <div>
            <strong>{item.title}</strong>
            <p style={{ margin: "4px 0" }}>
              {"列表项可以有不同的内容高度。".repeat(index + 1)}
            </p>
            <Button size="sm">查看详情</Button>
          </div>
        )}
      />
    </div>
  );
}
