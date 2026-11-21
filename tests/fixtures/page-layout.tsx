import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { AdminLayout, Button, PageLayout, Tabs } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";

function Fixture() {
  const [saved, setSaved] = useState(false);
  return (
    <div data-mt-theme="dark" style={{ background: "var(--mt-bg)", width: "min(100%, 920px)" }}>
      <Button data-testid="outside-button">Save draft</Button>
      <AdminLayout hasSider>
        <AdminLayout.Sider width={180} breakpoint={0}>Menu</AdminLayout.Sider>
        <AdminLayout.Content style={{ padding: 10 }}>
          <PageLayout
            aria-label="Project"
            title={<span>ProjectActivityForTeamsWithLongNames</span>}
            subtitle="Workspace"
            icon={<span aria-hidden="true" style={{ display: "block", width: 22, height: 22 }}>▸</span>}
            actions={<><Button onClick={() => setSaved(true)}>Save draft</Button><Button>Share update</Button><Button style={{ fontSize: 18 }}>Review 项目交付历史</Button></>}
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

function MaxWidthFixture() {
  const cases = [
    ["default", undefined], ["sm", "sm"], ["md", "md"], ["lg", "lg"], ["custom", 840],
  ] as const;
  return (
    // The parent is deliberately not centered in the viewport.
    <div data-testid="layout-parent" style={{
      marginInlineStart: 24, marginInlineEnd: 48, paddingInline: 12, maxInlineSize: 1350,
    }}>
      {cases.map(([testId, maxWidth]) => (
        <PageLayout
          key={testId}
          data-testid={testId}
          maxWidth={maxWidth}
          title="ProjectActivityForTeamsWithLongNames"
          actions={<Button>Share project</Button>}
          tabs={<Tabs items={[{ value: "today", label: "Today", content: "Daily activity" }]} />}
        >
          Project tasks
        </PageLayout>
      ))}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  new URLSearchParams(window.location.search).has("max-width") ? <MaxWidthFixture /> : <Fixture />,
);
