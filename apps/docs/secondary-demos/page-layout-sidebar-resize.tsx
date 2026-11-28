import { useState } from "react";
import { FileText, Filter } from "lucide-react";
import { Button, NavGroup, NavItem, PageLayout, Sidebar, Switch, Text } from "../../../packages/mtone/src";

const resizeOptions = { defaultWidth: 220, minWidth: 160, maxWidth: 360 };

export default function Demo() {
  const [position, setPosition] = useState<"left" | "right">("left");
  const [bordered, setBordered] = useState(true);
  const [resize, setResize] = useState(true);
  const [revision, setRevision] = useState(0);

  function reset() {
    setPosition("left");
    setBordered(true);
    setResize(true);
    setRevision((value) => value + 1);
  }

  return (
    <div style={{ display: "grid", gap: 12, width: "100%", minWidth: 0 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 12px" }}>
        <div role="group" aria-label="侧栏位置" style={{ display: "flex", gap: 4 }}>
          <Button variant={position === "left" ? "solid" : "outline"}
            aria-pressed={position === "left"} onClick={() => setPosition("left")}>左侧</Button>
          <Button variant={position === "right" ? "solid" : "outline"}
            aria-pressed={position === "right"} onClick={() => setPosition("right")}>右侧</Button>
        </div>
        <Switch label="边框布局" checked={bordered} onCheckedChange={setBordered} />
        <Switch label="拖拽调宽" checked={resize} onCheckedChange={setResize} />
        <Button variant="ghost" onClick={reset}>恢复默认</Button>
      </div>
      <PageLayout key={revision} headingLevel={3} title="项目文件"
        bordered={bordered} sidebarPosition={position} sidebarResize={resize && resizeOptions}
        style={{ minBlockSize: 280 }}
        sidebar={<Sidebar collapsible aria-label="项目文件筛选">
          <NavGroup label="筛选">
            <NavItem icon={<FileText size={15} />} active>全部文件</NavItem>
            <NavItem icon={<Filter size={15} />}>有待办</NavItem>
          </NavGroup>
        </Sidebar>}>
        <Text>需求说明、交互原型、会议纪要</Text>
      </PageLayout>
    </div>
  );
}
