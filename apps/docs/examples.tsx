import { MentionsExample } from "./mentions-example";
import { TableExample } from "./table-example";
import { SplitterExample } from "./splitter-example";
import { CardExample } from "./card-example";
import { FormExample, FormFieldExample } from "./form-example";
import { SpotlightExample } from "./spotlight-example";
import { ToastAction } from "./toast-example";
import { LayoutExample } from "./layout-example";
import React, { useState } from "react";
import * as M from "../../packages/mtone/src";
import { BookOpen, FileText, Folder, Plus, Search, Star } from "lucide-react";

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

  switch (name) {
    case "Splitter":
      return <SplitterExample />;
    case "Spotlight":
      return <SpotlightExample />;
    case "Layout":
      return <LayoutExample compact={compact} />;
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
          {output}
        </div>
      );
    case "Input":
      return (
        <div style={stackStyle}>
          <M.Input
            aria-label="文档标题"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <M.Text muted>当前值：{text || "（空）"}</M.Text>
          <M.Input aria-label="禁用输入框" disabled placeholder="不可编辑" />
        </div>
      );
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
      return (
        <M.Breadcrumb
          items={[
            { label: "组件库", href: "#/gallery" },
            { label: "导航", href: "#/components/Sidebar" },
            { label: "当前页面" },
          ]}
        />
      );
    case "Tree":
      return (
        <div style={stackStyle}>
          <M.Tree
            label="知识库目录"
            value={value ?? undefined}
            onValueChange={setValue}
            defaultExpanded={["root"]}
            items={[
              {
                id: "root",
                label: "我的知识库",
                icon: <Folder size={14} />,
                children: [
                  { id: "design", label: "设计规范" },
                  { id: "research", label: "研究笔记" },
                  { id: "locked", label: "不可用节点", disabled: true },
                ],
              },
            ]}
          />
          <M.Text muted>选中节点：{value}</M.Text>
        </div>
      );
    case "Tabs":
      return (
        <M.Tabs
          items={[
            { value: "all", label: "全部", content: "所有文档都在这里。" },
            { value: "recent", label: "最近", content: "最近编辑的文档。" },
            { value: "disabled", label: "未开放", content: "", disabled: true },
          ]}
        />
      );
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
    case "DropdownMenu":
      return (
        <div style={stackStyle}>
          <M.DropdownMenu
            trigger={<M.Button>文档操作</M.Button>}
            items={menuItems}
            onSelect={setNotice}
          />
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
    case "Card":
      return <CardExample />;
    case "Text":
      return (
        <div style={stackStyle}>
          <M.Text>正文内容清晰可读。</M.Text>
          <M.Text muted>次要信息使用更克制的颜色。</M.Text>
        </div>
      );
    case "Divider":
      return (
        <div style={stackStyle}>
          <M.Text>上一部分</M.Text>
          <M.Divider />
          <M.Text>下一部分</M.Text>
        </div>
      );
    case "List":
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
    case "Avatar":
      return (
        <div style={rowStyle}>
          <M.Avatar name="林" />
          <M.Avatar name="Alex" size={36} />
          <M.Avatar name="周" size={48} />
        </div>
      );
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
      return (
        <div style={stackStyle}>
          <M.Progress value={number ?? 0} label="任务进度" />
          <div style={rowStyle}>
            <M.Button onClick={() => setNumber((n) => ((n ?? 0) + 20) % 120)}>
              增加进度
            </M.Button>
            <M.Text>{number}%</M.Text>
          </div>
        </div>
      );
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
            density="comfortable"
            tokens={{ "--mt-primary": "#436653" }}
          >
            <div style={rowStyle}>
              <M.Button variant="solid">Save changes</M.Button>
              <M.Select label="Category" options={options} />
              <M.Empty />
            </div>
          </M.MtoneProvider>
          <M.Text muted>局部使用英文、舒适密度和自定义主题。</M.Text>
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
          <M.Text>此区域继承当前 Provider 的主题与密度。</M.Text>
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
