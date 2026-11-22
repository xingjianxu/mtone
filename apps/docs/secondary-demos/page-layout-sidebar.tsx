import { useState } from "react";
import { Button, NavItem, PageLayout, Sidebar, Tabs } from "../../../packages/mtone/src";

export default function Demo() {
  const [position, setPosition] = useState<"left" | "right">("left");
  const [span, setSpan] = useState<"full" | "main">("full");
  return (
    <div style={{ width: "100%", display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button onClick={() => setPosition(position === "left" ? "right" : "left")}>
          侧栏：{position === "left" ? "左侧" : "右侧"}
        </Button>
        <Button onClick={() => setSpan(span === "full" ? "main" : "full")}>
          页头：{span === "full" ? "跨整页" : "仅主栏"}
        </Button>
      </div>
      <PageLayout
        headingLevel={3}
        maxWidth="md"
        title="项目资料库"
        actions={<Button>新建资料</Button>}
        description="查看项目文件和交付记录。"
        extra="本周更新"
        tabs={<Tabs items={[
          { value: "files", label: "文件", content: "项目需求说明、原型文件和会议纪要" },
          { value: "history", label: "交付记录", content: "最近交付：项目需求说明（第 2 版）" },
        ]} />}
        sidebarPosition={position}
        headerSpan={span}
        sidebar={<Sidebar aria-label="资料分类" header="资料分类">
          <NavItem active>全部资料</NavItem>
          <NavItem>项目文档</NavItem>
          <NavItem>参考材料</NavItem>
        </Sidebar>}
      >
        <div style={{ padding: 12, background: "var(--mt-subtle)", borderRadius: 4 }}>
          共 3 份资料，最近更新于本周。
        </div>
      </PageLayout>
    </div>
  );
}
