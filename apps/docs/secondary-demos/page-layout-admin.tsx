import { useState } from "react";
import { AdminLayout, Button, NavGroup, NavItem, PageLayout, Sidebar } from "../../../packages/mtone/src";

export default function Demo() {
  const [expanded, setExpanded] = useState(false);
  return (
    <AdminLayout style={{ width: "100%", height: 360, border: "1px solid var(--mt-border)", borderRadius: 6 }}>
      <AdminLayout.Header
        extra={<Button aria-pressed={expanded} onClick={() => setExpanded(!expanded)}>长内容</Button>}
      >
        项目工作台
      </AdminLayout.Header>
      <AdminLayout.Content style={{ padding: 16 }}>
        <PageLayout
          headingLevel={3}
          title="项目资料"
          sidebar={
            <Sidebar aria-label="项目导航">
              <NavGroup label="资料">
                <NavItem active>项目概览</NavItem>
              </NavGroup>
            </Sidebar>
          }
        >
          {expanded
            ? Array.from({ length: 16 }, (_, i) => <p key={i}>项目记录 {i + 1}</p>)
            : <p>本周尚无新记录。</p>}
        </PageLayout>
      </AdminLayout.Content>
      <AdminLayout.Footer>项目工作台</AdminLayout.Footer>
    </AdminLayout>
  );
}
