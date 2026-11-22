import { useState } from "react";
import { Button, Input, Popover, Text, Toolbar } from "../../../packages/mtone/src";

const scopes = ["全部", "我的", "团队"];
const initialSummary = "全部 · 无关键词";

export default function Demo() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState(scopes[0]);
  const [summary, setSummary] = useState(initialSummary);

  return (
    <div style={{ width: "100%", minWidth: 0, display: "grid", gap: 8 }}>
      <Toolbar
        aria-label="查找操作"
        background="gray"
        search={<Input.Search aria-label="关键词" placeholder="输入关键词" value={query} onChange={(event) => setQuery(event.target.value)} />}
        start={<Popover.Menu trigger={scope} items={scopes.map((key) => ({ key, label: key }))} onSelect={setScope} />}
        end={<>
          <Button onClick={() => { setQuery(""); setScope(scopes[0]); setSummary(initialSummary); }}>重置</Button>
          <Button variant="solid" onClick={() => setSummary(`${scope} · ${query.trim() || "无关键词"}`)}>应用</Button>
        </>}
      />
      <Text muted role="status">当前条件：{summary}</Text>
    </div>
  );
}
