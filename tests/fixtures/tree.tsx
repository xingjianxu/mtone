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
  const guides = [{
    id: "guide-root", label: "Guide root", children: [
      { id: "guide-folder", label: "Guide folder", children: [
        { id: "guide-first", label: "Guide first" },
        { id: "guide-last", label: "Guide last" },
      ] },
      { id: "guide-sibling", label: "Guide sibling" },
    ],
  }, { id: "guide-root-leaf", label: "Guide root leaf" }];
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
        <Tree label="Height only" itemHeight={38} gap={0} items={basic} defaultExpandAll showLine />
        <Tree
          label="Height with nonvirtual scrolling"
          height={100}
          virtual={false}
          itemHeight={36.5}
          gap={3.5}
          items={basic}
          defaultExpandAll
          showLine
          actions={() => ({ content: <Button size="sm" aria-label="Height demo action">A</Button> })}
        />
        <Tree label="Minimum height" itemHeight={10} items={basic}
          actions={() => ({ content: <Button size="sm" aria-label="Compact action">A</Button> })}
        />
        <Tree label="Invalid height" itemHeight={Number.NaN} items={basic} />
        <Tree label="Default virtual height" height={100} items={basic} defaultExpandAll />
        <Tree label="Guide LTR" indent={26} gap={2} items={guides} defaultExpandAll showLine />
        <Tree label="Guide RTL" dir="rtl" indent={21.5} gap={3.5} itemHeight={36.5} height={120}
          items={guides} defaultExpandAll showLine />
        <Tree label="Guide zero" indent={0} gap={0} itemHeight={24} items={guides} defaultExpandAll showLine />
        <DocumentNavigationDemo />
        <NodeActionsDemo />
      </main>
    </MtoneProvider>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
