import { useState } from "react";
import { BookOpen, Box, FileText, Folder, House, Search, Star } from "lucide-react";
import { NavGroup, NavItem, Sidebar, Text } from "../../../packages/mtone/src";

const work = [
  "最近文档", "项目笔记", "研究资料", "设计规范",
  "会议纪要", "团队文档", "发布记录", "历史版本",
];

export default function Demo() {
  const [page, setPage] = useState("概览");
  const item = (name: string, icon = <FileText size={16} />) => (
    <NavItem key={name} icon={icon} active={page === name} onClick={() => setPage(name)}>
      {name}
    </NavItem>
  );

  return (
    <div style={{ width: 238, maxWidth: "100%" }}>
      <Sidebar
        aria-label="工作区侧栏"
        style={{ height: 372 }}
        collapsible
        collapsePlacement="footer"
        header={(collapsed) => (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Box size={20} aria-hidden="true" />
            {!collapsed && <Text strong>研究工作区</Text>}
          </div>
        )}
        footer={(collapsed) => collapsed ? null : "mtone 工作台 · v1.0"}
        tabs={{
          label: "侧栏分类",
          defaultValue: "workspace",
          items: [
            { value: "workspace", label: "工作区", content: <>
              <NavGroup label="导航">
                {item("概览", <House size={16} />)}
                {item("工作区搜索", <Search size={16} />)}
              </NavGroup>
              <NavGroup label="资料">{work.map((name) => item(name))}</NavGroup>
            </> },
            { value: "projects", label: "项目", content: <NavGroup label="项目列表">
              {item("知识库", <BookOpen size={16} />)}
              {item("文档站", <Folder size={16} />)}
            </NavGroup> },
            { value: "favorites", label: "收藏", content: <NavGroup label="快捷访问">
              {item("设计素材", <Star size={16} />)}
            </NavGroup> },
          ],
        }}
      />
    </div>
  );
}
