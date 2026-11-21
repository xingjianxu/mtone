import { useState } from "react";
import { BookOpen, Folder, Home, Slash } from "lucide-react";
import { Breadcrumb, Text } from "../../packages/mtone/src";

export function BreadcrumbExample() {
  const [project, setProject] = useState("产品设计");
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section aria-label="基础路径">
        <h3>基础路径</h3>
        <Breadcrumb
          items={[
            { label: "首页", href: "#/" },
            { label: "组件", href: "#/components" },
            { label: "Breadcrumb" },
          ]}
        />
      </section>
      <section aria-label="图标">
        <h3>图标与纯图标入口</h3>
        <Breadcrumb
          items={[
            { label: null, icon: <Home />, href: "#/", "aria-label": "首页" },
            { label: "知识库", icon: <Folder />, href: "#/components" },
            { label: "组件规范", icon: <BookOpen /> },
          ]}
        />
      </section>
      <section aria-label="下拉菜单">
        <h3>下拉菜单</h3>
        <Breadcrumb
          items={[
            { label: "工作空间", href: "#/" },
            {
              label: project,
              icon: <Folder />,
              menu: {
                items: [
                  {
                    key: "design",
                    label: "产品设计",
                    onSelect: () => setProject("产品设计"),
                  },
                  {
                    key: "engineering",
                    label: "技术文档",
                    onSelect: () => setProject("技术文档"),
                  },
                  { type: "divider", key: "divider" },
                  { key: "archive", label: "已归档", disabled: true },
                ],
              },
            },
            { label: "概览" },
          ]}
        />
        <Text muted>
          复用 Menu 的键盘操作、分组和二级菜单；当前目录：{project}。
        </Text>
      </section>
      <section aria-label="链接和菜单">
        <h3>链接与菜单分开操作</h3>
        <Breadcrumb
          items={[
            {
              label: "组件",
              href: "#/components",
              menu: {
                align: "right",
                width: 180,
                items: [
                  {
                    key: "menu",
                    label: "Menu",
                    onSelect: () => {
                      window.location.hash = "/components/Menu";
                    },
                  },
                  {
                    key: "dropdown",
                    label: "Popover",
                    onSelect: () => {
                      window.location.hash = "/components/Popover";
                    },
                  },
                ],
              },
            },
            { label: "Breadcrumb" },
          ]}
        />
        <Text muted>
          文字用于导航，右侧箭头用于展开菜单，互不抢占点击事件。
        </Text>
      </section>
      <section aria-label="自定义分隔符">
        <h3>自定义分隔符</h3>
        <Breadcrumb
          separator="/"
          items={[
            { label: "首页", href: "#/" },
            { label: "文档", separator: <Slash size={12} /> },
            { label: "基础", separator: "→" },
            { label: "组件" },
          ]}
        />
        <Text muted>
          支持全局 separator 和单项 separator；单项作用于其后，null
          隐藏该分隔符。
        </Text>
      </section>
    </div>
  );
}
