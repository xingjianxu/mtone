import { Home, Settings } from "lucide-react";
import { AdminLayout, NavGroup, NavItem, Text } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <AdminLayout aria-label="可调整应用侧栏" sidebarResize={{ minWidth: 160, maxWidth: 360, storageKey: "docs:admin:sidebar-width" }}
      style={{ blockSize: 250, border: "1px solid var(--mt-border)", borderRadius: 4 }}>
      <AdminLayout.Sider storageKey="docs:admin:sidebar-collapse" width={210} collapsible breakpoint={600} logo="管理台" collapsedLogo="管" version="v1.0">
        <NavGroup label="工作区">
          <NavItem active icon={<Home size={15} />}>首页</NavItem>
          <NavItem icon={<Settings size={15} />}>设置</NavItem>
        </NavGroup>
      </AdminLayout.Sider>
      <AdminLayout>
        <AdminLayout.Header>项目管理</AdminLayout.Header>
        <AdminLayout.Content><Text>试着拖宽后收起侧栏；展开会恢复拖宽后的宽度。</Text></AdminLayout.Content>
      </AdminLayout>
    </AdminLayout>
  );
}
