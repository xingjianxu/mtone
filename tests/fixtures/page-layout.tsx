import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { AdminLayout, Button, PageLayout, Sidebar, Tabs } from "../../packages/mtone/src";
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

function SidebarFixture() {
  const query = new URLSearchParams(window.location.search);
  const narrow = query.has("narrow");
  return (
    <div dir={query.has("rtl") ? "rtl" : undefined} style={{ width: narrow ? 360 : 1100, maxWidth: "100%" }}>
      {([
        ["left-full", {}],
        ["right-main", { sidebarPosition: "right", headerSpan: "main" }],
        ["left-header", { headerSpan: "header" }],
        ["right-header", { sidebarPosition: "right", headerSpan: "header" }],
        ["left-header-no-tabs", { headerSpan: "header" }],
      ] as const).map(([id, options]) => (
        <PageLayout {...options} key={id}
          data-testid={id}
          maxWidth={840}
          style={id.startsWith("right") ? { "--mt-page-layout-sidebar-width": "200px" } as React.CSSProperties : undefined}
          title="Project overview"
          actions={<Button>Share</Button>}
          description="Latest progress"
          extra="Updated today"
          tabs={id.endsWith("no-tabs") ? undefined : <Tabs items={[{ value: "recent", label: "Recent", content: null }]} />}
          sidebar={<Sidebar aria-label="Filters"><Button>Open filters</Button></Sidebar>}
        >
          Project tasks
        </PageLayout>
      ))}
    </div>
  );
}

function AdminContentFixture() {
  const query = new URLSearchParams(window.location.search);
  const mode = query.get("admin-content");
  const sidebar = !query.has("no-sidebar");
  const layout = (
    <PageLayout
      data-testid="fill-page"
      title="Project overview"
      tabs={<Tabs items={[{ value: "today", label: "Today", content: "Daily activity" }]} />}
      sidebar={sidebar ? <Sidebar aria-label="Departments">Design</Sidebar> : undefined}
      maxWidth={840}
    >
      <div style={mode === "long" ? { minHeight: 680 } : undefined}>Project tasks</div>
    </PageLayout>
  );
  if (mode === "standalone") return <div style={{ height: 430 }}>{layout}</div>;
  return (
    <AdminLayout fullHeight style={{ height: 430, "--mt-layout-header-height": "64px" } as React.CSSProperties}>
      <AdminLayout.Header>Workspace</AdminLayout.Header>
      <AdminLayout.Content data-testid="admin-content" style={{ padding: "12px 18px 20px" }}>
        {mode === "multiple" ? <><p>Another block</p>{layout}</> :
          mode === "wrapped" ? <div>{layout}</div> : layout}
      </AdminLayout.Content>
      {!query.has("no-footer") && <AdminLayout.Footer>Workspace footer</AdminLayout.Footer>}
    </AdminLayout>
  );
}

const query = new URLSearchParams(window.location.search);
createRoot(document.getElementById("root")!).render(
  query.has("admin-content") ? <AdminContentFixture /> : query.has("sidebar") ? <SidebarFixture /> : query.has("max-width") ? <MaxWidthFixture /> : <Fixture />,
);
