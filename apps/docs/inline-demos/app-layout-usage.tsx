import * as React from "react";
import {
  Box,
  BookOpen,
  Folder,
  House,
  LogOut,
  Moon,
  Settings,
  User,
  Users,
} from "lucide-react";
import {
  AppLayout,
  Avatar,
  Button,
  NavGroup,
  NavItem,
  PageLayout,
  Switch,
  Table,
  Tag,
} from "../../../packages/mtone/src";

const defaults = {
  resize: true,
  separatorBordered: true,
  collapsible: true,
  brand: true,
  account: true,
  footer: false,
  fullHeight: false,
  width: 240,
};
export default function Demo() {
  const [page, setPage] = React.useState("项目");
  const [feedback, setFeedback] = React.useState("");
  const [config, setConfig] = React.useState(defaults);
  const [resetCount, setResetCount] = React.useState(0);
  const update = <K extends keyof typeof defaults>(
    key: K,
    value: (typeof defaults)[K],
  ) => setConfig((current) => ({ ...current, [key]: value }));
  const toggles = [
    ["resize", "拖动调宽"],
    ["separatorBordered", "分隔条边框"],
    ["collapsible", "允许折叠"],
    ["brand", "显示品牌"],
    ["account", "显示账户"],
    ["footer", "自定义底部"],
    ["fullHeight", "占满视口高度"],
  ] as const;
  const projects = [
    ["组件库", "进行中", "2026-11-26"],
    ["知识库", "已发布", "2026-11-24"],
    ["文档站", "进行中", "2026-11-23"],
  ];
  return (
    <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
      <div
        role="group"
        aria-label="AppLayout 示例配置"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "8px 14px",
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          侧栏初始宽度
          <input
            type="range"
            min={160}
            max={300}
            step={10}
            value={config.width}
            aria-valuetext={`${config.width} px`}
            onChange={(event) =>
              update("width", event.currentTarget.valueAsNumber)
            }
            style={{ inlineSize: 100, accentColor: "var(--mt-accent-blue)" }}
          />
          <span aria-hidden="true">{config.width} px</span>
        </label>
        {toggles.map(([key, label]) => (
          <Switch
            key={key}
            label={label}
            checked={config[key]}
            disabled={key === "separatorBordered" && !config.resize}
            onCheckedChange={(value) => update(key, value)}
          />
        ))}
        <Button
          variant="ghost"
          onClick={() => {
            setConfig(defaults);
            setResetCount((count) => count + 1);
          }}
        >
          恢复示例配置
        </Button>
      </div>
      <AppLayout
        key={`${config.width}:${resetCount}`}
        fullHeight={config.fullHeight}
        style={{
          height: config.fullHeight ? undefined : 420,
          border: "1px solid var(--mt-border)",
          borderRadius: 8,
          overflow: "hidden",
        }}
        sidebarWidth={config.width}
        sidebarResize={
          config.resize && {
            minWidth: 160,
            maxWidth: 300,
            separatorBordered: config.separatorBordered,
          }
        }
        sidebarCollapsible={config.collapsible}
        sidebarFooter={config.footer ? <Tag>工作区在线</Tag> : undefined}
        contentAs="section"
        contentLabel="工作区预览"
        brand={
          config.brand ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Box size={18} aria-hidden /> <strong>mtone</strong>
            </span>
          ) : undefined
        }
        navigationLabel="工作区导航"
        navigation={
          <>
            <NavGroup label="工作台">
              <NavItem
                icon={<House size={16} aria-hidden />}
                active={page === "概览"}
                onClick={() => setPage("概览")}
              >
                概览
              </NavItem>
              <NavItem
                icon={<Folder size={16} aria-hidden />}
                active={page === "项目"}
                onClick={() => setPage("项目")}
              >
                项目
              </NavItem>
              <NavItem
                icon={<BookOpen size={16} aria-hidden />}
                active={page === "文档"}
                onClick={() => setPage("文档")}
              >
                文档
              </NavItem>
            </NavGroup>
            <NavGroup label="管理">
              <NavItem
                icon={<Users size={16} aria-hidden />}
                active={page === "成员"}
                onClick={() => setPage("成员")}
              >
                成员
              </NavItem>
            </NavGroup>
          </>
        }
        account={
          config.account
            ? {
                name: "工作区成员",
                description: "个人工作区",
                avatar: <Avatar size={30}>X</Avatar>,
                items: [
                  {
                    key: "profile",
                    label: "个人资料",
                    icon: <User size={15} />,
                    onSelect: () => setFeedback("已选择个人资料"),
                  },
                  {
                    key: "settings",
                    label: "账号设置",
                    icon: <Settings size={15} />,
                    onSelect: () => setFeedback("已选择账号设置"),
                  },
                  {
                    key: "theme",
                    label: "切换主题",
                    icon: <Moon size={15} />,
                    onSelect: () => setFeedback("由应用更新主题设置"),
                  },
                  { type: "divider", key: "divider" },
                  {
                    key: "sign-out",
                    label: "退出登录",
                    icon: <LogOut size={15} />,
                    onSelect: () => setFeedback("由应用处理退出登录"),
                  },
                ],
              }
            : undefined
        }
      >
        <PageLayout
          headingLevel={3}
          title={page}
          subtitle={page === "项目" ? "查看和管理工作区中的项目" : undefined}
          actions={
            page === "项目" ? (
              <Button
                variant="solid"
                onClick={() => setFeedback("已选择新建项目")}
              >
                新建项目
              </Button>
            ) : undefined
          }
        >
          {page === "项目" ? (
            <div style={{ overflowX: "auto" }}>
              <Table bordered>
                <thead>
                  <tr>
                    <th>项目名称</th>
                    <th>状态</th>
                    <th>更新时间</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(([name, state, date]) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>
                        <Tag>{state}</Tag>
                      </td>
                      <td>{date}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <p>{page}页面内容</p>
          )}
          {feedback && <p role="status">{feedback}</p>}
        </PageLayout>
      </AppLayout>
    </div>
  );
}
