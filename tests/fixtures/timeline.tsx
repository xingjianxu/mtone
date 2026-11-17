import React from "react";
import { createRoot } from "react-dom/client";
import { Timeline, MtoneProvider } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
const items = [
  { title: "First", content: "Short" },
  { title: "Second", content: "Long".repeat(80), loading: true },
  { title: "Third", content: "Last", color: "red" },
];
function App() {
  const [reverse, setReverse] = React.useState(false);
  return (
    <MtoneProvider>
      <button onClick={() => setReverse(!reverse)}>Reverse</button>
      <main style={{ display: "grid", gap: 30, minWidth: 0 }}>
        <Timeline data-testid="vertical" items={items} reverse={reverse} />
        <Timeline data-testid="alternate" items={items} mode="alternate" />
        <Timeline
          data-testid="horizontal"
          items={items}
          orientation="horizontal"
          mode="alternate"
        />
        <Timeline
          data-testid="explicit"
          items={[{ content: "Right", placement: "end" }, { content: "Left" }]}
        />
        <div dir="rtl">
          <Timeline data-testid="rtl" items={items} />
        </div>
      </main>
    </MtoneProvider>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
