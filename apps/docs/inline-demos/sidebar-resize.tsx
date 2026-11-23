import { BookOpen, Files } from "lucide-react";
import { NavGroup, NavItem, Sidebar, Splitter, Text } from "../../../packages/mtone/src";

export default function Demo() {
  return (
    <Splitter style={{ height: 190 }}>
      <Splitter.Panel defaultSize={200} min={135} max={320} groupResizeBehavior="preserve-pixel-size">
        <Sidebar aria-label="独立工作区导航" style={{ height: "100%" }}>
          <NavGroup label="工作区">
            <NavItem active icon={<Files size={15} />}>我的文件</NavItem>
            <NavItem icon={<BookOpen size={15} />}>工作笔记</NavItem>
          </NavGroup>
        </Sidebar>
      </Splitter.Panel>
      <Splitter.Panel>
        <div style={{ padding: 16 }}><Text>在 Splitter.Panel 中放置 Sidebar 即可调宽。</Text></div>
      </Splitter.Panel>
    </Splitter>
  );
}
