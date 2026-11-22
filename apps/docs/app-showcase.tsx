import React, { useId, useMemo, useState } from "react";
import {
  BookOpen,
  FileText,
  FolderOpen,
  Grid2X2,
  List,
  Plus,
  Search,
  Star,
  Trash2,
  Layers,
  PenLine,
  ArrowUpRight,
  FlaskConical,
  Box,
  Info,
} from "lucide-react";
import {
  Avatar,
  Tag,
  Breadcrumb,
  Button,
  ConfirmDialog,
  Dialog,
  FormField,
  Input,
  AdminLayout,
  NavItem,
  SearchInput,
  Select,
  Textarea,
  ToastProvider,
  useToast,
} from "../../packages/mtone/src";
import "./app-showcase.css";

type Category = "设计" | "产品" | "研究";
type Document = {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: Category;
  draft: boolean;
  favorite: boolean;
  updated: string;
};
const initialDocuments: Document[] = [
  {
    id: "principles",
    title: "设计原则",
    summary: "用清晰的层级与克制的表达，让复杂的工作变得简单。",
    body: "清晰优先\n让内容成为主角，每一个控件都应该有明确的目的。\n\n保持一致\n复用语言、间距与交互模式，减少重复学习。\n\n尊重注意力\n只在需要的时候提供恰当的反馈。",
    category: "设计",
    draft: false,
    favorite: true,
    updated: "今天",
  },
  {
    id: "kickoff",
    title: "项目启动清单",
    summary: "从问题定义到阶段目标，一起建立项目的共同起点。",
    body: "1. 写下我们要解决的问题。\n2. 明确目标用户与成功标准。\n3. 整理现有资料与待验证假设。\n4. 约定第一个可交付成果。",
    category: "产品",
    draft: false,
    favorite: false,
    updated: "今天",
  },
  {
    id: "interview",
    title: "用户访谈手册",
    summary: "从真实故事出发，听见需求背后的动机和习惯。",
    body: "访谈前：确认研究目标，准备开放式问题。\n\n访谈中：请对方描述最近一次真实经历，避免引导答案。\n\n访谈后：区分事实、观察与推断，及时整理记录。",
    category: "研究",
    draft: false,
    favorite: true,
    updated: "昨天",
  },
  {
    id: "release",
    title: "发布检查清单",
    summary: "把最后一公里走稳，让每次发布都可追溯、可回退。",
    body: "核对范围与变更记录。\n检查关键流程、键盘操作与移动端布局。\n确认回退方案。\n发布后核验线上结果。",
    category: "产品",
    draft: false,
    favorite: false,
    updated: "11 月 12 日",
  },
  {
    id: "voice",
    title: "品牌语气指南",
    summary: "直接、友好、有帮助。让每一句文案都像一个可靠的伙伴。",
    body: "使用读者熟悉的词。\n先说结果，再补充必要的细节。\n错误信息应说明发生了什么，以及下一步可以做什么。",
    category: "设计",
    draft: true,
    favorite: false,
    updated: "11 月 11 日",
  },
  {
    id: "ideas",
    title: "灵感收集箱",
    summary: "暂时没有答案的观察，也值得留下一个位置。",
    body: "待探索：如何让新成员更快找到需要的信息？\n\n观察：目录的命名往往比目录的数量更重要。",
    category: "研究",
    draft: true,
    favorite: false,
    updated: "11 月 10 日",
  },
];
const categoryIcons = { 设计: Layers, 产品: Box, 研究: FlaskConical };
const blank = (): Omit<Document, "id" | "updated"> => ({
  title: "",
  summary: "",
  body: "",
  category: "设计",
  draft: true,
  favorite: false,
});

