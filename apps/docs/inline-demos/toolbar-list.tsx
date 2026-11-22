import { useState } from "react";
import { Ellipsis, FileText, Folder, LayoutGrid, List as ListIcon, Plus } from "lucide-react";
import { Button, ButtonGroup, Card, Input, List, ListItem, Popover, Text, Toolbar } from "../../../packages/mtone/src";

const initialDocuments = [
  { id: 1, name: "设计规范", kind: "资料库" },
  { id: 2, name: "交互验收清单", kind: "文档" },
  { id: 3, name: "发布记录", kind: "文档" },
];
const categories = ["全部分类", "资料库", "文档"];

export default function Demo() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [grid, setGrid] = useState(false);
  const shown = documents.filter((item) =>
    item.name.includes(query.trim()) && (category === categories[0] || item.kind === category),
  );

  function addDocument() {
    setDocuments((current) => [...current, { id: Math.max(0, ...current.map(({ id }) => id)) + 1, name: "未命名资料", kind: "文档" }]);
    setQuery("");
    setCategory(categories[0]);
  }

  return (
    <div style={{ width: "100%", minWidth: 0, border: "1px solid var(--mt-border)", borderRadius: 8 }}>
      <Toolbar
        aria-label="资料列表操作"
        background="gray"
        search={<Input.Search aria-label="搜索资料" placeholder="搜索资料" value={query} onChange={(event) => setQuery(event.target.value)} />}
        start={<Popover.Menu trigger={category === categories[0] ? "分类" : category} items={categories.map((key) => ({ key, label: key }))} onSelect={setCategory} />}
        end={<>
          <ButtonGroup connected aria-label="资料视图">
            <Button iconOnly toggle pressed={!grid} aria-label="列表视图" onClick={() => setGrid(false)}><ListIcon size={16} aria-hidden="true" /></Button>
            <Button iconOnly toggle pressed={grid} aria-label="卡片视图" onClick={() => setGrid(true)}><LayoutGrid size={16} aria-hidden="true" /></Button>
          </ButtonGroup>
          <Button variant="solid" leftSection={<Plus size={16} aria-hidden="true" />} onClick={addDocument}>添加资料</Button>
        </>}
      />
      {grid ? (
        <div style={{ display: "grid", gap: 8, padding: 12, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 130px), 1fr))" }}>
          {shown.map((item) => <Card key={item.id} title={item.name}>{item.kind}</Card>)}
        </div>
      ) : (
        <List aria-label="资料" style={{ margin: 0 }}>
          {shown.map((item) => (
            <ListItem key={item.id} icon={item.kind === "资料库" ? <Folder size={16} aria-hidden="true" /> : <FileText size={16} aria-hidden="true" />}
              actions={<>
                <Text muted>{item.kind}</Text>
                <Popover.Menu
                  trigger={<Button iconOnly variant="ghost" aria-label={`${item.name}的操作`}><Ellipsis size={16} aria-hidden="true" /></Button>}
                  items={[{ key: "remove", label: "从列表移除" }]}
                  onSelect={() => setDocuments((current) => current.filter(({ id }) => id !== item.id))}
                />
              </>}
            >{item.name}</ListItem>
          ))}
        </List>
      )}
    </div>
  );
}
