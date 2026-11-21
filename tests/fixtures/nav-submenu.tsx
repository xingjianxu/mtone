import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { CreditCard, Mail } from "lucide-react";
import { AdminLayout, Button, MtoneProvider, NavGroup, NavItem, NavSubmenu, Sidebar } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";

function Fixture() {
  const scenario = new URLSearchParams(window.location.search);
  const admin = scenario.has("admin");
  const rtl = scenario.has("rtl");
  const [current, setCurrent] = useState("Usage");
  const navigation = <NavGroup label="Account">
    <NavSubmenu label="Billing and licensing" icon={<CreditCard size={16} />} defaultExpanded>
      <NavItem disabled>Disabled</NavItem>
      {["Overview", "Usage", "Licensing", "Payment history", "Receipt details"].map((label) =>
        <NavItem active={current === label} key={label} onClick={() => setCurrent(label)}>{label}</NavItem>)}
    </NavSubmenu>
    <NavItem active={current === "Email"} icon={<Mail size={16} />} onClick={() => setCurrent("Email")}>Email</NavItem>
  </NavGroup>;
  return (
    <MtoneProvider theme={scenario.has("dark") ? "dark" : "light"}>
      <div dir={rtl ? "rtl" : "ltr"} style={{ display: "grid", gap: 8, alignItems: "start", padding: 8 }}>
        <div><Button>Outside</Button> <span data-testid="current">{current}</span></div>
        {admin ? (
          <AdminLayout hasSider style={{ height: 160 }}>
            <AdminLayout.Sider aria-label="Workspace" collapsible breakpoint={scenario.has("responsive") ? 700 : 0} width={220} logo={<span>Workspace</span>}>{navigation}</AdminLayout.Sider>
            <AdminLayout.Content>Page</AdminLayout.Content>
          </AdminLayout>
        ) : (
          <div style={{ width: 220 }}><Sidebar collapsible>{navigation}</Sidebar></div>
        )}
      </div>
    </MtoneProvider>
  );
}

createRoot(document.getElementById("root")!).render(<Fixture />);
