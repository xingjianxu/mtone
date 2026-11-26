import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  AdminLayout,
  Breadcrumb,
  Button,
  MtoneProvider,
} from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
import "../../apps/docs/site.css";
import { AdminLayoutExample } from "../../apps/docs/admin-layout-example";
import TopbarCenterDemo from "../../apps/docs/inline-demos/topbar-center";
import TopbarDemo from "../../apps/docs/inline-demos/topbar-usage";

const parent = "A very long parent section name";
const current = "An even longer current page name that must not wrap";
createRoot(document.getElementById("root")!).render(
  <MtoneProvider>
    {location.search === "?topbar-center" ? (
      <TopbarCenterDemo />
    ) : location.search === "?topbar" ? (
      <TopbarDemo />
    ) : location.search === "?demo" ? (
      <AdminLayoutExample />
    ) : (
      <AdminLayout fullHeight>
        <AdminLayout.Sider
          logo={<strong>Brand</strong>}
          collapsedLogo={<strong>B</strong>}
          collapsible
          breakpoint={640}
        >
          Navigation
        </AdminLayout.Sider>
        <AdminLayout>
          {location.search === "?children" ? (
            <AdminLayout.Header>
              <Button>Action</Button>
            </AdminLayout.Header>
          ) : (
            <AdminLayout.Header
              breadcrumb={
                <Breadcrumb items={[{ label: parent }, { label: current }]} />
              }
              extra={<Button>Action</Button>}
            />
          )}
          <AdminLayout.Content>
            <div style={{ height: 1800 }}>Content</div>
          </AdminLayout.Content>
        </AdminLayout>
      </AdminLayout>
    )}
  </MtoneProvider>,
);
