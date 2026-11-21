import { useState } from "react";
import { CreditCard, Mail } from "lucide-react";
import { NavItem, NavSubmenu, Sidebar } from "../../../packages/mtone/src";

export default function Demo() {
  const [page, setPage] = useState("usage");
  return (
    <div style={{ display: "flex", alignItems: "start", gap: 16 }}>
      <Sidebar collapsible defaultCollapsed>
        <NavSubmenu label="账单与许可" icon={<CreditCard size={16} />} defaultExpanded>
          <NavItem active={page === "overview"} onClick={() => setPage("overview")}>概览</NavItem>
          <NavItem active={page === "usage"} onClick={() => setPage("usage")}>用量</NavItem>
        </NavSubmenu>
        <NavItem icon={<Mail size={16} />} active={page === "email"} onClick={() => setPage("email")}>电子邮件</NavItem>
      </Sidebar>
      <span aria-live="polite">当前：{{ overview: "概览", usage: "用量", email: "电子邮件" }[page]}</span>
    </div>
  );
}
