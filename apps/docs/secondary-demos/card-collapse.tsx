import { useState } from "react";
import { Button, Card, Input, Text } from "../../../packages/mtone/src";

export default function Demo() {
  const [collapsed, setCollapsed] = useState(false);
  const [draft, setDraft] = useState("折叠后仍保留的笔记");
  return (
    <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 560 }}>
      <Card
        title="可折叠笔记"
        collapsible
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        extra={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "外部展开" : "外部收起"}
          </Button>
        }
      >
        <Input
          aria-label="卡片笔记"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <p style={{ marginBottom: 0 }}>
          点击标题旁箭头收起内容。输入状态会保留，标题与右侧操作始终可见。
        </p>
      </Card>
      <Card title="默认收起" collapsible defaultCollapsed size="small">
        <Text muted>这是非受控示例，第一次渲染默认收起。</Text>
      </Card>
    </div>
  );
}
