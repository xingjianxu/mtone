import React from "react";
import { createRoot } from "react-dom/client";
import {
  HoverCard,
  Popover,
  MtoneProvider,
  Button,
} from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
createRoot(document.getElementById("root")!).render(
  <MtoneProvider>
    <main style={{ padding: 24 }}>
      <HoverCard
        defaultOpen
        trigger={<Button>Nested preview</Button>}
        openDelay={0}
        content={
          <>
            <p>Parent preview content</p>
            <Popover
              defaultOpen
              trigger={<Button>Nested popup</Button>}
              content={<button>Nested portal action</button>}
            />
          </>
        }
      />
      <button style={{ display: "block", marginTop: 300 }}>
        Outside nested preview
      </button>
    </main>
  </MtoneProvider>,
);
