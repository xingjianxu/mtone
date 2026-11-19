import React from "react";
import { Input, Text } from "../../../packages/mtone/src";

export default function Demo() {
  const [query, setQuery] = React.useState("");
  const [result, setResult] = React.useState("");
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Input.Search
        aria-label="搜索文档"
        placeholder="搜索文档…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        allowClear
        searchButton="搜索"
        onSearch={setResult}
      />
      <Text muted>最近搜索：{result || "尚未搜索"}</Text>
    </div>
  );
}
