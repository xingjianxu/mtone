import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { CreditCard, Mail } from "lucide-react";
import { AdminLayout, Button, IconButton, MtoneProvider, Popover, NavGroup, NavItem, NavSubmenu, Sidebar } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";

function Fixture() {
  const scenario = new URLSearchParams(window.location.search);
  if (scenario.has("groups")) return <GroupSpacing />;
  if (scenario.has("actions")) return <ActionRows rtl={scenario.has("rtl")} />;
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

function GroupSpacing() {
  const [divider, setDivider] = useState(true);
  const [clicks, setClicks] = useState(0);
  const group = (label: string) => <NavGroup label={label}><NavItem>First item</NavItem><NavItem>Second item</NavItem></NavGroup>;
  return (
    <>
      <nav data-testid="standalone">
        {group("First group")}
        {group("Second group")}
      </nav>
      <Sidebar data-testid="sidebar" collapsible>
        <nav data-testid="wrapped" dir="rtl" style={{ width: "100%", maxWidth: 160 }}>
          {group("First wrapped group")}
          <NavGroup
            divider={divider}
            label="Second wrapped group with a title just long enough to truncate"
            actions={<Button size="sm" variant="ghost" aria-label="Add view" onClick={() => setClicks((n) => n + 1)}>+</Button>}
          >
            <NavItem>View count: {clicks}</NavItem>
          </NavGroup>
        </nav>
      </Sidebar>
      <button type="button" onClick={() => setDivider((value) => !value)}>Toggle group divider</button>
      <nav data-testid="after-item">
        <NavItem>Independent page</NavItem>
        {group("After actual item")}
      </nav>
    </>
  );
}

function ActionRows({ rtl }: { rtl: boolean }) {
  const [editCount, setEditCount] = useState(0);
  return <MtoneProvider theme={rtl ? "dark" : "light"}>
    <div dir={rtl ? "rtl" : "ltr"} style={{ width: 218, margin: 12 }}>
      <Button>Outside</Button>
      <Sidebar collapsible>
        <NavGroup>
          <NavItem>Before</NavItem>
          <NavItem active href="#destination" actions={[
            { content: <IconButton size="sm" variant="ghost" aria-label="Edit" onClick={() => setEditCount((n) => n + 1)}>E</IconButton> },
            { visibility: "hover", content: <Popover trigger={<IconButton size="sm" variant="ghost" aria-label="More">M</IconButton>} content={<Button>Rename</Button>} /> },
            { visibility: "active", content: <IconButton size="sm" variant="ghost" aria-label="Archive">A</IconButton> },
          ]}>A very long folder name for documents</NavItem>
          <NavItem actions={{ visibility: "active", content: <IconButton size="sm" variant="ghost" aria-label="Inactive archive">A</IconButton> }}>After</NavItem>
          <NavItem disabled actions={{ visibility: "hover", content: <IconButton size="sm" variant="ghost" aria-label="Edit disabled row">E</IconButton> }}>Unavailable</NavItem>
          <NavSubmenu label="Projects">
            <NavItem actions={{ visibility: "hover", content: <IconButton size="sm" variant="ghost" aria-label="Edit project" onClick={() => setEditCount((n) => n + 1)}>E</IconButton> }}>Workspace</NavItem>
          </NavSubmenu>
        </NavGroup>
      </Sidebar>
      <output data-testid="edit-count">{editCount}</output>
    </div>
  </MtoneProvider>;
}

createRoot(document.getElementById("root")!).render(<Fixture />);
