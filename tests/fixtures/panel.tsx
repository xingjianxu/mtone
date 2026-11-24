import React from "react";
import { Terminal } from "lucide-react";
import { createRoot } from "react-dom/client";
import { MtoneProvider, Panel, Splitter } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
import PanelIde from "../../apps/docs/inline-demos/panel-ide";

function Fixture() {
  const [collapsed, setCollapsed] = React.useState(false);
  React.useEffect(() => {
    const requestCollapse = () => setCollapsed(true);
    window.addEventListener("controlled-collapse", requestCollapse);
    return () => window.removeEventListener("controlled-collapse", requestCollapse);
  }, []);
  return <>
    <MtoneProvider theme="dark" locale="en">
      <div data-testid="standalone" style={{ width: 190, height: 166 }}>
        <Panel label="Standalone tabs" collapsed={collapsed} onCollapsedChange={setCollapsed}
          actions={<button type="button">Action</button>}
          items={[
            { value: "one", label: "Visible", content: <input aria-label="Standalone input" /> },
            { value: "two", label: "Second tab with a long name", content: "Second panel" },
          ]}
        />
      </div>
    </MtoneProvider>
    <MtoneProvider theme="system">
      <div data-testid="ide"><PanelIde /></div>
      <div data-testid="plain-splitter" style={{ width: 180, height: 60 }}>
        <Splitter>
          <Splitter.Panel label="First pane">First</Splitter.Panel>
          <Splitter.Panel label="Second pane">Second</Splitter.Panel>
        </Splitter>
      </div>
    </MtoneProvider>
    <MtoneProvider theme="dark" locale="en">
      <div data-testid="rtl-rail" style={{ width: "min(100%, 260px)", height: 132 }}>
        <Panel label="RTL tabs" tabPlacement="right" dir="rtl"
          actions={<button type="button">Info</button>}
          items={[
            { value: "console", label: "Console", icon: <Terminal />, content: "Console content" },
            { value: "settings", label: "Settings", content: "Settings content" },
          ]}
        />
      </div>
    </MtoneProvider>
  </>;
}

createRoot(document.getElementById("root")!).render(<Fixture />);
