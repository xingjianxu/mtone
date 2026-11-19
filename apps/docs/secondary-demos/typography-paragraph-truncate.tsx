import { useState } from "react";

import { Typography, Button } from "../../../packages/mtone/src";

export default function Demo() {
  const [expanded, setExpanded] = useState(false);
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
    </div>
  );
}
