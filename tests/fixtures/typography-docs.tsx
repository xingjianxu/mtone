import * as React from "react";
import { createRoot } from "react-dom/client";
import { MtoneProvider } from "../../packages/mtone/src";
import { TypographyExample } from "../../apps/docs/typography-example";
import "../../packages/mtone/dist/styles.css";
import "../../apps/docs/site.css";
createRoot(document.getElementById("root")!).render(
  <MtoneProvider>
    <div style={{ padding: 24, maxWidth: 720 }}>
      <TypographyExample />
    </div>
  </MtoneProvider>,
);
