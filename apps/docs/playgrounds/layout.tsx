import { useState } from "react";
import {
  BookOpen,
  Folder,
  Home,
  Plus,
  Search,
  Settings,
  Terminal,
} from "lucide-react";
import * as M from "../../../packages/mtone/src";
import {
  choice as c,
  flag as f,
  number as n,
  playground as p,
  sides,
  sizes,
  text as t,
} from "./frame";

const tabItems = [
  {
    value: "overview",
    label: "概览",
    icon: <BookOpen size={14} />,
    content: <p>项目进展与待办事项</p>,
  },
  {
    value: "docs",
    label: "文档",
    icon: <Folder size={14} />,
    content: <p>会议纪要与交付文档</p>,
  },
  {
    value: "terminal",
    label: "终端",
    icon: <Terminal size={14} />,
    content: <p>构建已完成。</p>,
  },
];
const nav = (
  <M.NavGroup label="工作区">
    <M.NavItem icon={<Home size={15} />} active>
      概览
    </M.NavItem>
    <M.NavItem icon={<Folder size={15} />}>文档</M.NavItem>
  </M.NavGroup>
);
const workspace = (
  <div className="docs-playground-box" style={{ minBlockSize: 120 }}>
    <strong>项目概览</strong>
    <p>在此查看工作进展。</p>
  </div>
);
const breadcrumbs = (
  <M.Breadcrumb items={[{ label: "工作区" }, { label: "项目文档" }]} />
);
const action = (
  <M.Button variant="outline" size="sm" leftSection={<Plus size={14} />}>
    新建
  </M.Button>
);
const panelSize = c("标签尺寸", "md", sizes);

function TabsPreview({
  showIcons,
  ...props
}: Omit<M.TabsProps, "items"> & { showIcons: boolean }) {
  const [items, setItems] = useState(tabItems);
  const [active, setActive] = useState("overview");
  return (
    <M.Tabs
      {...props}
      label="项目页面"
      value={active}
      onValueChange={setActive}
      items={items.map((item) => ({
        ...item,
        icon: showIcons ? item.icon : undefined,
      }))}
      onEdit={(action, key) => {
        if (action === "add") {
          const next = String(Date.now());
          setItems((list) => [
            ...list,
            {
              value: next,
              label: "新标签",
              icon: <FileTextIcon />,
              content: <p>草稿</p>,
            },
          ]);
          setActive(next);
        } else {
          const next = items.filter((item) => item.value !== key);
          setItems(next);
          if (key === active) setActive(next[0]?.value ?? "");
        }
      }}
      onOrderChange={(keys) =>
        setItems((previous) =>
          keys.flatMap((key) => previous.filter((item) => item.value === key)),
        )
      }
    />
  );
}
function FileTextIcon() {
  return <BookOpen size={14} />;
}
function ActiveNav({
  divider,
  label,
  hasAction,
  icon,
}: {
  divider: boolean;
  label: string;
  hasAction: boolean;
  icon: boolean;
}) {
  const [selected, setSelected] = useState("overview");
  return (
    <M.NavGroup
      label={label}
      divider={divider}
      actions={
        hasAction && (
          <M.Button size="sm" iconOnly aria-label="添加分组项">
            <Plus size={14} />
          </M.Button>
        )
      }
    >
      {tabItems.slice(0, 2).map((item) => (
        <M.NavItem
          key={item.value}
          icon={icon ? item.icon : undefined}
          active={selected === item.value}
          onClick={() => setSelected(item.value)}
        >
          {item.label}
        </M.NavItem>
      ))}
    </M.NavGroup>
  );
}

