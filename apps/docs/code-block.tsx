import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Typography } from "../../packages/mtone/src";

export function CodeBlock({ code, language, highlight = true }: {
  code: string;
  language?: string;
  highlight?: boolean;
}) {
  const [status, setStatus] = useState("");
  return (
    <div className="code-box">
      <div className="code-head">
        <span>{language?.toUpperCase() ?? "代码"}</span>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setStatus("已复制");
            } catch {
              setStatus("复制失败，请手动选择代码");
            }
          }}
          aria-label="复制代码"
        >
          {status === "已复制" ? <Check size={14} /> : <Copy size={14} />}{" "}
          {status || "复制"}
        </button>
      </div>
      <Typography.Code block language={highlight ? language : undefined} tabIndex={0}>{code}</Typography.Code>
      <span className="sr-only" role="status">
        {status}
      </span>
    </div>
  );
}

export function DemoSource({ code }: { code: string }) {
  const [hasOpened, setHasOpened] = useState(false);
  return (
    <details className="component-demo-source" onToggle={(event) => {
      if (event.currentTarget.open) setHasOpened(true);
    }}>
      <summary>查看代码</summary>
      <CodeBlock code={code} language="tsx" highlight={hasOpened} />
    </details>
  );
}
