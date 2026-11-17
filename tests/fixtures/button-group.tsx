import { ComponentExample } from "../../apps/docs/examples";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { Button, ButtonGroup, MtoneProvider } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
createRoot(document.getElementById("root")!).render(
  <MtoneProvider><main style={{ padding: 24, display: "grid", gap: 24, justifyItems: "start" }}>
    <ButtonGroup data-testid="default"><Button>One</Button><Button>Two</Button></ButtonGroup>
    {["ltr", "rtl"].map(dir => <ButtonGroup key={dir} dir={dir} connected data-testid={dir}>
      <Button>First</Button><Button>Middle</Button><Button>Last</Button>
    </ButtonGroup>)}
    <ButtonGroup connected data-testid="single"><Button>Only</Button></ButtonGroup>
    <ButtonGroup connected data-testid="danger"><Button danger variant="solid">Delete</Button><Button danger variant="solid">Remove</Button><Button danger variant="solid" disabled>Disabled</Button></ButtonGroup>
    <section data-testid="docs"><ComponentExample name="ButtonGroup" /></section>
  </main></MtoneProvider>
);
