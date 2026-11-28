import { useState, type ReactNode } from "react";
import { BookOpen, FileText, Folder, Plus } from "lucide-react";
import * as M from "../../../packages/mtone/src";
import photo from "../block-editor-image.svg";
import {
  choice as c,
  flag as f,
  number as n,
  playground as p,
  sizes,
  text as t,
} from "./frame";
import { treeItems } from "./forms";

export const tone = c("色调", "neutral", [
  "neutral",
  "blue",
  "green",
  "orange",
  "red",
  "purple",
]);
const state = c("状态", "normal", ["normal", "active", "success", "exception"]);
const width = c("宽度", "normal", [
  ["narrow", "窄"],
  ["normal", "标准"],
  ["wide", "宽"],
]);
const documents = [
  {
    id: "guide",
    title: "快速开始",
    description: "安装与导入",
    updatedAt: "今天",
  },
  {
    id: "design",
    title: "组件设计",
    description: "交互与视觉规范",
    updatedAt: "昨天",
  },
  {
    id: "release",
    title: "发布记录",
    description: "版本与迁移",
    updatedAt: "周一",
  },
  {
    id: "tests",
    title: "测试清单",
    description: "浏览器与可访问性",
    updatedAt: "周一",
  },
];
const rows = documents.map((d, i) => ({
  ...d,
  type: i % 2 ? "维护" : "设计",
  priority: i + 1,
}));
const tabs = [
  { key: "overview", label: "概览", content: "本周进展与文档更新" },
  { key: "records", label: "记录", content: "已更新组件目录" },
];
const milestones = [
  { title: "启动项目", content: "明确范围" },
  { title: "完成设计", content: "评审组件规范" },
  { title: "交付", content: "发布项目文档" },
];
const samplePhoto = { src: photo, alt: "几何图形示意" };
const date = "2026-11-18";
function RemovableTag(props: {
  name: string;
  tone: M.Tone;
  variant: "default" | "filter";
  removable: boolean;
}) {
  const [removed, setRemoved] = useState(false);
  if (removed)
    return <M.Button onClick={() => setRemoved(false)}>恢复标签</M.Button>;
  return (
    <M.Tag
      tone={props.tone}
      variant={props.variant}
      onRemove={props.removable ? () => setRemoved(true) : undefined}
    >
      {props.name}
    </M.Tag>
  );
}
function OrderList({
  grouped,
  sortable,
  length,
  ...props
}: {
  grouped: boolean;
  sortable: boolean;
  length: number;
  stickyGroups: boolean;
  hoverable: boolean;
  loading: boolean;
}) {
  const [items, setItems] = useState(rows);
  return (
    <M.List
      {...props}
      items={items.slice(0, length)}
      getKey={(d) => d.id}
      height={164}
      groupBy={grouped ? (item) => item.type : undefined}
      renderItem={(item) => (
        <div className="docs-playground-actions">
          {sortable && <M.List.SortHandle />}
          <strong>{item.title}</strong>{" "}
          <M.Text muted>{item.description}</M.Text>
        </div>
      )}
      onReorder={
        sortable
          ? (from, to) =>
              setItems((list) => {
                const next = [...list];
                next.splice(to, 0, ...next.splice(from, 1));
                return next;
              })
          : undefined
      }
    />
  );
}
function Documents({
  count,
  descriptions,
  timestamp,
  icon,
  card,
}: {
  count: number;
  descriptions: boolean;
  timestamp: boolean;
  icon: boolean;
  card?: boolean;
}) {
  const [chosen, setChosen] = useState("");
  const items = documents.slice(0, count).map((d) => ({
    ...d,
    description: descriptions ? d.description : undefined,
    updatedAt: timestamp ? d.updatedAt : undefined,
    icon: icon ? <FileText size={16} /> : undefined,
    onClick: () => setChosen(d.title),
  }));
  return (
    <div style={{ maxWidth: 490 }}>
      {card ? (
        <M.DocumentCard {...items[0]} />
      ) : (
        <M.DocumentList items={items} />
      )}
      <output>{chosen}</output>
    </div>
  );
}
function TreePreview({
  mode,
  collapse,
  expandAction,
  ...config
}: {
  mode: "single" | "multiple" | "none";
  collapse: "initial" | "all" | "none";
  expandAction: "click" | "doubleClick" | "arrow";
} & Pick<
  M.TreeProps,
  | "showLine"
  | "showIcon"
  | "checkable"
  | "directory"
  | "itemHeight"
  | "gap"
  | "indent"
  | "height"
  | "blockNode"
  | "disabled"
  | "labelMarquee"
  | "checkStrictly"
>) {
  const initialExpanded =
    collapse === "none"
      ? []
      : collapse === "all"
        ? ["docs", "design", "archive"]
        : ["docs", "design"];
  return (
    <div
      className="docs-playground-box"
      style={{ inlineSize: "min(100%, 34rem)" }}
    >
      <M.Tree
        label="树形配置预览"
        items={treeItems}
        {...config}
        multiple={mode === "multiple"}
        selectable={mode !== "none"}
        checkStrictly={config.checkable && config.checkStrictly}
        expandAction={expandAction === "arrow" ? false : expandAction}
        defaultExpandedKeys={initialExpanded}
        defaultSelectedKeys={mode === "none" ? [] : ["start"]}
        icon={({ node }) =>
          node.id === "docs" ? (
            <BookOpen size={15} />
          ) : node.children ? (
            <Folder size={15} />
          ) : (
            <FileText size={15} />
          )
        }
      />
    </div>
  );
}
export const treePlayground = p(
  "Tree",
  {
    showLine: f("连接线", true),
    showIcon: f("节点图标", true),
    checkable: f("复选框"),
    mode: c("选择", "single", [
      ["single", "单选"],
      ["multiple", "多选"],
      ["none", "不可选"],
    ]),
    directory: c("类型", "tree", [
      ["tree", "普通树"],
      ["directory", "目录树"],
    ]),
    itemHeight: n("行高（px）", 32, 24, 56),
    gap: n("节点间距（px）", 2, 0, 16, true),
    indent: n("层级缩进（px）", 20, 0, 48, true),
    height: n("可视高度（px）", 224, 96, 360, true),
    blockNode: f("整行铺满", true, true),
    labelMarquee: f("长标题悬停滚动", true, true),
    checkStrictly: {
      ...f("父子独立勾选", false, true),
      disabled: (o) => !o.checkable,
    },
    disabled: f("禁用整棵树", false, true),
    expandAction: {
      ...c(
        "标题展开方式",
        "click",
        [
          ["click", "单击"],
          ["doubleClick", "双击"],
          ["arrow", "仅箭头"],
        ],
        true,
      ),
      when: (o) => o.directory === "directory",
    },
    collapse: {
      ...c("节点状态", "initial", ["initial", "all", "none"]),
      hidden: true,
    },
  },
  ({ directory, ...props }) => (
    <TreePreview {...props} directory={directory === "directory"} />
  ),
  {
    remountOn: ["mode"],
    actions: (apply) => (
      <div className="docs-playground-actions docs-playground-advanced-actions">
        <M.Button variant="ghost" onClick={() => apply({ collapse: "all" })}>
          全部展开
        </M.Button>
        <M.Button variant="ghost" onClick={() => apply({ collapse: "none" })}>
          全部折叠
        </M.Button>
      </div>
    ),
  },
);