export function AppShowcase({ toolbarExtra }: { toolbarExtra?: React.ReactNode }) {
  return (
    <ToastProvider>
      <KnowledgeWorkspace toolbarExtra={toolbarExtra} />
    </ToastProvider>
  );
}
function KnowledgeWorkspace({ toolbarExtra }: { toolbarExtra?: React.ReactNode }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [section, setSection] = useState<"all" | "favorites" | "drafts">("all");
  const [category, setCategory] = useState<Category | "全部">("全部");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"cards" | "list">("cards");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(blank);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const id = useId();
  const toast = useToast();
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return documents.filter(
      (doc) =>
        (section !== "favorites" || doc.favorite) &&
        (section !== "drafts" || doc.draft) &&
        (category === "全部" || doc.category === category) &&
        (!term ||
          `${doc.title} ${doc.summary} ${doc.body}`
            .toLocaleLowerCase()
            .includes(term)),
    );
  }, [documents, section, category, query]);
  const resetFilters = () => {
    setQuery("");
    setCategory("全部");
    setSection("all");
  };
  const openEditor = (doc?: Document) => {
    setEditingId(doc?.id ?? null);
    setDraft(doc ? { ...doc } : blank());
    setError("");
    setEditorOpen(true);
  };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) {
      setError("请填写文档标题");
      return;
    }
    const next = {
      ...draft,
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      id: editingId ?? `document-${Date.now()}`,
      updated: "刚刚",
    };
    setDocuments((items) =>
      editingId
        ? items.map((item) => (item.id === editingId ? next : item))
        : [next, ...items],
    );
    setEditorOpen(false);
    resetFilters();
    toast.success({
      title: editingId ? "文档已更新" : "文档已创建",
      body: "仅保存在当前页面，刷新后将重置。",
    });
  };
  const favorite = (doc: Document) => {
    setDocuments((items) =>
      items.map((item) =>
        item.id === doc.id ? { ...item, favorite: !item.favorite } : item,
      ),
    );
    toast.info({
      title: doc.favorite ? "已取消收藏" : "已加入收藏",
      body: doc.title,
    });
  };
  const sectionLabel =
    section === "favorites"
      ? "我的收藏"
      : section === "drafts"
        ? "草稿"
        : "全部文档";
  return (
    <div className="showcase">
      <AdminLayout hasSider className="showcase-shell" aria-label="知识库应用示例">
        <AdminLayout.Sider
          className="showcase-sidebar"
          width={174}
          collapsedWidth={48}
          collapsible
          breakpoint={760}
          version="mtone · 本地演示"
          logo={
            <span className="showcase-brand">
              <BookOpen size={19} aria-hidden="true" />
              纸间 / Paper
            </span>
          }
          collapsedLogo={<BookOpen size={19} aria-label="纸间" />}
        >
          <div className="showcase-nav-label">工作空间</div>
          <NavItem
            active={section === "all"}
            icon={<FolderOpen size={16} />}
            onClick={() => setSection("all")}
          >
            全部文档
          </NavItem>
          <NavItem
            active={section === "favorites"}
            icon={<Star size={16} />}
            onClick={() => setSection("favorites")}
          >
            我的收藏
          </NavItem>
          <NavItem
            active={section === "drafts"}
            icon={<PenLine size={16} />}
            onClick={() => setSection("drafts")}
          >
            草稿
          </NavItem>
          <div className="showcase-sidebar-guide">
            <span className="showcase-guide-mark">
              <Layers size={18} />
            </span>
            <strong>把好想法留下来</strong>
            <p>让知识有序，让协作轻一点。</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openEditor()}
              icon={<Plus size={13} />}
            >
              写一篇文档
            </Button>
          </div>
        </AdminLayout.Sider>
        <AdminLayout>
          <AdminLayout.Header
            className="showcase-topbar"
            breadcrumb={
              <Breadcrumb
                items={[{ label: "工作空间" }, { label: "团队知识库" }]}
              />
            }
            extra={
              <div className="showcase-topbar-actions">
                {toolbarExtra}
                <a href="./index.html#/gallery" className="showcase-docs-link">返回组件文档</a>
                <div className="showcase-member"><Avatar name="林" size={23} /></div>
              </div>
            }
          />
          <AdminLayout.Content
            as="section"
            className="showcase-content"
            aria-label="知识库文档"
          >
            <div className="showcase-heading">
              <div>
                <div className="showcase-kicker">
                  <span /> A PLACE FOR IDEAS
                </div>
                <h2>团队知识库</h2>
                <p>将散落的经验，变成共同的知识。</p>
              </div>
              <Button
                variant="solid"
                icon={<Plus size={15} />}
                onClick={() => openEditor()}
              >
                新建文档
              </Button>
            </div>
            <div className="showcase-stats" aria-label="知识库统计">
              <div>
                <span>全部文档</span>
                <strong>{documents.length.toString().padStart(2, "0")}</strong>
              </div>
              <div>
                <span>已收藏</span>
                <strong>
                  {documents
                    .filter((doc) => doc.favorite)
                    .length.toString()
                    .padStart(2, "0")}
                </strong>
              </div>
              <div>
                <span>待完善草稿</span>
                <strong>
                  {documents
                    .filter((doc) => doc.draft)
                    .length.toString()
                    .padStart(2, "0")}
                </strong>
              </div>
            </div>
            <div className="showcase-library-head">
              <h3>
                {sectionLabel}
                <span>{filtered.length}</span>
              </h3>
              <div className="showcase-view" role="group" aria-label="文档视图">
                <Button iconOnly
                  variant="ghost"
                  aria-label="卡片视图"
                  aria-pressed={view === "cards"}
                  onClick={() => setView("cards")}
                >
                  <Grid2X2 size={15} />
                </Button>
                <Button iconOnly
                  variant="ghost"
                  aria-label="列表视图"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                >
                  <List size={16} />
                </Button>
              </div>
            </div>
            <div className="showcase-filters">
              <div
                className="showcase-categories"
                role="group"
                aria-label="按分类筛选"
              >
                {(["全部", "设计", "产品", "研究"] as const).map((item) => (
                  <Button
                    key={item}
                    size="sm"
                    variant={category === item ? "soft" : "ghost"}
                    aria-pressed={category === item}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
              <SearchInput
                aria-label="搜索知识库"
                placeholder="搜索标题或内容…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="showcase-result-count" role="status">
              {query || category !== "全部"
                ? `找到 ${filtered.length} 篇文档`
                : `${filtered.length} 篇文档 · 点击即可查看与编辑`}
            </div>
            {filtered.length > 0 ? (
              <div className={`showcase-documents showcase-documents-${view}`}>
                {filtered.map((doc) => {
                  const Icon = categoryIcons[doc.category];
                  return (
                    <article className="showcase-document" key={doc.id}>
                      <div className="showcase-document-top">
                        <span
                          className={`showcase-document-icon showcase-icon-${doc.category}`}
                        >
                          <Icon size={19} aria-hidden="true" />
                        </span>
                        <div className="showcase-document-actions">
                          <Button iconOnly
                            size="sm"
                            variant="ghost"
                            aria-label={`${doc.favorite ? "取消收藏" : "收藏"}：${doc.title}`}
                            aria-pressed={doc.favorite}
                            onClick={() => favorite(doc)}
                          >
                            <Star
                              size={14}
                              fill={doc.favorite ? "currentColor" : "none"}
                            />
                          </Button>
                          <Button iconOnly
                            size="sm"
                            variant="ghost"
                            aria-label={`删除文档：${doc.title}`}
                            onClick={() => setDeleteId(doc.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      <button
                        className="showcase-document-open"
                        aria-label={`编辑文档：${doc.title}`}
                        onClick={() => openEditor(doc)}
                      >
                        <h4>
                          {doc.title}
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </h4>
                        <p>{doc.summary || "还没有摘要，打开文档继续记录。"}</p>
                      </button>
                      <div className="showcase-document-meta">
                        <span>
                          <Tag>{doc.category}</Tag>
                          {doc.draft && <Tag tone="orange">草稿</Tag>}
                        </span>
                        <time>{doc.updated}</time>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="showcase-empty">
                <Search size={28} aria-hidden="true" />
                <h4>暂时没有符合条件的文档</h4>
                <p>换一个关键词，或清除筛选重新查找。</p>
                <Button onClick={resetFilters}>重置筛选</Button>
              </div>
            )}
            <div className="showcase-bottom">
              <span>
                <FileText size={13} aria-hidden="true" />
                本页演示 · 刷新或离页重置 · 不会发送到服务器
              </span>
              <span>由 mtone 组件构建</span>
            </div>
          </AdminLayout.Content>
        </AdminLayout>
      </AdminLayout>
      <Dialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        title={editingId ? "编辑文档" : "新建文档"}
        description="保存仅影响当前演示页面。正文使用普通文本，不是块编辑器。"
        footer={
          <>
            <Button onClick={() => setEditorOpen(false)}>取消</Button>
            <Button variant="solid" type="submit" form={`${id}-form`}>
              保存文档
            </Button>
          </>
        }
      >
        <form
          id={`${id}-form`}
          onSubmit={save}
          className="showcase-editor"
          noValidate
        >
          <FormField label="文档标题" required error={error}>
            <Input
              value={draft.title}
              onChange={(event) => {
                setDraft({ ...draft, title: event.target.value });
                if (error) setError("");
              }}
              placeholder="给你的想法起个名字"
            />
          </FormField>
          <div className="showcase-editor-meta">
            <Select
              label="文档分类"
              value={draft.category}
              onValueChange={(value) =>
                value && setDraft({ ...draft, category: value as Category })
              }
              options={(["设计", "产品", "研究"] as const).map((value) => ({
                value,
                label: value,
              }))}
            />
            <Select
              label="文档状态"
              value={draft.draft ? "draft" : "published"}
              onValueChange={(value) =>
                setDraft({ ...draft, draft: value === "draft" })
              }
              options={[
                { value: "draft", label: "草稿" },
                { value: "published", label: "已整理" },
              ]}
            />
          </div>
          <FormField label="摘要">
            <Input
              value={draft.summary}
              onChange={(event) =>
                setDraft({ ...draft, summary: event.target.value })
              }
              placeholder="用一句话说明这篇文档"
            />
          </FormField>
          <FormField label="正文">
            <Textarea
              rows={6}
              value={draft.body}
              onChange={(event) =>
                setDraft({ ...draft, body: event.target.value })
              }
              placeholder="开始记录你的想法…"
            />
          </FormField>
        </form>
      </Dialog>
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="删除文档"
        description={`确定删除「${documents.find((doc) => doc.id === deleteId)?.title ?? ""}」吗？仅影响当前演示页面。`}
        confirmText="确认删除"
        danger
        onConfirm={() => {
          setDocuments((items) => items.filter((doc) => doc.id !== deleteId));
          setDeleteId(null);
          toast.info({ title: "文档已删除", body: "刷新页面可恢复示例数据。" });
        }}
      />
    </div>
  );
}
