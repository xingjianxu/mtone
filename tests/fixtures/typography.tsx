import * as React from "react";
import { createRoot } from "react-dom/client";
import { Quote } from "lucide-react";
import { MtoneProvider, Typography } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
import "../../apps/docs/site.css";
const long = "Typography 保持紧凑且清晰的文字层级。".repeat(20);
createRoot(document.getElementById("root")!).render(
  <MtoneProvider>
    <main style={{ padding: 24, width: 320 }}>
      <Typography.Title level={2}>Typography</Typography.Title>
      <Typography.Paragraph
        data-testid="clamp"
        ellipsis={{ rows: 2, expandable: true }}
      >
        {long}
      </Typography.Paragraph>
      <Typography.Text data-testid="single" ellipsis style={{ width: 180 }}>
        {long}
      </Typography.Text>
      <Typography.Paragraph editable>Editable text</Typography.Paragraph>
      <Typography.Link data-testid="danger-link" type="danger" href="#end">
        Next link
      </Typography.Link>
      <Typography.Blockquote data-testid="quote-default" cite="— 设计笔记">
        让内容成为主角。
      </Typography.Blockquote>
      <Typography.Blockquote
        data-testid="quote-icon"
        icon={<Quote />}
        color="#448361"
        cite="— mtone"
        style={{ marginTop: 28 }}
      >
        引用块的图标保持紧凑，并为上方的图标预留空间。
      </Typography.Blockquote>
      <Typography.Blockquote
        data-testid="quote-rtl"
        dir="rtl"
        icon={<Quote />}
        style={{ marginTop: 28 }}
      >
        اقتباس باللغة العربية
      </Typography.Blockquote>
    </main>
  </MtoneProvider>,
);
