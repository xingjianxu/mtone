import NavSubmenuExample from "./secondary-demos/nav-submenu-usage";
import PageLayoutExample from "./secondary-demos/page-layout-usage";
import CheckCardExample from "./secondary-demos/check-card-usage";
import { CardGroupExample } from "./card-group-example";
import QuestionnaireExample from "./secondary-demos/questionnaire-usage";
import { aiExamples } from "./ai-demos/examples";
import { InputExample } from "./input-example";
import { ListExample } from "./list-example";
import LocalDataListDemo from "./data-list-demos/local";
import { BreadcrumbExample } from "./breadcrumb-example";
import { ProgressExamples } from "./ProgressExamples";
import { FieldsetExample } from "./fieldset-example";
import { LoadingOverlayExample } from "./loading-overlay-example";
import { HoverCardExample } from "./hover-card-example";
import { MenubarExample } from "./menubar-example";
import { DropdownExample } from "./dropdown-example";
import { TypographyExample } from "./typography-example";
import { TransferExample } from "./transfer-example";
import { TreeSelectExample } from "./tree-select-example";
import { CascaderExample } from "./cascader-example";
import { AutoCompleteExample } from "./auto-complete-example";
import { TabsExample } from "./tabs-example";
import { TableOfContentsExample } from "./table-of-contents-example";
import { ImageExample } from "./image-example";
import { TreeExample } from "./tree-example";
import { TimelineExample } from "./timeline-example";
import { AffixExample } from "./affix-example";
import { ResultExample } from "./result-example";
import { AvatarExample } from "./avatar-example";
import { PopconfirmExample } from "./popconfirm-example";
import { RateExample } from "./rate-example";
import { CalendarExample } from "./calendar-example";
import { MentionsExample } from "./mentions-example";
import { TableExample } from "./table-example";
import { SplitterExample } from "./splitter-example";
import { CardExample } from "./card-example";
import { FormExample, FormFieldExample } from "./form-example";
import { SpotlightExample } from "./spotlight-example";
import { ToastAction } from "./toast-example";
import { AdminLayoutExample } from "./admin-layout-example";
import React, { useState } from "react";
import * as M from "../../packages/mtone/src";
import { ChevronDown, BookOpen, FileText, Folder, Plus, Search, Star } from "lucide-react";

const options = [
  { value: "design", label: "产品设计" },
  { value: "research", label: "研究笔记" },
  { value: "engineering", label: "技术文档" },
];
const rowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  alignItems: "center",
};
const stackStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
  width: "100%",
  maxWidth: 460,
};

/** A local-only upload adapter: no file bytes are sent to any server. */
const simulateUpload: M.UploadAdapter = (_file, { signal, onProgress }) =>
  new Promise<void>((resolve, reject) => {
    let progress = 0;
    const abort = () => {
      clearInterval(timer);
      reject(new DOMException("Cancelled", "AbortError"));
    };
    const timer = setInterval(() => {
      progress += 20;
      onProgress(progress);
      if (progress >= 100) {
        clearInterval(timer);
        signal.removeEventListener("abort", abort);
        resolve();
      }
    }, 220);
    if (signal.aborted) abort();
    else signal.addEventListener("abort", abort, { once: true });
  });

export function ComponentExample({
  name,
  compact = false,
}: {
  name: string;
  compact?: boolean;
}) {
  // A keyed inner component resets each demonstration when its document changes.
  return <ExampleBody key={name} name={name} compact={compact} />;
}