export const layoutPlaygrounds = {
  Topbar: p(
    "Topbar",
    {
      breadcrumbs: f("面包屑", true),
      center: f("居中搜索"),
      extra: f("右侧操作", true),
      status: f("状态", true, true),
      as: c("元素", "header", ["header", "div"], true),
    },
    ({ breadcrumbs: withBreadcrumb, center, extra, status, as }) => (
      <M.Topbar
        as={as}
        breadcrumb={withBreadcrumb ? breadcrumbs : undefined}
        center={center ? <M.Input.Search aria-label="搜索项目" /> : undefined}
        status={status ? <M.Tag tone="green">已保存</M.Tag> : undefined}
        extra={extra ? action : undefined}
      />
    ),
  ),
  Toolbar: p(
    "Toolbar",
    {
      background: c("背景", "gray", ["gray", "white"]),
      controlStyle: {
        ...c("控件边框", "borderless", ["default", "borderless"]),
        disabled: (o) => o.background === "white",
      },
      search: f("搜索", true),
      start: f("左侧筛选", true, true),
      end: f("右侧操作", true, true),
    },
    ({ start, end, search, ...props }) => (
      <M.Toolbar
        {...props}
        aria-label="文档工具栏"
        search={search ? <M.Input.Search aria-label="搜索文档" /> : undefined}
        start={
          start ? (
            <M.Select
              label="筛选状态"
              options={[
                { value: "all", label: "全部" },
                { value: "done", label: "完成" },
              ]}
              defaultValue="all"
            />
          ) : undefined
        }
        end={
          end ? (
            <M.ButtonGroup connected>
              <M.Button>导出</M.Button>
              <M.Button>更多</M.Button>
            </M.ButtonGroup>
          ) : undefined
        }
      />
    ),
  ),
  Container: p(
    "Container",
    {
      width: c("最大宽度", "420", [
        "280",
        "420",
        "600",
        "sm",
        "md",
        "lg",
        "xl",
        "none",
      ]),
      paddingInline: n("横向内边距", 16, 0, 48),
    },
    ({ width, ...props }) => (
      <div className="docs-playground-box">
        <M.Container
          {...props}
          maxWidth={/^[0-9]+$/.test(width) ? Number(width) : width}
          style={{ background: "var(--mt-subtle)", paddingBlock: 12 }}
        >
          内容在父容器中居中，并受最大宽度限制。
        </M.Container>
      </div>
    ),
  ),
  Panel: p(
    "Panel",
    {
      size: panelSize,
      tabPlacement: c("标签位置", "top", sides),
      collapseOnTabClick: f("重复点击收起", true),
      actions: f("面板操作", false, true),
      icon: f("标签图标", true, true),
      initial: f("初始收起", false, true),
    },
    ({ initial, actions, icon, ...props }) => (
      <M.Panel
        {...props}
        label="工作区面板"
        defaultCollapsed={initial}
        items={tabItems.map((item) => ({
          ...item,
          icon: icon ? item.icon : undefined,
        }))}
        actions={
          actions ? (
            <M.Button iconOnly aria-label="面板设置" size="sm">
              <Settings size={14} />
            </M.Button>
          ) : undefined
        }
      />
    ),
    { remountOn: ["initial"] },
  ),
  Splitter: p(
    "Splitter",
    {
      orientation: c("分割方向", "horizontal", ["horizontal", "vertical"]),
      bordered: f("外框", true),
      separatorBordered: f("手柄两侧边线", true),
      separatorVariant: c("分隔样式", "default", ["default", "line"], true),
      disabled: f("禁止拖动", false, true),
      lazy: f("松手再调整", false, true),
      collapsible: f("双击收起", true, true),
    },
    ({ collapsible, ...props }) => (
      <div style={{ height: 210 }}>
        <M.Splitter {...props}>
          <M.Splitter.Panel
            defaultSize="34%"
            min={54}
            label="侧栏"
            collapsible={collapsible}
          >
            侧栏
          </M.Splitter.Panel>
          <M.Splitter.Panel min={70} label="主内容">
            主内容
          </M.Splitter.Panel>
        </M.Splitter>
      </div>
    ),
    { remountOn: ["orientation"] },
  ),
  SectionGroup: p(
    "SectionGroup",
    {
      dividers: f("分隔线", true),
      actions: f("标题操作", true),
      heading: c("标题级别", "3", ["2", "3", "4", "5", "6"], true),
    },
    ({ actions, heading, ...props }) => (
      <M.SectionGroup {...props}>
        <M.SectionGroup.Section
          title="常规"
          headingLevel={Number(heading) as 2 | 3 | 4 | 5 | 6}
          actions={actions ? action : undefined}
        >
          项目名称与工作区信息
        </M.SectionGroup.Section>
        <M.SectionGroup.Section
          title="通知"
          headingLevel={Number(heading) as 2 | 3 | 4 | 5 | 6}
        >
          <M.Switch label="接收更新" />
        </M.SectionGroup.Section>
      </M.SectionGroup>
    ),
  ),
  Sidebar: p(
    "Sidebar",
    {
      collapsible: f("允许收起", true),
      withTabs: f("顶部标签"),
      collapsePlacement: c("收起按钮", "header", [
        ["header", "顶部"],
        ["footer", "底部"],
      ]),
      withFooter: f("底部内容", false, true),
      withHeader: f("顶部内容", true, true),
      initial: f("初始收起", false, true),
    },
    ({ withTabs, withFooter, withHeader, initial, ...props }) => (
      <M.Sidebar
        {...props}
        defaultCollapsed={initial}
        style={{
          maxWidth: 290,
          border: "1px solid var(--mt-border)",
          borderRadius: 6,
        }}
        tabs={
          withTabs
            ? {
                items: tabItems
                  .slice(0, 2)
                  .map((item) => ({ ...item, content: nav })),
              }
            : undefined
        }
        header={withHeader ? "知识库" : undefined}
        footer={withFooter ? "徐行健" : undefined}
      >
        {nav}
      </M.Sidebar>
    ),
    { remountOn: ["initial"] },
  ),
  NavGroup: p(
    "NavGroup",
    {
      divider: f("顶部间隔线", true),
      hasAction: f("右侧按钮", true),
      icon: f("选项图标", true),
      label: t("分组标题", "工作区", true),
    },
    (props) => <ActiveNav {...props} />,
  ),
  NavItem: p(
    "NavItem",
    {
      active: f("选中", true),
      disabled: f("禁用"),
      icon: f("前置图标", true),
      visibility: c(
        "右侧按钮",
        "hover",
        [
          ["hover", "悬停"],
          ["always", "常显"],
          ["active", "选中时"],
        ],
        true,
      ),
      hasActions: f("显示右侧按钮", true, true),
      label: t("标签", "项目文档", true),
    },
    ({ icon, visibility, hasActions, label, ...props }) => (
      <div style={{ maxWidth: 290 }}>
        <M.NavItem
          {...props}
          icon={icon ? <Folder size={15} /> : undefined}
          actions={
            hasActions
              ? {
                  visibility,
                  content: (
                    <M.Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      aria-label="新建文档"
                    >
                      <Plus size={14} />
                    </M.Button>
                  ),
                }
              : undefined
          }
        >
          {label}
        </M.NavItem>
      </div>
    ),
  ),
  NavSubmenu: p(
    "NavSubmenu",
    {
      initial: f("初始展开", true),
      disabled: f("禁用"),
      icon: f("图标", true),
      label: t("标签", "项目资料", true),
    },
    ({ initial, icon, ...props }) => (
      <div style={{ maxWidth: 290 }}>
        <M.NavSubmenu
          {...props}
          defaultExpanded={initial}
          icon={icon ? <Folder size={15} /> : undefined}
        >
          <M.NavItem active>快速开始</M.NavItem>
          <M.NavItem>发布记录</M.NavItem>
        </M.NavSubmenu>
      </div>
    ),
    { remountOn: ["initial"] },
  ),
  Breadcrumb: p(
    "Breadcrumb",
    {
      separator: c("分隔符", "/", ["/", "›", "→"]),
      icons: f("图标", true),
      menu: f("下拉菜单", true),
      disabled: f("禁用导航项", false, true),
    },
    ({ separator, icons, menu, disabled }) => (
      <M.Breadcrumb
        separator={separator}
        items={[
          {
            label: "主页",
            href: "#/components/Breadcrumb",
            icon: icons ? <Home size={14} /> : undefined,
            disabled,
          },
          {
            label: "知识库",
            icon: icons ? <Folder size={14} /> : undefined,
            menu: menu
              ? {
                  items: [
                    { key: "overview", label: "概览" },
                    { key: "project", label: "项目" },
                  ],
                }
              : undefined,
          },
          { label: "组件文档" },
        ]}
      />
    ),
  ),
  Tabs: p(
    "Tabs",
    {
      variant: c("外观", "line", ["line", "card", "editable-card", "attached"]),
      size: panelSize,
      placement: c("标签位置", "top", ["top", "bottom", "start", "end"]),
      centered: f("居中", false, true),
      gap: n("标签间距", 6, 0, 18, true),
      activateOnFocus: f("聚焦即激活", false, true),
      destroyOnHidden: f("隐藏时卸载", false, true),
      showIcons: f("标签图标", true, true),
      reorderable: f("可重排", false, true),
      hideAdd: {
        ...f("隐藏新建", false, true),
        when: (o) => o.variant === "editable-card",
      },
    },
    (props) => <TabsPreview {...props} />,
  ),
  AppLayout: p(
    "AppLayout",
    {
      sidebarCollapsible: f("可收起", true),
      sidebarResize: f("拖拽调宽"),
      sidebarWidth: n("侧栏宽度", 190, 120, 300, false, 10),
      showAccount: f("账户区", true, true),
      showFooter: f("侧栏底部内容", false, true),
      showBrand: f("品牌", true, true),
      fullHeight: f("充满所在区域", true, true),
    },
    ({ showAccount, showFooter, showBrand, ...props }) => (
      <div style={{ height: 245 }}>
        <M.AppLayout
          {...props}
          brand={showBrand ? "知识库" : undefined}
          navigation={nav}
          account={showAccount ? { name: "徐行健" } : undefined}
          sidebarFooter={showFooter ? <small>内部文档</small> : undefined}
          contentAs="section"
        >
          {workspace}
        </M.AppLayout>
      </div>
    ),
  ),
  AdminLayout: p(
    "AdminLayout",
    {
      hasSider: f("侧栏", true),
      collapsible: f("可收起", true),
      sidebarResize: f("拖拽调宽"),
      fullHeight: f("充满所在区域", true, true),
      notice: f("常驻提醒", false, true),
      width: n("侧栏宽度", 185, 115, 280, true, 5),
    },
    ({ collapsible, notice, width, ...props }) => (
      <div style={{ height: 245 }}>
        <M.AdminLayout
          {...props}
          notice={notice ? <M.GlobalNotice title="管理模式" /> : undefined}
        >
          {props.hasSider && (
            <M.AdminLayout.Sider
              width={width}
              logo="管理后台"
              collapsible={collapsible}
            >
              {nav}
            </M.AdminLayout.Sider>
          )}
          <M.AdminLayout.Header breadcrumb={breadcrumbs} extra={action} />
          <M.AdminLayout.Content>{workspace}</M.AdminLayout.Content>
        </M.AdminLayout>
      </div>
    ),
  ),
  Affix: p(
    "Affix",
    {
      side: c("停靠边缘", "top", ["top", "bottom"]),
      offset: n("边距（px）", 8, 0, 40),
      enabled: f("开启吸附", true),
    },
    (props) => <AffixPreview {...props} />,
  ),
  Divider: p(
    "Divider",
    {
      orientation: c("方向", "horizontal", ["horizontal", "vertical"]),
      variant: c("线型", "solid", ["solid", "dashed", "dotted"]),
      size: c("粗细", "medium", ["small", "medium", "large"]),
      titlePlacement: c("标题位置", "center", ["start", "center", "end"], true),
      plain: f("常规字重", false, true),
      label: t("标题", "分组", true),
    },
    ({ label, ...props }) =>
      props.orientation === "vertical" ? (
        <div className="docs-playground-actions">
          上一项
          <M.Divider {...props} />
          下一项
        </div>
      ) : (
        <div>
          章节上方<M.Divider {...props}>{label}</M.Divider>章节下方
        </div>
      ),
  ),
  TableOfContents: p(
    "TableOfContents",
    {
      listStyle: c("条目样式", "nested", ["nested", "flat"]),
      variant: c("外观", "default", ["default", "subtle"]),
      indent: n("层级缩进", 14, 0, 32, true),
      highlightLastAtEnd: f("底部高亮最后标题", true, true),
    },
    (props) => <ContentsPreview {...props} />,
  ),
};

