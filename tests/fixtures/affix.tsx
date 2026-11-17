import React from "react";
import { createRoot } from "react-dom/client";
import { Affix, Button } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
function App() {
  const target = React.useRef<HTMLDivElement>(null);
  const [large, setLarge] = React.useState(false);
  const [count, setCount] = React.useState(0);
  const getTarget = React.useCallback(() => target.current, []);
  return (
    <main style={{ padding: 20 }}>
      <div style={{ height: 150 }}>Window scroll</div>
      <Affix data-testid="window" offsetTop={10}>
        <Button>Window action</Button>
      </Affix>
      <div
        ref={target}
        data-testid="target"
        style={{
          marginTop: 80,
          height: 240,
          overflow: "auto",
          border: "3px solid #aaa",
          width: "min(600px, 100%)",
        }}
      >
        <div style={{ height: 100 }} />
        <Affix
          data-testid="container"
          target={getTarget}
          offsetTop={8}
          onChange={() => setCount((x) => x + 1)}
        >
          <div
            style={{ background: "#eee", padding: 10, height: large ? 90 : 50 }}
          >
            <Button onClick={() => setLarge((x) => !x)}>Resize</Button>
          </div>
        </Affix>
        <div style={{ height: 450 }} />
        <Affix data-testid="bottom" target={getTarget} offsetBottom={5}>
          <Button>Bottom</Button>
        </Affix>
        <div style={{ height: 100 }} />
      </div>
      <output data-testid="count">{count}</output>
      <div style={{ height: 1500 }} />
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
