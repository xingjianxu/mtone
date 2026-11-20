import { Card, CardGroup, Text } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <CardGroup>
      {["研究笔记", "设计资源", "项目归档"].map((title) => (
        <Card key={title} title={title} size="small">
          <Text muted>每一项都是独立 Card。</Text>
        </Card>
      ))}
    </CardGroup>
  );
}
