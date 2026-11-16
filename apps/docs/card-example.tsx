import React, { useState } from "react";
import { BookOpen, Bookmark, Check, MoreHorizontal } from "lucide-react";
import { Avatar, Badge, Button, Card, IconButton, Text } from "../../packages/mtone/src";

/** All actions below are local demo state; no account or server is changed. */
export function CardExample() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [notice, setNotice] = useState("所有操作仅影响当前示例，刷新后重置。");
  return (
    <div style={{ display: "grid", gap: 12, width: "100%", maxWidth: 560 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Button onClick={() => setLoading((value) => !value)}>
          {loading ? "结束加载演示" : "演示加载状态"}
        </Button>
        <Button variant="ghost" onClick={() => setActiveTab(activeTab === "overview" ? "notes" : "overview")}>
          外部切换标签
        </Button>
      </div>
      <Card
        title="设计知识库"
        extra={<IconButton aria-label="查看卡片信息" variant="ghost" onClick={() => setNotice("这张卡片组合了封面、元信息、标签页和底部操作。")}><MoreHorizontal size={16} /></IconButton>}
        cover={<div style={{ minHeight: 72, background: "var(--mt-subtle, #f7f7f5)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--mt-muted, #787774)" }}><BookOpen size={28} aria-hidden="true" /></div>}
        loading={loading}
        actions={[
          <Button key="save" variant="ghost" icon={saved ? <Check size={14} /> : <Bookmark size={14} />} onClick={() => { setSaved(!saved); setNotice(saved ? "已取消示例收藏。" : "已收藏到当前示例。"); }}>{saved ? "已收藏" : "收藏"}</Button>,
          <Button key="open" variant="ghost" onClick={() => { setActiveTab("notes"); setNotice("已切换到笔记内容。"); }}>阅读</Button>,
        ]}
        activeTabKey={activeTab}
        onTabChange={setActiveTab}
        tabList={[{ key: "overview", label: "概览" }, { key: "notes", label: "笔记" }]}
        tabBarExtraContent={<Badge>本地示例</Badge>}
      >
        {activeTab === "overview" ? <Card.Meta avatar={<Avatar name="林" />} title="把想法组织成知识" description="记录设计决定、使用约定与可复用的经验。" /> : <div><strong>阅读笔记</strong><p style={{ marginBottom: 0 }}>先保持结构清晰，再逐步增加有价值的信息。</p></div>}
      </Card>
      <div role="status" style={{ fontSize: 12, color: "var(--mt-muted, #787774)" }}>{notice}</div>
      <Card title="快速入口" size="small">
        <Card.Grid><strong>设计原则</strong><div><Text muted>简洁、清楚、可组合</Text></div></Card.Grid>
        <Card.Grid><strong>组件约定</strong><div><Text muted>一致的交互与反馈</Text></div></Card.Grid>
        <Card.Grid hoverable={false}><strong>版本记录</strong><div><Text muted>无悬浮提升的网格项</Text></div></Card.Grid>
      </Card>
      <Card type="inner" variant="borderless" title="嵌套内容" size="small">
        <Text muted>inner 样式和无边框变体可独立组合。悬浮样式不会把普通 div 变成按钮。</Text>
      </Card>
    </div>
  );
}