function ExampleBody({ name, compact }: { name: string; compact: boolean }) {
  const [text, setText] = useState("设计规范");
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState(true);
  const [value, setValue] = useState<string | null>("design");
  const [multi, setMulti] = useState<string[]>(["design"]);
  const [number, setNumber] = useState<number | null>(40);
  const [date, setDate] = useState("2026-11-15");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<React.Key[]>([]);
  const output = notice ? (
    <M.Text role="status" muted>
      {notice}
    </M.Text>
  ) : null;
  const documents: M.DocumentItem[] = [
    {
      id: "guide",
      title: "知识库使用指南",
      description: "从一个想法开始",
      updatedAt: "今天",
      onClick: () => setNotice("已选择：知识库使用指南"),
    },
    {
      id: "notes",
      title: "项目研究笔记",
      description: "值得保留的观察",
      updatedAt: "昨天",
      onClick: () => setNotice("已选择：项目研究笔记"),
    },
  ];
  const menuItems: M.MenuItem[] = [
    { key: "open", label: "打开文档", icon: <FileText size={14} /> },
    { key: "favorite", label: "加入收藏", shortcut: "⌘D" },
    { key: "disabled", label: "不可用操作", disabled: true },
    { key: "delete", label: "移至回收站（演示）", danger: true },
  ];
  const field = (
    <M.FormField
      label="名称"
      description="示例仅修改当前页面，不保存到服务器。"
    >
      <M.Input value={text} onChange={(e) => setText(e.target.value)} />
    </M.FormField>
  );
  const properties = (
    <M.PropertyList>
      <M.PropertyItem label="类型">文档</M.PropertyItem>
      <M.PropertyItem label="标签">
        <M.Badge tone="green">研究</M.Badge>
      </M.PropertyItem>
      <M.PropertyItem label="负责人">
        <M.Avatar name="林" />
      </M.PropertyItem>
    </M.PropertyList>
  );

  const AiExample = aiExamples[name];
  if (AiExample) return <AiExample />;

  switch (name) {
    case "Splitter":
      return <SplitterExample />;
    case "Spotlight":
      return <SpotlightExample />;
    case "PageLayout":
      return <PageLayoutExample />;
    case "AdminLayout":
      return <AdminLayoutExample compact={compact} />;
    case "Button":
      return (
        <div style={stackStyle}>
          <div style={rowStyle}>
            {(["blue", "solid", "outline", "soft", "ghost"] as const).map(
              (variant) => (
                <M.Button
                  key={variant}
                  variant={variant}
                  onClick={() => setNotice(`点击了 ${variant}`)}
                >
                  {variant}
                </M.Button>
              ),
            )}
            <M.Button
              danger
              onClick={() => setNotice("危险操作样式演示，未删除任何内容")}
            >
              删除
            </M.Button>
            <M.Button
              variant="blue"
              onClick={() =>
                setNotice("两步验证按钮样式演示，不会更改安全设置")
              }
            >
              启用两步验证
            </M.Button>
            <M.Button variant="blue" loading>
              保存中
            </M.Button>
            <M.Button variant="blue" disabled>
              不可用
            </M.Button>
            <M.Button disabled>不可用</M.Button>
          </div>
          {output}
        </div>
      );
    case "IconButton":
      return (
        <div style={rowStyle}>
          <M.IconButton
            aria-label="收藏文档"
            aria-pressed={checked}
            variant={checked ? "soft" : "outline"}
            onClick={() => setChecked(!checked)}
          >
            <Star size={16} fill={checked ? "currentColor" : "none"} />
          </M.IconButton>
          <M.Text muted>{checked ? "已收藏" : "未收藏"}</M.Text>
        </div>
      );
    case "ButtonGroup":
      return (
        <div style={stackStyle}>
          <M.ButtonGroup aria-label="文档操作">
            <M.Button onClick={() => setNotice("已选择新建")}>新建</M.Button>
            <M.Button onClick={() => setNotice("已选择复制")}>复制</M.Button>
            <M.Button onClick={() => setNotice("已选择归档")}>归档</M.Button>
          </M.ButtonGroup>
          <M.ButtonGroup connected aria-label="相连文档操作">
            <M.Button onClick={() => setNotice("已选择复制")}>复制</M.Button>
            <M.Button onClick={() => setNotice("已选择粘贴")}>粘贴</M.Button>
            <M.Button onClick={() => setNotice("已选择归档")}>归档</M.Button>
          </M.ButtonGroup>
          <M.ButtonGroup connected aria-label="危险操作">
            <M.Button danger variant="solid" onClick={() => setNotice("删除示例")}>删除</M.Button>
            <M.Button danger variant="solid" onClick={() => setNotice("永久删除示例")}>永久删除</M.Button>
          </M.ButtonGroup>
          <M.ButtonGroup connected aria-label="导出文档">
            <M.Button onClick={() => setNotice("已选择导出 PDF")}>导出 PDF</M.Button>
            <M.Menu
              trigger={<M.IconButton aria-label="更多导出格式"><ChevronDown size={14} /></M.IconButton>}
              items={[
                { key: "markdown", label: "导出 Markdown", onSelect: () => setNotice("已选择导出 Markdown") },
                { key: "html", label: "导出 HTML", onSelect: () => setNotice("已选择导出 HTML") },
              ]}
            />
          </M.ButtonGroup>
          {output}
        </div>
      );
    case "CheckCard":
      return <CheckCardExample />;
    case "Questionnaire":
      return <QuestionnaireExample />;
    case "Input":
      return <InputExample compact={compact} />;
    case "SearchInput":
      return (
        <div style={stackStyle}>
          <M.SearchInput
            aria-label="搜索示例文档"
            placeholder="搜索示例文档…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <M.Text muted>输入不会发送网络请求；搜索逻辑由应用实现。</M.Text>
        </div>
      );
    case "TableOfContents":
      return <TableOfContentsExample compact={compact} />;
    case "Image":
    case "ImageGroup":
    case "ImagePreview":
      return <ImageExample compact={compact} variant={name} />;
    case "Timeline":
      return <TimelineExample compact={compact} />;
    case "Rate":
      return <RateExample compact={compact} />;
    case "Affix":
      return <AffixExample compact={compact} />;
    case "Result":
      return <ResultExample compact={compact} />;
    case "Calendar":
      return <CalendarExample compact={compact} />;
    case "Transfer": return <TransferExample compact={compact} />;
    case "TreeSelect": return <TreeSelectExample compact={compact} />;
    case "CascaderPanel": return <CascaderExample panelOnly />;
    case "Cascader": return <CascaderExample compact={compact} />;
    case "AutoComplete": return <AutoCompleteExample compact={compact} />;
    case "Mentions":
    case "Mention":
      return <MentionsExample compact={compact} />;
    case "Textarea":
      return (
        <div style={stackStyle}>
          <M.Textarea
            aria-label="文档说明"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <M.Text muted>{text.length} 个字符</M.Text>
        </div>
      );
    case "Fieldset":
      return <FieldsetExample />;
    case "Form":
      return <FormExample />;
    case "FormField":
      return <FormFieldExample />;
    case "Checkbox":
      return (
        <div style={stackStyle}>
          <M.Checkbox
            label="接收更新提醒"
            checked={checked}
            onCheckedChange={setChecked}
          />
          <M.Checkbox label="部分选中" indeterminate />
          <M.Checkbox label="不可用" disabled />
          <M.Text muted>{checked ? "提醒已开启" : "提醒已关闭"}</M.Text>
        </div>
      );
    case "Switch":
      return (
        <div style={rowStyle}>
          <M.Switch
            label="自动保存（演示）"
            checked={checked}
            onCheckedChange={setChecked}
          />
          <M.Text muted>{checked ? "已开启" : "已关闭"}</M.Text>
        </div>
      );
    case "RadioGroup":
      return (
        <M.RadioGroup
          label="文档分类"
          options={options}
          value={value ?? "design"}
          onValueChange={setValue}
        />
      );
    case "Select":
      return (
        <div style={stackStyle}>
          <M.Select
            label="选择知识库"
            options={options}
            value={value}
            onValueChange={setValue}
          />
          <M.Text muted>选中值：{value ?? "无"}</M.Text>
        </div>
      );
    case "TagSelect":
      return <M.TagSelect aria-label="主题" defaultValue={["design"]} options={[{value:"design",label:"设计"},{value:"research",label:"研究"},{value:"development",label:"开发"}]} />;
    case "MultiSelect":
      return (
        <div style={stackStyle}>
          <M.MultiSelect
            label="文档标签"
            options={options}
            value={multi}
            onValueChange={setMulti}
          />
          <M.Text muted>已选 {multi.length} 项</M.Text>
        </div>
      );
    case "Slider":
      return (
        <div style={stackStyle}>
          <M.Slider
            label="完成进度"
            min={0}
            max={100}
            step={5}
            value={number ?? 0}
            onValueChange={setNumber}
          />
          <M.Text muted>{number}%</M.Text>
        </div>
      );
    case "NumberInput":
      return (
        <div style={stackStyle}>
          <M.NumberInput
            label="每页数量"
            min={1}
            max={100}
            value={number}
            onValueChange={setNumber}
          />
          <M.Text muted>允许 1–100；当前值：{number ?? "空"}</M.Text>
        </div>
      );
    case "DatePicker":
      return (
        <div style={stackStyle}>
          <M.DatePicker
            label="截止日期"
            value={date}
            onValueChange={setDate}
            clearable
          />
          <M.Text muted>日历由浏览器提供，当前值：{date || "未选择"}</M.Text>
        </div>
      );
    case "Sidebar":
      return (
        <M.Sidebar
          collapsible
          aria-label="工作空间导航"
          style={{ maxWidth: 240 }}
        >
          <M.NavGroup label="工作空间">
            <M.NavItem
              active={value === "design"}
              icon={<Folder size={15} />}
              onClick={() => setValue("design")}
            >
              产品设计
            </M.NavItem>
            <M.NavItem
              active={value === "research"}
              icon={<BookOpen size={15} />}
              onClick={() => setValue("research")}
            >
              研究笔记
            </M.NavItem>
          </M.NavGroup>
        </M.Sidebar>
      );
    case "NavSubmenu":
      return <NavSubmenuExample />;
    case "NavGroup":
      return (
        <div style={{ width: 220 }}>
          <M.NavGroup label="个人空间">
            <M.NavItem
              active={value === "design"}
              onClick={() => setValue("design")}
            >
              设计资料
            </M.NavItem>
            <M.NavItem
              active={value === "research"}
              onClick={() => setValue("research")}
            >
              研究资料
            </M.NavItem>
          </M.NavGroup>
        </div>
      );
    case "NavItem":
      return (
        <div style={{ width: 220 }}>
          <M.NavItem
            active={checked}
            icon={<Star size={15} />}
            onClick={() => setChecked(!checked)}
          >
            收藏夹
          </M.NavItem>
        </div>
      );
    case "Breadcrumb":
      return <BreadcrumbExample />;
    case "DirectoryTree":
    case "Tree":
      return <TreeExample compact={compact} />;
    case "Tabs":
      return <TabsExample compact={compact} />;
    case "Segmented":
      return (
        <div style={stackStyle}>
          <M.Segmented
            label="视图模式"
            options={[
              { value: "design", label: "列表" },
              { value: "research", label: "卡片" },
            ]}
            value={value ?? "design"}
            onValueChange={setValue}
          />
          <M.Text muted>
            {value === "design" ? "当前列表视图" : "当前卡片视图"}
          </M.Text>
        </div>
      );
    case "FilterBar":
      return (
        <M.FilterBar>
          <M.SearchInput aria-label="按名称筛选" placeholder="筛选名称" />
          <M.Select label="分类筛选" options={options} defaultValue="design" />
          {visible && (
            <M.FilterChip onRemove={() => setVisible(false)}>
              状态：进行中
            </M.FilterChip>
          )}
        </M.FilterBar>
      );
    case "FilterChip":
      return (
        <div style={rowStyle}>
          {visible ? (
            <M.FilterChip onRemove={() => setVisible(false)}>
              分类：设计
            </M.FilterChip>
          ) : (
            <M.Button onClick={() => setVisible(true)}>重新添加筛选</M.Button>
          )}
        </div>
      );
    case "Pagination":
      return (
        <div style={stackStyle}>
          <M.Pagination
            total={85}
            pageSize={10}
            page={page}
            onPageChange={setPage}
          />
          <M.Text muted>当前第 {page} 页</M.Text>
        </div>
      );
    case "Menubar":
      return <MenubarExample />;
    case "Dropdown":
      return <DropdownExample />;
    case "DropdownMenu":
    case "Menu":
      return (
        <div style={stackStyle}>
          <M.Menu
            trigger={<M.Button>文档操作</M.Button>}
            items={[
              { type: "group", key: "documents", label: "文档操作", children: menuItems },
              { type: "divider", key: "divider" },
              { type: "group", key: "sharing", label: "共享与导出", children: [
                { key: "export", label: "导出", children: [
                  { key: "PDF", label: "PDF" },
                  { key: "Markdown", label: "Markdown" },
                  { key: "Word", label: "Word（不可用）", disabled: true },
                ] },
                { key: "share", label: "共享", children: [
                  { key: "copy-link", label: "复制链接" },
                  { key: "invite", label: "邀请成员" },
                ] },
              ] },
            ]}
            onSelect={setNotice}
          />
          <M.Menu trigger={<M.Button>右对齐菜单，宽度 240px</M.Button>} width={240} align="right" items={menuItems} onSelect={setNotice}/>
          {output}
        </div>
      );
    case "ContextMenu":
      return (
        <div style={stackStyle}>
          <M.ContextMenu items={menuItems} onSelect={setNotice}>
            <div
              tabIndex={0}
              style={{
                padding: 32,
                border: "1px dashed var(--mt-border)",
                borderRadius: 4,
              }}
            >
              在这里点击右键或使用键盘菜单键
            </div>
          </M.ContextMenu>
          {output}
        </div>
      );
    case "HoverCard":
      return <HoverCardExample />;
    case "Popover":
      return (
        <M.Popover
          title="文档信息"
          trigger={<M.Button>查看信息</M.Button>}
          content={<div style={{ minWidth: 180 }}>{properties}</div>}
        />
      );
    case "Tooltip":
      return (
        <M.Tooltip content="搜索当前知识库">
          <M.IconButton aria-label="搜索">
            <Search size={16} />
          </M.IconButton>
        </M.Tooltip>
      );
    case "CardGroup":
      return <CardGroupExample />;
    case "Card":
      return <CardExample />;
    case "Blockquote":
      return <M.Typography.Blockquote cite="— mtone 设计笔记">让内容成为主角，用一致的间距建立层次。</M.Typography.Blockquote>;
    case "Typography":
    case "Text":
    case "Title":
    case "Paragraph":
    case "Link":
      if (compact) {
        if (name === "Title") return <M.Typography.Title level={3}>清晰的标题</M.Typography.Title>;
        if (name === "Text") return <M.Typography.Text muted>简洁的辅助文字</M.Typography.Text>;
        if (name === "Paragraph") return <M.Typography.Paragraph>让内容清晰、有层次，用一致的间距组织正文。</M.Typography.Paragraph>;
        if (name === "Link") return <M.Typography.Link href="#/components/Typography?section=Link">阅读文档</M.Typography.Link>;
        return <div><M.Typography.Title level={3}>内容与层次</M.Typography.Title><M.Typography.Text muted>标题、文本、段落、链接与引用</M.Typography.Text></div>;
      }
      return <TypographyExample />;
    case "Divider":
      return (
        <div style={{ width: "100%" }}>
          <M.Text>默认分隔</M.Text>
          <M.Divider />
          <M.Divider titlePlacement="start">基本信息</M.Divider>
          <M.Divider variant="dashed">虚线标题</M.Divider>
          <M.Divider variant="dotted" titlePlacement="end" plain>
            更多内容
          </M.Divider>
          <M.Divider size="small" />
          <M.Divider size="large" />
          <span>编辑</span>
          <M.Divider orientation="vertical" />
          <span>归档</span>
        </div>
      );
    case "DataList":
      return compact ? (
        <M.DataList
          aria-label="文档管理预览"
          items={documents.slice(0, 2)}
          getKey={(item) => item.id}
          renderItem={(item) => <M.Text>{item.title}</M.Text>}
        />
      ) : <LocalDataListDemo />;
    case "List":
      return <ListExample compact={compact} />;
    case "ListItem":
      return (
        <M.List>
          <M.ListItem
            icon={<FileText size={16} />}
            description="今天更新"
            actions={<M.Badge>设计</M.Badge>}
          >
            组件规范
          </M.ListItem>
          <M.ListItem icon={<FileText size={16} />} description="昨天更新">
            研究笔记
          </M.ListItem>
        </M.List>
      );
    case "DocumentList":
      return (
        <div style={stackStyle}>
          <M.DocumentList items={documents} />
          {output}
        </div>
      );
    case "DocumentCard":
      return (
        <div style={stackStyle}>
          <M.DocumentCard {...documents[0]} />
          {output}
        </div>
      );
    case "Table":
      return <TableExample compact={compact} />;
    case "Badge": {
      return (
        <div style={rowStyle}>
          {(
            ["neutral", "blue", "green", "orange", "red", "purple"] as const
          ).map((tone) => (
            <M.Badge key={tone} tone={tone}>
              {tone}
            </M.Badge>
          ))}
          {visible ? (
            <M.Badge onRemove={() => setVisible(false)}>可移除</M.Badge>
          ) : (
            <M.Button onClick={() => setVisible(true)}>恢复标签</M.Button>
          )}
        </div>
      );
    }
    case "Status":
      return (
        <div style={rowStyle}>
          <M.Status>未开始</M.Status>
          <M.Status tone="orange">进行中</M.Status>
          <M.Status tone="green">已完成</M.Status>
        </div>
      );
    case "Popconfirm":
      return <PopconfirmExample compact={compact} />;
    case "Avatar":
      return <AvatarExample compact={compact} />;
    case "AvatarGroup":
      return (
        <M.AvatarGroup
          items={[
            { name: "林" },
            { name: "陈" },
            { name: "王" },
            { name: "李" },
            { name: "周" },
          ]}
          max={3}
        />
      );
    case "Progress":
      return <ProgressExamples compact={compact} />;
    case "PropertyList":
    case "PropertyItem":
      return properties;
    case "Dialog":
      return (
        <div style={{ display: "grid", gap: 12 }}>
        {!compact && <M.Checkbox checked={checked} onCheckedChange={setChecked} label="阻止点击对话框外部关闭（modal）" />}
        <M.Dialog
          modal={checked}
          title="新建知识库"
          description="此示例只更新当前页面状态。"
          open={open}
          onOpenChange={setOpen}
          trigger={<M.Button>打开弹窗</M.Button>}
          footer={
            <>
              <M.Button onClick={() => setOpen(false)}>取消</M.Button>
              <M.Button variant="solid" onClick={() => setOpen(false)}>
                完成
              </M.Button>
            </>
          }
        >
          {field}
        </M.Dialog>
        </div>
      );
    case "Drawer":
      return (
        <M.Drawer
          title="文档属性"
          description="在不离开当前页面的情况下查看信息。"
          trigger={<M.Button>打开属性抽屉</M.Button>}
        >
          {properties}
        </M.Drawer>
      );
    case "ConfirmDialog":
      return (
        <div style={stackStyle}>
          <M.ConfirmDialog
            title="确认归档这份示例文档？"
            description="这是本地演示，不会修改真实文档。"
            trigger={<M.Button danger>归档文档</M.Button>}
            confirmText="确认归档"
            onConfirm={() => setNotice("已确认示例操作")}
          />
          {output}
        </div>
      );
    case "Alert":
      return (
        <div style={stackStyle}>
          {visible ? (
            <M.Alert
              tone="success"
              title="保存成功"
              onClose={() => setVisible(false)}
            >
              你可以关闭这条提示。
            </M.Alert>
          ) : (
            <M.Button onClick={() => setVisible(true)}>重新显示</M.Button>
          )}
          <M.Alert tone="warning" title="请检查内容">
            这是状态样式演示。
          </M.Alert>
        </div>
      );
    case "Toast":
      return (
        <M.Toast timeout={3500}>
          <ToastAction compact={compact} />
        </M.Toast>
      );
    case "ToastProvider":
      return (
        <M.ToastProvider timeout={3500} limit={3}>
          <ToastAction compact={compact} />
        </M.ToastProvider>
      );
    case "Empty":
      return (
        <div style={stackStyle}>
          <M.Empty
            title="还没有文档"
            description="创建第一份文档，记录新的想法。"
            action={
              <M.Button
                icon={<Plus size={14} />}
                onClick={() => setNotice("点击了新建入口（演示）")}
              >
                新建文档
              </M.Button>
            }
          />
          {output}
        </div>
      );
    case "Skeleton":
      return (
        <div style={stackStyle} aria-label="内容加载占位">
          <M.Skeleton style={{ height: 24, width: "45%" }} />
          <M.Skeleton style={{ height: 14, width: "100%" }} />
          <M.Skeleton style={{ height: 14, width: "75%" }} />
        </div>
      );
    case "LoadingOverlay":
      return <LoadingOverlayExample />;
    case "Spinner":
      return (
        <div style={rowStyle}>
          <M.Spinner label="正在加载文档" />
          <M.Text muted>正在加载文档…</M.Text>
        </div>
      );
    case "Upload":
    case "Dropzone": {
      const Upload = name === "Dropzone" ? M.Dropzone : M.Upload;
      return (
        <div style={stackStyle}>
          <Upload
            upload={simulateUpload}
            accept=".pdf,.txt,image/*"
            maxSize={5 * 1024 * 1024}
          />
          <M.Text muted>
            模拟上传：文件不会发送到服务器。支持 PDF、TXT、图片，单文件最大 5
            MB。
          </M.Text>
        </div>
      );
    }
    case "MtoneProvider":
      return (
        <div style={stackStyle}>
          <M.MtoneProvider
            locale="en"

            tokens={{ "--mt-primary": "#436653" }}
          >
            <div style={rowStyle}>
              <M.Button variant="solid">Save changes</M.Button>
              <M.Select label="Category" options={options} />
              <M.Empty />
            </div>
          </M.MtoneProvider>
          <M.Text muted>局部使用英文和自定义主题。</M.Text>
        </div>
      );
    case "MtoneScope":
      return (
        <M.MtoneScope
          style={{
            padding: 16,
            border: "1px solid var(--mt-border)",
            borderRadius: 4,
          }}
        >
          <M.Text>此区域继承当前 Provider 的主题。</M.Text>
          <M.Divider />
          <M.Button>局部区域按钮</M.Button>
        </M.MtoneScope>
      );
    default:
      return (
        <M.Alert tone="error" title="未找到此组件的示例">
          请返回组件目录选择已实现的组件。
        </M.Alert>
      );
  }
}
