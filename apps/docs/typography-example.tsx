import React, { useId, useState } from "react";
import { Quote } from "lucide-react";
import {
  typographySections,
  typographySectionId,
  componentDocHref,
  handleTypographyNavigation,
} from "./typography-navigation";
import TypographyCodeDemo from "./secondary-demos/typography-code";
import { Typography, Button } from "../../packages/mtone/src";

function DemoSection({
  name,
  code,
  children,
}: {
  name: string;
  code: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <section
      id={typographySectionId(name.split(" ")[0])}
      tabIndex={-1}
      aria-labelledby={id}
      style={{ margin: 0, minWidth: 0, scrollMarginTop: 72 }}
    >
      <h3 id={id} style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600 }}>
        {name}
      </h3>
      {children}
      <details style={{ marginTop: 12 }}>
        <summary style={{ cursor: "pointer", fontSize: 12 }}>
          查看 {name.split(" ")[0]} 用法
        </summary>
        <pre style={{ overflowX: "auto", fontSize: 12 }}>
          <code>{code}</code>
        </pre>
      </details>
    </section>
  );
}

export function TypographyExample() {
  const [text, setText] = useState("点击铅笔，记录下一步工作。");
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <div
      style={{
        display: "grid",
        gap: 28,
        minWidth: 0,
        width: "100%",
        maxWidth: 640,
      }}
    >
      <p style={{ margin: 0 }}>
        Typography 包含 Title、Text、Paragraph、Link 和
        Blockquote、Code。Code 通过 Typography 命名空间使用。
      </p>
      <nav className="typography-subnav" aria-label="Typography 子组件">
        {typographySections.map(({ name }) => (
          <a
            key={name}
            href={componentDocHref(name)}
            onClick={(event) => handleTypographyNavigation(event, name)}
          >
            {name}
          </a>
        ))}
      </nav>
      <DemoSection
        name="Title 标题"
        code={
          "<Typography.Title level={2}>工作笔记</Typography.Title>\n<Typography.Title level={2} divider={false}>不带分隔线</Typography.Title>\n<Typography.Title level={3} divider>带分隔线的三级标题</Typography.Title>"
        }
      >
        <p>level 对应 h1 到 h6；请选择符合页面结构的层级，而不只按字号选择。</p>
        {([1, 2, 3, 4, 5, 6] as const).map((level) => (
          <Typography.Title key={level} level={level}>
            H{level} · 让内容清晰、有层次
          </Typography.Title>
        ))}
        <p>
          二级标题默认带整行分隔线。使用 divider
          可为其他层级开启分隔线，或为二级标题关闭。它不改变文字本身的下划线。
        </p>
        <Typography.Title level={2} divider={false}>
          H2 · 关闭分隔线
        </Typography.Title>
        <Typography.Title level={3} divider>
          H3 · 开启分隔线
        </Typography.Title>
      </DemoSection>
      <DemoSection
        name="Text 文本"
        code={
          '<Typography.Text muted>次要说明</Typography.Text>\n<Typography.Text type="success">已完成</Typography.Text>\n<Typography.Text strong>重点</Typography.Text>\n<Typography.Text code>npm install @bixlab/mtone</Typography.Text>\n<div style={{ maxWidth: 300 }}>\n  <Typography.Text ellipsis>较长的单行内容……</Typography.Text>\n</div>'
        }
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Typography.Text>普通文本</Typography.Text>
          <Typography.Text muted>次要说明</Typography.Text>
          <Typography.Text type="success">已完成</Typography.Text>
          <Typography.Text type="warning">待确认</Typography.Text>
          <Typography.Text type="danger">需要处理</Typography.Text>
          <Typography.Text disabled>不可用</Typography.Text>
        </div>
        <h4>文字修饰</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Typography.Text strong>重点</Typography.Text>
          <Typography.Text italic>备注</Typography.Text>
          <Typography.Text underline>下划线</Typography.Text>
          <Typography.Text delete>旧内容</Typography.Text>
          <Typography.Text mark>标记</Typography.Text>
          <Typography.Text code>npm install @bixlab/mtone</Typography.Text>
          <Typography.Text keyboard>⌘ K</Typography.Text>
        </div>
        <h4>单行省略</h4>
        <div style={{ maxWidth: 300 }}>
          <Typography.Text ellipsis>
            单行内容会在容器宽度不足时省略，请为容器设置可用宽度。
          </Typography.Text>
        </div>
      </DemoSection>
      <DemoSection
        name="Paragraph 段落"
        code={
          "<Typography.Paragraph>正文段落</Typography.Paragraph>\n<Typography.Paragraph copyable>可复制内容</Typography.Paragraph>\n<Typography.Paragraph editable={{ text, onChange: setText }}>\n  {text}\n</Typography.Paragraph>\n<Typography.Paragraph ellipsis={{ rows: 2, expandable: true }}>\n  较长的正文……\n</Typography.Paragraph>"
        }
      >
        <Typography.Paragraph>
          Typography 沿用 mtone
          的中性色、紧凑间距与细边框，适合工作台、笔记与产品文档。
        </Typography.Paragraph>
        <h4>复制与编辑</h4>
        <Typography.Paragraph
          copyable={{
            onCopy: () => setMessage("已复制到剪贴板"),
            onError: () => setMessage("无法访问剪贴板，请手动选择文字复制。"),
          }}
        >
          团队空间 / 产品设计 / 发布计划
        </Typography.Paragraph>
        <Typography.Paragraph
          editable={{
            text,
            editing,
            onEditingChange: setEditing,
            onChange: setText,
            maxLength: 100,
          }}
        >
          {text}
        </Typography.Paragraph>
        <p>
          Enter 保存，Shift + Enter 换行，Escape
          取消；失去焦点保存。这里只更新当前页面，不发送到服务器。
        </p>
        <div role="status" style={{ minHeight: 24 }}>
          {message}
        </div>
        <h4>多行省略与受控展开</h4>
        <Typography.Paragraph
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
        </Typography.Paragraph>
        <Button size="sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? "从外部收起" : "从外部展开"}
        </Button>
      </DemoSection>
      <DemoSection
        name="Link 链接"
        code={
          '<Typography.Link href="#/components/Button">查看 Button 文档</Typography.Link>\n<Typography.Link href="/unavailable" disabled>暂不可用</Typography.Link>'
        }
      >
        <Typography.Link href="#/components/Button">
          查看 Button 文档
        </Typography.Link>
        {" · "}
        <Typography.Link href="#/components/Typography" disabled>
          暂不可用
        </Typography.Link>
      </DemoSection>
      <DemoSection
        name="Blockquote 引用"
        code={
          '<Typography.Blockquote cite="— mtone 设计笔记">\n  让内容成为主角。\n</Typography.Blockquote>\n<Typography.Blockquote\n  icon={<Quote />} iconSize={28} color="var(--mt-focus, #5378aa)"\n  radius={4} textWrap="balance"\n  cite={<Typography.Link href="/source">阅读来源</Typography.Link>}\n  citeUrl="/source"\n>\n  用克制的色彩与一致的间距建立层次。\n</Typography.Blockquote>'
        }
      >
        <div style={{ display: "grid", gap: 20 }}>
          <Typography.Blockquote>
            让内容成为主角。默认无图标和署名，使用中性灰底和细左边框。
          </Typography.Blockquote>
          <Typography.Blockquote cite="— mtone 设计笔记">
            减少装饰，不减少信息。署名可包含作者、作品名称或来源链接。
          </Typography.Blockquote>
          <Typography.Blockquote
            icon={<Quote />}
            color="var(--mt-focus, #5378aa)"
            radius={4}
            textWrap="balance"
            cite={
              <Typography.Link href="#/components/Typography">
                mtone 排版指南
              </Typography.Link>
            }
            citeUrl="#/components/Typography"
          >
            用克制的色彩与一致的间距建立层次。图标是装饰元素，正文支持 React
            内容。
          </Typography.Blockquote>
        </div>
        <p>
          cite 是可见署名，citeUrl 是原生 blockquote 的来源 URL。color 接受 CSS
          颜色；不设置时沿用主题中性色。radius、iconSize 支持数字（px）或 CSS
          长度。
        </p>
      </DemoSection>
      <DemoSection
        name="Code 代码"
        code={'<Typography.Code>npm test</Typography.Code>\n<Typography.Code block aria-label="配置示例">{source}</Typography.Code>'}
      >
        <TypographyCodeDemo />
      </DemoSection>
    </div>
  );
}