function AffixPreview({
  side,
  offset,
  enabled,
}: {
  side: "top" | "bottom";
  offset: number;
  enabled: boolean;
}) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const button = <M.Button>新建文档</M.Button>;
  const control = enabled ? (
    <M.Affix
      target={() => target}
      offsetTop={side === "top" ? offset : undefined}
      offsetBottom={side === "bottom" ? offset : undefined}
    >
      {button}
    </M.Affix>
  ) : (
    button
  );
  return (
    <div
      className="docs-playground-box"
      ref={setTarget}
      style={{ height: 170, overflow: "auto" }}
    >
      {side === "bottom" && control}
      <p>在这个区域内滚动，观察按钮的停靠位置。</p>
      {side === "top" && control}
      {Array.from({ length: 8 }, (_, i) => (
        <p key={i}>项目记录 {i + 1}</p>
      ))}
      {side === "bottom" && <p>滚动区域底部</p>}
    </div>
  );
}
function ContentsPreview(
  props: Pick<
    M.TableOfContentsProps,
    "listStyle" | "variant" | "indent" | "highlightLastAtEnd"
  >,
) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  return (
    <div className="docs-playground-box">
      <M.TableOfContents
        {...props}
        root={target}
        scrollContainer={target}
        title="文档目录"
      />
      <div ref={setTarget} style={{ height: 140, overflow: "auto" }}>
        <h2 id="playground-toc-overview">概览</h2>
        <p>了解项目结构与内容。</p>
        <h3 id="playground-toc-setup">安装</h3>
        <p>配置工作区。</p>
        <h2 id="playground-toc-next">下一步</h2>
        <p>运行第一个示例。</p>
      </div>
    </div>
  );
}
