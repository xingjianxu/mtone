import React from "react";
import { createRoot } from "react-dom/client";
import {
  Tree,
  MtoneProvider,
  Button,
  type TreeItem,
  type TreeRef,
} from "../../packages/mtone/src";
import NodeActionsDemo from "../../apps/docs/secondary-demos/tree-node-actions";
import DocumentNavigationDemo from "../../apps/docs/secondary-demos/tree-document-navigation";
import "../../packages/mtone/dist/styles.css";
function App() {
  const [items, setItems] = React.useState<TreeItem[]>([
    { id: "async", label: "Async", isLeaf: false },
  ]);
  const [drop, setDrop] = React.useState("");
  const ref = React.useRef<TreeRef>(null);
  const basic = [
    {
      id: "p",
      label: "Parent",
      children: [
        { id: "a", label: "Alpha" },
        { id: "b", label: "Beta" },
      ],
    },
    { id: "z", label: "Last" },
  ];
  return (
    <MtoneProvider locale="en">
      <main style={{ display: "grid", gap: 20, minWidth: 0 }}>
        <Tree
          label="Checked"
          items={basic}
          multiple
          defaultSelectedKeys={["a", "b"]}
          checkable
          defaultExpandAll
          showLine
        />
        <Tree directory label="Directory" items={basic} multiple />
        <Tree
          label="Async tree"
          items={items}
          loadData={async () => {
            await new Promise((r) => setTimeout(r, 50));
            setItems([
              {
                id: "async",
                label: "Async",
                children: [{ id: "child", label: "Loaded", isLeaf: true }],
              },
            ]);
          }}
        />
        <Tree
          label="Drag tree"
          items={basic}
          defaultExpandAll
          draggable
          actions={({ node }) => node.id === "a" ? {
            content: <Button type="button" size="sm" variant="ghost">Drag row action</Button>,
          } : undefined}
          onDrop={(info) => setDrop(`${info.dragNode.id}:${info.node.id}`)}
        />
        <output>{drop}</output>
        <Button
          onClick={() => ref.current?.scrollTo({ key: "900", align: "top" })}
        >
          Scroll to 900
        </Button>
        <Tree
          ref={ref}
          label="Virtual"
          height={150}
          itemHeight={34}
          gap={5.5}
          multiple
          defaultSelectedKeys={["900", "901"]}
          items={Array.from({ length: 1001 }, (_, i) => ({
            id: String(i),
            label: `Node ${i}`,
          }))}
        />
        <Tree
          label="Long"
          items={[{ id: "long", label: "LongLabel".repeat(80) }]}
        />
        <Tree label="Tight gap" gap={0} items={basic} defaultExpandAll showLine />
        <DocumentNavigationDemo />
        <NodeActionsDemo />
      </main>
    </MtoneProvider>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
