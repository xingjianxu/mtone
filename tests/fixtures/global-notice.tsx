import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AdminLayout, Button, GlobalNotice, MtoneProvider, NavItem } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";

const scenario = new URLSearchParams(location.search);
const locale = scenario.get("locale") === "zh" ? "zh" : "en";
const theme = scenario.get("theme") === "dark" ? "dark"
  : scenario.get("theme") === "system" ? "system" : "light";

function Standalone() {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const action = useRef<HTMLButtonElement>(null);
  return (
    <section aria-label="Standalone notices" style={{ padding: 10 }}>
      <Button onClick={() => action.current?.focus()}>Focus action</Button>
      <Button onClick={() => setLoading((value) => !value)}>Toggle loading</Button>
      <GlobalNotice
        data-testid="action-notice"
        title="Account verification"
        actionRef={action}
        actionLabel="Review account"
        onAction={() => setCount((value) => value + 1)}
        loading={loading}
      >
        Review the account details before continuing.
      </GlobalNotice>
      {open && (
        <GlobalNotice data-testid="dismiss-notice" title="Scheduled update" onAction={() => setOpen(false)}>
          The service will restart this evening.
        </GlobalNotice>
      )}
      <GlobalNotice
        data-testid="error-notice"
        title="Unable to update"
        error="The change was not saved."
      />
      <output data-testid="action-count">{count}</output>
    </section>
  );
}

function Workspace() {
  const [route, setRoute] = useState("Overview");
  const [actionCount, setActionCount] = useState(0);
  const token = "AnUnusuallyLongWorkspaceActivationMessage".repeat(3);
  return (
    <AdminLayout
      data-testid="shell"
      hasSider
      style={{ height: 560 }}
      notice={
        <GlobalNotice
          data-testid="workspace-notice"
          title="Workspace verification pending"
          actionLabel="Review workspace"
          onAction={() => setActionCount((value) => value + 1)}
        >
          {token} Continue working while the workspace owner checks the settings.
        </GlobalNotice>
      }
    >
      <AdminLayout.Sider collapsible logo={<strong>Workspace</strong>} aria-label="Workspace navigation">
        <NavItem active={route === "Overview"} onClick={() => setRoute("Overview")}>Overview</NavItem>
        <NavItem active={route === "Activity"} onClick={() => setRoute("Activity")}>Activity</NavItem>
      </AdminLayout.Sider>
      <AdminLayout>
        <AdminLayout.Header data-testid="workspace-header">Workspace header</AdminLayout.Header>
        <AdminLayout.Content data-testid="workspace-content">
          <h1>{route} content</h1>
          <p style={{ minHeight: 980 }}>Scrollable content</p>
        </AdminLayout.Content>
      </AdminLayout>
      <output hidden data-testid="workspace-action-count">{actionCount}</output>
    </AdminLayout>
  );
}

createRoot(document.getElementById("root")!).render(
  <MtoneProvider locale={locale} theme={theme}>
    {scenario.has("standalone") ? <Standalone /> : <Workspace />}
  </MtoneProvider>,
);
