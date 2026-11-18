import React from "react";
import { createRoot } from "react-dom/client";
import { HoverCard, MtoneProvider, Button } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
const dark = new URLSearchParams(location.search).has("dark");
createRoot(document.getElementById("root")!).render(
  <MtoneProvider
    tokens={
      dark
        ? { "--mt-bg": "#242424", "--mt-border": "#666", "--mt-fg": "#eee" }
        : undefined
    }
  >
    <main
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 32,
        padding: 100,
      }}
    >
      {(["top", "bottom", "left", "right"] as const).map((side) => (
        <section
          key={side}
          style={{
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HoverCard
            open
            withArrow
            side={side}
            width={140}
            trigger={<Button>{side}</Button>}
            content={
              <span data-testid={`content-${side}`}>{side} preview</span>
            }
          />
        </section>
      ))}
    </main>
  </MtoneProvider>,
);