const documentFields = {
  descriptions: f("描述", true),
  timestamp: f("更新时间", true),
  icon: f("图标", true),
};
export const dataPlaygrounds = {
  Tree: treePlayground,
  List: p(
    "List",
    {
      grouped: f("分组"),
      sortable: { ...f("拖动排序"), disabled: (o) => !!o.grouped },
      hoverable: f("悬停高亮", true),
      stickyGroups: {
        ...f("分组吸顶", false, true),
        disabled: (o) => !o.grouped,
      },
      loading: f("加载中", false, true),
      length: n("示例行数", 4, 0, 4, true),
    },
    (props) => (
      <OrderList {...props} sortable={props.sortable && !props.grouped} />
    ),
  ),
  ListItem: p(
    "ListItem",
    {
      description: f("说明", true),
      icon: f("图标", true),
      actions: f("行末操作", true),
    },
    ({ description, icon, actions }) => (
      <M.List>
        <M.ListItem
          description={description ? "组件规范与设计令牌" : undefined}
          icon={icon ? <FileText size={16} /> : undefined}
          actions={actions ? <M.Button size="sm">详情</M.Button> : undefined}
        >
          设计文档
        </M.ListItem>
      </M.List>
    ),
  ),
  DocumentList: p(
    "DocumentList",
    { ...documentFields, count: n("文档数量", 3, 1, 4, true) },
    (props) => <Documents {...props} />,
  ),
  DocumentCard: p("DocumentCard", documentFields, (props) => (
    <Documents count={1} card {...props} />
  )),
  DataList: p(
    "DataList",
    {
      toolbar: f("工具栏", true),
      pagination: f("分页", true),
      selection: f("选择", true),
      expansion: f("展开详情", false, true),
      loading: f("加载中", false, true),
      length: n("示例行数", 4, 0, 4, true),
    },
    ({ toolbar, pagination, selection, expansion, length, loading }) => (
      <M.DataList
        items={rows.slice(0, length)}
        getKey={(d) => d.id}
        getLabel={(d) => d.title}
        search={{}}
        loading={loading}
        renderItem={(d) => (
          <>
            <strong>{d.title}</strong> · {d.description}
          </>
        )}
        toolbar={
          toolbar ? (
            <M.Toolbar search={<M.DataList.Search label="搜索文档" />} />
          ) : undefined
        }
        pagination={pagination ? { pageSize: 2 } : undefined}
        selection={selection ? {} : undefined}
        expansion={
          expansion
            ? {
                renderDetail: (d) => (
                  <p>
                    {d.description} · {d.updatedAt}
                  </p>
                ),
              }
            : undefined
        }
      />
    ),
  ),
  Table: p(
    "Table",
    {
      bordered: f("边框", true),
      striped: f("条纹"),
      highlightOnHover: f("悬停高亮", true),
    },
    (props) => (
      <M.Table {...props}>
        <thead>
          <tr>
            <th>文档</th>
            <th>更新</th>
          </tr>
        </thead>
        <tbody>
          {documents.slice(0, 3).map((d) => (
            <tr key={d.id}>
              <td>{d.title}</td>
              <td>{d.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </M.Table>
    ),
  ),
  DataTable: p(
    "DataTable",
    {
      size: c("密度", "middle", ["small", "middle", "large"]),
      bordered: f("边框", true),
      selectable: f("行选择"),
      paginate: f("分页", true, true),
      rowHoverable: f("悬停高亮", true, true),
      loading: f("加载中", false, true),
      toolbar: f("工具栏", false, true),
      length: n("示例行数", 4, 0, 4, true),
    },
    ({ paginate, toolbar, length, ...props }) => (
      <M.DataTable
        {...props}
        data={rows.slice(0, length)}
        rowKey="id"
        pagination={paginate ? { pageSize: 3 } : false}
        toolbar={
          toolbar ? (
            <M.Toolbar start={<M.Button>新建文档</M.Button>} />
          ) : undefined
        }
        columns={[
          { title: "文档", dataIndex: "title" },
          { title: "更新", dataIndex: "updatedAt" },
          {
            title: "优先级",
            dataIndex: "priority",
            sorter: (a, b) => a.priority - b.priority,
          },
        ]}
      />
    ),
  ),
  PropertyList: p(
    "PropertyList",
    {
      kind: c("显示内容", "mixed", [
        ["mixed", "混合"],
        ["text", "纯文字"],
      ]),
      owner: f("负责人", true),
      date: f("更新时间", true),
    },
    ({ kind, owner, date }) => (
      <M.PropertyList>
        <M.PropertyItem label="类型">文档</M.PropertyItem>
        <M.PropertyItem label="状态">
          {kind === "mixed" ? <M.Tag tone="green">已完成</M.Tag> : "已完成"}
        </M.PropertyItem>
        {owner && (
          <M.PropertyItem label="负责人">
            {kind === "mixed" ? <M.Avatar name="徐行健" /> : "徐行健"}
          </M.PropertyItem>
        )}
        {date && <M.PropertyItem label="更新">今天</M.PropertyItem>}
      </M.PropertyList>
    ),
  ),
  Card: p(
    "Card",
    {
      size: c("尺寸", "medium", ["small", "medium"]),
      variant: c("外观", "outlined", ["outlined", "borderless"]),
      hoverable: f("悬停效果"),
      collapsible: f("可折叠", false, true),
      loading: f("加载中", false, true),
      inner: f("内嵌样式", false, true),
      actions: f("底部操作", false, true),
      showTabs: f("标签页", false, true),
      cover: f("封面", false, true),
    },
    ({ inner, actions, showTabs, cover, ...props }) => (
      <M.Card
        {...props}
        title="项目文档"
        style={{ maxWidth: 480 }}
        type={inner ? "inner" : undefined}
        cover={
          cover ? (
            <img
              src={photo}
              alt="封面"
              style={{ width: "100%", height: 96, objectFit: "cover" }}
            />
          ) : undefined
        }
        tabList={showTabs ? tabs : undefined}
        actions={actions ? [<M.Button key="open">打开</M.Button>] : undefined}
      >
        {!showTabs && "本周进展与文档更新"}
      </M.Card>
    ),
  ),
  CardGroup: p(
    "CardGroup",
    {
      direction: c("方向", "horizontal", ["horizontal", "vertical"]),
      columns: n("列数", 2, 1, 4),
      divided: f("分隔线"),
      gap: n("间距（px）", 12, 0, 28, true),
      span: f("首项跨列", false, true),
    },
    ({ span, ...props }) => (
      <M.CardGroup {...props}>
        {documents.map((d, i) => (
          <M.CardGroup.Item key={d.id} span={span && i === 0 ? 2 : 1}>
            <M.Card title={d.title}>{d.description}</M.Card>
          </M.CardGroup.Item>
        ))}
      </M.CardGroup>
    ),
  ),
  Tag: p(
    "Tag",
    {
      tone,
      variant: c("外观", "default", [
        ["default", "普通"],
        ["filter", "筛选"],
      ]),
      removable: f("可移除"),
      name: t("文字", "设计评审", true),
    },
    (props) => <RemovableTag {...props} />,
  ),
  Status: p(
    "Status",
    { tone, label: t("文字", "进行中") },
    ({ label, ...props }) => <M.Status {...props}>{label}</M.Status>,
  ),
  Avatar: p(
    "Avatar",
    {
      size: c("尺寸", "md", sizes),
      shape: c("形状", "circle", ["circle", "square"]),
      content: c("内容", "name", [
        ["name", "姓名"],
        ["photo", "图片"],
        ["icon", "图标"],
      ]),
      name: t("姓名", "徐行健", true),
      gap: n("文字内边距", 4, 0, 14, true),
    },
    ({ content, ...props }) => (
      <M.Avatar
        {...props}
        src={content === "photo" ? photo : undefined}
        icon={content === "icon" ? <BookOpen size={16} /> : undefined}
      />
    ),
  ),
  Image: p(
    "Image",
    {
      preview: f("可预览", true),
      width,
      fit: c("适应方式", "cover", ["cover", "contain", "fill"]),
      broken: f("模拟加载失败", false, true),
      height: n("高度（px）", 150, 80, 220, true, 10),
    },
    ({ width, broken, ...props }) => (
      <M.Image
        {...samplePhoto}
        {...props}
        width={width === "narrow" ? 130 : width === "normal" ? 240 : 300}
        src={broken ? "data:image/png;base64," : photo}
        errorContent="图片暂不可用"
      />
    ),
  ),
  Calendar: p(
    "Calendar",
    {
      mode: c("视图", "month", ["month", "year"]),
      fullscreen: f("全屏样式", false),
      showWeek: f("周数"),
      locale: c("语言", "zh", ["zh", "en"], true),
      week: c(
        "每周开始",
        "mon",
        [
          ["mon", "周一"],
          ["sun", "周日"],
        ],
        true,
      ),
      disabled: f("禁用", false, true),
      events: f("标记事件", false, true),
    },
    ({ week, events, ...props }) => (
      <M.Calendar
        {...props}
        defaultValue={date}
        weekStartsOn={week === "mon" ? 1 : 0}
        cellRender={
          events
            ? (value) => (value === date ? <span>评审</span> : null)
            : undefined
        }
      />
    ),
  ),
  Timeline: p(
    "Timeline",
    {
      orientation: c("方向", "vertical", ["vertical", "horizontal"]),
      mode: c("排列", "start", ["start", "end", "alternate"]),
      variant: c("圆点", "outlined", ["outlined", "filled"]),
      reverse: f("倒序", false, true),
      pending: f("进行中节点", false, true),
    },
    ({ pending, ...props }) => (
      <M.Timeline
        {...props}
        items={milestones}
        pending={pending ? "等待回访" : undefined}
      />
    ),
  ),
  Progress: p(
    "Progress",
    {
      type: c("样式", "line", ["line", "circle", "dashboard"]),
      value: n("进度", 66, 0, 100),
      status: state,
      showInfo: f("显示数值", true, true),
      strokeWidth: n("线宽", 6, 2, 12, true),
      strokeLinecap: c("线帽", "round", ["round", "butt", "square"], true),
      steps: n("步数（0 为连续）", 0, 0, 12, true),
    },
    ({ steps, ...props }) => (
      <M.Progress {...props} steps={steps || undefined} />
    ),
  ),
  Pagination: p(
    "Pagination",
    { total: n("总条数", 84, 0, 200), pageSize: n("每页条数", 10, 1, 30) },
    (props) => <PagingPreview {...props} />,
  ),
};

function PagingPreview({
  total,
  pageSize,
}: {
  total: number;
  pageSize: number;
}) {
  const [page, setPage] = useState(1);
  return (
    <M.Pagination
      total={total}
      pageSize={pageSize}
      page={Math.min(page, Math.max(1, Math.ceil(total / pageSize)))}
      onPageChange={setPage}
    />
  );
}
