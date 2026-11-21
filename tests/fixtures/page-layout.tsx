import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { AdminLayout, Button, PageLayout, Tabs } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";

function Fixture() {
  const [saved, setSaved] = useState(false);
  return (
    <div data-mt-theme="dark" style={{ background: "var(--mt-bg)", width: "min(100%, 920px)" }}>
      <AdminLayout hasSider>
        <AdminLayout.Sider width={180} breakpoint={0}>Menu</AdminLayout.Sider>
        <AdminLayout.Content style={{ padding: 10 }}>
          <PageLayout
            aria-label="Project"
            title={<span>ProjectActivityForTeamsWithLongNames</span>}
            subtitle="Workspace"
            icon={<span aria-hidden="true" style={{ display: "block", width: 22, height: 22 }}>▸</span>}
            actions={<><Button onClick={() => setSaved(true)}>Save draft</Button><Button>Share update</Button><Button>Review history</Button></>}
            description="Latest activity"
            extra={saved ? "Saved" : "Unsaved"}
            tabs={<Tabs items={[
              { value: "today", label: "Today", content: "Daily activity" },
              { value: "week", label: "Week", content: "Weekly activity" },
            ]} />}
          ><div>Project tasks</div></PageLayout>
        </AdminLayout.Content>
      </AdminLayout>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Fixture />);
