import { ComponentExample } from "../../apps/docs/examples";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, Download, Image } from "lucide-react";
import { Button, ButtonGroup, Menu, MtoneProvider } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
createRoot(document.getElementById("root")!).render(
  <MtoneProvider><main style={{ padding: 24, display: "grid", gap: 24, justifyItems: "start" }}>
    <ButtonGroup data-testid="default"><Button>One</Button><Button>Two</Button></ButtonGroup>
    <ButtonGroup size="small" data-testid="inherited-size" aria-label="Sized actions">
      <Button>Inherit small</Button>
      <Menu
        trigger={<Button iconOnly aria-label="Inherit small trigger">+</Button>}
        items={[{ key: "pick", label: "Pick action" }]}
      />
      <Button size="large">Explicit large</Button>
      <Button size="md">Explicit normal alias</Button>
    </ButtonGroup>
    {["ltr", "rtl"].map(dir => <ButtonGroup key={dir} dir={dir} connected data-testid={dir}>
      <Button>First</Button><Button>Middle</Button><Button>Last</Button>
    </ButtonGroup>)}
    <ButtonGroup connected data-testid="single"><Button>Only</Button></ButtonGroup>
    <ButtonGroup connected data-testid="danger"><Button danger variant="solid">Delete</Button><Menu trigger={<Button danger variant="solid">Remove</Button>} items={[{ key: "confirm", label: "Confirm removal" }]} /><Button danger variant="solid" disabled>Disabled</Button></ButtonGroup>
    {["ltr", "rtl"].map(dir => (
      <ButtonGroup dir={dir} key={"sections-" + dir} data-testid={"sections-" + dir}>
        <Button leftSection={<Image size={14} aria-hidden="true" />}>Gallery</Button>
        <Button rightSection={<Download size={14} aria-hidden="true" />}>Download</Button>
        <Button
          leftSection={<Image size={14} aria-hidden="true" data-testid="start" />}
          rightSection={<ArrowRight size={14} aria-hidden="true" data-testid="end" />}
        >
          <span data-testid="label">View gallery</span>
        </Button>
        <Button loading leftSection={<Image size={14} aria-hidden="true" />} rightSection={<ArrowRight size={14} aria-hidden="true" />}>
          Loading
        </Button>
        <Button icon={<Image size={14} aria-hidden="true" />}>Legacy</Button>
        <Button iconOnly aria-label="Only icon"><Image size={14} aria-hidden="true" /></Button>
      </ButtonGroup>
    ))}
    {["ltr", "rtl"].map(dir => (
      <section key={dir} dir={dir} data-testid={"docs-" + dir}><ComponentExample name="ButtonGroup" /></section>
    ))}
  </main></MtoneProvider>
);
