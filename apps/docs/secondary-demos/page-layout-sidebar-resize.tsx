import { FileText, Filter } from "lucide-react";
import { NavGroup, NavItem, PageLayout, Sidebar, Text } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <PageLayout headingLevel={3} title="项目文件" sidebarPosition="right"
      sidebarResize={{ defaultWidth: 220, minWidth: 160, maxWidth: 360, storageKey: "docs:page:sidebar-width" }}
      sidebar={<Sidebar storageKey="docs:page:sidebar-collapse" collapsible aria-label="项目文件筛选">
        <NavGroup label="筛选">
          <NavItem icon={<FileText size={15} />} active>全部文件</NavItem>
          <NavItem icon={<Filter size={15} />}>有待办</NavItem>
        </NavGroup>
      </Sidebar>}>
      <Text>文件列表留在主栏。宽容器中可拖右侧分隔线；窄容器中侧栏自然下移。</Text>
    </PageLayout>
  );
}
