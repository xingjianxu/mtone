import React, { useState } from "react";
import {
  Typography,
  Text,
  Title,
  Paragraph,
  Link,
  Button,
} from "../../packages/mtone/src";

export function TypographyExample() {
  const [text, setText] = useState("点击铅笔，记录下一步工作。");
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <div
      style={{
        display: "grid",
        gap: 24,
        minWidth: 0,
        width: "100%",
        maxWidth: 640,
      }}
    >
      <section style={{ margin: 0 }}>
        <Title level={2}>让内容清晰、有层次</Title>
        <Paragraph>
          Typography 沿用 mtone
          的中性色、紧凑间距与细边框，适合工作台、笔记与产品文档。
        </Paragraph>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Text muted>次要说明</Text>
          <Text type="success">已完成</Text>
          <Text type="warning">待确认</Text>
          <Text type="danger">需要处理</Text>
          <Text disabled>不可用</Text>
        </div>
      </section>
      <section style={{ margin: 0 }}>
        <Title level={4}>文字修饰</Title>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Text strong>重点</Text>
          <Text italic>备注</Text>
          <Text underline>下划线</Text>
          <Text delete>旧内容</Text>
          <Text mark>标记</Text>
          <Text code>npm install @bixlab/mtone</Text>
          <Text keyboard>⌘ K</Text>
        </div>
      </section>
      <section style={{ margin: 0 }}>
        <Title level={4}>复制与编辑</Title>
        <Paragraph
          copyable={{
            onCopy: () => setMessage("已复制到剪贴板"),
            onError: () => setMessage("无法访问剪贴板，请手动选择文字复制。"),
          }}
        >
          团队空间 / 产品设计 / 发布计划
        </Paragraph>
        <Paragraph
          editable={{
            text,
            editing,
            onEditingChange: setEditing,
            onChange: setText,
            maxLength: 100,
          }}
        >
          {text}
        </Paragraph>
        <Text muted>
          Enter 保存，Shift + Enter 换行，Escape
          取消；失去焦点保存。这里只更新当前页面，不发送到服务器。
        </Text>
        <div role="status" style={{ minHeight: 24 }}>
          {message}
        </div>
      </section>
      <section style={{ margin: 0 }}>
        <Title level={4}>省略与展开</Title>
        <div style={{ maxWidth: 300 }}>
          <Text ellipsis>
            单行内容会在容器宽度不足时省略，请为容器设置可用宽度。
          </Text>
        </div>
        <Paragraph
          ellipsis={{
            rows: 2,
            expandable: true,
            expanded,
            onExpandedChange: setExpanded,
          }}
        >
          清晰的界面应该让人把注意力留给内容。我们使用克制的色彩、适度的留白和一致的交互，让信息自然形成层次。长段落可以先显示摘要，再由读者展开阅读。此示例采用
          CSS
          行数裁切，不计算文字溢出，因此展开按钮始终可见。调整窗口宽度可以观察内容的自然换行。
        </Paragraph>
        <Button size="sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? "从外部收起" : "从外部展开"}
        </Button>
      </section>
      <section style={{ margin: 0 }}>
        <Typography.Title level={4}>链接与语义标题</Typography.Title>
        <Typography.Paragraph>
          Title 支持 h1 到 h6；请选择符合页面结构的层级，而不只按字号选择。
        </Typography.Paragraph>
        <Link href="#/components/Button">查看 Button 文档</Link>
        {" · "}
        <Link href="#/components/Typography" disabled>
          暂不可用
        </Link>
      </section>
    </div>
  );
}
