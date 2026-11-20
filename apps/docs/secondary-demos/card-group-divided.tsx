import { Card, CardGroup, Text } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <CardGroup columns={{ xs: 2, md: 3 }} gap={{ xs: 16, md: 24 }} divided>
      {["资料", "笔记", "任务", "成员", "标签", "动态"].map((title) => (
        <Card key={title} title={title} size="small" variant="borderless">
          <Text muted>分隔线随当前行列布局调整。</Text>
        </Card>
      ))}
    </CardGroup>
  );
}
