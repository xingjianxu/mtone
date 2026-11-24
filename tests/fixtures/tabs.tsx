import React, { useState } from "react";
import { FileText } from "lucide-react";
import { createRoot } from "react-dom/client";
import { Tabs, Card, MtoneProvider } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
function App() {
  const [items, setItems] = useState(
    Array.from({ length: 15 }, (_, n) => ({
      value: String(n),
      label: `Document ${n}`,
      content: (
        <input
          style={{ maxWidth: "100%", boxSizing: "border-box" }}
          aria-label={`Draft ${n}`}
        />
      ),
    })),
  );
  const [placement, setPlacement] = useState<
    "top" | "bottom" | "start" | "end"
  >("top");
  return (
    <MtoneProvider locale="en">
      <main style={{ maxWidth: 700, margin: "auto", minWidth: 0 }}>
        <select
          aria-label="Placement"
          value={placement}
          onChange={(e) => setPlacement(e.target.value as typeof placement)}
        >
          {["top", "bottom", "start", "end"].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <Tabs
          label="Documents"
          items={items}
          variant="editable-card"
          placement={placement}
          destroyOnHidden={false}
          reorderable
          onOrderChange={(keys) =>
            setItems(keys.map((k) => items.find((i) => i.value === k)!))
          }
          onEdit={(action, key) =>
            action === "remove"
              ? setItems(items.filter((i) => i.value !== key))
              : setItems([
                  ...items,
                  {
                    value: `new-${items.length}`,
                    label: "New document",
                    content: (
                      <input
                        style={{ maxWidth: "100%", boxSizing: "border-box" }}
                        aria-label="New draft"
                      />
                    ),
                  },
                ])
          }
        />
        <div data-testid="nested">
          <Tabs
            placement="start"
            variant="card"
            size="large"
            items={[
              {
                value: "outer",
                label: "Outer",
                content: (
                  <Tabs
                    label="Nested"
                    items={[
                      {
                        value: "inner",
                        label: "Inner",
                        content: "Nested content",
                      },
                    ]}
                  />
                ),
              },
            ]}
          />
        </div>
        <Tabs
          dir="rtl"
          label="RTL"
          items={[
            { value: "r1", label: "First RTL", content: "First" },
            { value: "r2", label: "Second RTL", content: "Second" },
          ]}
        />
        <Card
          title="Card integration"
          tabList={[
            { key: "a", label: "Card A", content: "A contents" },
            { key: "b", label: "Card B", content: "B contents" },
          ]}
        />
      </main>
    </MtoneProvider>
  );
}
function SizeFixture() {
  return <MtoneProvider locale="en"><main>
{(["line", "card", "editable-card", "attached"] as const).flatMap(variant =>
  (["sm", "md", "lg"] as const).flatMap(size =>
    (["top", "bottom", "start", "end"] as const).map(placement =>
      <Tabs key={`${variant}-${size}-${placement}`} data-testid={`preset-${variant}-${size}-${placement}`}
        label={`${variant} ${size} ${placement} preset`} variant={variant} size={size} placement={placement}
        onEdit={() => {}} items={[
          { value: "a", label: "First", icon: <FileText />, content: "First panel" },
          { value: "b", label: "Second", content: "Second panel" },
        ]} />
    )
  )
)}
<Tabs size="lg" label="Outer lg" items={[{value:"outer",label:"Outer lg tab",content:
  <Tabs label="Inner default" items={[{value:"inner",label:"Inner default tab",content:"Nested"}]}/>
}]}/>
  </main></MtoneProvider>;
}
createRoot(document.getElementById("root")!).render(
  new URLSearchParams(location.search).has("sizes") ? <SizeFixture /> : <App />,
);
