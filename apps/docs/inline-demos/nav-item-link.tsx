import { BookOpen, ArrowUpRight } from "lucide-react";
import { NavGroup, NavItem } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <div style={{ width: "min(100%, 240px)" }}>
      <NavGroup label="文档">
        <NavItem href="#/components/NavItem" active icon={<BookOpen size={15} aria-hidden="true" />}>导航项</NavItem>
        <NavItem href="./showcase.html" target="_blank" rel="noopener noreferrer" icon={<ArrowUpRight size={15} aria-hidden="true" />}>应用示例</NavItem>
        <NavItem href="#/start" disabled>不可用链接</NavItem>
      </NavGroup>
    </div>
  );
}
