import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({ code }: { code: string }) {
  const [status, setStatus] = useState("");
  return (
    <div className="code-box">
      <div className="code-head">
        <span>TSX</span>
        <button
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
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
      <span className="sr-only" role="status">
        {status}
      </span>
    </div>
  );
}
