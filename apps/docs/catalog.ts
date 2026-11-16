/** Public component reference, maintained alongside the source and generated llms.txt. */
export type PropDoc = {
  name: string;
  type: string;
  default?: string;
  description: string;
};
export type ComponentDoc = {
  name: string;
  category: string;
  description: string;
  importNames: string[];
  code: string;
  props: PropDoc[];
  notes: string[];
};
export const componentDocs: ComponentDoc[] = [
{
  "name": "Spotlight",
  "category": "反馈与浮层",
  "description": "可搜索的快捷操作面板，支持分组、键盘导航和动作回调。",
  "importNames": [
    "Spotlight"
  ],
  "code": "import { useState } from \"react\";\nimport { Search, Plus } from \"lucide-react\";\nimport { Button, Spotlight } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  const [drafts, setDrafts] = useState(0);\n  return (\n    <>\n      <Spotlight\n        shortcut={false}\n        trigger={<Button icon={<Search size={16} />}>快捷操作</Button>}\n        actions={[\n          { id: \"create\", label: \"新建草稿\", group: \"操作\", keywords: [\"new\", \"create\"], icon: <Plus size={16} />, onSelect: () => setDrafts(n => n + 1) },\n          { id: \"publish\", label: \"发布\", group: \"操作\", disabled: true },\n        ]}\n        nothingFound=\"未找到操作\"\n      />\n      <p role=\"status\">草稿数：{drafts}</p>\n    </>\n  );\n}",
  "props": [
    {
      "name": "actions",
      "type": "SpotlightAction[]",
      "description": "动作列表；id 与 label 必填。支持 description、keywords(string|string[])、group、icon、rightSection、disabled 和 onSelect。"
    },
    {
      "name": "trigger",
      "type": "ReactElement",
      "description": "触发元素，建议使用 Button；省略时可通过快捷键或受控 open 打开。"
    },
    {
      "name": "open / defaultOpen",
      "type": "boolean",
      "description": "受控打开状态或非受控初始状态。",
      "default": "false（defaultOpen）"
    },
    {
      "name": "onOpenChange",
      "type": "(open: boolean) => void",
      "description": "请求打开或关闭时调用。"
    },
    {
      "name": "query / defaultQuery",
      "type": "string",
      "description": "受控搜索内容或非受控初始查询。",
      "default": "\"\"（defaultQuery）"
    },
    {
      "name": "onQueryChange",
      "type": "(query: string) => void",
      "description": "查询变化或关闭时请求重置查询。"
    },
    {
      "name": "shortcut",
      "type": "string | false",
      "description": "配合 Ctrl 或 Meta 的 KeyboardEvent.key 值；false 禁用。不是快捷键表达式解析器，不传 \"mod+k\"。",
      "default": "\"k\""
    },
    {
      "name": "enableInInputs",
      "type": "boolean",
      "description": "是否允许快捷键在外部输入和可编辑内容中触发；面板自己的搜索框始终允许切换。",
      "default": "false"
    },
    {
      "name": "title",
      "type": "string",
      "description": "面板标题，默认按 Provider locale 选择。",
      "default": "快捷操作 / Command palette"
    },
    {
      "name": "placeholder",
      "type": "string",
      "description": "搜索输入提示，同时用于输入可访问名称。",
      "default": "搜索操作或页面… / Search actions or pages…"
    },
    {
      "name": "nothingFound",
      "type": "ReactNode",
      "description": "过滤后无结果时显示的内容。",
      "default": "没有找到相关操作 / No actions found"
    },
    {
      "name": "limit",
      "type": "number",
      "description": "最多显示的匹配项数量；向下取整，负数按 0，非有限值回退 20。",
      "default": "20"
    },
    {
      "name": "filter",
      "type": "(query: string, action: SpotlightAction) => boolean",
      "description": "替换默认匹配逻辑；不负责排序或异步请求。"
    },
    {
      "name": "onActionSelect",
      "type": "(action: SpotlightAction) => void",
      "description": "执行可用动作时的统一回调，在动作自身 onSelect 之后调用。"
    },
    {
      "name": "closeOnSelect",
      "type": "boolean",
      "description": "选择可用动作后请求关闭面板。",
      "default": "true"
    },
    {
      "name": "resetQueryOnClose",
      "type": "boolean",
      "description": "组件请求关闭时将查询重置为空字符串。",
      "default": "true"
    },
    {
      "name": "className",
      "type": "string",
      "description": "附加到面板的类名。"
    },
    {
      "name": "action.onSelect",
      "type": "() => void",
      "description": "动作选择回调；与 id、label 一起定义在 actions 中。"
    }
  ],
  "notes": [
    "这是 mtone 自己的组件 API，不是 Mantine Spotlight API 的兼容实现；不提供全局 singleton、spotlight.open() 或命令注册中心。每个实例独立管理状态。",
    "默认 Ctrl/Cmd+K 切换面板；默认不拦截 input、textarea、select 和可编辑内容中的按键，忽略组合输入、重复按键及 Alt/Shift 组合。文档演示使用 shortcut={false}，避免 Gallery 多实例争抢快捷键。应用中建议只挂载一个启用相同全局快捷键的实例。",
    "默认搜索 label、description 和 keywords，不区分大小写，并去除查询首尾空白；group 不参与默认搜索。filter 接收未经裁剪的原始查询。",
    "动作按传入顺序保留，连续相同 group 合并为一组；相同分组若不连续，会出现多个同名组。每个 action.id 必须在实例中唯一。limit 在过滤之后应用，禁用项也计入数量。",
    "方向键上下循环选择可用项，Home/End 到首尾，Enter 执行，Esc 关闭。禁用项显示但不会执行。焦点保持在搜索框，关闭与焦点恢复由 Dialog 处理。",
    "默认选择后先关闭并请求清空查询，然后调用 action.onSelect 和 onActionSelect。回调不自动导航、等待异步任务、捕获业务错误或保存数据，业务逻辑由应用负责。",
    "open/query 受控时，父组件必须响应对应回调更新状态。resetQueryOnClose 作用于组件发出的关闭请求；外部直接改变 open 不应被视为自动重置 query 的保证。",
    "面板复用 mtone Dialog 和 Input。示例动作只修改本地演示状态，不发送网络请求。"
  ]
},
  {
    name: "Layout",
    category: "页面布局",
    description:
      "可组合的页面骨架，组织左侧品牌与导航、右侧顶部操作和独立滚动主体。",
    importNames: ["Layout"],
    code: 'import { useState } from "react";\nimport { Box, BookOpen, Home, Settings } from "lucide-react";\nimport { Layout, Breadcrumb, NavItem, IconButton, Card } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  const [collapsed, setCollapsed] = useState(false);\n  return (\n    <Layout hasSider style={{ height: 480 }}>\n      <Layout.Sider\n        collapsible\n        collapsed={collapsed}\n        onCollapsedChange={setCollapsed}\n        width={240}\n        collapsedWidth={52}\n        version="v1.0.0"\n        breakpoint={768}\n        logo={<strong>mtone</strong>}\n        collapsedLogo={<Box size={22} aria-label="mtone" />}\n        aria-label="主导航"\n      >\n        <NavItem icon={<Home size={16} />}>首页</NavItem>\n        <NavItem icon={<BookOpen size={16} />} active>知识库</NavItem>\n      </Layout.Sider>\n      <Layout>\n        <Layout.Header\n          breadcrumb={<Breadcrumb items={[{ label: "知识库" }, { label: "设计规范" }]} />}\n          extra={<IconButton aria-label="设置"><Settings size={16} /></IconButton>}\n        />\n        <Layout.Content>\n          <h1>设计规范</h1>\n          <Card>这里是独立滚动的主体内容。</Card>\n        </Layout.Content>\n      </Layout>\n    </Layout>\n  );\n}',
    props: [
      {
        name: "Layout.Sider.version",
        type: "ReactNode",
        description:
          "底部左侧的应用版本文字/内容；默认不显示，收起时隐藏。折叠按钮固定在底部右侧。",
      },
      {
        name: "Layout.hasSider",
        type: "boolean",
        description:
          "是否采用横向布局。省略时自动识别直接子元素中的 Layout.Sider；包装组件内的 Sider 请显式指定。",
      },
      {
        name: "Layout.fullHeight",
        type: "boolean",
        default: "false",
        description:
          "占满视口高度（100dvh）；嵌入页面时可改用 style.height 指定有限高度。",
      },
      {
        name: "Layout.Sider.collapsible",
        type: "boolean",
        default: "false",
        description: "启用复用自 Sidebar 的收起/展开按钮和图标窄栏。",
      },
      {
        name: "Layout.Sider.collapsed",
        type: "boolean",
        description: "受控收起状态；搭配 onCollapsedChange 由父组件更新。",
      },
      {
        name: "Layout.Sider.defaultCollapsed",
        type: "boolean",
        default: "false",
        description: "非受控模式的初始收起状态。",
      },
      {
        name: "Layout.Sider.onCollapsedChange",
        type: "(collapsed: boolean) => void",
        description:
          "点击收起按钮或响应式断点请求改变状态时调用；受控模式不会自行覆盖 collapsed。",
      },
      {
        name: "Layout.Sider.logo / collapsedLogo",
        type: "ReactNode",
        description: "顶部品牌插槽；collapsedLogo 用于窄栏中的简化标识。",
      },
      {
        name: "Layout.Sider.width / collapsedWidth",
        type: "number",
        default: "240 / 52",
        description: "展开/收起宽度，单位 px，最小 40px；本版不支持零宽隐藏。",
      },
      {
        name: "Layout.Sider.breakpoint",
        type: "number",
        description:
          "可选视口断点（px），例如 768。低于断点请求收起，恢复宽屏请求展开；未设置时不自动响应。",
      },
      {
        name: "Layout.Sider.onBreakpoint",
        type: "(broken: boolean) => void",
        description: "监听断点状态；true 表示视口低于设定断点。",
      },
      {
        name: "Layout.Sider.collapseLabel / expandLabel",
        type: "string",
        default: "收起侧边栏 / 展开侧边栏",
        description: "继承 Sidebar 的切换按钮可访问名称。",
      },
      {
        name: "Layout.Header.breadcrumb",
        type: "ReactNode",
        description: "顶部左侧插槽；建议传入已有 Breadcrumb 组件。",
      },
      {
        name: "Layout.Header.extra",
        type: "ReactNode",
        description:
          "顶部右对齐操作插槽，可组合 IconButton、DropdownMenu、Avatar 等。",
      },
      {
        name: "Layout.Header.children",
        type: "ReactNode",
        description: "顶部左侧补充内容；窄屏允许换行。",
      },
      {
        name: "Layout.Content.as",
        type: '"main" | "section" | "div"',
        default: "main",
        description:
          "主体语义标签。一个页面通常只使用一个 main；嵌入其他主体时改为 section 或 div。",
      },
      {
        name: "children / className / style / 原生属性",
        type: "ReactNode / string / CSSProperties / HTMLAttributes",
        description:
          "各区域均可嵌套内容和覆盖样式；默认不生成主体 Footer，显式组合 Layout.Footer 时显示，默认高度 42px。",
      },
    ],
    notes: [
      "主体 Footer 与侧栏版本/折叠底栏是独立区域，默认高度均为 42px。需要时加入 <Layout.Footer>内容</Layout.Footer>；主体 Footer 可用 style.height 覆盖高度；--mt-layout-footer-height 可统一覆盖左右两个底栏高度。Topbar 与品牌行使用 --mt-layout-header-height（默认 48px），窄屏内容换行时可自然增高。",
      "使用 Layout.Sider、Layout.Header、Layout.Content、Layout.Footer 组合，不需要单独安装子组件。API 采用 Ant Design 的组合习惯，但不是 Ant Design Layout 的全量兼容实现。",
      "Layout.Sider 复用本库 Sidebar 的状态、NavItem 图标窄栏和键盘提示，不重写导航逻辑。Header 推荐复用 Breadcrumb、IconButton 等已有组件。",
      "默认头部 48px，侧栏 240px，窄栏 52px；可通过 width、collapsedWidth 和区域 style 配置。使用有限高度或 fullHeight 后，侧栏内容和 Content 独立滚动，品牌、侧栏底部版本/折叠行与顶部操作保持可见。",
      "响应式收起为图标窄栏，不是弹出式抽屉。breakpoint 按浏览器视口判断，不按示例容器宽度判断；希望自定义手机抽屉时可组合已有 Drawer。",
      "受控状态必须在 onCollapsedChange 中更新，否则切换只发出请求。导航、路由、数据保存、账号菜单与持久化由应用实现。",
      "示例右上按钮仅更新本地提示；不发送搜索、通知请求，也不更改账号或安全设置。",
    ],
  },
  {
    name: "Button",
    category: "按钮与操作",
    description: "带完整样式的基础操作按钮。",
    importNames: ["Button"],
    code: 'import { Button } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Button variant="blue">启用两步验证</Button>\n  );\n}',
    props: [
      {
        name: "variant",
        type: '"blue" | "solid" | "outline" | "soft" | "ghost"',
        description: "按钮外观。",
        default: "outline",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        description: "按钮尺寸。",
        default: "md",
      },
      {
        name: "danger",
        type: "boolean",
        description: "危险操作样式。",
      },
      {
        name: "loading",
        type: "boolean",
        description: "显示加载图标并禁用点击。",
      },
      {
        name: "icon",
        type: "ReactNode",
        description: "前置图标。",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "禁用按钮。",
      },
      {
        name: "onClick",
        type: "MouseEventHandler",
        description: "点击回调。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
    ],
    notes: [
      "支持 ref 和 Base UI Button 的可组合属性。加载中不会重复触发操作。",
      "blue 为蓝色实心变体：背景 #2783DE、文字 #F3F9FD，悬停背景 #2276C9，背景颜色过渡 100ms ease-in-out。danger 会优先使用危险操作色。",
    ],
  },
  {
    name: "IconButton",
    category: "按钮与操作",
    description: "有可访问名称的图标操作按钮。",
    importNames: ["IconButton"],
    code: 'import { IconButton } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <IconButton aria-label="添加">＋</IconButton>\n  );\n}',
    props: [
      {
        name: "aria-label",
        type: "string",
        description: "必填；读屏器朗读的操作名称。",
      },
      {
        name: "variant",
        type: '"blue" | "solid" | "outline" | "soft" | "ghost"',
        description: "按钮外观。",
        default: "outline",
      },
      {
        name: "size",
        type: '"sm" | "md" | "lg"',
        description: "按钮尺寸。",
        default: "md",
      },
      {
        name: "danger",
        type: "boolean",
        description: "危险操作样式。",
      },
      {
        name: "loading",
        type: "boolean",
        description: "显示加载图标并禁用点击。",
      },
      {
        name: "icon",
        type: "ReactNode",
        description: "前置图标。",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "禁用按钮。",
      },
      {
        name: "onClick",
        type: "MouseEventHandler",
        description: "点击回调。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
    ],
    notes: ["children 中可直接放 lucide-react 图标；不要只用图标而省略名称。"],
  },
  {
    name: "ButtonGroup",
    category: "按钮与操作",
    description: "将关联按钮组织为一个操作组。",
    importNames: ["ButtonGroup", "Button"],
    code: 'import { ButtonGroup, Button } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <ButtonGroup aria-label="编辑操作"><Button>复制</Button><Button>粘贴</Button></ButtonGroup>\n  );\n}',
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "原生属性",
        type: "HTMLAttributes",
        description:
          "支持对应元素的 className、style 与适用的 DOM 属性；以 TypeScript 定义为准。",
      },
    ],
    notes: [],
  },
  {
    name: "Input",
    category: "输入与表单",
    description: "单行文本输入，保留标准 HTML 输入接口。",
    importNames: ["Input"],
    code: 'import { Input } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Input aria-label="标题" placeholder="输入标题" />\n  );\n}',
    props: [
      {
        name: "value / defaultValue",
        type: "string",
        description: "受控值或非受控初始值。",
      },
      {
        name: "onChange",
        type: "ChangeEventHandler",
        description: "接收原生 React change 事件。",
      },
      {
        name: "placeholder",
        type: "string",
        description: "输入提示。",
      },
      {
        name: "disabled / readOnly",
        type: "boolean",
        description: "禁用或只读。",
      },
      {
        name: "aria-label / id",
        type: "string",
        description: "可访问名称或与 label 关联的标识。",
      },
      {
        name: "原生属性",
        type: "HTMLAttributes",
        description:
          "支持对应元素的 className、style 与适用的 DOM 属性；以 TypeScript 定义为准。",
      },
    ],
    notes: ["默认单行外框高度为 28px（含边框）；comfortable 密度保留 36px。可使用 style 或 --mt-height 定制，不影响 Textarea 的多行高度。", "支持对应原生输入元素属性和 ref。占位提示不能替代标签。", "Input 聚焦时只将原有 1px 边框改为浅蓝 #93B4DC，不显示外部 outline，也不改变尺寸。错误态保留红色边框；强制颜色模式恢复系统焦点提示。SearchInput、Textarea、Select、MultiSelect、NumberInput、DatePicker 及 Table 筛选输入采用相同边框聚焦效果。"],
  },
  {
    name: "SearchInput",
    category: "输入与表单",
    description: "带搜索图标的输入框，不注册全局快捷键。",
    importNames: ["SearchInput"],
    code: 'import { SearchInput } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <SearchInput aria-label="搜索文档" placeholder="搜索文档…" />\n  );\n}',
    props: [
      {
        name: "value / defaultValue",
        type: "string",
        description: "受控值或非受控初始值。",
      },
      {
        name: "onChange",
        type: "ChangeEventHandler",
        description: "接收原生 React change 事件。",
      },
      {
        name: "placeholder",
        type: "string",
        description: "输入提示。",
      },
      {
        name: "disabled / readOnly",
        type: "boolean",
        description: "禁用或只读。",
      },
      {
        name: "aria-label / id",
        type: "string",
        description: "可访问名称或与 label 关联的标识。",
      },
      {
        name: "原生属性",
        type: "HTMLAttributes",
        description:
          "支持对应元素的 className、style 与适用的 DOM 属性；以 TypeScript 定义为准。",
      },
    ],
    notes: ["默认单行外框高度为 28px（含边框），搜索图标垂直居中；comfortable 密度保留 36px，可通过 --mt-height 定制。", "输入表面聚焦时只将现有边框改为 #93B4DC，不加粗、不加外圈；错误与禁用状态保留，强制颜色模式使用系统焦点提示。", "支持对应原生输入元素属性和 ref。占位提示不能替代标签。"],
  },
  {
    name: "Textarea",
    category: "输入与表单",
    description: "用于多行说明和长文本的输入框。",
    importNames: ["Textarea"],
    code: 'import { Textarea } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Textarea aria-label="说明" rows={4} placeholder="记录你的想法" />\n  );\n}',
    props: [
      {
        name: "value / defaultValue",
        type: "string",
        description: "受控值或非受控初始值。",
      },
      {
        name: "onChange",
        type: "ChangeEventHandler",
        description: "接收原生 React change 事件。",
      },
      {
        name: "placeholder",
        type: "string",
        description: "输入提示。",
      },
      {
        name: "disabled / readOnly",
        type: "boolean",
        description: "禁用或只读。",
      },
      {
        name: "aria-label / id",
        type: "string",
        description: "可访问名称或与 label 关联的标识。",
      },
      {
        name: "原生属性",
        type: "HTMLAttributes",
        description:
          "支持对应元素的 className、style 与适用的 DOM 属性；以 TypeScript 定义为准。",
      },
    ],
    notes: ["输入表面聚焦时只将现有边框改为 #93B4DC，不加粗、不加外圈；错误与禁用状态保留，强制颜色模式使用系统焦点提示。", "支持对应原生输入元素属性和 ref。占位提示不能替代标签。"],
  },
{
  "name": "Form",
  "category": "输入与表单",
  "description": "管理字段值与同步/异步校验，支持受验证的提交回调并保留原生表单用法。",
  "importNames": [
    "Form",
    "FormField",
    "Input",
    "Button"
  ],
  "code": "import { useState } from \"react\";\nimport { Form, FormField, Input, Button } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  const [form] = Form.useForm();\n  const [message, setMessage] = useState(\"\");\n  return (\n    <Form form={form} initialValues={{ email: \"\" }}\n      onFinish={values => setMessage(`本地提交成功：${values.email}`)}\n      onFinishFailed={() => setMessage(\"请检查字段错误\")}\n    >\n      <FormField name=\"email\" label=\"邮箱\" rules={[\n        { required: true, message: \"请输入邮箱\" },\n        { type: \"email\", message: \"请输入有效邮箱\" },\n      ]}>\n        <Input type=\"email\" />\n      </FormField>\n      <Button type=\"submit\" variant=\"blue\">提交</Button>\n      <Button type=\"reset\">重置</Button>\n      <p role=\"status\">{message}</p>\n    </Form>\n  );\n}",
  "props": [
    {
      "name": "form",
      "type": "FormInstance",
      "description": "传入 Form.useForm() 获得的实例；省略时创建内部实例。"
    },
    {
      "name": "initialValues",
      "type": "Record<string, unknown>",
      "description": "初始值及 resetFields 的恢复值；一次初始化，优先于字段 initialValue。"
    },
    {
      "name": "validateTrigger",
      "type": "\"onChange\" | \"onBlur\" | (\"onChange\" | \"onBlur\")[] | false",
      "description": "字段自动校验时机；false 仅关闭自动校验，提交和手动校验仍执行。",
      "default": "\"onChange\""
    },
    {
      "name": "onFinish",
      "type": "(values: FormValues) => void",
      "description": "所有托管字段校验通过后的提交回调。"
    },
    {
      "name": "onFinishFailed",
      "type": "(error: FormValidationError) => void",
      "description": "非过期的提交校验失败回调，包含 values、errorFields、outOfDate。"
    },
    {
      "name": "onValuesChange",
      "type": "(changed: FormValues, values: FormValues) => void",
      "description": "控件交互更新值时触发，提供改变的字段和值快照。"
    },
    {
      "name": "onSubmit / onReset",
      "type": "FormEventHandler",
      "description": "原生事件回调最先执行；preventDefault 可取消对应内建处理。"
    },
    {
      "name": "noValidate",
      "type": "boolean",
      "description": "托管时默认由规则引擎校验，避免浏览器原生校验拦截提交；可显式覆盖。",
      "default": "托管表单默认 true"
    },
    {
      "name": "children / className / style / 原生属性",
      "type": "ReactNode / string / CSSProperties / FormHTMLAttributes",
      "description": "支持原生 form 属性。"
    },
    {
      "name": "Form.useForm()",
      "type": "() => [FormInstance]",
      "description": "创建生命周期稳定的表单实例，遵守 React Hook 使用规则。"
    },
    {
      "name": "Form.Item",
      "type": "typeof FormField",
      "description": "FormField 的组合式别名，支持相同字段属性。"
    },
    {
      "name": "form.getFieldValue / getFieldsValue",
      "type": "(name: string) => unknown / () => FormValues",
      "description": "读取单个字段或全部当前值。"
    },
    {
      "name": "form.setFieldValue / setFieldsValue",
      "type": "(name: string, value: unknown) => void / (values: FormValues) => void",
      "description": "设置单个或合并多个字段值，不触发 onValuesChange 或自动校验。"
    },
    {
      "name": "form.getFieldError / getFieldsError",
      "type": "(name: string) => string[] / (names?: string[]) => {name: string; errors: string[]}[]",
      "description": "读取单个或多个字段的规则错误。"
    },
    {
      "name": "form.isFieldValidating",
      "type": "(name: string) => boolean",
      "description": "读取字段是否正在校验。"
    },
    {
      "name": "form.validateFields",
      "type": "(names?: string[]) => Promise<FormValues>",
      "description": "校验全部注册字段或指定字段；失败或过期时拒绝，必须处理 Promise。"
    },
    {
      "name": "form.resetFields",
      "type": "(names?: string[]) => void",
      "description": "恢复全部或指定字段的初始值，清除错误与校验中状态。"
    }
  ],
  "notes": [
    "这是 mtone 的轻量表单 API，不是 Ant Design Form 的完整兼容实现；支持 Form.Item（等同 FormField）和 Form.useForm()，不支持 Form.List、dependencies、嵌套路径、transform 或自动依赖重验证。",
    "字段 name 是扁平字符串 key；例如 \"user.email\" 只是一个完整 key，不会生成嵌套对象。控件以 Form 接管的值为准，不要同时传 value/defaultValue。",
    "initialValues 对每个 Form 实例只在初始化时生效，不会随 prop 改变覆盖编辑值；动态加载数据请调用 setFieldsValue。Form.initialValues 优先于字段 initialValue，MultiSelect 的初始值建议在 initialValues 中设为 []。",
    "无 name 的 FormField 保留原有手动 error/受控值用法；没有托管字段、没有传 form/onFinish 的 Form 仍使用原生提交行为。",
    "规则按顺序执行，每个字段遇到首个错误停止。可选空值跳过内建类型/长度/范围/正则检查，但仍执行自定义 validator；若要求填写请设置 required。required 只判断空值，不等于 Checkbox 必须选中；此类业务约束用自定义 validator。",
    "异步校验不发送内置网络请求；自定义 validator 可返回错误字符串、抛出错误或返回 Promise。值变化、重置或新校验可能使旧校验失效，validateFields 会拒绝并返回 outOfDate: true；手动调用须 catch，忽略过期结果。",
    "显式 error 优先于自动错误显示，但仅是展示，不会使 validateFields 失败或阻止 onFinish；阻止提交必须使用 rules。",
    "组件注入 id、required、aria-invalid、aria-describedby 和校验中的 aria-busy；子控件需将这些属性传递到实际输入元素。内置 Input/Select/MultiSelect 已适配。",
    "控件交互触发 onValuesChange；setFieldValue/setFieldsValue/resetFields 不触发该回调，也不会自动重跑校验。set 操作清除对应字段旧错误，若需校验请手动调用 validateFields。",
    "托管提交会阻止浏览器默认提交并校验；通过后调用 onFinish，失败调用 onFinishFailed。用户 onSubmit 最先执行，若调用 preventDefault 则取消本次内建提交和校验。",
    "Form 内 type=\"reset\" 按钮恢复初始值与校验状态；onReset 若 preventDefault 则取消内建重置。业务保存/请求、成功状态与提交中的 loading 由应用管理。",
    "字段卸载后不再参与校验，但值保留在表单数据中。实例读取返回浅拷贝，不要原地修改其中的数组或对象。"
  ]
},
{
  "name": "FormField",
  "category": "输入与表单",
  "description": "关联字段标签与帮助信息，配合 Form 的 name/rules 自动管理值和校验。",
  "importNames": [
    "Form",
    "FormField",
    "Input",
    "Button"
  ],
  "code": "import { Form, FormField, Input, Button } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return (\n    <Form onFinish={values => console.log(\"已校验\", values)}>\n      <FormField name=\"title\" label=\"文档名称\" validateTrigger=\"onBlur\"\n        rules={[\n          { required: true, whitespace: true, message: \"请输入文档名称\" },\n          { min: 3, message: \"至少输入 3 个字符\" },\n        ]}\n      >\n        <Input placeholder=\"例如：阅读笔记\" />\n      </FormField>\n      <Button type=\"submit\">校验并提交</Button>\n    </Form>\n  );\n}",
  "props": [
    {
      "name": "label",
      "type": "ReactNode",
      "description": "必填；字段可访问标签。"
    },
    {
      "name": "children",
      "type": "ReactElement",
      "description": "必填；单个可接收注入值、事件、id 与 ARIA 属性的控件。"
    },
    {
      "name": "name",
      "type": "string",
      "description": "Form 中的扁平字段 key。省略时保持手动模式。"
    },
    {
      "name": "rules",
      "type": "FormRule[]",
      "description": "同步/异步规则，按顺序遇到首错停止。"
    },
    {
      "name": "initialValue",
      "type": "unknown",
      "description": "字段初始值，优先级低于 Form.initialValues；只用于初始化/重置。"
    },
    {
      "name": "validateTrigger",
      "type": "\"onChange\" | \"onBlur\" | (\"onChange\" | \"onBlur\")[] | false",
      "description": "覆盖此字段的自动校验时机。",
      "default": "继承 Form"
    },
    {
      "name": "valuePropName",
      "type": "string",
      "description": "绑定到子控件的值属性，例如 checked。",
      "default": "\"value\""
    },
    {
      "name": "trigger",
      "type": "string",
      "description": "取值事件名；同名子控件事件仍会调用。",
      "default": "Input: onChange；Select/MultiSelect: onValueChange"
    },
    {
      "name": "getValueFromEvent",
      "type": "(...args: any[]) => unknown",
      "description": "自定义从控件事件参数中提取字段值。"
    },
    {
      "name": "description",
      "type": "ReactNode",
      "description": "没有错误时显示的辅助说明。"
    },
    {
      "name": "error",
      "type": "ReactNode",
      "description": "显式错误展示，优先于规则错误；不参与提交校验。"
    },
    {
      "name": "required",
      "type": "boolean",
      "description": "必填标记和传给控件的 required；规则引擎是否必填应使用 rules.required。",
      "default": "从 rules.required 推断"
    },
    {
      "name": "rule.required / whitespace",
      "type": "boolean",
      "description": "必填检查 / 拒绝纯空白字符串。"
    },
    {
      "name": "rule.type",
      "type": "\"string\" | \"number\" | \"boolean\" | \"array\" | \"email\" | \"url\" | \"integer\"",
      "description": "值类型或基础格式规则，不隐式转换类型。"
    },
    {
      "name": "rule.min / max / len",
      "type": "number",
      "description": "字符串/数组长度或数值下限、上限、相等值。"
    },
    {
      "name": "rule.pattern",
      "type": "RegExp",
      "description": "字符串正则检查。"
    },
    {
      "name": "rule.message",
      "type": "string",
      "description": "覆盖规则失败的错误文案。"
    },
    {
      "name": "rule.validator",
      "type": "(rule: FormRule, value: unknown, values: FormValues) => void | string | Promise<void | string>",
      "description": "返回 void 表示通过，返回错误字符串或抛错表示失败；支持异步。"
    }
  ],
  "notes": [
    "这是 mtone 的轻量表单 API，不是 Ant Design Form 的完整兼容实现；支持 Form.Item（等同 FormField）和 Form.useForm()，不支持 Form.List、dependencies、嵌套路径、transform 或自动依赖重验证。",
    "字段 name 是扁平字符串 key；例如 \"user.email\" 只是一个完整 key，不会生成嵌套对象。控件以 Form 接管的值为准，不要同时传 value/defaultValue。",
    "initialValues 对每个 Form 实例只在初始化时生效，不会随 prop 改变覆盖编辑值；动态加载数据请调用 setFieldsValue。Form.initialValues 优先于字段 initialValue，MultiSelect 的初始值建议在 initialValues 中设为 []。",
    "无 name 的 FormField 保留原有手动 error/受控值用法；没有托管字段、没有传 form/onFinish 的 Form 仍使用原生提交行为。",
    "规则按顺序执行，每个字段遇到首个错误停止。可选空值跳过内建类型/长度/范围/正则检查，但仍执行自定义 validator；若要求填写请设置 required。required 只判断空值，不等于 Checkbox 必须选中；此类业务约束用自定义 validator。",
    "异步校验不发送内置网络请求；自定义 validator 可返回错误字符串、抛出错误或返回 Promise。值变化、重置或新校验可能使旧校验失效，validateFields 会拒绝并返回 outOfDate: true；手动调用须 catch，忽略过期结果。",
    "显式 error 优先于自动错误显示，但仅是展示，不会使 validateFields 失败或阻止 onFinish；阻止提交必须使用 rules。",
    "组件注入 id、required、aria-invalid、aria-describedby 和校验中的 aria-busy；子控件需将这些属性传递到实际输入元素。内置 Input/Select/MultiSelect 已适配。",
    "Input 默认监听 onChange 并提取 event.target.value；内置 Select/MultiSelect 自动改用 onValueChange，无需额外 trigger。自定义控件可配置 valuePropName、trigger、getValueFromEvent。",
    "Checkbox 等非 value 控件可配置 valuePropName=\"checked\"、trigger=\"onCheckedChange\"。trigger 负责取值，validateTrigger 负责校验时机，是两个不同概念。",
    "rules.type 不做类型转换，原生数字输入的字符串不会自动成为 number；可用 getValueFromEvent 显式转换。string/array 的 min/max/len 比较长度，number 的 min/max/len 比较数值。",
    "URL 规则接受有效 http/https 地址；email 是基础格式检查，不验证邮箱存在。whitespace 拒绝纯空白字符串，不会自动 trim 值。pattern 为 RegExp。",
    "规则 message 覆盖该规则的错误文案（包括 validator 的错误），建议提供中文文案；如果希望 validator 返回不同错误，省略此规则的 message。"
  ]
},
  {
    name: "Checkbox",
    category: "选择控件",
    description: "勾选状态切换。",
    importNames: ["Checkbox"],
    code: 'import { Checkbox } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Checkbox label="自动保存" defaultChecked />\n  );\n}',
    props: [
      {
        name: "label",
        type: "string",
        description: "提供可访问名称。",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "禁用交互。",
      },
      {
        name: "name",
        type: "string",
        description: "表单字段名称。",
      },
      {
        name: "className",
        type: "string",
        description: "附加样式类。",
      },
      {
        name: "checked",
        type: "boolean",
        description: "受控勾选值。",
      },
      {
        name: "defaultChecked",
        type: "boolean",
        description: "非受控初始值。",
      },
      {
        name: "onCheckedChange",
        type: "(checked: boolean) => void",
        description: "勾选变化回调。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "indeterminate",
        type: "boolean",
        description: "不确定状态，适合部分选中。",
      },
    ],
    notes: ["提供 label 或可读 children，确保控件有名称。"],
  },
  {
    name: "Switch",
    category: "选择控件",
    description: "开关式布尔状态控制。",
    importNames: ["Switch"],
    code: 'import { Switch } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Switch label="自动保存" defaultChecked />\n  );\n}',
    props: [
      {
        name: "label",
        type: "string",
        description: "提供可访问名称。",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "禁用交互。",
      },
      {
        name: "name",
        type: "string",
        description: "表单字段名称。",
      },
      {
        name: "className",
        type: "string",
        description: "附加样式类。",
      },
      {
        name: "checked",
        type: "boolean",
        description: "受控勾选值。",
      },
      {
        name: "defaultChecked",
        type: "boolean",
        description: "非受控初始值。",
      },
      {
        name: "onCheckedChange",
        type: "(checked: boolean) => void",
        description: "勾选变化回调。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
    ],
    notes: ["提供 label 或可读 children，确保控件有名称。"],
  },
  {
    name: "RadioGroup",
    category: "选择控件",
    description: "从一组选项中选择一个值。",
    importNames: ["RadioGroup"],
    code: 'import { RadioGroup } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <RadioGroup label="显示方式" defaultValue="list" options={[{value:"list",label:"列表"},{value:"table",label:"表格"}]} />\n  );\n}',
    props: [
      {
        name: "label",
        type: "string",
        description: "提供可访问名称。",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "禁用交互。",
      },
      {
        name: "name",
        type: "string",
        description: "表单字段名称。",
      },
      {
        name: "className",
        type: "string",
        description: "附加样式类。",
      },
      {
        name: "options",
        type: "Option[]",
        description:
          "必填；每项含 value、label，可设置 disabled。value 必须唯一。",
      },
      {
        name: "value",
        type: "string",
        description: "受控值；提供后需在回调中更新。",
      },
      {
        name: "defaultValue",
        type: "string",
        description: "非受控初始值。",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "值变化回调。",
      },
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        description: "RadioGroup 的排列方向；Segmented 默认采用水平分段样式。",
        default: "vertical",
      },
    ],
    notes: ["每个选项的 label 为可见名称；可用 disabled 禁用单项。"],
  },
  {
    name: "Segmented",
    category: "导航与筛选",
    description: "用紧凑分段按钮切换视图或模式。",
    importNames: ["Segmented"],
    code: 'import { Segmented } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Segmented label="显示方式" defaultValue="list" options={[{value:"list",label:"列表"},{value:"table",label:"表格"}]} />\n  );\n}',
    props: [
      {
        name: "label",
        type: "string",
        description: "提供可访问名称。",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "禁用交互。",
      },
      {
        name: "name",
        type: "string",
        description: "表单字段名称。",
      },
      {
        name: "className",
        type: "string",
        description: "附加样式类。",
      },
      {
        name: "options",
        type: "Option[]",
        description:
          "必填；每项含 value、label，可设置 disabled。value 必须唯一。",
      },
      {
        name: "value",
        type: "string",
        description: "受控值；提供后需在回调中更新。",
      },
      {
        name: "defaultValue",
        type: "string",
        description: "非受控初始值。",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "值变化回调。",
      },
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        description: "RadioGroup 的排列方向；Segmented 默认采用水平分段样式。",
        default: "horizontal",
      },
    ],
    notes: ["每个选项的 label 为可见名称；可用 disabled 禁用单项。"],
  },
  {
    name: "Select",
    category: "选择控件",
    description: "带浮层列表的单选控件。",
    importNames: ["Select"],
    code: 'import { Select } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Select label="分类" defaultValue="design" options={[{value:"design",label:"设计"},{value:"code",label:"开发"}]} />\n  );\n}',
    props: [
      {
        name: "label",
        type: "string",
        description: "提供可访问名称。",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "禁用交互。",
      },
      {
        name: "name",
        type: "string",
        description: "表单字段名称。",
      },
      {
        name: "className",
        type: "string",
        description: "附加样式类。",
      },
      {
        name: "options",
        type: "Option[]",
        description:
          "必填；每项含 value、label，可设置 disabled。value 必须唯一。",
      },
      {
        name: "placeholder",
        type: "string",
        description: "未选择时的提示。",
      },
      {
        name: "value",
        type: "string | null",
        description: "受控值；提供后需在回调中更新。",
      },
      {
        name: "defaultValue",
        type: "string | null",
        description: "非受控初始值。",
      },
      {
        name: "onValueChange",
        type: "(value: string | null) => void",
        description: "值变化回调。",
      },
      {
        name: "open",
        type: "boolean",
        description: "受控开关。",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        description: "非受控初始开关。",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "开关变化回调。",
      },
    ],
    notes: ["默认单行外框高度为 28px（含边框）；长选中标签在行内省略，comfortable 密度保留 34px。可用 className 覆盖尺寸。", "输入表面聚焦时只将现有边框改为 #93B4DC，不加粗、不加外圈；错误与禁用状态保留，强制颜色模式使用系统焦点提示。", "支持键盘选择、禁用选项和焦点恢复。", "选中项使用垂直居中的 16px Lucide Check 细线对号（1.5px 描边），无需新增属性配置。"],
  },
  {
    name: "MultiSelect",
    category: "选择控件",
    description: "支持搜索与移除标签的多选控件。",
    importNames: ["MultiSelect"],
    code: 'import { MultiSelect } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <MultiSelect label="分类" defaultValue={["design"]} options={[{value:"design",label:"设计"},{value:"code",label:"开发"}]} />\n  );\n}',
    props: [
      {
        name: "label",
        type: "string",
        description: "提供可访问名称。",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "禁用交互。",
      },
      {
        name: "name",
        type: "string",
        description: "表单字段名称。",
      },
      {
        name: "className",
        type: "string",
        description: "附加样式类。",
      },
      {
        name: "options",
        type: "Option[]",
        description:
          "必填；每项含 value、label，可设置 disabled。value 必须唯一。",
      },
      {
        name: "placeholder",
        type: "string",
        description: "未选择时的提示。",
      },
      {
        name: "value",
        type: "string[]",
        description: "受控值；提供后需在回调中更新。",
      },
      {
        name: "defaultValue",
        type: "string[]",
        description: "非受控初始值。",
      },
      {
        name: "onValueChange",
        type: "(value: string[]) => void",
        description: "值变化回调。",
      },
      {
        name: "open",
        type: "boolean",
        description: "受控开关。",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        description: "非受控初始开关。",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "开关变化回调。",
      },
    ],
    notes: ["默认单行外框最小高度为 28px（含边框）；多个标签换行时自动增高，不强制裁剪为 28px。comfortable 密度下仍以 28px 为最小高度；可用 className 定制。", "输入表面聚焦时只将现有边框改为 #93B4DC，不加粗、不加外圈；错误与禁用状态保留，强制颜色模式使用系统焦点提示。", "MultiSelect 建议使用纯文本 label，以确保搜索与标签显示正确。"],
  },
  {
    name: "Slider",
    category: "选择控件",
    description: "通过滑轨调整一个数值。",
    importNames: ["Slider"],
    code: 'import { Slider } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Slider label="数量" defaultValue={20} min={0} max={100} step={5} />\n  );\n}',
    props: [
      {
        name: "label",
        type: "string",
        description: "提供可访问名称。",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "禁用交互。",
      },
      {
        name: "name",
        type: "string",
        description: "表单字段名称。",
      },
      {
        name: "className",
        type: "string",
        description: "附加样式类。",
      },
      {
        name: "value",
        type: "number",
        description: "受控值；提供后需在回调中更新。",
      },
      {
        name: "defaultValue",
        type: "number",
        description: "非受控初始值。",
      },
      {
        name: "onValueChange",
        type: "(value: number) => void",
        description: "值变化回调。",
      },
      {
        name: "min / max",
        type: "number",
        description: "数值下限与上限。",
      },
      {
        name: "step",
        type: "number",
        description: "步进大小。",
      },
    ],
    notes: ["仅单值，不支持区间滑块。"],
  },
  {
    name: "NumberInput",
    category: "选择控件",
    description: "带增减按钮的数字输入框。",
    importNames: ["NumberInput"],
    code: 'import { NumberInput } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <NumberInput label="数量" defaultValue={20} min={0} max={100} step={5} />\n  );\n}',
    props: [
      {
        name: "label",
        type: "string",
        description: "提供可访问名称。",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "禁用交互。",
      },
      {
        name: "name",
        type: "string",
        description: "表单字段名称。",
      },
      {
        name: "className",
        type: "string",
        description: "附加样式类。",
      },
      {
        name: "value",
        type: "number | null",
        description: "受控值；提供后需在回调中更新。",
      },
      {
        name: "defaultValue",
        type: "number | null",
        description: "非受控初始值。",
      },
      {
        name: "onValueChange",
        type: "(value: number | null) => void",
        description: "值变化回调。",
      },
      {
        name: "min / max",
        type: "number",
        description: "数值下限与上限。",
      },
      {
        name: "step",
        type: "number",
        description: "步进大小。",
      },
    ],
    notes: ["默认整体外框高度为 28px（含边框），增减按钮位于边框内；comfortable 密度保留 36px。可用 className 定制尺寸。", "输入表面聚焦时只将现有边框改为 #93B4DC，不加粗、不加外圈；错误与禁用状态保留，强制颜色模式使用系统焦点提示。", "清空时 value 可为 null；defaultValue 应传 number。"],
  },
  {
    name: "DatePicker",
    category: "选择控件",
    description: "使用浏览器原生日历的单日期选择。",
    importNames: ["DatePicker"],
    code: 'import { DatePicker } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <DatePicker label="完成日期" defaultValue="2026-11-15" min="2026-01-01" max="2026-12-31" />\n  );\n}',
    props: [
      {
        name: "label",
        type: "string",
        description: "提供可访问名称。",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "禁用交互。",
      },
      {
        name: "name",
        type: "string",
        description: "表单字段名称。",
      },
      {
        name: "className",
        type: "string",
        description: "附加样式类。",
      },
      {
        name: "value",
        type: "string",
        description: "受控值；提供后需在回调中更新。",
      },
      {
        name: "defaultValue",
        type: "string",
        description: "非受控初始值。",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "值变化回调。",
      },
      {
        name: "min / max",
        type: "string",
        description: "ISO YYYY-MM-DD 日期边界。",
      },
      {
        name: "disabledDate",
        type: "(date: string) => boolean",
        description: "返回 true 的日期在选择后被拒绝。",
      },
      {
        name: "clearable",
        type: "boolean",
        description: "显示清除按钮。",
        default: "true",
      },
    ],
    notes: ["默认单行输入外框高度为 28px（含边框）；comfortable 密度保留 36px，可通过 --mt-height 定制。原生日历弹层尺寸由浏览器决定。", "输入表面聚焦时只将现有边框改为 #93B4DC，不加粗、不加外圈；错误与禁用状态保留，强制颜色模式使用系统焦点提示。",
      "值为 YYYY-MM-DD，清空返回空字符串，不进行 UTC 转换。",
      "日历外观和键盘操作由浏览器决定；disabledDate 不会在原生日历中绘制禁用状态。",
      "仅对支持样式的原生日期指示器使用与 Select 一致的 16px 箭头，不叠加第二个图标；其他浏览器和强制颜色模式保留原生日期界面。",
      "不支持日期区间、时间或自定义日历面板。",
    ],
  },
  {
    name: "Sidebar",
    category: "导航与筛选",
    description: "支持展开与图标窄栏切换的应用侧栏。",
    importNames: ["Sidebar", "NavItem"],
    code: 'import { Sidebar, NavItem } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Sidebar collapsible><NavItem active>我的知识库</NavItem><NavItem>最近访问</NavItem></Sidebar>\n  );\n}',
    props: [
      {
        name: "footer",
        type: "ReactNode | ((collapsed: boolean) => ReactNode)",
        description: "可选底部内容。",
      },
      {
        name: "collapsePlacement",
        type: '"header" | "footer"',
        default: "header",
        description:
          "折叠按钮位置；Layout.Sider 使用 footer，独立 Sidebar 保持原默认。",
      },
      {
        name: "header",
        type: "ReactNode | ((collapsed: boolean) => ReactNode)",
        description:
          "可选品牌头部，与已有折叠按钮同排；Layout.Sider 的 logo 通过该插槽复用。",
      },
      {
        name: "collapsible",
        type: "boolean",
        default: "false",
        description: "启用内置收起/展开按钮；未启用时保持原有容器行为。",
      },
      {
        name: "collapsed",
        type: "boolean",
        description: "受控收起状态；搭配 onCollapsedChange 更新。",
      },
      {
        name: "defaultCollapsed",
        type: "boolean",
        default: "false",
        description: "非受控模式的初始收起状态。",
      },
      {
        name: "onCollapsedChange",
        type: "(collapsed: boolean) => void",
        description: "点击切换按钮时触发。",
      },
      {
        name: "collapseLabel / expandLabel",
        type: "string",
        default: "收起侧边栏 / 展开侧边栏",
        description: "切换按钮的可访问名称和提示，可本地化。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "原生属性",
        type: "HTMLAttributes",
        description:
          "支持对应元素的 className、style 与适用的 DOM 属性；以 TypeScript 定义为准。",
      },
    ],
    notes: [
      "收起为 52px 图标窄栏，NavItem 保留可访问名称；NavGroup 隐藏标题并保留分组分隔。建议每个 NavItem 提供 icon，没有图标时显示圆形占位。",
      "收起时悬停或键盘聚焦显示提示，Escape 可关闭提示。复杂 children 请提供 aria-label 作为提示文字。",
      "受控用法：const [collapsed, setCollapsed] = useState(false); <Sidebar collapsible collapsed={collapsed} onCollapsedChange={setCollapsed}>…</Sidebar>。",
      "不接管路由、固定定位、持久化或响应式断点。不要用固定 width 覆盖收起宽度；自定义内容需自行适配窄栏。",
    ],
  },
  {
    name: "NavItem",
    category: "导航与筛选",
    description: "支持当前状态和图标的导航按钮。",
    importNames: ["NavItem"],
    code: 'import { NavItem } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <NavItem active onClick={() => console.log("navigation")}>我的知识库</NavItem>\n  );\n}',
    props: [
      {
        name: "active",
        type: "boolean",
        description: "设置当前项样式和 aria-current。",
      },
      {
        name: "icon",
        type: "ReactNode",
        description: "前置图标。",
      },
      {
        name: "onClick",
        type: "MouseEventHandler",
        description: "由应用执行导航。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "原生属性",
        type: "HTMLAttributes",
        description:
          "支持对应元素的 className、style 与适用的 DOM 属性；以 TypeScript 定义为准。",
      },
    ],
    notes: ["底层为 button，不是链接；应用负责与路由集成。"],
  },
  {
    name: "NavGroup",
    category: "导航与筛选",
    description: "以可选分组标题组织导航内容。",
    importNames: ["NavGroup", "NavItem"],
    code: 'import { NavGroup, NavItem } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <NavGroup label="私人空间"><NavItem active>工作笔记</NavItem><NavItem>阅读记录</NavItem></NavGroup>\n  );\n}',
    props: [
      {
        name: "label",
        type: "ReactNode",
        description: "可选分组标题。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
    ],
    notes: [],
  },
  {
    name: "Breadcrumb",
    category: "导航与筛选",
    description: "显示层级路径，最后一项为当前位置。",
    importNames: ["Breadcrumb"],
    code: 'import { Breadcrumb } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Breadcrumb items={[{label:"首页",href:"#"},{label:"知识库",href:"#"},{label:"组件规范"}]} />\n  );\n}',
    props: [
      {
        name: "items",
        type: "{ label: ReactNode; href?: string }[]",
        description: "必填；按层级排列。",
      },
      {
        name: "aria-label",
        type: "string",
        description: "导航区域名称。",
        default: "Breadcrumb",
      },
    ],
    notes: ['最后一项使用 aria-current="page"，不渲染链接。'],
  },
  {
    name: "Tree",
    category: "导航与筛选",
    description: "支持展开、单选和键盘导航的目录树。",
    importNames: ["Tree"],
    code: 'import { Tree } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Tree label="文档目录" defaultExpanded={["root"]} defaultValue="notes" items={[{id:"root",label:"知识库",children:[{id:"notes",label:"工作笔记"},{id:"ideas",label:"灵感"}]}]} />\n  );\n}',
    props: [
      {
        name: "items",
        type: "TreeItem[]",
        description: "必填；节点含 id、label、children、disabled、icon。",
      },
      {
        name: "value",
        type: "string",
        description: "受控值；提供后需在回调中更新。",
      },
      {
        name: "defaultValue",
        type: "string",
        description: "非受控初始值。",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "值变化回调。",
      },
      {
        name: "expanded / defaultExpanded",
        type: "string[]",
        description: "受控或初始展开节点 ID。",
      },
      {
        name: "onExpandedChange",
        type: "(ids: string[]) => void",
        description: "展开状态变化。",
      },
      {
        name: "label",
        type: "string",
        description: "目录树可访问名称。",
      },
      {
        name: "className",
        type: "string",
        description: "附加样式类。",
      },
    ],
    notes: [
      "支持方向键、Home/End、Enter/Space。节点 id 应全树唯一。",
      "不含拖拽排序、懒加载协议或复选树。",
    ],
  },
  {
    name: "Tabs",
    category: "导航与筛选",
    description: "切换一组关联内容面板。",
    importNames: ["Tabs"],
    code: 'import { Tabs } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Tabs items={[{value:"all",label:"全部",content:"全部文档"},{value:"saved",label:"收藏",content:"收藏文档"}]} />\n  );\n}',
    props: [
      {
        name: "items",
        type: "TabItem[]",
        description: "必填；value、label、content，可带 disabled。",
      },
      {
        name: "value",
        type: "string",
        description: "受控值；提供后需在回调中更新。",
      },
      {
        name: "defaultValue",
        type: "string",
        description: "非受控初始值。",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "值变化回调。",
      },
      {
        name: "className",
        type: "string",
        description: "附加样式类。",
      },
    ],
    notes: ["未指定 defaultValue 时使用第一项的 value。"],
  },
  {
    name: "FilterBar",
    category: "导航与筛选",
    description: "筛选控件的弹性布局容器。",
    importNames: ["FilterBar", "FilterChip", "Button"],
    code: 'import { FilterBar, FilterChip, Button } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <FilterBar><FilterChip onRemove={() => console.log("remove")}>分类：设计</FilterChip><Button>添加筛选</Button></FilterBar>\n  );\n}',
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "原生属性",
        type: "HTMLAttributes",
        description:
          "支持对应元素的 className、style 与适用的 DOM 属性；以 TypeScript 定义为准。",
      },
    ],
    notes: ["仅负责布局，不定义筛选查询或服务器协议。"],
  },
  {
    name: "FilterChip",
    category: "导航与筛选",
    description: "展示已生效条件并提供移除操作。",
    importNames: ["FilterChip"],
    code: 'import { useState } from "react";\nimport { FilterChip } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  const [visible, setVisible] = useState(true);\n  if (!visible) return <span>筛选已移除</span>;\n  return (\n    <FilterChip onRemove={() => setVisible(false)}>分类：设计</FilterChip>\n  );\n}',
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "onRemove",
        type: "() => void",
        description: "必填；移除请求，由应用更新条件。",
      },
    ],
    notes: ["默认单行外框高度为 28px，与输入及选择控件对齐；comfortable 密度下仍为 28px。可通过宿主 CSS 覆盖 .mt-filter-chip 的尺寸，不新增 size 属性。", "点击移除不会自行隐藏，应用负责更新状态。"],
  },
  {
    name: "Pagination",
    category: "导航与筛选",
    description: "完全受控的分页导航。",
    importNames: ["Pagination"],
    code: 'import { useState } from "react";\nimport { Pagination } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  const [page, setPage] = useState(1);\n  return (\n    <Pagination total={80} pageSize={10} page={page} onPageChange={setPage} />\n  );\n}',
    props: [
      {
        name: "total",
        type: "number",
        description: "必填；记录总数。",
      },
      {
        name: "pageSize",
        type: "number",
        description: "每页记录数。",
        default: "10",
      },
      {
        name: "page",
        type: "number",
        description: "必填；从 1 开始的当前页。",
      },
      {
        name: "onPageChange",
        type: "(page: number) => void",
        description: "必填；应用更新当前页。",
      },
      {
        name: "className",
        type: "string",
        description: "附加样式类。",
      },
    ],
    notes: ["不自动加载数据。首尾翻页按钮会禁用；大量页码显示省略。"],
  },
  {
    name: "DropdownMenu",
    category: "菜单与浮层",
    description: "点击触发器打开的操作菜单。",
    importNames: ["DropdownMenu", "Button"],
    code: 'import { DropdownMenu, Button } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <DropdownMenu trigger={<Button>文档操作</Button>} items={[{key:"open",label:"打开"},{key:"delete",label:"移至回收站",danger:true}]} onSelect={(key) => console.log(key)} />\n  );\n}',
    props: [
      {
        name: "trigger",
        type: "ReactElement",
        description: "必填；触发元素。",
      },
      {
        name: "items",
        type: "MenuItem[]",
        description:
          "必填；key、label，可选 icon、shortcut、disabled、danger、onSelect。",
      },
      {
        name: "onSelect",
        type: "(key: string) => void",
        description: "选中菜单项时调用。",
      },
      {
        name: "open",
        type: "boolean",
        description: "受控开关。",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        description: "非受控初始开关。",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "开关变化回调。",
      },
    ],
    notes: [
      "快捷键文字仅作提示，不注册全局快捷键。自定义 trigger 需转发 ref 与 DOM props。",
    ],
  },
  {
    name: "ContextMenu",
    category: "菜单与浮层",
    description: "在指定区域右键打开操作菜单。",
    importNames: ["ContextMenu"],
    code: 'import { ContextMenu } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <ContextMenu items={[{key:"copy",label:"复制"}]} onSelect={(key) => console.log(key)}><div style={{padding:24}}>在此区域点击右键</div></ContextMenu>\n  );\n}',
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "items",
        type: "MenuItem[]",
        description:
          "必填；key、label，可选 icon、shortcut、disabled、danger、onSelect。",
      },
      {
        name: "onSelect",
        type: "(key: string) => void",
        description: "选中菜单项时调用。",
      },
      {
        name: "open",
        type: "boolean",
        description: "受控开关。",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        description: "非受控初始开关。",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "开关变化回调。",
      },
    ],
    notes: ["children 为右键区域；不要向其传 DropdownMenu 的 trigger 属性。"],
  },
  {
    name: "Popover",
    category: "菜单与浮层",
    description: "点击展开的轻量信息或操作浮层。",
    importNames: ["Popover", "Button"],
    code: 'import { Popover, Button } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Popover trigger={<Button>查看说明</Button>} title="提示" content="这里放置相关内容。" />\n  );\n}',
    props: [
      {
        name: "trigger",
        type: "ReactElement",
        description: "必填；触发元素。",
      },
      {
        name: "content",
        type: "ReactNode",
        description: "必填；浮层内容。",
      },
      {
        name: "title",
        type: "ReactNode",
        description: "浮层标题。",
      },
      {
        name: "side",
        type: '"top" | "bottom" | "left" | "right"',
        description: "优先显示位置。",
        default: "bottom",
      },
      {
        name: "open",
        type: "boolean",
        description: "受控开关。",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        description: "非受控初始开关。",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "开关变化回调。",
      },
    ],
    notes: [
      "自定义触发器需转发 ref 与 DOM props。浮层自动继承 MtoneProvider 上下文。",
    ],
  },
  {
    name: "Tooltip",
    category: "菜单与浮层",
    description: "悬停或聚焦时显示简短说明。",
    importNames: ["Tooltip", "Button"],
    code: 'import { Tooltip, Button } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Tooltip content="复制当前链接"><Button>复制链接</Button></Tooltip>\n  );\n}',
    props: [
      {
        name: "children",
        type: "ReactElement",
        description: "必填；单个可聚焦触发元素。",
      },
      {
        name: "content",
        type: "ReactNode",
        description: "必填；提示内容。",
      },
      {
        name: "side",
        type: '"top" | "bottom" | "left" | "right"',
        description: "优先显示位置。",
        default: "top",
      },
      {
        name: "open",
        type: "boolean",
        description: "受控开关。",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        description: "非受控初始开关。",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "开关变化回调。",
      },
    ],
    notes: ["不要在提示中放必须操作的交互内容；图标触发器仍需 aria-label。"],
  },
  {
    name: "Card",
    category: "内容展示",
    description: "带轻边框的内容卡片。",
    importNames: ["Card"],
    code: 'import { Card } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Card><strong>阅读笔记</strong><p>将知识组织为可复用的内容。</p></Card>\n  );\n}',
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "原生属性",
        type: "HTMLAttributes",
        description:
          "支持对应元素的 className、style 与适用的 DOM 属性；以 TypeScript 定义为准。",
      },
    ],
    notes: [],
  },
  {
    name: "Text",
    category: "内容展示",
    description: "可使用次级颜色的行内文本。",
    importNames: ["Text"],
    code: 'import { Text } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Text muted>更新于今天</Text>\n  );\n}',
    props: [
      {
        name: "muted",
        type: "boolean",
        description: "使用次级文字颜色。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "原生属性",
        type: "HTMLAttributes",
        description:
          "支持对应元素的 className、style 与适用的 DOM 属性；以 TypeScript 定义为准。",
      },
    ],
    notes: [],
  },
  {
    name: "Divider",
    category: "内容展示",
    description: "内容段落之间的水平分隔线。",
    importNames: ["Divider"],
    code: 'import { Divider } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <div><p>基本信息</p><Divider /><p>详细内容</p></div>\n  );\n}',
    props: [],
    notes: ["Divider 无额外公开属性。"],
  },
  {
    name: "List",
    category: "内容展示",
    description: "语义化无序列表容器。",
    importNames: ["List", "ListItem"],
    code: 'import { List, ListItem } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <List><ListItem>设计规范</ListItem><ListItem>研究笔记</ListItem></List>\n  );\n}',
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "原生属性",
        type: "HTMLAttributes",
        description:
          "支持对应元素的 className、style 与适用的 DOM 属性；以 TypeScript 定义为准。",
      },
    ],
    notes: [],
  },
  {
    name: "ListItem",
    category: "内容展示",
    description: "包含图标、说明与尾部操作的列表项。",
    importNames: ["ListItem", "List", "Button"],
    code: 'import { ListItem, List, Button } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <List><ListItem description="记录项目过程" actions={<Button size="sm">打开</Button>}>研究笔记</ListItem></List>\n  );\n}',
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "icon",
        type: "ReactNode",
        description: "前置图标。",
      },
      {
        name: "description",
        type: "ReactNode",
        description: "次级描述。",
      },
      {
        name: "actions",
        type: "ReactNode",
        description: "尾部操作区域。",
      },
      {
        name: "原生属性",
        type: "HTMLAttributes",
        description:
          "支持对应元素的 className、style 与适用的 DOM 属性；以 TypeScript 定义为准。",
      },
    ],
    notes: ["应放在 List 或 ul 中保持语义正确。"],
  },
  {
    name: "DocumentList",
    category: "内容展示",
    description: "面向知识库文档的标题与摘要列表。",
    importNames: ["DocumentList"],
    code: 'import { DocumentList } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <DocumentList items={[{id:"guide",title:"使用指南",description:"从一个想法开始",updatedAt:"今天",onClick:() => console.log("open guide")}]} />\n  );\n}',
    props: [
      {
        name: "items",
        type: "DocumentItem[]",
        description: "必填；文档数组。",
      },
      {
        name: "DocumentItem",
        type: "{ id: string; title: string; description?: string; updatedAt?: string; icon?: ReactNode; onClick?: () => void }",
        description: "文档记录结构；时间是应用提供的显示字符串。",
      },
    ],
    notes: ["不提供路由或日期格式化；点击由每项 onClick 处理。"],
  },
  {
    name: "DocumentCard",
    category: "内容展示",
    description: "以卡片展示一份文档。",
    importNames: ["DocumentCard"],
    code: 'import { DocumentCard } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <DocumentCard id="guide" title="使用指南" description="从一个想法开始" updatedAt="今天" onClick={() => console.log("open guide")} />\n  );\n}',
    props: [
      {
        name: "id",
        type: "string",
        description: "类型要求的文档标识。",
      },
      {
        name: "title",
        type: "string",
        description: "必填；文档名称。",
      },
      {
        name: "description / updatedAt",
        type: "string",
        description: "摘要与已格式化更新时间。",
      },
      {
        name: "icon",
        type: "ReactNode",
        description: "替代默认文件图标。",
      },
      {
        name: "onClick",
        type: "() => void",
        description: "点击标题回调。",
      },
    ],
    notes: ["该组件不直接执行导航或读取文档内容。"],
  },
  {
    name: "Table",
    category: "内容展示",
    description: "支持排序、文本筛选、选择和分页的泛型数据表格。",
    importNames: ["Table"],
    code: 'import { Table } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Table data={[{id:1,title:"设计规范",status:"进行中"},{id:2,title:"项目笔记",status:"已完成"}]} rowKey="id" selectable columns={[{key:"title",title:"名称",dataIndex:"title",sortable:true,filterable:true},{key:"status",title:"状态",dataIndex:"status"}]} pagination={{pageSize:10}} />\n  );\n}',
    props: [
      {
        name: "data",
        type: "T[]",
        description: "必填；当前数据行。",
      },
      {
        name: "columns",
        type: "TableColumn<T>[]",
        description:
          "必填；列定义 key、title、dataIndex、render、sortable、filterable。",
      },
      {
        name: "rowKey",
        type: "keyof T | ((row: T) => React.Key)",
        description: "必填；稳定且唯一的字符串或数字键。",
      },
      {
        name: "selectable",
        type: "boolean",
        description: "显示行选择。",
      },
      {
        name: "selectedKeys / onSelectionChange",
        type: "React.Key[] / (keys: React.Key[]) => void",
        description: "受控选择与回调。",
      },
      {
        name: "sort",
        type: '{key: string; direction: "asc" | "desc"} | null',
        description: "受控单列排序，null 清除排序。",
      },
      {
        name: "filters",
        type: "Record<string, string>",
        description: "受控文本筛选。",
      },
      {
        name: "pagination",
        type: "false | {pageSize?, page?, total?, onPageChange?}",
        description: "分页配置。",
        default: "false",
      },
      {
        name: "manual",
        type: "boolean",
        description: "远程模式，不在本地重复排序/筛选/分页。",
        default: "false",
      },
      {
        name: "onChange",
        type: "(state: TableState) => void",
        description: "排序、筛选或分页变化。",
      },
      {
        name: "loading",
        type: "boolean",
        description: "加载状态。",
        default: "false",
      },
      {
        name: "empty",
        type: "ReactNode",
        description: "自定义空态。",
      },
      {
        name: "className",
        type: "string",
        description: "附加样式类。",
      },
    ],
    notes: ["列筛选输入默认外框高度为 28px（含边框），comfortable 密度保留 36px；不改变表头、数据行或分页按钮的尺寸。", "输入表面聚焦时只将现有边框改为 #93B4DC，不加粗、不加外圈；错误与禁用状态保留，强制颜色模式使用系统焦点提示。",
      "筛选为不区分大小写的文本包含匹配。远程模式请传 pagination.total 和受控 page。",
      "选择可跨页保留；数据删除后应用负责清理失效行键。",
      "不含单元格编辑、冻结列、虚拟滚动或列宽调整。",
    ],
  },
  {
    name: "Badge",
    category: "属性与状态",
    description: "紧凑的低饱和标签，支持语义颜色与可选移除操作。",
    importNames: ["Badge"],
    code: 'import { Badge } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Badge tone="green">已完成</Badge>\n  );\n}',
    props: [
      {
        name: "tone",
        type: '"neutral" | "blue" | "green" | "orange" | "red" | "purple"',
        description: "低饱和语义颜色。",
        default: "neutral",
      },
      {
        name: "onRemove",
        type: "() => void",
        description: "提供后显示移除按钮，应用负责移除内容。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "原生属性",
        type: "HTMLAttributes",
        description:
          "支持对应元素的 className、style 与适用的 DOM 属性；以 TypeScript 定义为准。",
      },
    ],
    notes: ["可移除标签的存在状态由应用管理。Badge 不是数字角标或未读计数容器。"],
  },
  {
    name: "Status",
    category: "属性与状态",
    description: "使用状态点和文字表达进度。",
    importNames: ["Status"],
    code: 'import { Status } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Status tone="green">已完成</Status>\n  );\n}',
    props: [
      {
        name: "tone",
        type: '"neutral" | "blue" | "green" | "orange" | "red" | "purple"',
        description: "低饱和语义颜色。",
        default: "neutral",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
    ],
    notes: ["状态必须同时有文字，不应仅依赖颜色。"],
  },
  {
    name: "Avatar",
    category: "属性与状态",
    description: "展示头像，加载失败时回退到名字前两个字符。",
    importNames: ["Avatar"],
    code: 'import { Avatar } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Avatar name="张三" size={32} />\n  );\n}',
    props: [
      {
        name: "name",
        type: "string",
        description: "显示名称与图片替代文本。",
        default: "空字符串",
      },
      {
        name: "src",
        type: "string",
        description: "图片地址。",
      },
      {
        name: "size",
        type: "number",
        description: "宽高像素值。",
        default: "24",
      },
    ],
    notes: ["未传图片或图片加载失败时显示文字。"],
  },
  {
    name: "AvatarGroup",
    category: "属性与状态",
    description: "叠放一组头像并展示溢出数量。",
    importNames: ["AvatarGroup"],
    code: 'import { AvatarGroup } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <AvatarGroup items={[{name:"张三"},{name:"李四"},{name:"王五"}]} max={2} />\n  );\n}',
    props: [
      {
        name: "items",
        type: "{name: string; src?: string}[]",
        description: "必填；头像数据。",
      },
      {
        name: "max",
        type: "number",
        description: "最多可见头像数。",
        default: "4",
      },
    ],
    notes: ["各头像使用默认大小，多余人数以 +N 表示。"],
  },
  {
    name: "Progress",
    category: "属性与状态",
    description: "显示 0 到 100 的任务进度。",
    importNames: ["Progress"],
    code: 'import { Progress } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Progress value={68} label="上传进度" />\n  );\n}',
    props: [
      {
        name: "value",
        type: "number",
        description: "必填；进度百分比，超出范围会被限制。",
      },
      {
        name: "label",
        type: "string",
        description: "进度条可访问名称。",
        default: "Progress",
      },
    ],
    notes: ["非有限值按 0 处理。组件不自行显示百分比文字。"],
  },
  {
    name: "PropertyList",
    category: "属性与状态",
    description: "文档属性的定义列表容器。",
    importNames: ["PropertyList", "PropertyItem"],
    code: 'import { PropertyList, PropertyItem } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <PropertyList><PropertyItem label="类型">文档</PropertyItem><PropertyItem label="状态">进行中</PropertyItem></PropertyList>\n  );\n}',
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
    ],
    notes: ["使用 dl 语义，与 PropertyItem 搭配。"],
  },
  {
    name: "PropertyItem",
    category: "属性与状态",
    description: "展示一行属性名和值。",
    importNames: ["PropertyItem", "PropertyList"],
    code: 'import { PropertyItem, PropertyList } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <PropertyList><PropertyItem label="负责人">张三</PropertyItem></PropertyList>\n  );\n}',
    props: [
      {
        name: "label",
        type: "ReactNode",
        description: "必填；属性名。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
    ],
    notes: ["放在 PropertyList 中；编辑能力通过在 children 中组合控件实现。"],
  },
  {
    name: "Dialog",
    category: "弹窗与抽屉",
    description: "聚焦当前任务的模态对话框。",
    importNames: ["Dialog", "Button"],
    code: 'import { Dialog, Button } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Dialog modal={true} title="文档信息" description="编辑当前文档的说明" trigger={<Button>打开 Dialog</Button>}><p>这里是内容区域。</p></Dialog>\n  );\n}',
    props: [
      { name: "modal", type: "boolean", default: "true", description: "默认 true，点击外部不关闭；false 点击外部关闭。仅控制外部关闭，不影响焦点陷阱、遮罩、滚动锁定、Escape 或关闭按钮。" },
      {
        name: "title",
        type: "ReactNode",
        description: "对话框标题；传 null 隐藏可见标题，仍保留默认无障碍名称。",
      },
      {
        name: "description",
        type: "ReactNode",
        description: "说明文本。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "trigger",
        type: "ReactElement",
        description: "可选触发器；也可用 open 受控打开。",
      },
      {
        name: "footer",
        type: "ReactNode",
        description: "可选页脚操作区，分隔线上下独立布局；按钮上下内边距均为 8px。",
      },
      {
        name: "className",
        type: "string",
        description: "附加面板样式类。",
      },
      {
        name: "open",
        type: "boolean",
        description: "受控开关。",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        description: "非受控初始开关。",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "开关变化回调。",
      },
    ],
    notes: [
      "支持 Esc 关闭、焦点管理与关闭后焦点恢复。",
      "Modal/ModalProps 暂保留为已弃用兼容别名，建议迁移至 Dialog/DialogProps。",
      "复杂受控流程由 open/onOpenChange 管理。",
      "标题与关闭按钮垂直居中；面板顶部内边距 12px、左右 20px，footer 上间隔 16px，footer 内上下留白各 8px。多行标题与窄屏按钮换行均受支持。",
    ],
  },
  {
    name: "Drawer",
    category: "弹窗与抽屉",
    description: "从右侧打开的属性抽屉。",
    importNames: ["Drawer", "Button"],
    code: 'import { Drawer, Button } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Drawer title="文档信息" description="编辑当前文档的说明" trigger={<Button>打开Drawer</Button>}><p>这里是内容区域。</p></Drawer>\n  );\n}',
    props: [
      {
        name: "title",
        type: "ReactNode",
        description: "必填；对话框标题。",
      },
      {
        name: "description",
        type: "ReactNode",
        description: "说明文本。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "trigger",
        type: "ReactElement",
        description: "可选触发器；也可用 open 受控打开。",
      },
      {
        name: "footer",
        type: "ReactNode",
        description: "页脚操作区。",
      },
      {
        name: "className",
        type: "string",
        description: "附加面板样式类。",
      },
      {
        name: "open",
        type: "boolean",
        description: "受控开关。",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        description: "非受控初始开关。",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "开关变化回调。",
      },
    ],
    notes: [
      "支持 Esc 关闭、焦点管理与关闭后焦点恢复。",
      "Drawer 当前固定从右侧打开。",
    ],
  },
  {
    name: "ConfirmDialog",
    category: "弹窗与抽屉",
    description: "可等待异步结果的危险操作确认。",
    importNames: ["ConfirmDialog", "Button"],
    code: 'import { ConfirmDialog, Button } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <ConfirmDialog title="移除文档？" description="这是演示，不会删除任何文件。" danger trigger={<Button danger>移除文档</Button>} onConfirm={async () => { console.log("confirmed"); }} />\n  );\n}',
    props: [
      {
        name: "title",
        type: "ReactNode",
        description: "必填；对话框标题。",
      },
      {
        name: "description",
        type: "ReactNode",
        description: "说明文本。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "trigger",
        type: "ReactElement",
        description: "可选触发器；也可用 open 受控打开。",
      },
      {
        name: "open",
        type: "boolean",
        description: "受控开关。",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        description: "非受控初始开关。",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "开关变化回调。",
      },
      {
        name: "onConfirm",
        type: "() => void | Promise<void>",
        description: "确认操作；成功后关闭，抛错时保持打开并提示重试。",
      },
      {
        name: "confirmText / cancelText",
        type: "string",
        description: "确认和取消按钮文案。",
      },
      {
        name: "danger",
        type: "boolean",
        description: "危险确认按钮样式。",
      },
    ],
    notes: [
      "异步执行时禁用按钮。当前实现不使用 footer、className；请勿依赖这些继承类型属性定制确认框。",
    ],
  },
  {
    name: "Alert",
    category: "反馈与上传",
    description: "显示信息、成功、警告或错误反馈。",
    importNames: ["Alert"],
    code: 'import { Alert } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Alert tone="success" title="已保存">你的更改已保存。</Alert>\n  );\n}',
    props: [
      {
        name: "tone",
        type: '"info" | "success" | "warning" | "error"',
        description: "提示类型。",
        default: "info",
      },
      {
        name: "title",
        type: "ReactNode",
        description: "标题。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "onClose",
        type: "() => void",
        description: "提供后显示关闭按钮，应用负责隐藏。",
      },
    ],
    notes: ["错误使用 alert 语义，其余类型使用 status。"],
  },
  {
    name: "Empty",
    category: "反馈与上传",
    description: "为空数据提供说明与下一步入口。",
    importNames: ["Empty", "Button"],
    code: 'import { Empty, Button } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Empty title="暂无文档" description="创建第一份文档开始记录。" action={<Button>新建文档</Button>} />\n  );\n}',
    props: [
      {
        name: "title",
        type: "ReactNode",
        description: "标题，默认按语言显示暂无内容。",
      },
      {
        name: "description",
        type: "ReactNode",
        description: "补充说明。",
      },
      {
        name: "action",
        type: "ReactNode",
        description: "可选操作入口。",
      },
    ],
    notes: [],
  },
  {
    name: "Skeleton",
    category: "反馈与上传",
    description: "加载期间用于占位的轻量骨架。",
    importNames: ["Skeleton"],
    code: 'import { Skeleton } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Skeleton style={{width:240,height:16}} />\n  );\n}',
    props: [
      {
        name: "原生属性",
        type: "HTMLAttributes",
        description:
          "支持对应元素的 className、style 与适用的 DOM 属性；以 TypeScript 定义为准。",
      },
    ],
    notes: ["默认 aria-hidden，真实加载状态应由可访问文字或 Spinner 说明。"],
  },
  {
    name: "Spinner",
    category: "反馈与上传",
    description: "带状态语义的小型加载图标。",
    importNames: ["Spinner"],
    code: 'import { Spinner } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Spinner label="正在加载文档" />\n  );\n}',
    props: [
      {
        name: "label",
        type: "string",
        description: "可访问加载描述。",
        default: "Loading",
      },
    ],
    notes: ["不会阻塞父区域交互；需要禁用操作时由应用设置。"],
  },
  {
    name: "Upload",
    category: "反馈与上传",
    description: "支持选择、拖拽、进度、取消与重试的上传组件。",
    importNames: ["Upload"],
    code: 'import { Upload } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Upload accept=".txt,.md" maxSize={1024 * 1024} upload={async (_file, {signal, onProgress}) => {\n      // 仅演示：不会发送文件到服务器\n      if (signal.aborted) throw new DOMException("Aborted", "AbortError");\n      onProgress(100);\n    }}>模拟上传：文件不会发送到服务器。</Upload>\n  );\n}',
    props: [
      {
        name: "upload",
        type: "(file: File, context: UploadContext) => Promise<unknown>",
        description: "必填；context 包含 signal 和 onProgress(percent)。",
      },
      {
        name: "accept",
        type: "string",
        description: "扩展名或 MIME 类型筛选，例如 .pdf,image/*。",
      },
      {
        name: "maxSize",
        type: "number",
        description: "最大文件字节数。",
      },
      {
        name: "multiple",
        type: "boolean",
        description: "允许多文件选择。",
        default: "true",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "禁用选择和拖拽。",
      },
      {
        name: "onChange",
        type: "(files: UploadFile[]) => void",
        description: "文件状态列表变化。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "className",
        type: "string",
        description: "附加样式类。",
      },
    ],
    notes: [
      "实际上传需应用提供服务器接口，示例明确为模拟上传。",
      "适配器应使用 signal 取消请求；进度通过 onProgress(0–100) 更新。",
      "文件类型/大小检查只是客户端便利检查，服务端仍需校验。",
    ],
  },
  {
    name: "Dropzone",
    category: "反馈与上传",
    description: "Upload 的别名，支持相同上传适配器。",
    importNames: ["Dropzone"],
    code: 'import { Dropzone } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Dropzone accept=".txt,.md" maxSize={1024 * 1024} upload={async (_file, {signal, onProgress}) => {\n      // 仅演示：不会发送文件到服务器\n      if (signal.aborted) throw new DOMException("Aborted", "AbortError");\n      onProgress(100);\n    }}>模拟上传：文件不会发送到服务器。</Dropzone>\n  );\n}',
    props: [
      {
        name: "upload",
        type: "(file: File, context: UploadContext) => Promise<unknown>",
        description: "必填；context 包含 signal 和 onProgress(percent)。",
      },
      {
        name: "accept",
        type: "string",
        description: "扩展名或 MIME 类型筛选，例如 .pdf,image/*。",
      },
      {
        name: "maxSize",
        type: "number",
        description: "最大文件字节数。",
      },
      {
        name: "multiple",
        type: "boolean",
        description: "允许多文件选择。",
        default: "true",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "禁用选择和拖拽。",
      },
      {
        name: "onChange",
        type: "(files: UploadFile[]) => void",
        description: "文件状态列表变化。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "className",
        type: "string",
        description: "附加样式类。",
      },
    ],
    notes: [
      "实际上传需应用提供服务器接口，示例明确为模拟上传。",
      "适配器应使用 signal 取消请求；进度通过 onProgress(0–100) 更新。",
      "文件类型/大小检查只是客户端便利检查，服务端仍需校验。",
      "Dropzone 是 Upload 的同一实现。",
    ],
  },
  {
    name: "Toast",
    category: "反馈与上传",
    description:
      "ToastProvider 的别名，提供成功、失败、普通通知，不是单条消息组件。",
    importNames: ["Toast", "Button", "useToast"],
    code: 'import { Toast, Button, useToast } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nfunction Action() {\n  const toast = useToast();\n  return <Button onClick={() => toast.success({\n    title: "更改已保存",\n    body: "文档已同步，可以继续编辑。",\n    position: "top-right",\n  })}>显示成功通知</Button>;\n}\n\nexport default function Demo() {\n  return <Toast position="bottom-right" timeout={5000} limit={3}>\n    <Action />\n  </Toast>;\n}',
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "Provider 包裹的应用内容；不是单条通知正文。",
      },
      {
        name: "position",
        type: "ToastPosition",
        default: "bottom-right",
        description: "Provider 默认位置，单条通知可覆盖。",
      },
      {
        name: "timeout",
        type: "number",
        default: "5000",
        description: "默认自动关闭毫秒数；0 表示持续显示直到关闭。",
      },
      {
        name: "limit",
        type: "number",
        default: "3",
        description:
          "所有位置共用的可见通知上限；新通知优先，超出上限的旧通知隐藏。",
      },
      {
        name: "useToast().add(options)",
        type: "(options: ToastOptions) => string",
        description: "添加通知并返回 id；已有相同 id 时更新。",
      },
      {
        name: "options.type",
        type: '"success" | "error" | "info" | string',
        default: "info",
        description:
          "成功、失败和普通通知预设，各有图标和风格；未知类型按普通通知显示。",
      },
      {
        name: "options.title / body",
        type: "ReactNode",
        description: "标题和正文，无需提供自定义 children。",
      },
      {
        name: "options.description",
        type: "ReactNode",
        description: "保留旧正文字段；body 提供时优先于 description。",
      },
      {
        name: "options.position",
        type: '"top-right" | "bottom-right" | "top-left" | "bottom-left" | "top-center" | "bottom-center" | "center" | "center-top"',
        description: "覆盖此条通知的位置；center-top 位于视口上方约 25% 处。",
      },
      {
        name: "options.children",
        type: "ReactNode",
        description: "可选自定义正文，用于更复杂的通知内容。",
      },
      {
        name: "options.timeout / priority",
        type: 'number / "low" | "high"',
        description:
          "单条超时和播报优先级。默认礼貌播报；仅紧急通知使用 high。",
      },
      {
        name: "options.actionProps",
        type: "ButtonHTMLAttributes",
        description: "可选操作按钮属性，含 children、onClick 等。",
      },
      {
        name: "useToast().success / error / info",
        type: "(options: ToastOptions) => string",
        description:
          "预设类型快捷方法，接受同样的 title、body、position 等选项。",
      },
      {
        name: "useToast().update(id, options)",
        type: "(id, options | (previous) => options) => void",
        description: "更新已有通知的正文、类型和位置；保留未修改的选项。",
      },
      {
        name: "useToast().close(id?)",
        type: "(id?: string) => void",
        description: "关闭指定通知；省略 id 关闭全部。",
      },
      {
        name: "useToast().promise(promise, options)",
        type: "Promise<Value>",
        description:
          "保留异步通知 API，以 loading、success、error 配置各阶段；支持标题正文与预设选项。",
      },
    ],
    notes: [
      "必须在 Provider 后代调用 useToast。Toast 与 ToastProvider 是同一组件，建议放在 MtoneProvider 内。",
      "单一队列管理所有位置，改变位置不会创建第二条通知；多位置会占用同一 limit。数量较多时请关闭旧通知或适当调整上限。",
      "center / center-top 是非模态提示，不是 Dialog，不锁定焦点或阻止背景操作。",
      "默认使用 Base UI 的礼貌播报、自动关闭、悬停/焦点暂停与关闭行为。保留优先级、actionProps、data、update、close 和 promise API。",
      "持续通知（timeout: 0）必须留有关闭方式；不要仅用颜色传达状态，预设图标与文字共同表达含义。",
    ],
  },
  {
    name: "ToastProvider",
    category: "配置与主题",
    description: "支持预设状态、标题正文与多位置的通知上下文。",
    importNames: ["ToastProvider", "Button", "useToast"],
    code: 'import { ToastProvider, Button, useToast } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nfunction Action() {\n  const toast = useToast();\n  return <Button onClick={() => toast.success({\n    title: "更改已保存",\n    body: "文档已同步，可以继续编辑。",\n    position: "top-right",\n  })}>显示成功通知</Button>;\n}\n\nexport default function Demo() {\n  return <ToastProvider position="bottom-right" timeout={5000} limit={3}>\n    <Action />\n  </ToastProvider>;\n}',
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "Provider 包裹的应用内容；不是单条通知正文。",
      },
      {
        name: "position",
        type: "ToastPosition",
        default: "bottom-right",
        description: "Provider 默认位置，单条通知可覆盖。",
      },
      {
        name: "timeout",
        type: "number",
        default: "5000",
        description: "默认自动关闭毫秒数；0 表示持续显示直到关闭。",
      },
      {
        name: "limit",
        type: "number",
        default: "3",
        description:
          "所有位置共用的可见通知上限；新通知优先，超出上限的旧通知隐藏。",
      },
      {
        name: "useToast().add(options)",
        type: "(options: ToastOptions) => string",
        description: "添加通知并返回 id；已有相同 id 时更新。",
      },
      {
        name: "options.type",
        type: '"success" | "error" | "info" | string',
        default: "info",
        description:
          "成功、失败和普通通知预设，各有图标和风格；未知类型按普通通知显示。",
      },
      {
        name: "options.title / body",
        type: "ReactNode",
        description: "标题和正文，无需提供自定义 children。",
      },
      {
        name: "options.description",
        type: "ReactNode",
        description: "保留旧正文字段；body 提供时优先于 description。",
      },
      {
        name: "options.position",
        type: '"top-right" | "bottom-right" | "top-left" | "bottom-left" | "top-center" | "bottom-center" | "center" | "center-top"',
        description: "覆盖此条通知的位置；center-top 位于视口上方约 25% 处。",
      },
      {
        name: "options.children",
        type: "ReactNode",
        description: "可选自定义正文，用于更复杂的通知内容。",
      },
      {
        name: "options.timeout / priority",
        type: 'number / "low" | "high"',
        description:
          "单条超时和播报优先级。默认礼貌播报；仅紧急通知使用 high。",
      },
      {
        name: "options.actionProps",
        type: "ButtonHTMLAttributes",
        description: "可选操作按钮属性，含 children、onClick 等。",
      },
      {
        name: "useToast().success / error / info",
        type: "(options: ToastOptions) => string",
        description:
          "预设类型快捷方法，接受同样的 title、body、position 等选项。",
      },
      {
        name: "useToast().update(id, options)",
        type: "(id, options | (previous) => options) => void",
        description: "更新已有通知的正文、类型和位置；保留未修改的选项。",
      },
      {
        name: "useToast().close(id?)",
        type: "(id?: string) => void",
        description: "关闭指定通知；省略 id 关闭全部。",
      },
      {
        name: "useToast().promise(promise, options)",
        type: "Promise<Value>",
        description:
          "保留异步通知 API，以 loading、success、error 配置各阶段；支持标题正文与预设选项。",
      },
    ],
    notes: [
      "必须在 Provider 后代调用 useToast。Toast 与 ToastProvider 是同一组件，建议放在 MtoneProvider 内。",
      "单一队列管理所有位置，改变位置不会创建第二条通知；多位置会占用同一 limit。数量较多时请关闭旧通知或适当调整上限。",
      "center / center-top 是非模态提示，不是 Dialog，不锁定焦点或阻止背景操作。",
      "默认使用 Base UI 的礼貌播报、自动关闭、悬停/焦点暂停与关闭行为。保留优先级、actionProps、data、update、close 和 promise API。",
      "持续通知（timeout: 0）必须留有关闭方式；不要仅用颜色传达状态，预设图标与文字共同表达含义。",
    ],
  },
  {
    name: "MtoneProvider",
    category: "配置与主题",
    description: "为组件及其浮层配置语言、密度和主题变量。",
    importNames: ["MtoneProvider", "Button"],
    code: 'import { MtoneProvider, Button } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <MtoneProvider locale="zh" density="comfortable" tokens={{"--mt-primary":"#446c52"}}><Button variant="solid">保存</Button></MtoneProvider>\n  );\n}',
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "locale",
        type: '"zh" | "en"',
        description: "内置控件文案语言。",
        default: "zh",
      },
      {
        name: "density",
        type: '"compact" | "comfortable"',
        description: "控件密度。",
        default: "compact",
      },
      {
        name: "tokens",
        type: "Tokens",
        description:
          "CSS 自定义属性与 CSSProperties，常用 --mt-fg、--mt-bg、--mt-primary。",
      },
    ],
    notes: [
      "简单组件不使用 Provider 时也可用默认值。",
      "库分发预编译 CSS，不要求宿主安装 Tailwind。浮层继承 Provider 上下文。",
      "主题通过 CSS 变量传播，不是 Shadow DOM 隔离；自定义层级请检查 z-index 1200–1300。",
    ],
  },
  {
    name: "MtoneScope",
    category: "配置与主题",
    description: "把当前 Provider 的主题变量和密度应用到一个 div。",
    importNames: ["MtoneScope", "MtoneProvider", "Button"],
    code: 'import { MtoneScope, MtoneProvider, Button } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <MtoneProvider tokens={{"--mt-primary":"#446c52"}}><MtoneScope><Button variant="solid">主题作用域</Button></MtoneScope></MtoneProvider>\n  );\n}',
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "原生属性",
        type: "HTMLAttributes",
        description:
          "支持对应元素的 className、style 与适用的 DOM 属性；以 TypeScript 定义为准。",
      },
    ],
    notes: [
      "通常无需手动使用；库内部用它让 Portal 浮层继承主题。它读取已有上下文，不创建新的 Provider。",
    ],
  },
];
