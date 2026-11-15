import React, { useState } from "react";
import {
  Bell,
  BookOpen,
  Box,
  Clock,
  Grid2X2,
  Home,
  Layers,
  Pipette,
  Search,
  Settings,
  Star,
} from "lucide-react";
import {
  Avatar,
  Breadcrumb,
  Card,
  IconButton,
  Layout,
  NavItem,
  Text,
} from "../../packages/mtone/src";

const pages = [
  { name: "首页", icon: Home },
  { name: "最近访问", icon: Clock },
  { name: "收藏", icon: Star },
  { name: "知识库", icon: BookOpen },
  { name: "设置", icon: Settings },
];
const cards = [
  { title: "设计原则", text: "简洁、克制、一致的设计理念", icon: Layers },
  {
    title: "基础样式",
    text: "颜色、字体、间距、圆角等基础规范",
    icon: Pipette,
  },
  { title: "组件规范", text: "常用组件的使用指南与示例", icon: Grid2X2 },
];

export function LayoutExample({ compact = false }: { compact?: boolean }) {
  const [collapsed, setCollapsed] = useState(compact);
  const [page, setPage] = useState("知识库");
  const [notice, setNotice] = useState("");
  const title = page === "知识库" ? "设计规范" : page;
  const logo = (
    <span
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        fontSize: 19,
        fontWeight: 650,
      }}
    >
      <Box size={24} aria-hidden="true" />
      mtone
    </span>
  );
  return (
    <Layout
      hasSider
      aria-label="布局交互示例"
      style={{
        height: compact ? 132 : 420,
        width: "100%",
        border: "1px solid var(--mt-border, #e9e9e7)",
        borderRadius: 8,
        overflow: "hidden",
        fontSize: compact ? 11 : 13,
      }}
    >
      <Layout.Sider
        aria-label="示例导航"
        collapsible
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        width={200}
        collapsedWidth={52}
        breakpoint={compact ? undefined : 768}
        logo={logo}
        collapsedLogo={<Box size={22} aria-label="mtone" />}
      >
        {pages.map(({ name, icon: Icon }) => (
          <NavItem
            key={name}
            active={page === name}
            icon={<Icon size={17} aria-hidden="true" />}
            onClick={() => {
              setPage(name);
              setNotice("");
            }}
          >
            {name}
          </NavItem>
        ))}
      </Layout.Sider>
      <Layout>
        <Layout.Header
          style={compact ? { padding: "6px 10px" } : undefined}
          breadcrumb={
            <Breadcrumb items={[{ label: "知识库" }, { label: title }]} />
          }
          extra={
            compact ? null : (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <IconButton
                  variant="ghost"
                  aria-label="搜索示例"
                  onClick={() =>
                    setNotice(
                      "搜索是应用层功能，可在 extra 插槽接入 SearchInput 或自有搜索面板。此示例没有发送查询。",
                    )
                  }
                >
                  <Search size={17} />
                </IconButton>
                <IconButton
                  variant="ghost"
                  aria-label="查看通知"
                  onClick={() => setNotice("暂时没有新通知。")}
                >
                  <Bell size={17} />
                </IconButton>
                <IconButton
                  variant="ghost"
                  aria-label="打开设置"
                  onClick={() => {
                    setPage("设置");
                    setNotice("");
                  }}
                >
                  <Settings size={17} />
                </IconButton>
                <Avatar name="用户" />
              </div>
            )
          }
        />
        <Layout.Content
          as="section"
          aria-label="示例内容"
          style={{ padding: compact ? 10 : 24 }}
        >
          <h3
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              margin: "0 0 12px",
              fontSize: compact ? 15 : 25,
            }}
          >
            <BookOpen size={compact ? 17 : 28} aria-hidden="true" />
            {title}
          </h3>
          {!compact && (
            <p
              style={{
                color: "var(--mt-muted, #787774)",
                margin: "0 0 28px",
                lineHeight: 1.7,
              }}
            >
              mtone
              的界面与组件设计规范，包含设计原则、基础样式、组件使用说明等，帮助你在项目中快速构建一致的体验。
            </p>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 150px), 1fr))",
              gap: compact ? 6 : 16,
            }}
          >
            {(compact ? cards.slice(0, 1) : cards).map(
              ({ title: cardTitle, text, icon: Icon }) => (
                <Card key={cardTitle} style={{ padding: compact ? 8 : 20 }}>
                  {!compact && <Icon size={24} aria-hidden="true" />}
                  <h4
                    style={{
                      margin: compact ? 0 : "16px 0 8px",
                      fontSize: compact ? 11 : 16,
                    }}
                  >
                    {cardTitle}
                  </h4>
                  {!compact && <Text muted>{text}</Text>}
                </Card>
              ),
            )}
          </div>
          {!compact && (
            <p
              role="status"
              style={{
                color: "var(--mt-muted, #787774)",
                fontSize: 12,
                marginTop: 24,
              }}
            >
              {notice ||
                "点击导航、收起按钮或右上角操作。所有变化仅发生在此示例中。"}
            </p>
          )}
        </Layout.Content>
        {!compact && (
          <Layout.Footer>mtone · 内容优先的 React 组件库</Layout.Footer>
        )}
      </Layout>
    </Layout>
  );
}
