import * as React from "react";
import { Button, Typography } from "../../../packages/mtone/src";
import { CodeTokens } from "../../../packages/mtone/src/typography-code-tokens";
import { source, tokens } from "../typography-code-sample";

const liveSource = `const items: string[] = ["文字", "代码"];

export const total = items.length;`;

export default function Demo() {
  const [enabled, setEnabled] = React.useState(false);
  return (
    <div style={{ display: "grid", gap: 12, minWidth: 0, width: "100%" }}>
      <Typography.Code block aria-label="预先着色的 TSX 示例">
        {tokens ? <CodeTokens tokens={tokens} /> : source}
      </Typography.Code>
      <div>
        <Button aria-pressed={enabled} onClick={() => setEnabled(!enabled)}>
          实时语法高亮
        </Button>
      </div>
      <Typography.Code
        block
        language={enabled ? "ts" : undefined}
        aria-label="可切换高亮的 TS 示例"
      >
        {liveSource}
      </Typography.Code>
    </div>
  );
}
