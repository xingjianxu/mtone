import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, MtoneProvider } from "../../packages/mtone/src";
import { DataList, type DataListKey } from "../../packages/mtone/src/data-list";
import "../../packages/mtone/dist/styles.css";
const items = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Beta" },
  { id: "c", name: "Gamma" },
  { id: "d", name: "Locked", disabled: true },
  { id: "e", name: "Epsilon" },
];
function Fixture() {
  const [selected, setSelected] = useState<readonly DataListKey[]>([]);
  const [action, setAction] = useState("none");
  const [remotePage, setRemotePage] = useState(1);
  const [remoteQuery, setRemoteQuery] = useState("");
  return (
    <MtoneProvider locale="en">
      <main style={{ maxWidth: 760, margin: "0 auto", padding: 12 }}>
        <section data-testid="local">
          <h1>Local list</h1>
          <button data-testid="before">Before list</button>
          <DataList
            items={items}
            getKey={(item) => item.id}
            getLabel={(item) => item.name}
            renderItem={(item) => (
              <div>
                <strong>{item.name}</strong>
                <p style={{ margin: 0 }}>
                  LongUnbrokenContentForResponsiveLayoutTestingWithoutSpaces012345678901234567890123456789
                </p>
              </div>
            )}
            search={{
              label: "Find records",
              placeholder: "Filter by name",
              match: (item, query) =>
                item.name.toLowerCase().includes(query.toLowerCase()),
            }}
            filters={<Button>Filter records</Button>}
            toolbar={<Button>Create record</Button>}
            pagination={{ pageSize: 2 }}
            selection={{
              selectedKeys: selected,
              onChange: setSelected,
              getDisabled: (item) => !!item.disabled,
            }}
            expansion={{
              renderDetail: (item) => <p>Details for {item.name}</p>,
            }}
            renderActions={(item) => (
              <Button onClick={() => setAction(item.id)}>
                Open {item.name}
              </Button>
            )}
            renderBatchActions={({ selectedKeys, clearSelection }) => (
              <>
                <span data-testid="batch-count">
                  Batch {selectedKeys.length}
                </span>
                <Button onClick={clearSelection}>Reset batch</Button>
              </>
            )}
          />
          <output data-testid="selection">
            {selected.join(",") || "none"}
          </output>
          <output data-testid="action">{action}</output>
        </section>
        <section data-testid="remote">
          <h2>Remote list</h2>
          <DataList
            items={[
              { id: `remote-${remotePage}`, name: `Remote page ${remotePage}` },
            ]}
            getKey={(item) => item.id}
            getLabel={(item) => item.name}
            renderItem={(item) => item.name}
            search={{
              value: remoteQuery,
              onChange: setRemoteQuery,
              label: "Remote query",
              match: () => false,
            }}
            pagination={{
              mode: "remote",
              page: remotePage,
              pageSize: 1,
              total: 3,
              onPageChange: setRemotePage,
            }}
          />
          <output data-testid="remote-page">{remotePage}</output>
        </section>
        <section data-testid="loading">
          <h2>Loading state</h2>
          <DataList
            items={[]}
            getKey={(item: { id: string }) => item.id}
            renderItem={() => null}
            loading
          />
        </section>
        <section data-testid="empty">
          <h2>Empty state</h2>
          <DataList
            items={[]}
            getKey={(item: { id: string }) => item.id}
            renderItem={() => null}
            empty="No records available"
          />
        </section>
      </main>
    </MtoneProvider>
  );
}
createRoot(document.getElementById("root")!).render(<Fixture />);
