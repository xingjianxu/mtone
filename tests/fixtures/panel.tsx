import React from "react";
import { createRoot } from "react-dom/client";
import { MtoneProvider, Panel } from "../../packages/mtone/src";
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
    <div data-testid="ide"><PanelIde /></div>
  </>;
}

createRoot(document.getElementById("root")!).render(<Fixture />);
