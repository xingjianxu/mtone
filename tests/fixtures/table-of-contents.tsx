import React, { useRef, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { TableOfContents } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
function App() {
  const article = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const root = useCallback(() => article.current, []);
  const container = useCallback(() => scroller.current, []);
  const [more, setMore] = useState(false);
  return (
    <main style={{ maxWidth: 900, margin: "auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(100px,1fr) minmax(0,2fr)",
          gap: 12,
        }}
      >
        <TableOfContents
          aria-label="Article contents"
          root={root}
          scrollContainer={container}
          offset={16}
          behavior="auto"
        />
        <div
          ref={scroller}
          data-testid="scroller"
          style={{ height: 300, overflow: "auto", border: "3px solid #ccc" }}
        >
          <article ref={article} style={{ padding: 12 }}>
            <h2 id="first">First</h2>
            <div style={{ height: 250 }}>Introduction</div>
            <h3 id="detail">Details</h3>
            <div style={{ height: 350 }}>Nested topic</div>
            <h2 id="last">Last</h2>
            <div style={{ height: 320 }}>Conclusion</div>
            {more && (
              <>
                <h3>Dynamic heading with a long long long long title</h3>
                <div style={{ height: 350 }} />
              </>
            )}
          </article>
        </div>
      </div>
      <button onClick={() => setMore((value) => !value)}>Toggle heading</button>
      <TableOfContents
        aria-label="Window contents"
        selector="#window-article h2"
        behavior="auto"
        offset={20}
      />
      <article id="window-article">
        <h2 id="window-first">Window first</h2>
        <div style={{ height: 700 }} />
        <h2 id="window-last">Window last</h2>
        <div style={{ height: 900 }} />
      </article>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
