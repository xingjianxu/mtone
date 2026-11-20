import { Card, CardGroup } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <CardGroup direction="vertical" gap={20} divided>
      <Card title="第一步" size="small">
        收集与整理资料。
      </Card>
      <Card title="第二步" size="small" collapsible>
        提炼关键结论，并保留可追溯的笔记。
      </Card>
    </CardGroup>
  );
}
