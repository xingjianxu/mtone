import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import * as M from "../../packages/mtone/src";
import {
  Plus,
  Search,
  Star,
  MoreHorizontal,
  Copy,
  Folder,
  FileText,
  Clock,
  Home,
  PanelLeft,
  ArrowUpRight,
  SlidersHorizontal,
  LayoutGrid,
  List as ListIcon,
  Table2,
  Upload as UploadIcon,
  Command,
  Check,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import "../../packages/mtone/dist/styles.css";
import "./site.css";
const options = [
  { value: "design", label: "产品设计" },
  { value: "research", label: "研究笔记" },
  { value: "engineering", label: "技术文档" },
];
const docs = [
  {
    id: "1",
    title: "知识库使用指南",
    description: "从一个想法开始，构建你的知识体系",
    updatedAt: "2小时前",
  },
  {
    id: "2",
    title: "项目研究笔记",
    description: "值得保留的观察与思考",
    updatedAt: "昨天",
  },
  {
    id: "3",
    title: "阅读清单",
    description: "让知识发生连接",
    updatedAt: "3天前",
  },
];
function Section({
  n,
  title,
  description,
  children,
}: {
  n: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="demo-section" id={`section-${n}`}>
      <header>
        <span className="section-number">{n}</span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </header>
      <div className="section-content">{children}</div>
    </section>
  );
}
function ToastDemo() {
  const t = M.useToast();
  return (
    <M.Button
      onClick={() =>
        t.add({ title: "已保存", description: "你的更改已安全保留。" })
      }
    >
      <Check size={14} />
      显示消息
    </M.Button>
  );
}
function App() {
  const [page, setPage] = useState("overview");
  const [demoPage, setDemoPage] = useState(1);
  const [density, setDensity] = useState<"compact" | "comfortable">("compact");
  const [locale, setLocale] = useState<"zh" | "en">("zh");
  const [modal, setModal] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [filter, setFilter] = useState(true);
  const [name, setName] = useState("设计规范");
  return (
    <M.MtoneProvider density={density} locale={locale}>
      <M.ToastProvider>
        <div className="app-shell">
          <aside className="site-sidebar">
            <a className="brand" href="#">
              <span className="brand-mark">m</span>mtone
              <span className="version">0.1</span>
            </a>
            <div className="sidebar-intro">
              Less interface.
              <br />
              More room for thought.
            </div>
            <div className="sidebar-label">开始使用</div>
            <M.NavItem
              icon={<LayoutGrid size={15} />}
              active={page === "overview"}
              onClick={() => setPage("overview")}
            >
              组件总览 <span className="nav-count">11</span>
            </M.NavItem>
            <M.NavItem
              icon={<BookOpen size={15} />}
              active={page === "guide"}
              onClick={() => setPage("guide")}
            >
              安装与使用
            </M.NavItem>
            <M.NavItem
              icon={<Folder size={15} />}
              active={page === "workspace"}
              onClick={() => setPage("workspace")}
            >
              知识库示例
            </M.NavItem>
            <div className="sidebar-label">组件分类</div>
            {[
              "按钮与操作",
              "输入与表单",
              "选择控件",
              "导航与目录",
              "标签页与筛选",
              "菜单与浮层",
              "页面与文档",
              "数据表格",
              "属性与状态",
              "弹窗与抽屉",
              "反馈与上传",
            ].map((x, i) => (
              <a
                className="side-anchor"
                href={`#section-${String(i + 1).padStart(2, "0")}`}
                key={x}
                onClick={() => setPage("overview")}
              >
                {x}
              </a>
            ))}
            <div className="sidebar-bottom">
              <span className="status-dot" /> Base UI · Tailwind · Lucide
              <div>为内容而设计，为开发者而构建。</div>
            </div>
          </aside>
          <main className="site-main">
            <div className="topbar">
              <M.Breadcrumb
                items={[
                  { label: "mtone" },
                  {
                    label:
                      page === "guide"
                        ? "快速开始"
                        : page === "workspace"
                          ? "知识库"
                          : "组件总览",
                  },
                ]}
              />
              <div className="top-actions">
                <button
                  onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
                >
                  {locale === "zh" ? "中 / EN" : "EN / 中"}
                </button>
                <span className="top-divider" />
                <button
                  onClick={() =>
                    setDensity(
                      density === "compact" ? "comfortable" : "compact",
                    )
                  }
                >
                  <SlidersHorizontal size={13} />
                  {density === "compact" ? "紧凑" : "舒适"}
                </button>
                <span className="light-pill">LIGHT</span>
              </div>
            </div>
            <div className="page-content">
              {page === "guide" ? (
                <Guide />
              ) : page === "workspace" ? (
                <Workspace />
              ) : (
                <>
                  <div className="hero">
                    <div className="eyebrow">THE QUIET INTERFACE</div>
                    <h1>让内容成为主角。</h1>
                    <p>
                      一套简约、紧凑的 React 组件。减少视觉噪音，
                      <br className="desktop-break" />
                      为你的知识、想法与工作留出更多空间。
                    </p>
                    <div className="hero-actions">
                      <M.Button
                        variant="solid"
                        onClick={() => setPage("guide")}
                      >
                        开始使用 <ArrowUpRight size={14} />
                      </M.Button>
                      <span className="install-inline">
                        npm install ./mtone-0.1.0.tgz
                      </span>
                    </div>
                    <div className="hero-meta">
                      React + TypeScript <span>·</span> Base UI 交互{" "}
                      <span>·</span> 预编译样式
                    </div>
                  </div>
                  <div className="token-strip">
                    {[
                      ["#37352F", "文字"],
                      ["#787774", "次要文字"],
                      ["#E9E9E7", "分割线"],
                      ["#F7F7F5", "侧栏"],
                      ["#FFFFFF", "页面"],
                    ].map(([c, l]) => (
                      <div key={c}>
                        <i style={{ background: c }} />
                        <span>
                          {l}
                          <small>{c}</small>
                        </span>
                      </div>
                    ))}
                    <div className="token-metric">
                      <b>14</b>
                      <span>正文</span>
                    </div>
                    <div className="token-metric">
                      <b>28</b>
                      <span>控件</span>
                    </div>
                    <div className="token-metric">
                      <b>4</b>
                      <span>圆角</span>
                    </div>
                  </div>
                  <div className="component-grid">
                    <Section
                      n="01"
                      title="按钮与操作"
                      description="清晰表达每一个动作。"
                    >
                      <div className="demo-row">
                        <M.Button variant="solid" icon={<Plus size={14} />}>
                          新建
                        </M.Button>
                        <M.Button icon={<UploadIcon size={14} />}>
                          导入
                        </M.Button>
                        <M.Button variant="ghost">取消</M.Button>
                        <M.Button variant="ghost" danger>
                          删除
                        </M.Button>
                      </div>
                      <div className="demo-row">
                        {[Plus, Search, Star, MoreHorizontal, Copy].map(
                          (I, i) => (
                            <M.IconButton
                              key={i}
                              aria-label={
                                ["新建", "搜索", "收藏", "更多", "复制"][i]
                              }
                            >
                              <I size={15} />
                            </M.IconButton>
                          ),
                        )}
                        <M.Button disabled>不可用</M.Button>
                      </div>
                      <div className="demo-row">
                        <M.Button variant="soft" icon={<Star size={14} />}>
                          收藏
                        </M.Button>
                        <M.Button loading variant="ghost">
                          保存中
                        </M.Button>
                      </div>
                    </Section>
                    <Section
                      n="02"
                      title="输入与表单"
                      description="轻量的边界，明确的反馈。"
                    >
                      <M.SearchInput
                        placeholder="搜索知识库…"
                        aria-label="搜索知识库"
                      />
                      <div className="form-demo">
                        <M.FormField label="名称">
                          <M.Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </M.FormField>
                        <M.FormField label="说明">
                          <M.Textarea placeholder="添加描述…" rows={2} />
                        </M.FormField>
                      </div>
                    </Section>
                    <Section
                      n="03"
                      title="选择控件"
                      description="细节一致，操作自然。"
                    >
                      <div className="selection-grid">
                        <div className="stack">
                          <M.Checkbox defaultChecked label="已选中" />
                          <M.Checkbox label="未选中" />
                          <M.Checkbox disabled label="不可用" />
                        </div>
                        <M.RadioGroup
                          label="选项"
                          defaultValue="a"
                          options={[
                            { value: "a", label: "选项 A" },
                            { value: "b", label: "选项 B" },
                          ]}
                        />
                        <div className="stack">
                          <M.Switch defaultChecked label="自动保存" />
                          <M.Switch disabled label="公开分享" />
                        </div>
                      </div>
                      <div className="demo-row">
                        <span className="micro-label">进度</span>
                        <M.Slider label="进度" defaultValue={60} />
                        <span>60%</span>
                      </div>
                      <div className="demo-row">
                        <M.NumberInput label="数量" defaultValue={1} min={0} />
                        <M.DatePicker defaultValue="2026-11-15" label="日期" />
                        <M.Select
                          options={options}
                          defaultValue="design"
                          label="知识库"
                        />
                      </div>
                      <M.MultiSelect
                        options={options}
                        defaultValue={["design"]}
                        label="标签"
                      />
                    </Section>
                    <Section
                      n="04"
                      title="导航与目录"
                      description="有序组织，随时抵达。"
                    >
                      <M.Sidebar>
                        <M.NavItem icon={<Search size={14} />}>搜索</M.NavItem>
                        <M.NavItem icon={<Clock size={14} />}>
                          最近访问
                        </M.NavItem>
                        <M.NavGroup label="私人空间">
                          <M.Tree
                            items={[
                              {
                                id: "root",
                                label: "我的知识库",
                                children: [
                                  {
                                    id: "design",
                                    label: "产品设计",
                                    children: [
                                      { id: "spec", label: "组件规范" },
                                      { id: "notes", label: "交互笔记" },
                                    ],
                                  },
                                  { id: "tech", label: "技术文档" },
                                ],
                              },
                            ]}
                            defaultExpanded={["root", "design"]}
                            defaultValue="spec"
                          />
                        </M.NavGroup>
                      </M.Sidebar>
                    </Section>
                    <Section
                      n="05"
                      title="标签页与筛选"
                      description="不同视角，同一份内容。"
                    >
                      <M.Breadcrumb
                        items={[
                          { label: "知识库", href: "#" },
                          { label: "产品设计", href: "#" },
                          { label: "组件规范" },
                        ]}
                      />
                      <M.Tabs
                        items={[
                          {
                            value: "all",
                            label: "全部",
                            content: "汇集每一份值得保留的内容。",
                          },
                          {
                            value: "recent",
                            label: "最近",
                            content: "最近编辑的文档会显示在这里。",
                          },
                          {
                            value: "star",
                            label: "收藏",
                            content: "你收藏的重要文档。",
                          },
                        ]}
                      />
                      <M.Segmented
                        options={[
                          {
                            value: "table",
                            label: (
                              <>
                                <Table2 size={13} /> 表格
                              </>
                            ),
                          },
                          {
                            value: "list",
                            label: (
                              <>
                                <ListIcon size={13} /> 列表
                              </>
                            ),
                          },
                        ]}
                        defaultValue="table"
                      />
                      <M.FilterBar>
                        {filter && (
                          <M.FilterChip onRemove={() => setFilter(false)}>
                            分类：设计
                          </M.FilterChip>
                        )}
                        <M.Button
                          variant="ghost"
                          onClick={() => setFilter(true)}
                        >
                          筛选
                        </M.Button>
                      </M.FilterBar>
                      <M.Pagination
                        total={80}
                        pageSize={10}
                        page={demoPage}
                        onPageChange={setDemoPage}
                      />
                    </Section>
                    <Section
                      n="06"
                      title="菜单与浮层"
                      description="需要时出现，不打扰阅读。"
                    >
                      <div className="demo-row">
                        <M.DropdownMenu
                          trigger={
                            <M.Button>
                              文档操作 <MoreHorizontal size={14} />
                            </M.Button>
                          }
                          items={[
                            { key: "open", label: "打开" },
                            { key: "copy", label: "复制链接" },
                            { key: "star", label: "添加收藏" },
                            {
                              key: "delete",
                              label: "移至回收站",
                              danger: true,
                            },
                          ]}
                        />
                        <M.Tooltip content="复制链接">
                          <M.IconButton aria-label="复制链接">
                            <Copy size={14} />
                          </M.IconButton>
                        </M.Tooltip>
                        <M.Popover
                          title="快速笔记"
                          trigger={<M.Button>浮层</M.Button>}
                          content={<M.Textarea placeholder="记录一个想法…" />}
                        />
                      </div>
                      <M.ContextMenu
                        items={[
                          { key: "copy", label: "复制" },
                          { key: "paste", label: "粘贴", disabled: true },
                        ]}
                      >
                        <div className="context-target">
                          <Command size={18} />
                          <span>在此区域点击右键</span>
                          <small>上下文菜单</small>
                        </div>
                      </M.ContextMenu>
                    </Section>
                    <Section
                      n="07"
                      title="页面与文档"
                      description="标题、摘要与时间，恰到好处。"
                    >
                      <M.DocumentList items={docs} />
                      <div className="document-cards">
                        <M.DocumentCard
                          id="4"
                          title="设计规范"
                          description="设计 · 更新于 1 天前"
                        />
                        <M.DocumentCard
                          id="5"
                          title="会议记录"
                          description="文档 · 更新于 3 天前"
                        />
                      </div>
                    </Section>
                    <Section
                      n="08"
                      title="数据表格"
                      description="结构化信息，一眼看清。"
                    >
                      <M.Table
                        selectable
                        data={[
                          {
                            id: "1",
                            name: "组件规范",
                            category: "设计",
                            status: "进行中",
                          },
                          {
                            id: "2",
                            name: "项目笔记",
                            category: "研究",
                            status: "已完成",
                          },
                          {
                            id: "3",
                            name: "阅读记录",
                            category: "待办",
                            status: "进行中",
                          },
                          {
                            id: "4",
                            name: "接口文档",
                            category: "研究",
                            status: "未开始",
                          },
                        ]}
                        rowKey="id"
                        columns={[
                          {
                            key: "name",
                            title: "名称",
                            dataIndex: "name",
                            sortable: true,
                            filterable: true,
                          },
                          {
                            key: "category",
                            title: "分类",
                            dataIndex: "category",
                            render: (v) => (
                              <M.Tag tone="purple">{String(v)}</M.Tag>
                            ),
                          },
                          {
                            key: "status",
                            title: "状态",
                            dataIndex: "status",
                            render: (v) => (
                              <M.Status
                                tone={v === "已完成" ? "green" : "orange"}
                              >
                                {String(v)}
                              </M.Status>
                            ),
                          },
                        ]}
                      />
                    </Section>
                    <Section
                      n="09"
                      title="属性与状态"
                      description="用克制的色彩传达意义。"
                    >
                      <div className="demo-row">
                        <M.Tag tone="orange">设计</M.Tag>
                        <M.Tag tone="purple">研究</M.Tag>
                        <M.Tag tone="green">已归档</M.Tag>
                        <M.AvatarGroup
                          items={[
                            { name: "张" },
                            { name: "李" },
                            { name: "王" },
                            { name: "陈" },
                            { name: "林" },
                          ]}
                          max={3}
                        />
                      </div>
                      <div className="demo-row">
                        <M.Status>未开始</M.Status>
                        <M.Status tone="orange">进行中</M.Status>
                        <M.Status tone="green">已完成</M.Status>
                      </div>
                      <M.PropertyList>
                        <M.PropertyItem label="类型">文档</M.PropertyItem>
                        <M.PropertyItem label="标签">
                          <M.Tag tone="purple">研究</M.Tag>
                        </M.PropertyItem>
                        <M.PropertyItem label="负责人">
                          <M.Avatar name="我" />
                        </M.PropertyItem>
                      </M.PropertyList>
                      <div className="demo-row">
                        <span>进度</span>
                        <M.Progress value={68} />
                        <small>68%</small>
                      </div>
                    </Section>
                    <Section
                      n="10"
                      title="弹窗与属性抽屉"
                      description="聚焦任务，保留上下文。"
                    >
                      <div className="demo-row">
                        <M.Button
                          onClick={() => setModal(true)}
                          icon={<Plus size={14} />}
                        >
                          新建知识库
                        </M.Button>
                        <M.Button
                          onClick={() => setDrawer(true)}
                          icon={<PanelLeft size={14} />}
                        >
                          文档属性
                        </M.Button>
                      </div>
                      <M.ConfirmDialog
                        title="删除这份文档？"
                        description="示例操作，不会删除真实数据。"
                        danger
                        trigger={
                          <M.Button variant="ghost" danger>
                            危险操作确认
                          </M.Button>
                        }
                        onConfirm={async () => {}}
                      />
                      <M.Modal
                        title="新建知识库"
                        description="为你的下一个想法创建空间。"
                        open={modal}
                        onOpenChange={setModal}
                        footer={
                          <>
                            <M.Button onClick={() => setModal(false)}>
                              取消
                            </M.Button>
                            <M.Button
                              variant="solid"
                              onClick={() => setModal(false)}
                            >
                              创建
                            </M.Button>
                          </>
                        }
                      >
                        <M.FormField label="名称">
                          <M.Input placeholder="研究笔记" />
                        </M.FormField>
                      </M.Modal>
                      <M.Drawer
                        title="文档属性"
                        open={drawer}
                        onOpenChange={setDrawer}
                      >
                        <M.PropertyList>
                          <M.PropertyItem label="类型">文档</M.PropertyItem>
                          <M.PropertyItem label="标签">
                            <M.Tag tone="orange">设计</M.Tag>
                          </M.PropertyItem>
                        </M.PropertyList>
                      </M.Drawer>
                      <div className="quiet-note">
                        支持键盘导航、焦点管理与 Esc 关闭。
                      </div>
                    </Section>
                    <Section
                      n="11"
                      title="反馈与上传"
                      description="让每一次操作都有回应。"
                    >
                      <M.Alert tone="success">已保存</M.Alert>
                      <M.Alert tone="warning">
                        离线模式，联网后自动同步（示例文案）
                      </M.Alert>
                      <ToastDemo />
                      <div className="demo-row">
                        <M.Skeleton style={{ width: "45%" }} />
                        <M.Skeleton style={{ width: "30%" }} />
                        <M.Spinner />
                      </div>
                      <M.Upload
                        accept=".txt,.md"
                        maxSize={1024 * 1024}
                        upload={async (_file, { signal, onProgress }) => {
                          for (let i = 0; i <= 100; i += 25) {
                            if (signal.aborted) throw new Error("Cancelled");
                            onProgress(i);
                            await new Promise((r) => setTimeout(r, 150));
                          }
                        }}
                      />
                      <small>模拟上传：文件不会发送到服务器。</small>
                    </Section>
                  </div>
                  <footer className="page-footer">
                    <span className="brand-mini">mtone</span>{" "}
                    有样式的组件，无多余的噪音。
                    <span>01 / LIGHT COLLECTION</span>
                  </footer>
                </>
              )}
            </div>
          </main>
        </div>
      </M.ToastProvider>
    </M.MtoneProvider>
  );
}
function Guide() {
  return (
    <article className="guide">
      <div className="eyebrow">GETTING STARTED</div>
      <h1>一次安装，开始构建。</h1>
      <p>
        mtone 是完整的、有样式的 React
        组件包。无需复制组件源码，无需在你的应用里配置 Tailwind。
      </p>
      <h2>安装本地交付包</h2>
      <pre>npm install ./mtone-0.1.0.tgz</pre>
      <h2>使用组件</h2>
      <pre>{`import { Button, MtoneProvider } from 'mtone';\nimport 'mtone/styles.css';\n\n<MtoneProvider locale="zh" density="compact">\n  <Button variant="solid">新建文档</Button>\n</MtoneProvider>`}</pre>
      <h2>设计与约定</h2>
      <p>
        基础控件由 Base UI 提供交互逻辑，mtone 提供成品样式。通过 CSS
        变量定制颜色和圆角；不输出 Tailwind Preflight，避免重置你的页面。
      </p>
      <M.Alert title="0.1.0 范围">
        本版本不包含块编辑器、服务器或文件存储。日期选择为单日期，表格支持基本数据操作。公共
        npm 尚未发布，请使用交付的 tgz 安装。
      </M.Alert>
      <h2>完整 API</h2>
      <p>
        源码包中的 docs/API.md
        包含全部组件接口、使用示例与已知限制。类型声明随安装包一起交付。
      </p>
    </article>
  );
}
function Workspace() {
  const [query, setQuery] = useState("");
  return (
    <div className="workspace-demo">
      <div className="eyebrow">KNOWLEDGE, CONNECTED</div>
      <h1>我的知识库</h1>
      <p className="workspace-lead">记录、整理，然后让想法慢慢生长。</p>
      <div className="workspace-toolbar">
        <M.SearchInput
          aria-label="搜索文档"
          placeholder="搜索文档…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <M.Button variant="solid" icon={<Plus size={14} />}>
          新建文档
        </M.Button>
      </div>
      <div className="workspace-cards">
        {docs
          .filter((x) => x.title.includes(query))
          .map((x) => (
            <M.DocumentCard {...x} key={x.id} />
          ))}
      </div>
      {!docs.some((x) => x.title.includes(query)) && (
        <M.Empty description="尝试其他关键词" />
      )}
      <h2>最近更新</h2>
      <M.DocumentList items={docs.filter((x) => x.title.includes(query))} />
      <M.Alert tone="info">
        这是组件组合示例，使用本地样例数据，不连接后端。
      </M.Alert>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
