import React from "react";
import { createRoot } from "react-dom/client";
import { House } from "lucide-react";
import {
  AdminLayout,
  MtoneProvider,
  NavGroup,
  NavItem,
  Sidebar,
} from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";

createRoot(document.getElementById("root")!).render(
  <MtoneProvider>
    <div style={{ width: 180 }}>
      <Sidebar aria-label="Library" collapsible>
        <NavItem icon={<House size={16} aria-hidden="true" />} active>
          Overview
        </NavItem>
        <NavItem
          icon={<House size={16} aria-hidden="true" />}
          style={{ fontSize: 18 }}
        >
          A navigation label long enough to wrap in the expanded sidebar
        </NavItem>
        <NavGroup label="Projects">
          <NavItem>Current</NavItem>
          <NavItem disabled>Archived</NavItem>
        </NavGroup>
      </Sidebar>
    </div>
    <Sidebar aria-label="Grouped" style={{ width: 180 }}>
      <NavGroup label="Personal">
        <NavItem>Inbox</NavItem>
      </NavGroup>
      <NavGroup label="Shared">
        <NavItem>Team</NavItem>
      </NavGroup>
    </Sidebar>
    <AdminLayout hasSider style={{ height: 240 }}>
      <AdminLayout.Sider aria-label="Admin" collapsible>
        <NavGroup label="General">
          <NavItem>Dashboard</NavItem>
        </NavGroup>
        <NavGroup label="Permissions">
          <NavItem>Members</NavItem>
        </NavGroup>
      </AdminLayout.Sider>
      <AdminLayout.Content>Content</AdminLayout.Content>
    </AdminLayout>
  </MtoneProvider>,
);
