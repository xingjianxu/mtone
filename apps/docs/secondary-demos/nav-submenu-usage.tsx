import { useState } from "react";
import { CreditCard, Mail } from "lucide-react";
import { NavGroup, NavItem, NavSubmenu, Sidebar } from "../../../packages/mtone/src";

export default function Demo() {
  const [page, setPage] = useState("usage");
  return (
    <Sidebar collapsible style={{ width: "min(240px, 100%)" }}>
      <NavGroup label="账户">
        <NavSubmenu label="账单与许可" icon={<CreditCard size={16} />} defaultExpanded>
          <NavItem active={page === "overview"} onClick={() => setPage("overview")}>概览</NavItem>
          <NavItem active={page === "usage"} onClick={() => setPage("usage")}>用量</NavItem>
          <NavItem active={page === "license"} onClick={() => setPage("license")}>许可</NavItem>
        </NavSubmenu>
        <NavItem icon={<Mail size={16} />} active={page === "email"} onClick={() => setPage("email")}>电子邮件</NavItem>
      </NavGroup>
    </Sidebar>
  );
}
