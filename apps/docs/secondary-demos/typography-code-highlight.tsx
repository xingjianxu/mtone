import * as React from "react";
import { Button, Input, Typography } from "../../../packages/mtone/src";
import { CodeTokens } from "../../../packages/mtone/src/typography-code-tokens";
import { source, tokens } from "../typography-code-sample";

const liveSource = `items = ["文字", "代码"]

for item in items:
    print(item)`;

export default function Demo() {
  const [language, setLanguage] = React.useState<string>();
  const [label, setLabel] = React.useState("示例");
  const vue = language === "vue";
  const vueSource = `<script setup lang="ts">
const label: string = ${JSON.stringify(label)};
</script>
<template><p>{{ label }}</p></template>`;
  return (
    <div style={{ display: "grid", gap: 12, minWidth: 0, width: "100%" }}>
      <Typography.Code block aria-label="预先着色的 TSX 示例">
        {tokens ? <CodeTokens tokens={tokens} /> : source}
      </Typography.Code>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Button aria-pressed={language === "py"} onClick={() => setLanguage(language === "py" ? undefined : "py")}>
          实时语法高亮
        </Button>
        <Button aria-pressed={vue} onClick={() => setLanguage(vue ? undefined : "vue")}>
          Vue 混合语法
        </Button>
      </div>
      {vue && (
        <Input aria-label="Vue 示例文字" value={label} onChange={(event) => setLabel(event.target.value)} />
      )}
      <Typography.Code
        block
        language={language}
        aria-label={vue ? "实时高亮的 Vue 示例" : "可切换高亮的 Python 示例"}
      >
        {vue ? vueSource : liveSource}
      </Typography.Code>
    </div>
  );
}
