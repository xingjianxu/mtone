/** Public component reference, maintained alongside the source and generated llms.txt. */
export type PropDoc = {
  name: string;
  type: string;
  default?: string;
  description: string;
};
/** Group by primary use; lists are in reading order, with base components before variants.
 * Keep companion utilities together (e.g. Card/CardGroup and Popover/Menu).
 * This is the shared taxonomy for sidebar, catalog categories, and category search.
 */
const taxonomy = {
  "布局容器": [
    "AdminLayout", "PageLayout", "Toolbar", "SectionGroup", "Panel", "Splitter", "Affix", "Divider",
  ],
  "基础组件": [
    "Button", "ButtonGroup", "Typography", "Title", "Text",
    "Paragraph", "Link", "Blockquote", "HoverMarquee",
  ],
  "导航切换": [
    "Sidebar", "NavGroup", "NavItem", "NavSubmenu", "Breadcrumb",
    "TableOfContents", "Tabs", "Pagination",
  ],
  "表单输入": [
    "Form", "Fieldset", "Input", "Mentions", "NumberInput", "AutoComplete", "Select",
    "TreeSelect", "Cascader", "CascaderPanel", "Transfer",
    "Checkbox", "RadioGroup", "Switch", "TagSelect", "CheckCard",
    "Slider", "Rate", "DatePicker",
    "Upload", "Questionnaire",
  ],
  "数据展示": [
    "Card", "CardGroup", "List", "ListItem", "DataList",
    "DocumentList", "DocumentCard", "Table", "DataTable", "Tree",
    "PropertyList", "PropertyItem", "Image", "ImageGroup", "ImagePreview",
    "Avatar", "AvatarGroup", "Tag", "Calendar", "Timeline",
  ],
  "弹层与菜单": [
    "Popover", "Menu", "ContextMenu", "Menubar", "HoverCard",
    "Tooltip", "Spotlight", "Dialog", "ConfirmDialog", "Popconfirm",
    "Drawer", "FloatingWindow",
  ],
  "状态反馈": [
    "Alert", "GlobalNotice", "ToastProvider", "Status",
    "Progress", "Spinner", "LoadingOverlay", "Skeleton", "Empty",
    "Result",
  ],
  "AI 界面": [
    "AiChat", "AiMessage", "AiPromptInput", "AiSuggestion", "AiModelSelector",
    "AiPlan", "AiReasoning", "AiTask", "AiQueue",
    "AiSubagent", "AiTool", "AiCheckpoint", "AiConfirmation", "AiSources",
    "AiInlineCitation", "AiContext", "AiFileTree", "AiStackTrace", "AiTerminal",
    "AiTestResults",
  ],
  "全局配置": [
    "MtoneProvider", "MtoneScope", "ShortcutsProvider",
  ],
} as const;
export type ComponentCategory = keyof typeof taxonomy;
type DocumentedComponentName = (typeof taxonomy)[ComponentCategory][number];
export const componentCategories = Object.keys(taxonomy) as ComponentCategory[];
const categoryByName = new Map<string, ComponentCategory>();
for (const category of componentCategories) {
  for (const name of taxonomy[category]) categoryByName.set(name, category);
}
export type ComponentDoc = {
  name: string;
  category: ComponentCategory;
  description: string;
  importNames: string[];
  code: string;
  props: PropDoc[];
  notes: string[];
  sidebarParent?: string;
  sidebarSection?: string;
  demoLabel?: string;
};
const componentReferences: (Omit<ComponentDoc, "category"> & { name: DocumentedComponentName })[] = [
  {
    name: "CheckCard",
    description: "以卡片呈现可选项。独立使用可勾选，CheckCard.Group 管理单选或多选，CardGroup 负责响应式排列。",
    importNames: ["CheckCard", "CardGroup"],
    code: `import { CheckCard, CardGroup } from "@bixlab/mtone";
import "@bixlab/mtone/styles.css";

export default function Demo() {
  return (
    <CheckCard.Group legend="选择工作区视图" defaultValue="overview">
      <CardGroup columns={{ xs: 1, sm: 2, md: 3 }} gap={12}>
        <CheckCard value="overview" title="概览" />
        <CheckCard value="projects" title="项目" />
        <CheckCard value="notes" title="笔记" />
      </CardGroup>
    </CheckCard.Group>
  );
}`,
    props: [
      { name: "checked / defaultChecked", type: "boolean", default: "false", description: "独立卡片的受控选中状态或非受控初始状态。放入 Group 时由组管理。" },
      { name: "onChange", type: "(checked: boolean) => void", description: "独立卡片切换时触发；组内选择使用 Group 的 onChange。" },
      { name: "value", type: "string", description: "独立使用时为表单值；组内每张卡片指定唯一的 value。" },
      { name: "name / form", type: "string", description: "独立卡片的表单字段名与可选关联表单 ID。组内由 Group 提供字段名，Group 的 form 可关联外部表单。" },
      { name: "required", type: "boolean", default: "false", description: "独立复选框设为必选；组级必选使用单选 Group 的 required。" },
      { name: "title / description", type: "ReactNode", description: "卡片标题与辅助说明。无可读标题时用 aria-label 或 aria-labelledby 为输入控件命名。" },
      { name: "avatar / cover / children", type: "ReactNode", description: "头像、封面和自定义内容。按钮、链接等独立交互放入 extra，而非选择区域。" },
      { name: "extra", type: "ReactNode", description: "独立操作区。此区域不会切换卡片的选中状态；在表单中使用 type=button 防止无意提交。" },
      { name: "disabled / loading", type: "boolean", default: "false", description: "禁止选择；loading 显示加载状态。extra 中操作的禁用状态由调用方管理。" },
      { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "卡片尺寸，未设置时继承 Group 的尺寸。" },
      { name: "bordered", type: "boolean", default: "true", description: "是否展示卡片边框，未设置时继承 Group 的设置。" },
      { name: "CheckCard.Group.multiple", type: "boolean", default: "false", description: "默认渲染单选卡片；设为 true 后渲染多选卡片。" },
      { name: "CheckCard.Group.value / defaultValue", type: "string | readonly string[]", description: "受控值或非受控初始值。单选用字符串，多选用字符串数组。" },
      { name: "CheckCard.Group.onChange", type: "((value: string) => void) | ((value: string[]) => void)", description: "单选收到选中的字符串，多选收到选中项数组；受控用法需要在回调中更新 value。" },
      { name: "CheckCard.Group.legend / name / form", type: "ReactNode / string / string", description: "可见组名、表单字段名与可选关联表单 ID。单选未指定 name 时生成独立的内部名称。同一表单中的独立单选组应使用不同的 name。" },
      { name: "CheckCard.Group.options / children", type: "readonly CheckCardOption[] / ReactNode", description: "可用 options 提供带字符串 value 的卡片数据，或通过 children 自定义组合。两者同时提供时优先渲染 children。" },
      { name: "CheckCard.Group.required", type: "boolean", default: "false", description: "仅单选 Group 支持，要求在该组选择一项。" },
      { name: "CheckCard.Group.disabled / loading / size / bordered", type: "boolean / boolean / 'sm' | 'md' | 'lg' / boolean", description: "禁用组内选择、显示整组加载状态，或设置组内卡片的默认尺寸和边框。" },
    ],
    notes: [
      "CheckCard.Group 管理表单选择，不负责响应式列数；CardGroup 管理列数、间距和跨列，不管理选择。把 CardGroup 放在 CheckCard.Group 内，可同时获得两种行为。",
      "选项使用原生单选框或复选框，支持 Tab、空格和单选组方向键。为 Group 提供可读 legend，为每张卡片提供明确标题；仅用于装饰的图形应从无障碍树隐藏。",
      "需要提交表单时明确指定 name 和 value；多选用 FormData.getAll(name) 读取同名项。可用 CheckCardProps、CheckCardGroupProps 和 CheckCardOption 类型描述使用方式。",
    ],
  },
{
  "name": "Questionnaire",
  "description": "逐题填写的多步问卷，支持单选、多选、自由文本、其他答案、必答校验和跳过。",
  "importNames": [
    "Questionnaire"
  ],
  "code": "import { Questionnaire } from \"@bixlab/mtone\";\n\n<Questionnaire\n  items={[\n    { id: \"topic\", type: \"single\", title: \"选择主题\", required: true,\n      choices: [{ value: \"docs\", label: \"文档\" }], other: { label: \"其他\" } },\n    { id: \"notes\", type: \"text\", title: \"还有什么建议？\" },\n  ]}\n  onSubmit={(answers) => console.log(answers)}\n/>",
  "props": [
    {
      "name": "items",
      "type": "readonly QuestionnaireItem[]",
      "description": "有序问题：id、title、description、required；type 为 single、multiple 或 text。选项题传 choices；单选可传 other。"
    },
    {
      "name": "answers / defaultAnswers",
      "type": "QuestionnaireAnswers",
      "description": "按问题 id 索引的受控或初始答案。"
    },
    {
      "name": "onAnswersChange",
      "type": "(answers: QuestionnaireAnswers) => void",
      "description": "输入、选项变化或显式跳过时收到完整草稿。"
    },
    {
      "name": "onSubmit",
      "type": "(answers: QuestionnaireAnswers) => void | Promise<void>",
      "description": "末题通过校验时收到有效答案；异步失败后可重试。"
    },
    {
      "name": "submitLabel",
      "type": "ReactNode",
      "description": "最终提交按钮内容。"
    }
  ],
  "notes": [
    "答案为 {type:\"choice\",value}、{type:\"choices\",values} 或 {type:\"text\",value}。提交文本会去除首尾空白，多选按选项顺序返回。",
    "必答题不能跳过；选答题可留空，显式跳过清除本题草稿。上一题不会清除答案。",
    "问题 id 在问卷内必须唯一且稳定，选项 value 在本题内必须唯一。已提交后保留完成提示；开始新问卷时以不同 React key 挂载。",
    "组件不处理保存、传输和条件分支；由调用方在 onSubmit 中处理。"
  ]
},
{
  "name": "TreeSelect",
  "description": "在紧凑输入框中选择树形数据，支持单选、多选勾选、搜索和异步展开。",
  "importNames": [
    "TreeSelect"
  ],
  "code": "import { TreeSelect } from \"@bixlab/mtone\";\n\nconst items = [{ id: \"resources\", label: \"资源\", children: [\n  { id: \"design\", label: \"设计规范\" },\n  { id: \"notes\", label: \"研究笔记\" },\n] }];\n\n<TreeSelect items={items} aria-label=\"选择资源\" searchable allowClear\n  onValueChange={(value, nodes) => console.log(value, nodes)} />",
  "props": [
    {
      "name": "items",
      "type": "TreeItem[]",
      "description": "树形选项；每个节点的 id 在整棵树中唯一。"
    },
    {
      "name": "multiple",
      "type": "boolean",
      "description": "开启复选框多选；默认单选。",
      "default": "false"
    },
    {
      "name": "value / defaultValue",
      "type": "TreeKey | null | TreeKey[]",
      "description": "受控值或初始值；单选为空时用 null，多选用数组。"
    },
    {
      "name": "onValueChange",
      "type": "(value: TreeKey | null, nodes: TreeItem[]) => void | (value: TreeKey[], nodes: TreeItem[]) => void",
      "description": "按 multiple 使用对应签名；nodes 是当前已选且能在 items 中找到的节点。"
    },
    {
      "name": "checkStrictly",
      "type": "boolean",
      "description": "多选时独立勾选；默认父子联动。",
      "default": "false"
    },
    {
      "name": "showCheckedStrategy",
      "type": "\"all\" | \"parent\" | \"leaf\"",
      "description": "仅控制联动多选标签展示；独立勾选不合并标签，回调始终返回全部勾选键。",
      "default": "\"all\""
    },
    {
      "name": "maxTagCount",
      "type": "number",
      "description": "最大可见标签数，其余显示计数；默认全部显示。"
    },
    {
      "name": "renderValue",
      "type": "(node: TreeItem) => ReactNode",
      "description": "自定义单选值和多选标签内容；未知键回退显示键文本。"
    },
    {
      "name": "searchable",
      "type": "boolean",
      "description": "显示弹层搜索输入框。",
      "default": "false"
    },
    {
      "name": "searchValue / defaultSearchValue / onSearchChange",
      "type": "string / string / (value: string) => void",
      "description": "受控或非受控搜索词；关闭时请求清空搜索。"
    },
    {
      "name": "filterNode",
      "type": "(query: string, node: TreeItem) => boolean",
      "description": "自定义节点匹配；默认匹配 textValue 或文本 label，保留祖先。"
    },
    {
      "name": "open / defaultOpen / onOpenChange",
      "type": "boolean / boolean / (open: boolean) => void",
      "description": "受控或非受控弹层状态。",
      "default": "false"
    },
    {
      "name": "placeholder / searchPlaceholder / emptyContent",
      "type": "string / string / ReactNode",
      "description": "未选择提示、搜索提示与空结果内容；默认跟随语言设置。"
    },
    {
      "name": "allowClear / onClear",
      "type": "boolean / () => void",
      "description": "显示清空按钮及清空回调。",
      "default": "false"
    },
    {
      "name": "disabled / readOnly",
      "type": "boolean / boolean",
      "description": "禁用或只读均不打开弹层、不允许修改；继承 Fieldset 禁用。",
      "default": "false"
    },
    {
      "name": "expandedKeys / defaultExpandedKeys",
      "type": "TreeKey[]",
      "description": "受控或初始展开键；搜索时自动展开匹配路径。"
    },
    {
      "name": "defaultExpandAll",
      "type": "boolean",
      "description": "初始展开全部已提供节点。",
      "default": "false"
    },
    {
      "name": "onExpand",
      "type": "(keys: TreeKey[], info: { expanded: boolean; node: TreeItem }) => void",
      "description": "非搜索状态下的展开变化。"
    },
    {
      "name": "loadData",
      "type": "(node: TreeItem) => Promise<unknown>",
      "description": "异步加载分支，应用需更新 items；搜索时不触发。"
    },
    {
      "name": "loadedKeys / onLoad",
      "type": "TreeKey[] / (keys: TreeKey[], info: { node: TreeItem }) => void",
      "description": "受控已加载键和加载完成通知。"
    },
    {
      "name": "onLoadError",
      "type": "(error: unknown, node: TreeItem) => void",
      "description": "异步加载失败通知。"
    },
    {
      "name": "showLine / showIcon",
      "type": "boolean / boolean",
      "description": "树连接线和节点图标；图标来自节点 icon。",
      "default": "false"
    },
    {
      "name": "titleRender",
      "type": "(node: TreeItem) => ReactNode",
      "description": "自定义树节点标题。"
    },
    {
      "name": "height / virtual",
      "type": "number / boolean",
      "description": "树面板高度和窗口化渲染开关；高度默认 256px，virtual 默认 true。"
    },
    {
      "name": "size",
      "type": "\"sm\" | \"md\" | \"lg\"",
      "description": "触发器高度为 24 / 32 / 34px。",
      "default": "\"md\""
    },
    {
      "name": "status",
      "type": "\"error\" | \"warning\"",
      "description": "校验边框状态。"
    },
    {
      "name": "placement",
      "type": "\"bottom-start\" | \"bottom-end\" | \"top-start\" | \"top-end\"",
      "description": "弹层的方向与逻辑对齐。",
      "default": "\"bottom-start\""
    },
    {
      "name": "dropdownWidth",
      "type": "CSSProperties[\"width\"]",
      "description": "指定弹层宽度；默认跟随触发器，最小 180px 且受视口约束。"
    },
    {
      "name": "prefix",
      "type": "ReactNode",
      "description": "触发器前缀内容。"
    },
    {
      "name": "name / id",
      "type": "string / string",
      "description": "隐藏表单字段名与触发按钮 ID。"
    },
    {
      "name": "className / style",
      "type": "string / CSSProperties",
      "description": "外层容器样式。"
    },
    {
      "name": "aria-label / aria-labelledby",
      "type": "string / string",
      "description": "控件可访问名称。"
    },
    {
      "name": "ref",
      "type": "Ref<HTMLButtonElement>",
      "description": "触发按钮引用，可调用 focus()。"
    }
  ],
  "notes": [
    "TreeKey 为 string | number。单选 value 是键或 null；多选 value 是键数组，不是路径数组。数字 1 与字符串 \"1\" 不同。",
    "TreeItem 支持 id、label、children、disabled、disableCheckbox、checkable、selectable、isLeaf、icon。非文本 label 可补充 textValue 供搜索与标签移除按钮命名。",
    "多选默认父子联动并返回全部勾选键；disabled、disableCheckbox 和 checkable=false 的节点阻断勾选传播。单选遵循 disabled 和 selectable；多选遵循勾选限制。",
    "搜索只处理已提供的 items，保留匹配节点和祖先。筛选时勾选父节点仍以完整数据计算，不限于可见结果。",
    "异步分支设 isLeaf=false，在 loadData 中获取数据并不可变更新 items；组件不存储服务端结果；非受控加载完成键会保留到组件卸载，关闭弹层不清空。搜索期间不会触发 loadData。",
    "受控 value、open、searchValue、expandedKeys 和 loadedKeys 需由应用响应回调更新。默认值仅在初始化时使用。",
    "name 对单选提交键文本，多选提交全部勾选键的 JSON 数组；禁用时不参与表单提交。与 Form 集成时使用 value / onValueChange。",
    "尚未出现在 items 的选中键保留并显示键文本，支持异步数据更新；onValueChange 第二参数 nodes 仅包含已存在的节点。",
    "上下键移动焦点，左右键展开、折叠或进入子级，Enter / 空格选择，Escape 关闭并回到触发器。搜索框按下箭头进入树。",
    "不提供自动远程搜索或动态测量行高；虚拟树适合固定行高的单行节点。数据中的 id 必须全局唯一。"
  ]
},
{
  "name": "Fieldset",
  "description": "用原生 fieldset 与 legend 为相关表单控件分组，支持统一禁用。",
  "importNames": [
    "Fieldset"
  ],
  "code": "import { Fieldset, Form, Input, Button } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return <Fieldset legend=\"个人信息\">\n    <div style={{ display: \"grid\", gap: 10 }}>\n      <Form.Item label=\"姓名\"><Input /></Form.Item>\n      <Form.Item label=\"邮箱\"><Input type=\"email\" /></Form.Item>\n      <Button>保存</Button>\n    </div>\n  </Fieldset>;\n}",
  "props": [
    {
      "name": "legend",
      "type": "ReactNode",
      "description": "分组标题，渲染为原生 legend；省略时可使用 aria-label 命名。"
    },
    {
      "name": "variant",
      "type": "\"default\" | \"filled\" | \"unstyled\"",
      "default": "\"default\"",
      "description": "默认细边框、浅灰填充或无边框。"
    },
    {
      "name": "radius",
      "type": "CSSProperties[\"borderRadius\"]",
      "default": "6px",
      "description": "自定义圆角，数字按像素处理。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "统一禁用内部表单控件；嵌套分组无法覆盖祖先禁用。"
    },
    {
      "name": "原生属性 / ref",
      "type": "FieldsetHTMLAttributes<HTMLFieldSetElement> / Ref<HTMLFieldSetElement>",
      "description": "支持 name、form、className、style、aria-* 等原生属性。"
    }
  ],
  "notes": [
    "Fieldset 负责语义分组与统一禁用，不替代 Form 的提交/校验或 Form.Item 的单字段标签。内容布局由调用方控制，可用 Stack 或 Grid。",
    "disabled 保留原生 fieldset 语义：本组第一个 legend 内的控件不受本组禁用影响，仍继承祖先禁用。",
    "mtone 的 Button、Input、Input.TextArea、Checkbox、Switch、RadioGroup、Select、Slider、NumberInput、AutoComplete、Mentions、Cascader/CascaderPanel、TreeSelect、Rate、Transfer、DatePicker、Upload 会继承禁用。Select 等弹层同时关闭，disabled={false} 不会覆盖分组禁用。",
    "原生 input/button/select/textarea 使用浏览器禁用语义；自定义第三方控件、链接、Menu 等非表单动作需应用自行传递 disabled。受控值仍由应用管理，Fieldset 不清空已有值。"
  ]
},
{
  "name": "LoadingOverlay",
  "description": "覆盖局部区域的紧凑加载遮罩，支持模糊、圆角和自定义加载内容。",
  "importNames": [
    "LoadingOverlay"
  ],
  "code": "import { useState } from \"react\";\nimport { Button, Input, LoadingOverlay } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  const [loading, setLoading] = useState(false);\n  return <>\n    <div style={{ position: \"relative\", borderRadius: 6 }}>\n      <div aria-busy={loading} style={{ padding: 16 }}>\n        <Input aria-label=\"项目名称\" disabled={loading} />\n      </div>\n      <LoadingOverlay visible={loading} label=\"正在保存\" blur={1} />\n    </div>\n    <Button onClick={() => setLoading(value => !value)}>切换加载</Button>\n  </>;\n}",
  "props": [
    {
      "name": "visible",
      "type": "boolean",
      "description": "控制显示；隐藏时卸载整个遮罩，无退出延迟。",
      "default": "false"
    },
    {
      "name": "label",
      "type": "string",
      "description": "可选的可见提示文字，同时用作状态名称；省略或空白时可访问名称为 Loading。"
    },
    {
      "name": "loader",
      "type": "ReactNode",
      "description": "替换加载图标；null 隐藏图标。自定义内容由 status 容器承载，请勿重复添加 status/live 语义。",
      "default": "Spinner"
    },
    {
      "name": "overlayColor",
      "type": "string",
      "description": "遮罩背景颜色，不改变加载内容颜色。",
      "default": "var(--mt-bg, #fff)"
    },
    {
      "name": "opacity",
      "type": "number",
      "description": "仅背景透明度，限制在 0–1；非有限数字回退为 0.75。",
      "default": "0.75"
    },
    {
      "name": "blur",
      "type": "number",
      "description": "背景模糊像素数；负数和非有限数字回退为 0。",
      "default": "0"
    },
    {
      "name": "radius",
      "type": "CSSProperties[\"borderRadius\"]",
      "description": "遮罩圆角；数字为 px，也支持 CSS 值。",
      "default": "inherit"
    },
    {
      "name": "zIndex",
      "type": "number",
      "description": "局部堆叠层级，非有限数字回退为 10；不会逃离父堆叠上下文。",
      "default": "10"
    },
    {
      "name": "className / style",
      "type": "string / CSSProperties",
      "description": "根元素样式；style 可覆盖默认设置，修改 pointerEvents 或定位可能影响遮罩行为。"
    },
    {
      "name": "ref / div attributes",
      "type": "Ref<HTMLDivElement> / HTMLAttributes<HTMLDivElement>",
      "description": "透传到根 div；children 不受支持，使用 loader 自定义内容。"
    }
  ],
  "notes": [
    "父容器必须设置 position: relative（或其他定位方式）并具有实际尺寸。遮罩绝对定位，不占据布局空间；默认圆角继承父容器。",
    "遮罩拦截鼠标/触摸，但不会禁用下层键盘焦点，也不管理焦点、修改父 DOM 或提供模态语义。请在内容区域设置 aria-busy，并按需禁用表单或为独立的内容容器设置 inert；不要把遮罩或取消按钮放进 inert 容器。",
    "默认复用 Spinner，遵循 reduced-motion 设置；自定义加载动画由调用方处理。没有自动请求、计时器、全屏 Portal、延迟或过渡动画。",
    "高级定位元素或更高层级的后代可能显示在遮罩之上；按布局设置 zIndex。状态提示名称默认 Loading，可通过 label 本地化。"
  ]
},
  {
    name: "Panel",
    description: "IDE 风格的标签面板，可独立使用，也可与 Splitter 组合停靠和调节大小。",
    importNames: ["Panel"],
    code: 'import { Panel } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return <Panel label="工作区" items={[{ value: "output", label: "输出", content: <code>编译完成</code> }]} />;\n}',
    props: [
      { name: "items", type: "Pick<TabItem, 'value' | 'label' | 'content' | 'disabled' | 'icon'>[]", description: "标签数据。已访问的标签内容在切换和收起后保持挂载。" },
      { name: "label", type: "string", description: "标签列表的无障碍名称。" },
      { name: "value / defaultValue / onValueChange", type: "string / string / (value: string) => void", description: "受控或非受控的选中标签。" },
      { name: "actions", type: "ReactNode", description: "标题行末端的附加操作，收起时仍可操作。" },
      { name: "collapsed / defaultCollapsed / onCollapsedChange", type: "boolean / boolean / (collapsed: boolean) => void", default: "defaultCollapsed: false", description: "受控或非受控的收起状态，收起后只显示标题行。" },
      { name: "原生属性", type: "ComponentPropsWithRef<'div'>", description: "支持 className、style 和原生属性；ref 指向根 div。" },
    ],
    notes: [
      "Panel 不负责停靠和调整尺寸。与 Splitter 组合时，顶部和底部用纵向分栏，左右用横向分栏，标题栏始终在上方。示例在左右收起时保留紧凑标题宽度，并在展开后恢复此前的分栏尺寸。",
      "标题栏沿用 Tabs 的键盘操作与窄宽度溢出菜单；收起会隐藏内容区并使其不可聚焦，但保留内部状态。",
    ],
  },
  {
    name: "HoverMarquee",
    description: "单行文字溢出时显示省略号，悬停或聚焦时滚动查看全文。",
    importNames: ["HoverMarquee"],
    code: 'import { HoverMarquee } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <div style={{ inlineSize: "100%", maxInlineSize: "15rem", minInlineSize: 0 }}>\n      <HoverMarquee>面向多模态教学数据的人工智能实验记录、阶段性研究报告与后续模型评估计划及数据整理说明</HoverMarquee>\n    </div>\n  );\n}',
    props: [
      { name: "children", type: "ReactNode", description: "单行文本或非交互行内内容。" },
      { name: "tabIndex", type: "number", description: "默认仅文字溢出时可通过 Tab 聚焦；可覆盖。" },
      { name: "原生属性", type: "ComponentPropsWithRef<'span'>", description: "支持 className、style、ARIA 属性，ref 指向外层 span。" },
    ],
    notes: [
      "在宽度受限的容器中使用。仅溢出时滚动；到达行尾短暂停留，再平滑经过一小段留白，连续接到下一轮。悬停与焦点都离开时恢复省略状态。RTL 反向滚动。",
      "启用减少动态效果或设备不支持悬停时不自动滚动：聚焦后可用方向键横向滚动，触屏可横向滑动。原文始终保留在同一个可访问文本节点中。",
    ],
  },
  {
    name: "HoverCard",
    description: "悬停或键盘聚焦显示的富内容预览卡片。",
    importNames: ["HoverCard", "Button"],
    code: '<HoverCard trigger={<Button>作者</Button>} title="mtone" withArrow content="简约紧凑的 React 组件库" />',
    props: [
      { name: "trigger", type: "ReactElement", description: "必填，可聚焦触发元素；自定义组件需要传递 ref 和事件属性" },
      { name: "content / title", type: "ReactNode", description: "卡片内容（content 必填）和可选标题" },
      { name: "open / defaultOpen", type: "boolean", default: "false", description: "受控开关 / 非受控初始开关" },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "交互请求开关时触发" },
      { name: "openDelay / closeDelay", type: "number", default: "300 / 150", description: "打开和关闭延迟，毫秒" },
      { name: "side", type: '"top" | "bottom" | "left" | "right"', default: '"bottom"', description: "首选方向，空间不足时自动避让" },
      { name: "align", type: '"start" | "center" | "end"', default: '"center"', description: "相对触发元素的逻辑对齐方式" },
      { name: "sideOffset", type: "number", default: "6", description: "浮层与触发元素的间距，像素" },
      { name: "width", type: "CSSProperties[width]", default: "280", description: "卡片宽度，受可用视口宽度限制，不强制匹配触发宽度" },
      { name: "withArrow / disabled", type: "boolean", default: "false", description: "显示箭头 / 禁用预览但保留触发元素原本行为" },
    ],
    notes: [
      "复用 Base UI PreviewCard 的悬停安全区域、延迟与键盘聚焦行为。鼠标从触发元素移动到卡片时保持显示；Escape 或点击外部关闭。不会自动把焦点移入卡片。",
      "HoverCard 用于补充预览，不替代点击式 Popover；表单和必须完成的操作应使用 Popover。触摸设备不依赖悬停打开，也不拦截触发链接原本点击。",
      "提供可聚焦 trigger 以支持键盘；预览信息不应是完成任务的唯一入口。API 不兼容 Mantine，不提供复合子组件、delay group 或触摸开关。",
    ],
  },
  {
    name: "Cascader",
    description:
      "路径式级联选择，支持单选、多选联动、搜索、异步加载与独立面板。",
    importNames: ["Cascader"],
    code: '<Cascader aria-label="地区" options={[{value:"zhejiang",label:"浙江",children:[{value:"hangzhou",label:"杭州"}]}]} searchable allowClear onValueChange={(path) => console.log(path)} />',
    props: [
      {
        name: "options",
        type: "CascaderOption[]",
        description: "树形数据；同一父节点下 value 必须唯一",
      },
      {
        name: "value / defaultValue",
        type: "CascaderPath | CascaderPath[]",
        description: "单选为完整值路径；multiple 时为路径数组",
        default: "[]",
      },
      {
        name: "multiple",
        type: "boolean",
        description: "多选：父节点联动已加载、未禁用的叶节点",
        default: "false",
      },
      {
        name: "onValueChange",
        type: "(value, optionPath | optionPaths) => void",
        description:
          "单选回传路径及选项路径，多选回传路径数组及选项路径数组；清除回传 []",
      },
      {
        name: "changeOnSelect",
        type: "boolean",
        description:
          "单选允许选择非叶节点；选择父级保持面板打开。多选不改变叶路径值模型",
        default: "false",
      },
      {
        name: "expandTrigger",
        type: '"click" | "hover"',
        description: "鼠标展开方式；键盘始终可用",
        default: "click",
      },
      {
        name: "searchable",
        type: "boolean",
        description: "在面板顶部显示搜索框，默认按完整路径的各词匹配",
        default: "false",
      },
      {
        name: "searchValue / defaultSearchValue / onSearchChange",
        type: "string / string / (value:string)=>void",
        description: "受控或非受控搜索词；弹层关闭时请求清空搜索",
        default: "空字符串",
      },
      {
        name: "filterOption",
        type: "(query:string, path:CascaderOption[])=>boolean",
        description: "替换本地搜索匹配逻辑；仅处理已加载的可选路径",
      },
      {
        name: "loadOptions",
        type: "(path:CascaderOption[])=>Promise<CascaderOption[]>",
        description:
          "展开 isLeaf:false 的未加载分支时加载子项；失败可重试，空数组表示无子项",
      },
      {
        name: "onLoadError",
        type: "(error:unknown, path:CascaderOption[])=>void",
        description: "异步加载失败回调",
      },
      {
        name: "renderOption",
        type: "(option:CascaderOption, path:CascaderOption[])=>ReactNode",
        description: "自定义每行内容；不替换行交互",
      },
      {
        name: "emptyContent / loadingText / loadErrorText",
        type: "ReactNode",
        description: "空结果、加载中、加载失败文案",
        default: "本地化文案",
      },
      {
        name: "searchPlaceholder",
        type: "string",
        description: "搜索框提示文字",
        default: "本地化文案",
      },
      {
        name: "disabled / readOnly",
        type: "boolean",
        description: "禁用或只读；不允许修改值。弹出式 Cascader 不打开弹层",
        default: "false",
      },
      {
        name: "open / defaultOpen / onOpenChange",
        type: "boolean / boolean / (open:boolean)=>void",
        description: "仅 Cascader：控制弹层",
        default: "false",
      },
      {
        name: "placeholder / allowClear / onClear",
        type: "string / boolean / ()=>void",
        description: "仅 Cascader：提示文字、清除按钮及清除回调",
        default: "本地化提示 / false",
      },
      {
        name: "size / status",
        type: '"sm" | "md" | "lg" / "error" | "warning"',
        description: "仅 Cascader：高度 24 / 32 / 34px，及校验状态",
        default: "md",
      },
      {
        name: "placement",
        type: '"bottom-start" | "bottom-end" | "top-start" | "top-end"',
        description: "仅 Cascader：弹层位置",
        default: "bottom-start",
      },
      {
        name: "showCheckedStrategy",
        type: '"parent" | "leaf"',
        description:
          "仅 Cascader：多选标签合并父级或展示叶级，不改变回调的叶路径数组",
        default: "parent",
      },
      {
        name: "maxTagCount",
        type: "number",
        description: "仅 Cascader：最大可见标签数，其余显示计数",
        default: "3",
      },
      {
        name: "renderValue",
        type: "(options:CascaderOption[], path:CascaderPath)=>ReactNode",
        description:
          "仅 Cascader：单选值和多选标签渲染；不存在的路径 options 为空",
      },
      {
        name: "prefix / name / id",
        type: "ReactNode / string / string",
        description:
          "仅 Cascader：前缀、JSON 序列化值的隐藏表单字段名、触发按钮 ID",
      },
      {
        name: "ref",
        type: "Ref<HTMLButtonElement>",
        description: "仅 Cascader：触发按钮的原生引用",
      },
      {
        name: "className / style / aria-label / aria-labelledby",
        type: "string / CSSProperties / string / string",
        description: "外层样式与可访问名称",
      },
    ],
    notes: [
      "同组相邻菜单或选项行之间保留 3px 间距；首项、分组标题和分隔线不额外增加间距。",
      'CascaderPath = (string | number)[]。单选如 ["zhejiang","hangzhou"]，多选如 [["zhejiang","hangzhou"]]；数字 1 和字符串 "1" 是不同值。',
      "CascaderOption 支持 value、label、textValue、children、disabled、isLeaf。富文本 label 应提供 textValue，用于搜索、路径文字和可访问名称。禁用分支的后代也不可选。",
      "CascaderPanel 使用同一选项、选择、搜索与加载 API，但常驻页面，不支持触发器、标签展示、清除按钮、尺寸、定位及隐藏表单字段属性。",
      "搜索只处理当前已加载的路径，不触发递归远程加载。自定义远程检索需调用方更新 options。多选父级联动仅包括当前已加载的可用叶节点，不自动选择后来加载的数据。",
      "options 的路径值、文字、禁用状态、叶节点标记或子节点结构变化会清除加载缓存并忽略旧响应；仅重建数组或 loadOptions 函数引用不会清除缓存。远程数据源切换但结构相同时，请更换组件 key 显式重置。isLeaf:false 表示待加载分支，isLeaf:true 强制作为叶节点。",
      "上下键、Home/End 导航同级；左右键进入/返回层级；Enter/空格选择，Escape 关闭弹层。选项采用 mtone 灰底高亮，不叠加蓝色粗边框。",
      "不提供 fieldNames、任意触发器、variant、虚拟滚动或内置远程搜索；可在传入前映射数据字段。大树建议分批加载。",
      "name 提交 JSON 字符串，不自动接入 Form.Item 的 onChange 协议，也不实现原生表单 reset；需受控值时请响应 onValueChange。",
      "自 0.4.0 提供；文档站跟随 master，请以安装版本的声明为准。",
    ],
  },
  {
    sidebarParent: "Cascader",
    sidebarSection: "panel",
    name: "CascaderPanel",
    description:
      "常驻页面的级联选择面板，复用路径选择、多选联动、搜索与异步加载交互。",
    importNames: ["CascaderPanel"],
    code: '<CascaderPanel aria-label="地区面板" options={[{value:"zhejiang",label:"浙江",children:[{value:"hangzhou",label:"杭州"}]}]} multiple searchable />',
    props: [
      {
        name: "options",
        type: "CascaderOption[]",
        description: "树形数据；同一父节点下 value 必须唯一",
      },
      {
        name: "value / defaultValue",
        type: "CascaderPath | CascaderPath[]",
        description: "单选为完整值路径；multiple 时为路径数组",
        default: "[]",
      },
      {
        name: "multiple",
        type: "boolean",
        description: "多选：父节点联动已加载、未禁用的叶节点",
        default: "false",
      },
      {
        name: "onValueChange",
        type: "(value, optionPath | optionPaths) => void",
        description:
          "单选回传路径及选项路径，多选回传路径数组及选项路径数组；清除回传 []",
      },
      {
        name: "changeOnSelect",
        type: "boolean",
        description:
          "单选允许选择非叶节点；选择父级保持面板打开。多选不改变叶路径值模型",
        default: "false",
      },
      {
        name: "expandTrigger",
        type: '"click" | "hover"',
        description: "鼠标展开方式；键盘始终可用",
        default: "click",
      },
      {
        name: "searchable",
        type: "boolean",
        description: "在面板顶部显示搜索框，默认按完整路径的各词匹配",
        default: "false",
      },
      {
        name: "searchValue / defaultSearchValue / onSearchChange",
        type: "string / string / (value:string)=>void",
        description: "受控或非受控搜索词；弹层关闭时请求清空搜索",
        default: "空字符串",
      },
      {
        name: "filterOption",
        type: "(query:string, path:CascaderOption[])=>boolean",
        description: "替换本地搜索匹配逻辑；仅处理已加载的可选路径",
      },
      {
        name: "loadOptions",
        type: "(path:CascaderOption[])=>Promise<CascaderOption[]>",
        description:
          "展开 isLeaf:false 的未加载分支时加载子项；失败可重试，空数组表示无子项",
      },
      {
        name: "onLoadError",
        type: "(error:unknown, path:CascaderOption[])=>void",
        description: "异步加载失败回调",
      },
      {
        name: "renderOption",
        type: "(option:CascaderOption, path:CascaderOption[])=>ReactNode",
        description: "自定义每行内容；不替换行交互",
      },
      {
        name: "emptyContent / loadingText / loadErrorText",
        type: "ReactNode",
        description: "空结果、加载中、加载失败文案",
        default: "本地化文案",
      },
      {
        name: "searchPlaceholder",
        type: "string",
        description: "搜索框提示文字",
        default: "本地化文案",
      },
      {
        name: "disabled / readOnly",
        type: "boolean",
        description: "禁用或只读；不允许修改值。弹出式 Cascader 不打开弹层",
        default: "false",
      },
      {
        name: "className / style / aria-label / aria-labelledby",
        type: "string / CSSProperties / string / string",
        description: "外层样式与可访问名称",
      },
    ],
    notes: [
      'CascaderPath = (string | number)[]。单选如 ["zhejiang","hangzhou"]，多选如 [["zhejiang","hangzhou"]]；数字 1 和字符串 "1" 是不同值。',
      "CascaderOption 支持 value、label、textValue、children、disabled、isLeaf。富文本 label 应提供 textValue，用于搜索、路径文字和可访问名称。禁用分支的后代也不可选。",
      "CascaderPanel 使用同一选项、选择、搜索与加载 API，但常驻页面，不支持触发器、标签展示、清除按钮、尺寸、定位及隐藏表单字段属性。",
      "搜索只处理当前已加载的路径，不触发递归远程加载。自定义远程检索需调用方更新 options。多选父级联动仅包括当前已加载的可用叶节点，不自动选择后来加载的数据。",
      "options 的路径值、文字、禁用状态、叶节点标记或子节点结构变化会清除加载缓存并忽略旧响应；仅重建数组或 loadOptions 函数引用不会清除缓存。远程数据源切换但结构相同时，请更换组件 key 显式重置。isLeaf:false 表示待加载分支，isLeaf:true 强制作为叶节点。",
      "上下键、Home/End 导航同级；左右键进入/返回层级；Enter/空格选择，Escape 关闭弹层。选项采用 mtone 灰底高亮，不叠加蓝色粗边框。",
      "不提供 fieldNames、任意触发器、variant、虚拟滚动或内置远程搜索；可在传入前映射数据字段。大树建议分批加载。",
      "自 0.4.0 提供；文档站跟随 master，请以安装版本的声明为准。",
    ],
  },
{
  "name": "Transfer",
  "description": "双栏穿梭选择，支持搜索、分页、单向移动和自定义列表。",
  "importNames": [
    "Transfer"
  ],
  "code": "<Transfer items={[{key:\"a\",label:\"资料 A\"}]} defaultTargetKeys={[]} showSearch onChange={setKeys} />",
  "props": [
    {
      "name": "items",
      "type": "TransferItem[]",
      "description": "完整数据；唯一字符串 key、label、可选 description/searchText/disabled。富内容使用 searchText 提供搜索与移除名称。"
    },
    {
      "name": "targetKeys / defaultTargetKeys",
      "type": "string[]",
      "description": "目标项受控或非受控；顺序按 keys。缺失数据的目标 key 保留，不显示。",
      "default": "[]"
    },
    {
      "name": "onChange",
      "type": "(keys, direction, movedKeys) => void",
      "description": "移动后通知；right 移入，left 移回。"
    },
    {
      "name": "selectedKeys / defaultSelectedKeys",
      "type": "string[]",
      "description": "两侧复选状态，不是已移入目标的值。",
      "default": "[]"
    },
    {
      "name": "onSelectChange",
      "type": "(sourceKeys, targetKeys) => void",
      "description": "选中状态变更通知，移动后清除移动项选中状态。"
    },
    {
      "name": "showSearch / filterOption / onSearch",
      "type": "boolean / (query,item,direction)=>boolean / (direction,query)=>void",
      "description": "两侧独立过滤，默认 label 字符串或 searchText，富节点无 searchText 时按 key。",
      "default": "false"
    },
    {
      "name": "pagination",
      "type": "boolean | {pageSize?:number}",
      "description": "默认每页10条；全选仅当前过滤后的页，搜索重置页码；renderList 时关闭内置分页。",
      "default": "false"
    },
    {
      "name": "oneWay",
      "type": "boolean",
      "description": "右侧显示逐项移除而不是复选框。",
      "default": "false"
    },
    {
      "name": "disabled / loading",
      "type": "boolean",
      "description": "禁用所有选择、移动和搜索；loading 显示提示，已有数据仍可见。",
      "default": "false"
    },
    {
      "name": "showSelectAll",
      "type": "boolean",
      "description": "显示全选；只影响当前可见且可用项，保留隐藏选中项。",
      "default": "true"
    },
    {
      "name": "titles / panelLabels / operationLabels",
      "type": "[ReactNode,ReactNode] / [string,string] / [string,string]",
      "description": "显示标题、可访问区域名称、移入/移回按钮名称；缺省随 MtoneProvider locale。"
    },
    {
      "name": "searchPlaceholder / emptyContent",
      "type": "string / ReactNode",
      "description": "搜索占位与空列表内容。"
    },
    {
      "name": "height",
      "type": "number | string",
      "description": "每侧列表高度。",
      "default": "220"
    },
    {
      "name": "status",
      "type": "\"error\" | \"warning\"",
      "description": "边框反馈状态，不自动校验。"
    },
    {
      "name": "renderItem",
      "type": "(item,direction)=>ReactNode",
      "description": "自定义项目内容；不要嵌套交互控件到复选标签内。"
    },
    {
      "name": "renderList / footer",
      "type": "(context: TransferListContext)=>ReactNode",
      "description": "自定义列表或页脚；context含direction、过滤items、该侧selectedKeys、disabled、select(keys,boolean) 与 remove(keys)，过滤未知/禁用/异侧项；remove 只对目标侧生效。"
    },
    {
      "name": "ref / ...divProps",
      "type": "HTMLDivElement / HTMLAttributes",
      "description": "根节点 ref、className、style、aria 属性。"
    }
  ],
  "notes": [
    "支持受控和非受控，未内置 Tree/DataTable 适配器，可通过 renderList 自行连接。",
    "key 必须唯一且稳定。items 应包含两侧完整记录；未知 targetKeys 保留以支持外部数据更新。",
    "搜索和分页不会清除隐藏选择，移动按钮移动该侧所有选中可用项，不仅当前页。分页全选仅当前页；不提供反选菜单或虚拟化。",
    "键盘使用原生/本库复选框 Tab 与空格，操作按钮 Enter/空格；不使用伪 listbox 组合键。",
    "窄于480px时两栏上下排列；仅布局改变，left/right 仍代表来源/目标。",
    "自定义 renderList 自行负责键盘和无障碍，不提供远端请求或请求竞态管理。"
  ]
},
{
  "name": "AutoComplete",
  "description": "允许自由输入的自动补全，支持分组建议、远程搜索与完整键盘交互。",
  "importNames": [
    "AutoComplete"
  ],
  "code": "<AutoComplete aria-label=\"邮箱\" options={[{value:\"alice@example.com\",label:\"Alice\"}]} allowClear onChange={setValue} />",
  "props": [
    {
      "name": "options",
      "type": "(AutoCompleteOption | AutoCompleteGroup)[]",
      "default": "[]",
      "description": "候选项或分组"
    },
    {
      "name": "value / defaultValue",
      "type": "string",
      "default": "空字符串",
      "description": "受控值或初始值"
    },
    {
      "name": "onChange",
      "type": "(value:string)=>void",
      "default": "—",
      "description": "文字变化"
    },
    {
      "name": "onSelect",
      "type": "(value:string, option:AutoCompleteOption)=>void",
      "default": "—",
      "description": "鼠标或键盘确认候选"
    },
    {
      "name": "onSearch",
      "type": "(query:string)=>void",
      "default": "—",
      "description": "输入搜索回调"
    },
    {
      "name": "open / defaultOpen / onOpenChange",
      "type": "boolean / boolean / (open:boolean)=>void",
      "default": "false",
      "description": "弹层状态"
    },
    {
      "name": "filterOption",
      "type": "false | (query,option)=>boolean",
      "default": "内置包含匹配",
      "description": "false 表示应用过滤"
    },
    {
      "name": "autoHighlight / backfill",
      "type": "boolean",
      "default": "false",
      "description": "自动首项高亮 / 键盘临时回填"
    },
    {
      "name": "allowClear / onClear",
      "type": "boolean / ()=>void",
      "default": "false",
      "description": "清除按钮及回调"
    },
    {
      "name": "loading / notFoundContent",
      "type": "boolean / ReactNode",
      "default": "false / 本地化空状态",
      "description": "加载状态和无结果内容"
    },
    {
      "name": "size / status",
      "type": "sm | md | lg / error | warning",
      "default": "md",
      "description": "高度24/32/34px和校验状态"
    },
    {
      "name": "prefix / suffix",
      "type": "ReactNode",
      "default": "—",
      "description": "输入前后装饰"
    },
    {
      "name": "placement / popupWidth",
      "type": "top | bottom / number",
      "default": "bottom / 跟随输入",
      "description": "浮层方向/像素宽度"
    },
    {
      "name": "popupClassName / popupStyle",
      "type": "string / CSSProperties",
      "default": "—",
      "description": "浮层样式"
    },
    {
      "name": "ref",
      "type": "Ref<HTMLInputElement>",
      "default": "—",
      "description": "原生输入引用"
    },
    {
      "name": "原生 input 属性",
      "type": "InputHTMLAttributes",
      "default": "—",
      "description": "name/form/id/required/disabled/readOnly/aria 等；className/style 属于输入容器"
    }
  ],
  "notes": [
      "同组相邻菜单或选项行之间保留 3px 间距；首项、分组标题和分隔线不额外增加间距。",
    "自由输入不限定为选项值；选择后填入 value 而不是富文本 label。值必须在整个列表唯一。键盘可聚焦禁用项以朗读，但不能选中。",
    "options 支持 {label:string,options:AutoCompleteOption[]} 分组；选项支持 value、label、disabled、keywords。",
    "默认按 value、字符串 label 和 keywords 忽略大小写包含匹配；远程数据请使用 filterOption={false}，应用自行处理防抖、取消及过期响应。",
    "onSearch 只在用户输入（包括 IME 完成）时触发，选择和清除不触发；onChange 包含输入、选择及清除。",
    "默认无结果显示空状态。open 受控时仍由调用方响应 onOpenChange；disabled/readOnly 始终关闭弹层。",
    "原生 input ref 支持 focus/blur；Form.Item 绑定字符串 value/onChange。非受控原生表单 reset 恢复 defaultValue。",
    "不支持 textarea/任意输入替换、虚拟滚动、多选或 variant。大数据建议服务端筛选。",
    "自 0.4.0 提供；文档站跟随 master，请以安装版本的声明为准。"
  ]
},
{
  "name": "TableOfContents",
  "description": "自动采集文章标题、跟随滚动高亮并跳转的页内目录，适合文档与知识库。",
  "importNames": [
    "TableOfContents"
  ],
  "code": "import { useCallback, useRef } from \"react\";\nimport { TableOfContents } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  const article = useRef<HTMLElement>(null);\n  const getArticle = useCallback(() => article.current, []);\n  return <div style={{ display: \"flex\", gap: 24 }}>\n    <TableOfContents root={getArticle} offset={56} style={{ width: 180 }} />\n    <article ref={article}>\n      <h2 id=\"overview\">概览</h2><p>内容</p>\n      <h3 id=\"details\">详细说明</h3><p>内容</p>\n      <h2 id=\"usage\">使用方式</h2><p>内容</p>\n    </article>\n  </div>;\n}",
  "props": [
    {
      "name": "root",
      "type": "HTMLElement | null | (() => HTMLElement | null)",
      "default": "document",
      "description": "采集标题的作用域，不含作用域元素自身。建议 getter 配合 ref，避免采集页面其他标题；显式 null 表示作用域尚未准备好。"
    },
    {
      "name": "scrollContainer",
      "type": "HTMLElement | null | (() => HTMLElement | null)",
      "default": "window",
      "description": "实际包含文章的垂直滚动容器；null 回退为 window。"
    },
    {
      "name": "selector",
      "type": "string",
      "default": "\"h2, h3, h4\"",
      "description": "在 root 中匹配标题的 CSS 选择器；无效选择器显示空目录。"
    },
    {
      "name": "title",
      "type": "ReactNode",
      "default": "\"目录\"",
      "description": "目录标题，null 隐藏。"
    },
    {
      "name": "initialItems",
      "type": "TableOfContentsItem[]",
      "default": "[]",
      "description": "SSR 和首次渲染使用的 { id, label, level } 列表；挂载后由真实 DOM 采集结果替换，不是受控 items。"
    },
    {
      "name": "items",
      "type": "readonly TableOfContentsItem[]",
      "description": "显式提供有序的 { id, label, level }，替代 DOM 采集；活动项仍按 root 中同名 ID 的元素计算。"
    },
    {
      "name": "listStyle",
      "type": "\"flat\" | \"nested\"",
      "default": "\"flat\"",
      "description": "flat 保持原有平铺并缩进样式；nested 按 level 组织为真正的嵌套列表。"
    },
    {
      "name": "getHref",
      "type": "(item: TableOfContentsItem) => string | undefined",
      "description": "返回自定义链接时由浏览器原生导航，不执行内置滚动；返回 undefined 时仍按默认页内滚动。"
    },
    {
      "name": "fallbackActiveId",
      "type": "string",
      "description": "没有标题越过高亮阈值时优先选中的可用目标 ID；缺省选择首项。"
    },
    {
      "name": "highlightLastAtEnd",
      "type": "boolean",
      "default": "false",
      "description": "可滚动容器滚到末尾时高亮最后一个有效目标。"
    },
    {
      "name": "collapseBelow",
      "type": "number",
      "description": "在该视口宽度（CSS px）及以下使用原生可折叠目录；较宽时保持展开。正常激活链接时收起，修饰点击不收起。"
    },
    {
      "name": "observe",
      "type": "boolean",
      "default": "true",
      "description": "自动刷新 DOM 增删、文本及相关属性变化；关闭后通过 ref.refresh() 重新采集。"
    },
    {
      "name": "offset",
      "type": "number | (() => number)",
      "default": "0",
      "description": "跳转与激活判定距离滚动容器顶部的像素偏移，可避开固定工具栏；也可用 getter 在跳转或测量时读取当前位置。"
    },
    {
      "name": "behavior",
      "type": "ScrollBehavior",
      "default": "\"smooth\"",
      "description": "点击目录时的滚动方式；系统偏好减少动画时改为 auto。"
    },
    {
      "name": "indent",
      "type": "number",
      "default": "12",
      "description": "每级缩进像素。平铺模式以最小层级为基准，最多缩进 12 级；嵌套模式按实际深度缩进。"
    },
    {
      "name": "variant",
      "type": "\"default\" | \"subtle\"",
      "default": "\"default\"",
      "description": "default 使用灰底活动项；subtle 使用细侧边标记。"
    },
    {
      "name": "emptyContent",
      "type": "ReactNode",
      "default": "null",
      "description": "没有匹配标题时的内容。"
    },
    {
      "name": "getLabel",
      "type": "(element: HTMLElement) => string",
      "default": "textContent.trim()",
      "description": "读取目录标题；空白标签不显示。"
    },
    {
      "name": "getLevel",
      "type": "(element: HTMLElement) => number",
      "default": "标题级别或 1",
      "description": "读取标题层级，默认从 h1-h6 标签读取；可与自定义 selector 搭配。"
    },
    {
      "name": "renderLabel",
      "type": "(item: TableOfContentsItem, active: boolean) => ReactNode",
      "description": "自定义链接内部显示内容，不应包含嵌套交互控件。"
    },
    {
      "name": "onActiveChange",
      "type": "(id: string | null) => void",
      "description": "活动标题改变时触发；没有可用标题时为 null。"
    },
    {
      "name": "onItemClick",
      "type": "(item: TableOfContentsItem, event: MouseEvent<HTMLAnchorElement>) => void",
      "description": "点击目录项时触发；event.preventDefault() 取消内置导航，便于自行接入路由。"
    },
    {
      "name": "ref",
      "type": "Ref<TableOfContentsHandle>",
      "description": "暴露 refresh() 手动重新采集标题；不是 nav DOM ref。"
    },
    {
      "name": "className / style / aria-label",
      "type": "HTMLAttributes<HTMLElement>",
      "description": "其余属性传给 nav；aria-label 默认“目录”，可按页面语言设置。"
    }
  ],
  "notes": [
      "同组相邻菜单或选项行之间保留 3px 间距；首项、分组标题和分隔线不额外增加间距。",
    "功能参考 Mantine，API 独立设计，不是其直接替代。组件支持按视口宽度启用原生折叠导航；固定定位和全文检索由应用处理。",
    "默认跳转不修改 location.hash，适合 hash 路由；Ctrl/Cmd 等修饰点击保留原生链接行为。需要分享固定锚点时应自行给标题指定稳定、唯一的 id。",
    "没有 id 的匹配元素会被分配唯一 id，并保留在 DOM 上。自动 id 不保证跨页面重新挂载稳定；已有 id 不改写。重复 authored id 仅保留第一个匹配标题，请保证全页面唯一。",
    "目录自己的标题与后代、hidden 元素及其后代、空白标签不会被采集；显示样式隐藏的标题需要通过 selector 或应用逻辑排除。",
    "默认层级仅影响平铺列表的缩进；listStyle 为 nested 时生成嵌套列表。aria-current=\"location\" 标记活动链接。内置跳转将焦点移至目标标题，自动添加的 tabindex 在失焦时移除；自定义链接不执行此焦点操作。",
    "滚动监听以当前滚动容器顶部加 offset 为阈值，按采集到的 DOM 顺序或 items 顺序取最后经过阈值的标题；尚未越过任何标题时使用 fallbackActiveId 或首项；可选滚动到底时激活末项。标题应按页面垂直阅读顺序排列。",
    "自动观察当前 root 中节点、文本和属性变化。React 重新渲染时会重新解析 root 与 scrollContainer getter；在 React 外部替换作用域或滚动容器后请调用 refresh()。",
    "未提供 items 时，initialItems 仅供服务端及首次渲染；挂载后以 DOM 为准。自定义 getLabel/getLevel 建议保持引用稳定。"
  ]
},
{
  "name": "Image",
  "description": "带加载占位、失败备用图和模态大图预览的图片。",
  "importNames": [
    "Image"
  ],
  "code": "import { Image } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return <Image src=\"/photo-small.jpg\" previewSrc=\"/photo-large.jpg\" alt=\"山间湖泊\" width={240} height={160} fallback=\"/placeholder.jpg\" />;\n}",
  "props": [
    {
      "name": "src",
      "type": "string",
      "description": "图片地址，必填。"
    },
    {
      "name": "alt",
      "type": "string",
      "description": "图片替代文本，也作为预览按钮和标题的说明。"
    },
    {
      "name": "width / height",
      "type": "number | string",
      "description": "图片和外层尺寸，建议显式设置以避免布局跳动。"
    },
    {
      "name": "fit",
      "type": "CSSProperties[\"objectFit\"]",
      "description": "缩略图适配方式；预览始终 contain。",
      "default": "cover"
    },
    {
      "name": "fallback",
      "type": "string",
      "description": "主图失败后尝试一次备用地址；备用图失败则显示错误内容。"
    },
    {
      "name": "placeholder / errorContent",
      "type": "ReactNode",
      "description": "自定义加载占位或失败内容，不应包含交互控件。",
      "default": "加载图标 / 本地化错误提示"
    },
    {
      "name": "preview",
      "type": "boolean",
      "description": "是否允许点击打开预览。",
      "default": "true"
    },
    {
      "name": "previewSrc",
      "type": "string",
      "description": "独立大图地址；缺省使用 src。"
    },
    {
      "name": "open / defaultOpen",
      "type": "boolean",
      "description": "受控打开状态或非受控初始状态。",
      "default": "false"
    },
    {
      "name": "onOpenChange",
      "type": "(open: boolean) => void",
      "description": "请求打开或关闭时调用；受控模式需由使用方更新 open。"
    },
    {
      "name": "wrapperClassName",
      "type": "string",
      "description": "外层样式类。"
    },
    {
      "name": "className / style / 原生 img 属性",
      "type": "ImgHTMLAttributes<HTMLImageElement>",
      "description": "传给内部 img；支持 loading、srcSet、onLoad、onError 等。"
    }
  ],
  "notes": [
    "图片展示与预览使用 mtone 自身的属性和交互，支持范围以此处文档和类型声明为准。",
    "预览提供 100%–500% 缩放（每次 50%）、90° 旋转、水平/垂直翻转和重置；放大后可通过指针拖动。",
    "预览支持 Escape 关闭、左右方向键切换、焦点约束及关闭后焦点返回；切换图片或重新打开会重置变换。",
    "不提供下载、双指捏合、自动轮播、任意工具栏/预览内容替换或网络加载百分比。图组以显式 items 定义，不收集嵌套子 Image。",
    "MtoneProvider locale 控制界面中文/英文。Image 本身不是按钮替代品；原生 img 事件作用于图片节点。"
  ]
},
{
    sidebarParent: "Image",
    sidebarSection: "groups",
  "name": "ImageGroup",
  "description": "使用显式图片数组展示缩略图，并在同一个预览器中前后切换。",
  "importNames": [
    "ImageGroup"
  ],
  "code": "import { ImageGroup } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return <ImageGroup items={[{src:\"/one.jpg\",alt:\"山谷\"},{src:\"/two.jpg\",alt:\"海岸\"}]} thumbnailWidth={120} thumbnailHeight={90} />;\n}",
  "props": [
    {
      "name": "items",
      "type": "readonly ImageItem[]；ImageItem = { src: string; alt?: string; previewSrc?: string; fallback?: string; crossOrigin?; referrerPolicy? }",
      "description": "必填；数组顺序就是展示及切换顺序。空数组不显示预览。"
    },
    {
      "name": "open / defaultOpen",
      "type": "boolean",
      "description": "受控打开状态或非受控初始状态。",
      "default": "false"
    },
    {
      "name": "onOpenChange",
      "type": "(open: boolean) => void",
      "description": "请求打开或关闭时调用；受控模式需由使用方更新 open。"
    },
    {
      "name": "current / defaultCurrent",
      "type": "number",
      "description": "受控索引或非受控初始索引，从 0 开始；超界索引会限制到有效范围。",
      "default": "0"
    },
    {
      "name": "onCurrentChange",
      "type": "(index: number) => void",
      "description": "点击缩略图或请求切换时调用；受控模式需更新 current。"
    },
    {
      "name": "thumbnailWidth / thumbnailHeight",
      "type": "number | string",
      "description": "缩略图尺寸。",
      "default": "120 / 90"
    },
    {
      "name": "className / style / 原生 div 属性",
      "type": "HTMLAttributes<HTMLDivElement>",
      "description": "传给外层缩略图容器。"
    }
  ],
  "notes": [
    "图片展示与预览使用 mtone 自身的属性和交互，支持范围以此处文档和类型声明为准。",
    "预览提供 100%–500% 缩放（每次 50%）、90° 旋转、水平/垂直翻转和重置；放大后可通过指针拖动。",
    "预览支持 Escape 关闭、左右方向键切换、焦点约束及关闭后焦点返回；切换图片或重新打开会重置变换。",
    "不提供下载、双指捏合、自动轮播、任意工具栏/预览内容替换或网络加载百分比。图组以显式 items 定义，不收集嵌套子 Image。",
    "到达首尾时停止切换，不循环。点击第几张就从该张打开；关闭后恢复到对应缩略图按钮。"
  ]
},
{
    sidebarParent: "Image",
    sidebarSection: "controlled",
  "name": "ImagePreview",
  "description": "独立、受控的模态图片预览器，可由任意业务按钮打开而不渲染缩略图。",
  "importNames": [
    "ImagePreview"
  ],
  "code": "import { useState } from \"react\";\nimport { Button, ImagePreview } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  const [open, setOpen] = useState(false);\n  return <><Button onClick={() => setOpen(true)}>打开图片</Button><ImagePreview items={[{src:\"/photo.jpg\",alt:\"山间湖泊\"}]} open={open} onOpenChange={setOpen} /></>;\n}",
  "props": [
    {
      "name": "items",
      "type": "readonly ImageItem[]；ImageItem = { src: string; alt?: string; previewSrc?: string; fallback?: string; crossOrigin?; referrerPolicy? }",
      "description": "必填；空数组不显示预览。"
    },
    {
      "name": "open",
      "type": "boolean",
      "description": "必填，受控打开状态。"
    },
    {
      "name": "onOpenChange",
      "type": "(open: boolean) => void",
      "description": "必填；关闭请求需由使用方更新 open。"
    },
    {
      "name": "current / defaultCurrent",
      "type": "number",
      "description": "受控索引或非受控初始索引，从 0 开始；超界会限制到有效范围。",
      "default": "0"
    },
    {
      "name": "onCurrentChange",
      "type": "(index: number) => void",
      "description": "请求切换图片时调用。"
    },
    {
      "name": "returnFocus",
      "type": "RefObject<HTMLElement | null>",
      "description": "关闭后的焦点目标；缺省由底层对话框恢复先前焦点。"
    },
    {
      "name": "closeOnBackdrop",
      "type": "boolean",
      "description": "是否允许点击外侧遮罩或画布空白关闭；点击图片或拖动不会关闭。",
      "default": "true"
    },
    {
      "name": "className",
      "type": "string",
      "description": "传给预览对话框。"
    }
  ],
  "notes": [
    "图片展示与预览使用 mtone 自身的属性和交互，支持范围以此处文档和类型声明为准。",
    "预览提供 100%–500% 缩放（每次 50%）、90° 旋转、水平/垂直翻转和重置；放大后可通过指针拖动。",
    "预览支持 Escape 关闭、左右方向键切换、焦点约束及关闭后焦点返回；切换图片或重新打开会重置变换。",
    "不提供下载、双指捏合、自动轮播、任意工具栏/预览内容替换或网络加载百分比。图组以显式 items 定义，不收集嵌套子 Image。",
    "使用 Base UI 模态对话框并通过 Portal 挂载。预览关闭后不保留缩放和拖动位置。"
  ]
},
{
  "name": "Timeline",
  "description": "紧凑的时间线，支持横向、纵向、交替排列、标题、加载节点及倒序。",
  "importNames": [
    "Timeline"
  ],
  "code": "import { Timeline } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n return <Timeline items={[{title:\"09:00\",content:\"已创建\",color:\"green\"},{content:\"处理中\",loading:true}]} />;\n}",
  "props": [
    {
      "name": "items",
      "type": "readonly TimelineItem[]",
      "default": "[]",
      "description": "节点数组，支持 key、title、content、icon、color、loading、placement、className、style 及 li 属性。"
    },
    {
      "name": "mode",
      "type": "\"start\" | \"end\" | \"alternate\"",
      "default": "start",
      "description": "内容侧边；start 为逻辑起点轴后，end 在轴前，alternate 交替。兼容 left/right。"
    },
    {
      "name": "orientation",
      "type": "\"vertical\" | \"horizontal\"",
      "default": "vertical",
      "description": "水平布局在窄容器内部滚动。"
    },
    {
      "name": "reverse",
      "type": "boolean",
      "default": "false",
      "description": "倒序展示，不修改输入数组。"
    },
    {
      "name": "variant",
      "type": "\"outlined\" | \"filled\"",
      "default": "outlined",
      "description": "默认节点的描边/实心样式。"
    },
    {
      "name": "titleSpan",
      "type": "number | string",
      "default": "120px（窄屏72px）",
      "description": "纵向 start 布局标题宽度，上限40%；数字表示px，不是栅格份数。"
    },
    {
      "name": "pending / pendingDot",
      "type": "ReactNode",
      "description": "兼容末尾待办节点和图标；推荐显式 item.loading。倒序时待办节点位于开头。"
    },
    {
      "name": "classNames / styles",
      "type": "Partial<Record<TimelineSemantic, string / CSSProperties>>",
      "description": "对象形式的 root/item/tail/icon/title/content 样式。"
    },
    {
      "name": "原生属性 / ref",
      "type": "HTMLAttributes<HTMLOListElement> / Ref<HTMLOListElement>",
      "description": "支持 ol 属性；节点支持 li 属性。"
    }
  ],
  "notes": [
    "使用 mtone 中性灰节点，可用 blue/red/green/gray 或 CSS 颜色。",
    "节点支持 content/title/icon/placement，并兼容 children/label/dot/position；新属性优先。自定义 icon 是装饰内容，不应放交互控件。",
    "通过 aria-busy 标记加载项，读屏顺序与显示顺序一致。无自动播报、事件编辑或拖拽调度。",
    "titleSpan 仅控制纵向 start 布局；end/alternate 居中。styles/classNames 仅支持对象，不支持回调。"
  ]
},
{
 name: "Affix", description: "将操作栏固定到窗口或滚动容器的顶部、底部，并保留原位置占位。",
 importNames: ["Affix", "Button"],
 code: 'import { Affix, Button } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() { return <Affix offsetTop={16}><Button>保存</Button></Affix>; }',
 props: [
 { name: "offsetTop", type: "number", default: "0（未提供 offsetBottom 时）", description: "到目标顶部的像素偏移，同时提供时优先于 offsetBottom。" },
 { name: "offsetBottom", type: "number", description: "到目标底部的像素偏移；仅在未指定 offsetTop 时生效。" },
 { name: "target", type: "() => Window | HTMLElement | null", default: "() => window", description: "滚动目标；null 暂不固定，重新渲染后重新解析。容器按边框内的可视区域计算。" },
 { name: "onChange", type: "(affixed: boolean) => void", description: "仅固定状态变化时调用，不在初始未固定状态调用。" },
 { name: "children", type: "ReactNode", description: "被固定的内容，应参与常规文档流。" },
 { name: "ref / className / style / HTML 属性", type: "HTMLDivElement / string / CSSProperties", description: "作用于外层占位容器；固定时高度由内容测量值管理。" }
 ],
 notes: ["支持窗口及嵌套垂直滚动、窗口/容器/内容尺寸变化。监听祖先滚动以更新目标位置。", "使用 position: fixed，不是 position: sticky；内容可能超出滚动容器，不做容器裁剪。不要用于 transform/filter/perspective 或 contain 创建固定包含块的祖先中。", "仅支持垂直滚动；子元素不要使用 absolute/fixed 脱离文档流，外层避免 padding/border、显式高度及高度依赖百分比的子元素。", "自定义 --mt-affix-z-index 可调整固定层叠级别（默认 10）；小屏时确保不遮挡关键内容。", "SSR 输出普通文档流，挂载测量后才固定。target 引用改变后需触发渲染；不提供命令式实例方法。"]
},

{
  "name": "Result",
  "description": "操作结果页：状态图标、标题、说明、动作与详细内容，沿用 mtone 紧凑风格。",
  "importNames": [
    "Result",
    "Button"
  ],
  "code": "import { Result, Button } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return <Result status=\"success\" title=\"保存成功\" subTitle=\"你的修改已保存。\" extra={<Button>继续编辑</Button>} />;\n}",
  "props": [
    {
      "name": "status",
      "type": "\"success\" | \"error\" | \"info\" | \"warning\" | \"403\" | \"404\" | \"500\"",
      "default": "info",
      "description": "状态决定默认图标与配色。403/404/500 使用简洁线性图标，不附带插画或自动标题。"
    },
    {
      "name": "title / subTitle",
      "type": "ReactNode",
      "description": "标题和辅助说明；支持富文本与数字 0，未传入不渲染该区域。"
    },
    {
      "name": "icon",
      "type": "ReactNode",
      "description": "覆盖默认图标；null 或 false 隐藏图标。"
    },
    {
      "name": "extra / children",
      "type": "ReactNode",
      "description": "操作区与详细内容区，传入本库 Button 等内容。"
    },
    {
      "name": "classNames / styles",
      "type": "Partial<Record<ResultSemantic, string | CSSProperties>> | callback",
      "description": "分别传 class 字符串或样式对象；语义键 root/icon/title/subTitle/extra/body。回调接收 { props }，status 已解析默认值。"
    },
    {
      "name": "ref / 原生 div 属性",
      "type": "Ref<HTMLDivElement> / HTMLAttributes<HTMLDivElement>",
      "description": "转发 ref、id、aria-*、role 等；原生 title 属性由 ReactNode 标题取代。className 与 root 类合并，style 覆盖 styles.root。"
    }
  ],
  "notes": [
    "Result 是静态反馈布局，不会自动抢焦点或宣读。动态状态可显式设置 role=\"status\" 或 aria-live；错误详情需由业务提供。",
    "title 默认是 div，不假定页面标题层级；可传入合适的 h1/h2。",
    "状态色可用 --mt-result-success/error/info/warning 覆盖。",
    "默认图标为装饰性 SVG；自定义图标的无障碍标签由调用者负责。"
  ]
},
{
  "name": "Popconfirm",
  "description": "轻量的锚定确认浮层，支持异步确认、失败重试、键盘操作和边界避让。",
  "importNames": [
    "Popconfirm",
    "Button"
  ],
  "code": "import { Popconfirm, Button } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return <Popconfirm trigger={<Button danger>移除</Button>} title=\"确认移除？\" description=\"请核对后再执行。\" onConfirm={() => Promise.resolve()} />;\n}",
  "props": [
    {
      "name": "trigger",
      "type": "ReactElement",
      "description": "必填；触发元素，应是可聚焦按钮，并转发 ref、事件和 aria 属性。"
    },
    {
      "name": "title / description",
      "type": "ReactNode | (() => ReactNode)",
      "description": "确认标题必填，可选补充说明。"
    },
    {
      "name": "icon",
      "type": "ReactNode",
      "description": "标题前图标；null 隐藏。",
      "default": "问号图标"
    },
    {
      "name": "open / defaultOpen / onOpenChange",
      "type": "boolean / boolean / (open: boolean) => void",
      "description": "受控或非受控显示状态。受控模式由父组件更新 open。",
      "default": "false"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "description": "禁用触发和确认，并隐藏浮层。",
      "default": "false"
    },
    {
      "name": "placement",
      "type": "\"top\" | \"topLeft\" | \"topRight\" | \"bottom\" | \"bottomLeft\" | \"bottomRight\" | \"left\" | \"leftTop\" | \"leftBottom\" | \"right\" | \"rightTop\" | \"rightBottom\"",
      "description": "十二个锚定方向。",
      "default": "top"
    },
    {
      "name": "arrow / autoAdjustOverflow",
      "type": "boolean",
      "description": "箭头和屏幕边缘自动翻转/平移避让。",
      "default": "true / true"
    },
    {
      "name": "okText / cancelText / showCancel",
      "type": "ReactNode / ReactNode / boolean",
      "description": "按钮文本及是否显示取消。",
      "default": "确定 / 取消 / true（英文为 OK / Cancel）"
    },
    {
      "name": "okButtonProps / cancelButtonProps",
      "type": "Omit<ButtonProps, \"onClick\" | \"children\">",
      "description": "复用 mtone Button；确认默认为 solid，小尺寸。"
    },
    {
      "name": "onConfirm",
      "type": "(event: MouseEvent<HTMLButtonElement>) => void | boolean | Promise<void | boolean>",
      "description": "确认回调；返回 false 或 resolve(false) 保持打开，其他成功结果关闭；Promise 自动进入 loading。"
    },
    {
      "name": "onCancel",
      "type": "(event: MouseEvent<HTMLButtonElement>) => void",
      "description": "仅点击取消按钮触发；preventDefault() 可保持打开。Escape/外部点击仅请求 onOpenChange(false)。"
    },
    {
      "name": "onConfirmError / errorText",
      "type": "(error: unknown) => void / ReactNode",
      "description": "同步抛错或 Promise 拒绝时保持打开并显示错误提示，可自定义文案和错误处理。"
    },
    {
      "name": "onPopupClick / className / style",
      "type": "MouseEventHandler<HTMLDivElement> / string / CSSProperties",
      "description": "浮层点击事件及样式。"
    }
  ],
  "notes": [
    "异步操作期间禁用按钮、外部点击和 Escape 关闭，防止重复请求。父组件仍可通过 open 强制关闭；旧 Promise 不会影响重新打开的确认。",
    "弹层使用 portal 和本库主题上下文，关闭后恢复触发焦点；默认聚焦安全的取消按钮。",
    "使用 trigger 元素而非 children；不支持 hover/contextMenu 或多种触发数组，外观使用 mtone 主题变量。",
    "拒绝结果显示通用本地化错误而不直接暴露异常内容，业务可通过 errorText 与 onConfirmError 提供反馈。"
  ]
},
{
  "name": "Rate",
  "description": "紧凑的星级评分，支持半星、受控值、键盘操作与自定义字符。",
  "importNames": [
    "Rate"
  ],
  "code": "import { useState } from \"react\";\nimport { Rate } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  const [value, setValue] = useState(3.5);\n  return <Rate aria-label=\"体验评分\" value={value} onChange={setValue} allowHalf\n    tooltips={[\"不满意\", \"一般\", \"还不错\", \"满意\", \"非常满意\"]} />;\n}",
  "props": [
    {
      "name": "value / defaultValue",
      "type": "number",
      "default": "defaultValue=0",
      "description": "受控或非受控评分。有限数值会限制到 [0, count]，按 1 或 0.5 四舍五入；非有限值抛出 RangeError。"
    },
    {
      "name": "onChange",
      "type": "(value: number) => void",
      "description": "用户提交不同分数时回调；悬停、程序改值和边界处重复按键不触发。受控时父组件需更新 value。"
    },
    {
      "name": "count",
      "type": "number",
      "default": "5",
      "description": "字符数量，必须为正整数，否则抛出 RangeError。"
    },
    {
      "name": "allowHalf",
      "type": "boolean",
      "default": "false",
      "description": "允许 0.5 步长。指针命中字符前半区域选半星；从右向左时前半区域在右侧。"
    },
    {
      "name": "allowClear",
      "type": "boolean",
      "default": "true",
      "description": "再次点击相同分数或用 Home/Delete/Backspace 清零；false 时交互最低分为一个步长，但允许初始或受控值为 0。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "只读展示，禁用点击、悬停预览、键盘与自动聚焦，并移出 Tab 序列。"
    },
    {
      "name": "keyboard",
      "type": "boolean",
      "default": "true",
      "description": "方向键增减，Home/End 跳到边界，Delete/Backspace 在允许时清除。false 仅关闭内置快捷键，不影响指针操作或 Tab 聚焦。"
    },
    {
      "name": "size",
      "type": "'small' | 'medium' | 'large'",
      "default": "'medium'",
      "description": "字符尺寸分别为 16 / 20 / 24px。窄容器中按完整字符换行，不压缩命中区域。"
    },
    {
      "name": "character",
      "type": "React.ReactNode | ((info: RateCharacterInfo) => React.ReactNode)",
      "description": "替换默认实心星形；info 包括从 0 开始的 index、已提交 value、包含悬停的 displayValue、count、disabled。仅放纯展示内容。"
    },
    {
      "name": "tooltips",
      "type": "readonly string[]",
      "description": "按字符顺序对应提示文案，悬停或聚焦时显示，Escape 可关闭；浮层复用本库定位，传送到 portal 并避让视口边缘。当前已选项文案加入 aria-valuetext。半星使用对应整颗字符的文案。"
    },
    {
      "name": "onHoverChange",
      "type": "(value: number | undefined) => void",
      "description": "预览分数改变时触发；离开、取消、失焦或提交后回调 undefined。触屏不产生悬停预览。"
    },
    {
      "name": "autoFocus",
      "type": "boolean",
      "default": "false",
      "description": "启用时聚焦根元素（disabled 时不聚焦）。"
    },
    {
      "name": "ref",
      "type": "React.Ref<HTMLSpanElement>",
      "description": "根元素引用，支持 focus()、blur() 和 DOM 测量。"
    },
    {
      "name": "dir / tabIndex / onFocus / onBlur / onKeyDown",
      "type": "原生 span 属性与事件",
      "description": "支持继承 RTL；消费者 onKeyDown.preventDefault() 可阻止内置快捷键。aria-label、aria-labelledby、aria-valuetext 可自定义。"
    },
    {
      "name": "className / style",
      "type": "string / React.CSSProperties",
      "description": "根元素样式。可设置 --mt-rate-color、--mt-rate-empty-color、--mt-rate-size、--mt-rate-gap；默认填充为 mtone 中性主色，焦点为单层细线。"
    }
  ],
  "notes": [
    "单个 slider Tab 停靠点支持 0 和半星；读屏值描述使用已提交分数，不播报未确认的鼠标预览。未提供标签时按 MtoneProvider locale 使用“评分”或“Rating”；推荐给多个实例设置不同 aria-label。",
    "字符绘制两层以裁剪半星。自定义字符是固定方形中的纯展示内容，长文本会裁剪；请勿包含交互元素、有副作用组件或重复 DOM id。没有拖拽评分或表单隐藏字段；需要表单时通过 value/onChange 绑定。",
    "tooltips 只接收字符串数组；character 函数接收明确的 RateCharacterInfo，不接收完整 RateProps。外观使用 mtone 主题变量。",
    "数值按配置步长归一化（关闭半星时 2.5 显示为 3）；动态 count/allowHalf/value 变化会重算显示并清除旧预览，不触发 onChange。非受控初始值仅首次挂载读取。",
    "自 0.4.0 提供；文档站跟随 master，使用前请检查所安装版本的导出与类型。"
  ]
},
{
  "name": "Calendar",
  "description": "使用 mtone 样式展示月历、年度概览与日期内容，支持完整面板及紧凑卡片。",
  "importNames": [
    "Calendar"
  ],
  "code": "import { useState } from \"react\";\nimport { Calendar } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  const [value, setValue] = useState(\"2026-11-16\");\n  return <Calendar aria-label=\"项目日历\" value={value} onChange={setValue}\n    cellRender={(date, info) => info.type === \"date\" && date === \"2026-11-16\" ? \"版本计划\" : null} />;\n}",
  "props": [
    {
      "name": "value / defaultValue",
      "type": "string",
      "description": "受控日期 / 非受控初始日期；严格 YYYY-MM-DD，年份 0001–9999（不支持 0000）。",
      "default": "当天"
    },
    {
      "name": "onChange / onValueChange",
      "type": "(date: string) => void",
      "description": "日期确实变化时触发；两者都提供时都会调用。onValueChange 提供本库惯用命名。"
    },
    {
      "name": "mode / defaultMode",
      "type": "\"month\" | \"year\"",
      "description": "受控面板模式 / 非受控初始面板模式。",
      "default": "month"
    },
    {
      "name": "onPanelChange",
      "type": "(date: string, mode: CalendarMode) => void",
      "description": "头部导航、跨面板选择或模式切换时触发；键盘仅移动焦点不触发选择。"
    },
    {
      "name": "onSelect",
      "type": "(date: string, info: { source: \"date\" | \"month\" | \"year\" | \"customize\" }) => void",
      "description": "选择事件及触发来源。"
    },
    {
      "name": "validRange",
      "type": "readonly [string, string]",
      "description": "包含首尾日期的可选范围。"
    },
    {
      "name": "disabledDate",
      "type": "(date: string) => boolean",
      "description": "返回 true 的日期不可选择，绘制禁用状态。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "description": "禁用日历交互。",
      "default": "false"
    },
    {
      "name": "fullscreen",
      "type": "boolean",
      "description": "完整月历或紧凑卡片布局，并非浏览器全屏 API。",
      "default": "true"
    },
    {
      "name": "showWeek",
      "type": "boolean",
      "description": "月视图显示每一行周四所属的 ISO 周编号，与 weekStartsOn 独立。",
      "default": "false"
    },
    {
      "name": "locale",
      "type": "\"zh\" | \"en\"",
      "description": "覆盖 Provider 的中英文文案。",
      "default": "MtoneProvider locale"
    },
    {
      "name": "weekStartsOn",
      "type": "0 | 1 | 2 | 3 | 4 | 5 | 6",
      "description": "每周起始日，0 为周日。中文默认 1（周一），英文默认 0（周日）。"
    },
    {
      "name": "cellRender / fullCellRender",
      "type": "(date: string, info: CalendarCellInfo) => React.ReactNode",
      "description": "追加内容 / 替换内部内容；info 包含 type、originNode、today。"
    },
    {
      "name": "headerRender",
      "type": "(info: CalendarHeaderInfo) => React.ReactNode",
      "description": "自定义头部，参数包含 value、type、onChange(date)、onTypeChange(mode)。"
    },
    {
      "name": "classNames / styles",
      "type": "Partial<Record<CalendarSemanticSlot, string>> / Partial<Record<CalendarSemanticSlot, React.CSSProperties>>",
      "description": "语义部位 root、header、body、cell 的样式覆盖。"
    },
    {
      "name": "原生 div 属性",
      "type": "React.HTMLAttributes<HTMLDivElement>",
      "description": "支持 aria-label、className、style 等；onChange/onSelect 改用上述日期回调。"
    }
  ],
  "notes": [
    "日期值和所有日期回调均使用 YYYY-MM-DD 字符串，与 DatePicker 一致；无效 value/defaultValue 或无效、倒置 validRange 会抛出 RangeError。默认初始值会收敛到范围内；自定义头部 onChange 的越界值先收敛再检查 disabledDate，无效字符串忽略。可用年份为 0001–9999；边缘网格越出此范围的日期显示空单元格。不接收 Dayjs 或 Date 对象。此组件自 0.4.0 提供；请以已安装版本声明为准。",
    "默认头部使用本库 Select 和 Button，保留紧凑样式与 Provider 主题。导航对应日不可选时改选目标月首个可用日；该月全禁用时不改变值。month 展示日期，year 展示月份；选择月份不会自动切换模式。受控 value 必须由调用方接受回调并更新；拒绝更新则保留已选日期及选择前面板（键盘仍可独立移动焦点）。",
    "方向键移动焦点，Home / End 定位行边缘，Page Up / Page Down 翻页，Enter / Space 选择。Shift + Page Up / Page Down 按年翻页。Tab 正常离开网格。禁用日期不可选择。键盘沿目标方向跳过禁用日期或月份，最多探测 366 步；没有可用项则保持原焦点。",
    "cellRender 在日期或月份数字后追加内容；fullCellRender 替换单元格内部内容并优先于 cellRender，组件保留可访问按钮。不要在渲染内容内嵌套按钮、链接或输入框。",
    "仅单日期公历展示和选择；不内置日期范围多选、时间选择、农历换算、拖拽日程、网络请求或日程持久化。农历文字、事件列表等可通过单元格回调自行计算展示。",
    "不支持 Dayjs locale、dateCellRender/monthCellRender 或函数式 semantic styles。使用 MtoneProvider、locale、cellRender/fullCellRender 及对象形式 classNames/styles。"
  ]
},
{
  "name": "Mentions",
  "description": "紧凑的纯文本提及输入框，支持光标候选、多个触发符、键盘选择与异步搜索。",
  "importNames": [
    "Mentions",

    "getMentions"
  ],
  "code": "import { useState } from \"react\";\nimport { Mentions, getMentions } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  const [value, setValue] = useState(\"\");\n  return (\n    <>\n      <Mentions\n        aria-label=\"评论\"\n        value={value}\n        onChange={setValue}\n        options={[{ value: \"alice\", label: \"Alice\" }, { value: \"bob\", label: \"Bob\" }]}\n        placeholder=\"输入 @ 提及成员\"\n        allowClear\n        autoSize={{ minRows: 2, maxRows: 5 }}\n      />\n      <p>{getMentions(value).length} 个提及</p>\n    </>\n  );\n}",
  "props": [
    {
      "name": "value / defaultValue",
      "type": "string",
      "description": "受控值 / 初始纯文本；value 为受控时需在 onChange 中更新。",
      "default": "defaultValue: \"\""
    },
    {
      "name": "onChange",
      "type": "(value: string) => void",
      "description": "文本编辑、选择和清空后返回字符串，不是 textarea 的 ChangeEvent。"
    },
    {
      "name": "options",
      "type": "MentionOption[]",
      "description": "候选项 { value: string; label?: ReactNode; key?: React.Key; disabled?: boolean; className?: string; style?: CSSProperties }；value 是插入文本，label 只用于显示。",
      "default": "[]"
    },
    {
      "name": "prefix",
      "type": "string | string[]",
      "description": "触发符，可用 @、# 或多字符符号；必须位于文本开始、空白或 split 之后，因此不会在邮箱内部触发。",
      "default": "\"@\""
    },
    {
      "name": "split",
      "type": "string",
      "description": "选择后追加的分隔符，右侧已有相同分隔符则不重复添加；也用于查询边界判断。",
      "default": "\" \""
    },
    {
      "name": "onSearch",
      "type": "(text: string, prefix: string) => void",
      "description": "候选打开或有效查询变化时通知；不内置请求、缓存或取消。异步数据由调用方处理，并防止过期响应覆盖。"
    },
    {
      "name": "onSelect",
      "type": "(option: MentionOption, prefix: string) => void",
      "description": "选择候选项后的通知，替代原生 textarea 的 onSelect；不返回 DOM 事件。"
    },
    {
      "name": "filterOption",
      "type": "false | ((input: string, option: MentionOption) => boolean)",
      "description": "默认按 option.value 忽略大小写包含匹配；false 关闭本地过滤，适用于服务端筛选。"
    },
    {
      "name": "validateSearch",
      "type": "(text: string, split: string) => boolean",
      "description": "控制查询是否有效；默认遇到空白或 split 关闭候选。自定义校验替换默认查询校验，但不改变触发符边界。"
    },
    {
      "name": "loading / notFoundContent",
      "type": "boolean / ReactNode",
      "description": "加载中不允许选择；空候选内容可自定义，默认文案随 MtoneProvider locale 切换。",
      "default": "loading: false"
    },
    {
      "name": "placement",
      "type": "\"top\" | \"bottom\"",
      "description": "相对光标的优先位置；可用空间不足时自动翻转并约束到视口。",
      "default": "\"bottom\""
    },
    {
      "name": "getPopupContainer",
      "type": "() => HTMLElement",
      "description": "返回弹层挂载节点；默认 document.body。建议使用未受 transform / filter / perspective 影响的容器。"
    },
    {
      "name": "popupRender",
      "type": "(menu: React.ReactElement) => ReactNode",
      "description": "包装完整候选弹层；保留传入 menu 以维持关联 id、角色和定位。"
    },
    {
      "name": "onPopupScroll",
      "type": "React.UIEventHandler<HTMLDivElement>",
      "description": "候选弹层滚动事件，可由应用加载更多项；没有内置虚拟列表。"
    },
    {
      "name": "size / status",
      "type": "\"sm\" | \"md\" | \"lg\" / \"error\" | \"warning\"",
      "description": "mtone 尺寸与验证状态；error 也设置 aria-invalid。",
      "default": "size: \"md\""
    },
    {
      "name": "autoSize",
      "type": "boolean | { minRows?: number; maxRows?: number }",
      "description": "按内容调整高度，达到 maxRows 后滚动；默认最小行数取 rows。",
      "default": "false"
    },
    {
      "name": "allowClear",
      "type": "boolean | { clearIcon?: ReactNode; label?: string; tabIndex?: number }",
      "description": "显示有可访问名称的清空按钮；禁用或只读时隐藏。",
      "default": "false"
    },
    {
      "name": "onClear",
      "type": "() => void",
      "description": "清空按钮点击后通知，同时触发 onChange(\"\")。"
    },
    {
      "name": "className / style",
      "type": "string / React.CSSProperties",
      "description": "根包装元素样式；textarea 样式使用 classNames.textarea / styles.textarea。"
    },
    {
      "name": "classNames / styles",
      "type": "Partial<Record<MentionsSemantic, string>> / Partial<Record<MentionsSemantic, React.CSSProperties>>",
      "description": "静态语义样式对象，键为 root、textarea、popup、option、clear；不支持回调形式。"
    },
    {
      "name": "ref",
      "type": "React.Ref<MentionsRef>",
      "description": "提供 nativeElement: HTMLTextAreaElement | null、focus(options?: FocusOptions)、blur()。"
    },
    {
      "name": "native textarea attributes",
      "type": "Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, \"value\" | \"defaultValue\" | \"onChange\" | \"onSelect\" | \"prefix\" | \"children\">",
      "description": "支持 id、name、rows、placeholder、disabled、readOnly、maxLength、required、onFocus/onBlur、aria-label 等。务必提供 label 或 aria-label。",
      "default": "rows: 3"
    },
    {
      "name": "getMentions(value, config?)",
      "type": "(value: string, config?: { prefix?: string | string[]; split?: string }) => { prefix: string; value: string }[]",
      "description": "单独导出的解析函数，不是静态方法；使用相同边界规则，不检查候选成员资格或服务端权限。"
    }
  ],
  "notes": [
      "同组相邻菜单或选项行之间保留 3px 间距；首项、分组标题和分隔线不额外增加间距。",
    "相关类型：MentionsProps、MentionOption、MentionsRef、MentionsSemantic。此组件自 0.4.0 提供；请以已安装版本声明为准。",
    "这是原生 textarea 上的纯文本补全，不是富文本 token 编辑器。选项使用 options；不支持 Mentions.Option、children 选项、variant 或函数式语义样式；尺寸使用 sm/md/lg，主题通过 MtoneProvider 配置。",
    "↑ / ↓ 在可用候选间循环，Enter 插入当前项，Escape 关闭，Tab 关闭并正常切换焦点；输入法组合期间不会选择候选。Home/End 保留文本编辑行为。选中一段文本时不弹出建议。",
    "插入替换光标之前的当前触发符和查询，保留光标之后的文本；超出 maxLength 时不插入，不截断候选。不会把已有提及变成不可分割的标签。默认查询禁止空白，含空格的实体值不适合默认解析规则。",
    "异步示例只模拟本地延迟，不发送网络请求。业务端须自行请求、处理错误、取消或忽略旧响应；loading 时不会选中旧候选，filterOption={false} 可保留服务端排序。",
    "Form.Item 可直接绑定字符串 value/onChange。原生表单 reset 会恢复非受控 defaultValue，受控值仍由应用管理。getMentions 只解析文本，不能替代成员校验或权限检查。",
    "候选使用灰色背景高亮，不加蓝色边框。弹层挂到 document.body 时通过 MtoneProvider 继承 tokens/颜色主题；自定义 popupRender 应保留完整 menu 与可访问语义。复杂变换容器、自定义候选内容需在目标布局验证。"
  ]
},
{
  "name": "Splitter",
  "description": "可拖动的紧凑分栏布局，支持横向、纵向、受控大小和可折叠面板。",
  "importNames": [
    "Splitter"
  ],
  "code": "import { useState } from \"react\";\nimport { Splitter } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  const [sizes, setSizes] = useState<Array<number | `${number}%` | `${number}px`>>([\"30%\", \"70%\"]);\n  return (\n    <Splitter style={{ height: 280 }} sizes={sizes} onResize={setSizes}>\n      <Splitter.Panel id=\"navigation\" label=\"导航\" min=\"15%\" collapsible>\n        <div style={{ padding: 12 }}>导航内容</div>\n      </Splitter.Panel>\n      <Splitter.Panel id=\"content\" label=\"正文\" min=\"30%\" collapsible>\n        <div style={{ padding: 12 }}>正文内容</div>\n      </Splitter.Panel>\n    </Splitter>\n  );\n}",
  "props": [
    {
      "name": "children",
      "type": "Splitter.Panel elements",
      "description": "面板直接子元素，可使用 Fragment 和条件渲染；支持多个面板及在面板内嵌套另一个 Splitter。"
    },
    {
      "name": "orientation",
      "type": "'horizontal' | 'vertical'",
      "default": "'horizontal'",
      "description": "横向并排或纵向堆叠。容器必须有可测量的宽高。"
    },
    {
      "name": "sizes",
      "type": "SplitterSize[]",
      "description": "整个布局的受控大小，按面板顺序一一对应；数量必须与面板数一致。数值为 px，字符串仅支持明确的 % 或 px。"
    },
    {
      "name": "onResize",
      "type": "(sizes: number[]) => void",
      "description": "用户拖动、键盘或折叠交互中的大小请求，数组值为像素。受控时父组件接受并更新 sizes；不在首次挂载、容器变化或受控值同步时触发。"
    },
    {
      "name": "onResizeStart / onResizeEnd",
      "type": "(sizes: number[]) => void",
      "description": "交互开始/结束回调；结束在后续帧报告最终接受/约束后的像素大小，无变化的交互也会结束。"
    },
    {
      "name": "onCollapse",
      "type": "(collapsed: boolean[], sizes: number[]) => void",
      "description": "实际折叠状态变化回调（包括程序更新受控值），初次挂载不触发；数组按面板顺序对应。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "禁用整个布局的交互调整。"
    },
    {
      "name": "lazy",
      "type": "boolean",
      "default": "false",
      "description": "拖拽期间显示分隔条预览，释放时调整面板，避免每次移动都重排重内容。"
    },
    {
      "name": "onDraggerDoubleClick",
      "type": "(index: number) => void",
      "description": "鼠标双击/触屏双击分隔条通知，index 为分隔条索引，同时执行内建折叠循环；Enter 执行循环但不触发此指针通知。不是取消默认行为的回调。旧版自行重置 sizes 的处理器需避免与内建循环竞争。"
    },
    {
      "name": "Splitter.Panel.id",
      "type": "string",
      "description": "稳定且唯一的面板标识。动态增删、重排时应显式提供，不要用会变化的位置作为标识。"
    },
    {
      "name": "Splitter.Panel.label",
      "type": "string",
      "description": "面板的可访问名称，建议使用内容含义，如导航、编辑区、预览。"
    },
    {
      "name": "Splitter.Panel.defaultSize",
      "type": "SplitterSize",
      "description": "非受控初始大小。后续更改不会替代受控 sizes；重置可更新受控数组或重新挂载。"
    },
    {
      "name": "Splitter.Panel.min / max",
      "type": "SplitterSize",
      "description": "面板最小/最大大小约束。默认 min 为 0，可折叠面板默认为 10%；max 默认 100%。数字为 px，字符串仅支持明确的 % 或 px。"
    },
    {
      "name": "Splitter.Panel.resizable",
      "type": "boolean",
      "default": "true",
      "description": "是否允许调整此面板。"
    },
    {
      "name": "Splitter.Panel.collapsible",
      "type": "boolean",
      "default": "false",
      "description": "允许分隔条循环折叠此面板，无额外按钮。相邻两侧均可折叠时依次收起前一个、恢复初始比例、收起后一个、再收起前一个；仅一侧可折叠则在收起/恢复之间切换。配合 min 明确展开后的最小尺寸。"
    },
    {
      "name": "Splitter.Panel.collapsedSize",
      "type": "SplitterSize",
      "default": "0",
      "description": "折叠后的大小，可以保留窄栏而不是完全隐藏。"
    },
    {
      "name": "Splitter.Panel.groupResizeBehavior",
      "type": "'preserve-relative-size' | 'preserve-pixel-size'",
      "default": "'preserve-relative-size'",
      "description": "容器尺寸改变时优先保留相对比例，或尽量保留像素大小；仍受约束影响。至少一个面板必须保留相对大小，全部设为 preserve-pixel-size 会报错。"
    },
    {
      "name": "原生属性 / className / style",
      "type": "HTMLAttributes<HTMLDivElement>",
      "description": "根节点和 Panel 支持适用的原生属性及样式；Splitter 的 onResize 是布局回调而非 DOM UIEvent。不要覆盖内部必需的布局样式。"
    }
  ],
  "notes": [
    "无独立折叠按钮。鼠标双击、触屏双击分隔条或聚焦后按 Enter 执行相邻面板循环；前/后按渲染顺序定义，纵向和 RTL 同样适用。两侧都不可折叠则不改变布局；disabled 或任一相邻面板不可调整时禁用此边界交互。",
    "初始比例来自首次布局稳定后相邻两个面板的实际尺寸；恢复将此比例应用到当前两者总尺寸，其他面板不变。手动拖动/方向键调整会重启循环，但不改写初始比例；面板标识/顺序变化重新记录。受控父组件不接受请求时不推进循环。",
    "折叠和恢复仍受其他面板的 min/max 约束。若希望任意一侧完全收起，另一侧必须允许占满剩余空间；例如不要给另一侧设置 55% 的 max。",
    "所有大小数值均为 px；字符串必须带 % 或 px，如 240、'240px'、'30%'。不接受裸数字字符串、负数、NaN 或其他单位。回调返回像素，不是百分比。",
    "sizes 为整个布局受控数组，不支持 Panel.size。父组件需要在 onResize 中接受请求并更新；动态面板变化时同时更新数组长度与顺序。",
    "受控 sizes 先换算为像素，再按总和归一化填满可用面板空间（不含分隔条）。因此 [100,100] 表示等分，不保证各为 100px；总和应匹配实际空间才能精确表达像素请求。所有值为 0 无效。受控值会优先于容器变化的自动策略。",
    "显式提供稳定唯一 id 可在动态增删/重排中识别面板。只支持直接 Splitter.Panel（含 Fragment）；不要在 Panel 外另包 div 或自定义包装组件。",
    "min/max、容器可用尺寸与总布局必须协调。无效单位和同单位 min 大于 max 会报错；空间不足或相互冲突时引擎会调整布局以填满可用区域，不保证所有不可能同时满足的约束。",
    "这是基于 react-resizable-panels 的 mtone 封装。没有 Panel.size、layout/vertical 别名、动画配置或 destroyOnHidden；样式通过根节点和面板的 className/style 设置。",
    "Esc 或 pointercancel 撤销本次拖动并请求回到开始大小；窗口失焦提交最后有效大小。lazy 模式在释放时发出大小请求，取消时发回滚请求。0 大小面板保留挂载内容，但会 inert/aria-hidden，不参与交互。",
    "按需保存布局由宿主负责；示例只保留当前页面状态，不做服务器或浏览器持久化。库已包含所需依赖，使用者无需单独安装拖拽组件。"
  ]
},
{
  "name": "Spotlight",
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
      "description": "配合 Ctrl 或 Meta 的单个 KeyboardEvent.key 值，false 禁用。在 ShortcutsProvider 内共享监听；在 Provider 外保留独立监听。不要传 \"Mod+K\"。",
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
      "同组相邻菜单或选项行之间保留 3px 间距；首项、分组标题和分隔线不额外增加间距。",
    "这是 mtone 自己的组件 API，不是 Mantine Spotlight API 的兼容实现；不提供全局 singleton、spotlight.open() 或命令注册中心。每个实例独立管理状态。",
    "默认 Ctrl/Cmd+K 切换面板；默认不拦截 input、textarea、select 和可编辑内容中的按键，忽略组合输入、重复按键及 Alt/Shift 组合。同一应用的 Spotlight 可加入 ShortcutsProvider 并随 ShortcutScope 的启用状态和优先级切换。需要自定义组合时，用 shortcut={false}、受控 open/onOpenChange 和 useShortcut。文档演示禁用内建键，避免 Gallery 的多个实例争抢。",
    "默认搜索 label、description 和 keywords，不区分大小写，并去除查询首尾空白；group 不参与默认搜索。filter 接收未经裁剪的原始查询。",
    "动作按传入顺序保留，连续相同 group 合并为一组；相同分组若不连续，会出现多个同名组。每个 action.id 必须在实例中唯一。limit 在过滤之后应用，禁用项也计入数量。",
    "方向键上下循环选择可用项，Home/End 到首尾，Enter 执行，Esc 关闭。禁用项显示但不会执行。焦点保持在搜索框，关闭与焦点恢复由 Dialog 处理。",
    "默认选择后先关闭并请求清空查询，然后调用 action.onSelect 和 onActionSelect。回调不自动导航、等待异步任务、捕获业务错误或保存数据，业务逻辑由应用负责。",
    "open/query 受控时，父组件必须响应对应回调更新状态。resetQueryOnClose 作用于组件发出的关闭请求；外部直接改变 open 不应被视为自动重置 query 的保证。",
    "面板复用 mtone Dialog 和 Input.Search，上边缘固定在视窗中上方，不随搜索结果数量变化；结果过多时仅列表滚动。"
  ]
},
  {
    name: "PageLayout",
    description: "组织单页标题、操作、标签页和正文，可添加页面侧栏，也可限制整页宽度并在父容器内居中。",
    importNames: ["PageLayout"],
    code: 'import { PageLayout } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return <PageLayout title="项目总览" maxWidth="md">本周有 3 项任务待处理。</PageLayout>;\n}',
    props: [
      { name: "title", type: "ReactNode", description: "必填标题，渲染在语义标题元素中。" },
      { name: "headingLevel", type: "1 | 2 | 3 | 4 | 5 | 6", default: "1", description: "标题级别；嵌入时按页面结构调整。" },
      { name: "subtitle", type: "ReactNode", description: "标题下方的简短补充。" },
      { name: "icon", type: "ReactNode", description: "标题前的图标。" },
      { name: "actions", type: "ReactNode", description: "标题行的操作，空间不足时自然换行。" },
      { name: "description", type: "ReactNode", description: "标题行下方的补充内容。" },
      { name: "extra", type: "ReactNode", description: "与描述同组的附加信息。" },
      { name: "tabs", type: "ReactNode", description: "可选，可传入完整 Tabs。省略时不占空间。" },
      { name: "sidebar", type: "ReactNode", description: "页面级侧栏插槽，可传入 Sidebar 或自定义内容。省略时保持原有单栏结构。" },
      { name: "sidebarPosition", type: '"left" | "right"', default: '"left"', description: "侧栏位于主栏的物理左侧或右侧。空间不足时，左侧栏改排在主栏前，右侧栏排在主栏后。" },
      { name: "sidebarResize", type: "boolean | SidebarResizeOptions", default: "false", description: "可选。复用 Splitter 的指针和方向键调宽；defaultWidth / minWidth / maxWidth 是像素，默认 240 / 160 / 480。窄容器继续上下排列；直接传入的 Sidebar 折叠后隐藏手柄，展开恢复宽度。" },
      { name: "headerSpan", type: '"full" | "header" | "main"', default: '"full"', description: "full：页头和标签页均跨整页；header：页头跨整页，标签页与正文留在主栏；main：页头和标签页均留在主栏。页头包含标题、图标、副标题、操作、描述和附加信息。无侧栏时忽略。" },
      { name: "maxWidth", type: '"sm" | "md" | "lg" | number', description: "可选。sm 为 720px、md 为 960px、lg 为 1200px，也可传入正数像素值。设置后整个布局在父容器内居中，容器窄时随父容器收缩；省略时保持原有铺满行为。" },
      { name: "children", type: "ReactNode", description: "正文。" },
      { name: "HTML div 属性", type: 'Omit<ComponentPropsWithRef<"div">, "title">', description: "className、style、ref 等传给根元素。" },
    ],
    notes: [
      "maxWidth 同时约束页头、标签页、侧栏和正文，不影响外层 AdminLayout 的侧栏或顶栏。",
      "当 PageLayout 是有可用高度的 AdminLayout.Content 中唯一的直接子元素时，默认至少撑满主内容区的内边距以内；宽屏的页面侧栏同步延伸到底部。长页仍由 AdminLayout.Content 滚动。独立使用、有额外包裹或与其他区块一起使用时，按内容高度布局。",
      "PageLayout 本身的可用宽度达到 640px 时左右分栏；未启用拖拽时侧栏默认 240px，可用 CSS 变量 --mt-page-layout-sidebar-width 覆盖，最多为布局内宽的 50%。较窄时改为上下排列，full 和 header 模式的页头始终在最上方。",
      "只负责单页布局，不管理侧栏折叠、独立滚动、标签状态、路由或应用导航。",
    ],
  },
  {
    name: "Toolbar",
    description: "独立排列搜索、筛选和操作，可放在表格、列表或普通页面。",
    importNames: ["Toolbar"],
    code: 'import { Button, Input, Toolbar } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return <Toolbar aria-label="项目操作" search={<Input.Search aria-label="搜索项目" placeholder="搜索项目" />} start={<Button>筛选</Button>} end={<Button>新建</Button>} />;\n}',
    props: [
      { name: "search", type: "ReactNode", description: "可选搜索控件，空间不足时独占第一行。" },
      { name: "start", type: "ReactNode", description: "可选起始侧控件，例如筛选、分类或状态。" },
      { name: "end", type: "ReactNode", description: "可选末端控件，例如导出、视图切换或新建。在窄容器内可换行，沿逻辑末端对齐。" },
      { name: "background", type: '"white" | "gray"', default: '"gray"', description: "默认使用随主题适配的灰色表面。显式传入 white 时恢复普通表面及标准控件样式。" },
      { name: "controlStyle", type: '"default" | "borderless"', default: '"borderless"', description: "灰底默认无边框：独立按钮和 Select 悬停有灰色反馈。显式传入 default 恢复标准控件样式；white 始终使用标准样式。ButtonGroup 和键盘焦点样式不变。" },
      { name: "原生属性 / ref", type: "div 原生属性（不含 children）/ HTMLDivElement", description: "支持 className、style、ref 和可访问名称；有 aria-label 或 aria-labelledby 时默认作为 group。内容通过三个插槽传入。" },
    ],
    notes: [
      "响应自己的容器宽度，而不是只看视口。start 和 end 使用逻辑方向，RTL 自动镜像。",
      "只负责布局；不执行搜索、过滤、数据更新或快捷键，也不接管 Tab 顺序。表格、列表、普通页面的状态由应用各自管理，可独立使用，也可传入 DataTable 或 DataList 的 toolbar 插槽，让工具栏与内容共享外框。",
    ],
  },
  {
    name: "AdminLayout",
    description:
      "可组合的页面骨架，组织左侧品牌与导航、右侧顶部操作和独立滚动主体。",
    importNames: ["AdminLayout"],
    code: 'import { useState } from "react";\nimport { Box, BookOpen, Home, Settings } from "lucide-react";\nimport { AdminLayout, Breadcrumb, NavItem, Button, Card } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  const [collapsed, setCollapsed] = useState(false);\n  return (\n    <AdminLayout hasSider style={{ height: 480 }}>\n      <AdminLayout.Sider\n        collapsible\n        collapsed={collapsed}\n        onCollapsedChange={setCollapsed}\n        width={240}\n        collapsedWidth={52}\n        version="v1.0.0"\n        breakpoint={768}\n        logo={<strong>mtone</strong>}\n        collapsedLogo={<Box size={22} aria-label="mtone" />}\n        aria-label="主导航"\n      >\n        <NavItem icon={<Home size={16} />}>首页</NavItem>\n        <NavItem icon={<BookOpen size={16} />} active>知识库</NavItem>\n      </AdminLayout.Sider>\n      <AdminLayout>\n        <AdminLayout.Header\n          breadcrumb={<Breadcrumb items={[{ label: "知识库" }, { label: "设计规范" }]} />}\n          extra={<Button iconOnly aria-label="设置"><Settings size={16} /></Button>}\n        />\n        <AdminLayout.Content>\n          <h1>设计规范</h1>\n          <Card>这里是独立滚动的主体内容。</Card>\n        </AdminLayout.Content>\n      </AdminLayout>\n    </AdminLayout>\n  );\n}',
    props: [
      {
        name: "AdminLayout.Sider.version",
        type: "ReactNode",
        description:
          "底部左侧的应用版本文字/内容；默认不显示，收起时隐藏。折叠按钮固定在底部右侧。",
      },
      {
        name: "AdminLayout.hasSider",
        type: "boolean",
        description:
          "是否采用横向布局。省略时自动识别直接子元素中的 AdminLayout.Sider；包装组件内的 Sider 请显式指定。",
      },
      {
        name: "AdminLayout.fullHeight",
        type: "boolean",
        default: "false",
        description:
          "占满视口高度（100dvh）；嵌入页面时可改用 style.height 指定有限高度。",
      },
      {
        name: "AdminLayout.sidebarResize",
        type: "boolean | SidebarResizeOptions",
        default: "false",
        description: "对一个直接的 AdminLayout.Sider（可放在 Fragment 中）启用 Splitter 调宽。默认初始宽度继承 Sider.width；可传 defaultWidth / minWidth / maxWidth（像素，下限 160、上限 480）。折叠和窄容器隐藏手柄，不影响通知或断点规则。",
      },
      {
        name: "AdminLayout.Sider.tabs",
        type: "SidebarTabsOptions",
        description: "透传 Sidebar 顶部标签配置；侧栏宽屏时显示标签，收起时保持当前面板图标导航。",
      },
      {
        name: "AdminLayout.Sider.collapsible",
        type: "boolean",
        default: "false",
        description: "启用复用自 Sidebar 的收起/展开按钮和图标窄栏。",
      },
      {
        name: "AdminLayout.Sider.collapsed",
        type: "boolean",
        description: "受控收起状态；搭配 onCollapsedChange 由父组件更新。",
      },
      {
        name: "AdminLayout.Sider.defaultCollapsed",
        type: "boolean",
        default: "false",
        description: "非受控模式的初始收起状态。",
      },
      {
        name: "AdminLayout.Sider.onCollapsedChange",
        type: "(collapsed: boolean) => void",
        description:
          "点击收起按钮或响应式断点请求改变状态时调用；受控模式不会自行覆盖 collapsed。",
      },
      {
        name: "AdminLayout.Sider.logo / collapsedLogo",
        type: "ReactNode",
        description: "顶部品牌插槽；collapsedLogo 用于窄栏中的简化标识。",
      },
      {
        name: "AdminLayout.Sider.width / collapsedWidth",
        type: "number",
        default: "240 / 52",
        description: "展开/收起宽度，单位 px，最小 40px；本版不支持零宽隐藏。",
      },
      {
        name: "AdminLayout.Sider.breakpoint",
        type: "number",
        description:
          "可选视口断点（px），例如 768。低于断点请求收起，恢复宽屏请求展开；未设置时不自动响应。",
      },
      {
        name: "AdminLayout.Sider.onBreakpoint",
        type: "(broken: boolean) => void",
        description: "监听断点状态；true 表示视口低于设定断点。",
      },
      {
        name: "AdminLayout.Sider.collapseLabel / expandLabel",
        type: "string",
        default: "收起侧边栏 / 展开侧边栏",
        description: "继承 Sidebar 的切换按钮可访问名称。",
      },
      {
        name: "notice",
        type: "ReactNode",
        description: "可选全宽通知插槽，位于外层布局的侧栏与主栏上方。可放入 GlobalNotice；不随应用内容区切换或滚动。",
      },
      {
        name: "AdminLayout.Header.breadcrumb",
        type: "ReactNode",
        description: "顶部左侧插槽；建议传入已有 Breadcrumb 组件。",
      },
      {
        name: "AdminLayout.Header.extra",
        type: "ReactNode",
        description:
          "顶部右对齐操作插槽，可组合 Button、Popover.Menu、Avatar 等。",
      },
      {
        name: "AdminLayout.Header.children",
        type: "ReactNode",
        description: "顶部左侧补充内容；请使用单行内容。",
      },
      {
        name: "AdminLayout.Content.as",
        type: '"main" | "section" | "div"',
        default: "main",
        description:
          "主体语义标签。一个页面通常只使用一个 main；嵌入其他主体时改为 section 或 div。",
      },
      {
        name: "children / className / style / 原生属性",
        type: "ReactNode / string / CSSProperties / HTMLAttributes",
        description:
          "各区域均可嵌套内容和覆盖样式；默认不生成主体 Footer，显式组合 AdminLayout.Footer 时显示，默认高度 42px。",
      },
    ],
    notes: [
      "将跨页面的状态通知放在持续挂载的外层 AdminLayout.notice，不要放在会随路由切换的 Content 子页面。应用负责状态、异步操作和关闭后的焦点。",
      "主体 Footer 与侧栏版本/折叠底栏是独立区域，默认高度均为 42px。需要时加入 <AdminLayout.Footer>内容</AdminLayout.Footer>；主体 Footer 可用 style.height 覆盖高度；--mt-layout-footer-height 可统一覆盖左右两个底栏高度。Topbar 与品牌行共用固定的 --mt-layout-header-height（默认 48px，包含底边框），内容垂直居中。顶栏保持单行，面包屑过长时省略；窄栏操作较多时，可在 extra 中将次要操作收进 Popover.Menu。",
      "使用 AdminLayout.Sider、AdminLayout.Header、AdminLayout.Content、AdminLayout.Footer 组合，不需要单独安装子组件。支持的属性以 mtone 文档与类型声明为准。",
      "AdminLayout.Sider 复用本库 Sidebar 的状态、32px 高的 NavItem、图标窄栏和键盘提示，不重写导航逻辑。Header 推荐复用 Breadcrumb、Button 等已有组件。",
      "默认头部 48px，侧栏 240px，窄栏 52px；可通过 width、collapsedWidth 和区域 style 配置。使用有限高度或 fullHeight 后，侧栏内容和 Content 独立滚动，品牌、侧栏底部版本/折叠行与顶部操作保持可见。",
      "响应式收起为图标窄栏，不是弹出式抽屉。breakpoint 按浏览器视口判断，不按示例容器宽度判断；希望自定义手机抽屉时可组合已有 Drawer。",
      "受控状态必须在 onCollapsedChange 中更新，否则切换只发出请求。导航、路由、数据保存、账号菜单与持久化由应用实现。",
      "示例右上按钮仅更新本地提示；不发送搜索、通知请求，也不更改账号或安全设置。",
    ],
  },
  {
    name: "Button",
    description: "带完整样式的基础操作按钮，支持可选的按下状态。",
    importNames: ["Button"],
    code: "import React from \"react\";\nimport { ArrowRight, Download, Image, Plus } from \"lucide-react\";\nimport { Button } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return (\n    <div style={{ display: \"flex\", gap: 8, flexWrap: \"wrap\" }}>\n      <Button leftSection={<Image size={14} aria-hidden=\"true\" />}>图库</Button>\n      <Button\n        variant=\"solid\"\n        rightSection={<Download size={14} aria-hidden=\"true\" />}\n      >\n        下载\n      </Button>\n      <Button\n        variant=\"soft\"\n        leftSection={<Image size={14} aria-hidden=\"true\" />}\n        rightSection={<ArrowRight size={14} aria-hidden=\"true\" />}\n      >\n        查看图库\n      </Button>\n      <Button iconOnly aria-label=\"添加文档\">\n        <Plus size={16} aria-hidden=\"true\" />\n      </Button>\n    </div>\n  );\n}",
    props: [
      {
        name: "variant",
        type: '"blue" | "solid" | "outline" | "soft" | "ghost"',
        description: "按钮外观。soft 使用浅底，悬停采用当前主题的中性色反馈；禁用或加载时不变色。",
        default: "outline",
      },
      {
        name: "size",
        type: 'ButtonSize',
        description: "small / normal / large 分别高 28 / 32 / 36px；接受旧别名 sm / md / lg。未设置时继承 ButtonGroup，组外为 normal。",
        default: "normal",
      },
      {
        name: "iconOnly",
        type: "boolean",
        default: "false",
        description: "仅图标的等宽高模式；必须通过 aria-label 或 aria-labelledby 提供操作名称。复用 Button 的尺寸、变体、加载与切换行为。",
      },
      {
        name: "danger",
        type: "boolean",
        description: '危险操作样式；搭配 variant="solid" 显示红色背景、白色文字，悬停保持深红色。',
      },
      {
        name: "loading",
        type: "boolean",
        description: "显示加载图标并禁用点击。",
      },
      {
        name: "icon",
        type: "ReactNode",
        description: "旧版前置图标；未传 leftSection 时使用。",
      },
      {
        name: "leftSection",
        type: "ReactNode",
        description: "文字前的内容，可放图标或装饰；优先于 icon，传 null 可隐藏旧图标。",
      },
      {
        name: "preset",
        type: '"dropdown"',
        description: "仅外观；在文字后显示 14px 装饰箭头，不打开菜单或添加菜单 ARIA 属性。",
      },
      {
        name: "rightSection",
        type: "ReactNode",
        description: "文字后的内容，可放图标或装饰；加载期间仍显示。显式设置时优先于 preset，传 null 可隐藏预设箭头。",
      },
      {
        name: "toggle",
        type: "boolean | ButtonToggleOptions",
        default: "false",
        description: '设为 true 或 { mode: "background" } 时用背景显示按下状态；{ mode: "icon", preset: "star" | "pin" } 用轮廓/实心图标显示状态；亦可用 { mode: "icon", offIcon, onIcon } 自定义一对图标。',
      },
      {
        name: "pressed",
        type: "boolean",
        description: "开关按钮的受控按下状态；须配合 onPressedChange 更新。",
      },
      {
        name: "defaultPressed",
        type: "boolean",
        default: "false",
        description: "非受控开关按钮初始是否按下。",
      },
      {
        name: "onPressedChange",
        type: "(pressed: boolean) => void",
        description: "开关按钮请求切换时调用；禁用、加载或 onClick 调用 preventDefault() 时不调用。",
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
      "文字按钮行高为 20px，标准带边框样式的上下内边距为 3 / 5 / 7px；纯图标按钮与高度等宽，不添加内边距。normal 可用 --mt-height 覆盖。",
      "未开启 toggle 时保留普通按钮行为，不接管应用手动设置的 aria-pressed。开启时由 Button 提供 aria-pressed。保留前后状态一致的按钮名；纯图标使用固定 aria-label 或 aria-labelledby。",
      "图标模式不改变按钮背景，切换图标替代左侧 leftSection 与 icon，加载指示器优先，rightSection 保留。preset 和自定义图标对互斥；建议自定义图标两态同尺寸，且不要传入可交互内容。",
      "例如 <Button toggle>仅显示未读</Button> 或 <Button iconOnly aria-label=\"收藏\" toggle={{ mode: \"icon\", preset: \"star\" }} />。",
      "支持 ref 和 Base UI Button 的可组合属性。加载中显示前置加载图标并禁用按钮，右侧内容不变。",
      "左右内容按阅读方向排列，在 RTL 中自动对调。传入内容的一侧使用更紧凑的内边距；装饰图标可标记 aria-hidden。",
      "blue 为蓝色实心变体：背景 #2783DE、文字 #F3F9FD，悬停背景 #2276C9，背景颜色过渡 100ms ease-in-out。danger 会优先使用危险操作色。",
    ],
  },
  {
    name: "ButtonGroup",
    description: "将关联按钮组织为一个操作组，支持默认分开排列或相连组合。",
    importNames: ["ButtonGroup", "Button", "Popover"],
    code: "import { useState } from \"react\";\nimport { ChevronDown } from \"lucide-react\";\nimport { ButtonGroup, Button, Popover } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  const [message, setMessage] = useState(\"\");\n  return (\n    <div>\n      <ButtonGroup connected aria-label=\"导出文档\">\n        <Button onClick={() => setMessage(\"已选择导出 PDF\")}>导出 PDF</Button>\n        <Popover.Menu\n          trigger={<Button iconOnly aria-label=\"更多导出格式\"><ChevronDown size={14} /></Button>}\n          items={[\n            { key: \"markdown\", label: \"导出 Markdown\", onSelect: () => setMessage(\"已选择导出 Markdown\") },\n            { key: \"html\", label: \"导出 HTML\", onSelect: () => setMessage(\"已选择导出 HTML\") },\n          ]}\n        />\n      </ButtonGroup>\n      <p role=\"status\">{message}</p>\n    </div>\n  );\n}",
    props: [
      { name: "size", type: "ButtonSize", description: "未单独设置尺寸的 Button 会继承，含 Popover.Menu 的 Button 触发器；支持 small / normal / large 与 sm / md / lg，外层未设置时为 normal。" },
      { name: "connected", type: "boolean", default: "false", description: "相连样式：移除间距、共享边框，仅保留外侧圆角。" },
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
    notes: ['Popover.Menu 的 trigger 直接渲染为组内按钮，无需外层包裹；主按钮执行默认动作，箭头按钮打开其他选项。示例只展示操作反馈，不下载真实文件。', '默认保留 4px 间距。相连模式请直接放置 Button（可使用 iconOnly）；在 ButtonGroup 设置 size 可统一尺寸，子按钮显式 size 会覆盖继承值。', '使用 aria-label 为操作组命名；保留各按钮的原生 Tab 导航，不是单选分段控件。', '危险实心按钮使用 <Button danger variant="solid">删除</Button>。'],
  },
  {
  "name": "Input",
  "description": "紧凑输入家族：基础、搜索、密码、多行文本与分格验证码。",
  "importNames": [
    "Input"
  ],
  "code": "import { Input } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return <div style={{ display: \"grid\", gap: 12 }}>\n    <Input placeholder=\"标题\" aria-label=\"标题\" allowClear showCount maxLength={40} />\n    <Input.Search placeholder=\"搜索\" aria-label=\"搜索\" searchButton=\"搜索\" onSearch={value => console.log(value)} />\n    <Input.Password aria-label=\"密码\" autoComplete=\"new-password\" />\n    <Input.TextArea aria-label=\"备注\" autoSize={{ minRows: 2, maxRows: 5 }} />\n    <Input.OTP aria-label=\"验证码\" length={6} />\n  </div>;\n}",
  "props": [
    {
      "name": "value / defaultValue",
      "type": "string | number | readonly string[]",
      "description": "原生受控值或初始值；不要在生命周期内切换受控模式。"
    },
    {
      "name": "onChange",
      "type": "React.ChangeEventHandler<HTMLInputElement>",
      "description": "接收原生输入事件，清除按钮也触发值为空的 change。"
    },
    {
      "name": "prefix / suffix",
      "type": "ReactNode",
      "description": "输入框内前后缀；切换内容不会重建输入节点。"
    },
    {
      "name": "allowClear / onClear / clearLabel",
      "type": "boolean / () => void / string",
      "description": "显示清除按钮、清除通知与按钮可访问名称；禁用或只读时不显示。"
    },
    {
      "name": "controlSize",
      "type": "'sm' | 'md' | 'lg'",
      "description": "视觉尺寸。原生数字 size 属性仍保持原义。",
      "default": "md"
    },
    {
      "name": "variant",
      "type": "'outlined' | 'filled' | 'borderless' | 'underlined'",
      "description": "外观变体。",
      "default": "outlined"
    },
    {
      "name": "status",
      "type": "'error' | 'warning'",
      "description": "校验状态；错误会设置 aria-invalid。"
    },
    {
      "name": "showCount / countCharacters",
      "type": "boolean / (value: string) => number",
      "description": "显示字符数，默认按 JS 字符串长度计数；自定义计数不改变原生 maxLength 截断规则。"
    },
    {
      "name": "className / style / wrapperClassName",
      "type": "string / CSSProperties / string",
      "description": "className/style 保留在原生 input；wrapperClassName 设置外层容器。"
    },
    {
      "name": "disabled / readOnly / ref / 原生属性",
      "type": "HTMLInputElement attributes",
      "description": "继承 Fieldset 禁用；ref 指向原生 input，可调用 focus/select/setSelectionRange。"
    },
    {
      "name": "Input.Search: onSearch / searchButton / loading",
      "type": "(value: string) => void / ReactNode / boolean",
      "description": "Enter 或可选搜索按钮触发搜索；loading/disabled 阻止提交，输入法组合期间不提交。输入变化和清除只触发 onChange，不自动搜索。"
    },
    {
      "name": "Input.Password: visible / defaultVisible / onVisibleChange",
      "type": "boolean / boolean / (visible: boolean) => void",
      "description": "受控或非受控的密码显示状态；默认隐藏。"
    },
    {
      "name": "Input.TextArea: autoSize",
      "type": "boolean | { minRows?: number; maxRows?: number }",
      "description": "内容与容器宽度变化时自动调整高度，默认关闭；启用时默认至少2行，达到最大行数后滚动。"
    },
    {
      "name": "Input.TextArea: 通用属性",
      "type": "TextareaHTMLAttributes + InputAppearance",
      "description": "支持 variant/status/controlSize/showCount/countCharacters 和原生 textarea 属性；ref 为 HTMLTextAreaElement，不支持 prefix/suffix/allowClear。"
    },
    {
      "name": "Input.OTP: value / defaultValue / onValueChange / onComplete",
      "type": "string / string / (value: string) => void / (value: string) => void",
      "description": "连续字符串模型；值变化通知 onValueChange，填满时通知 onComplete，不发送或验证验证码。"
    },
    {
      "name": "Input.OTP: length / mask / separator",
      "type": "number / boolean / ReactNode",
      "description": "默认6格，限制1–32；mask 使用原生密码显示，separator 在格间显示装饰。"
    },
    {
      "name": "Input.OTP: inputMode / name / form / disabled / readOnly",
      "type": "native attributes",
      "description": "inputMode 默认 numeric，仅作为键盘提示，不限制内容；name 通过隐藏字段提交整串值。"
    },
    {
      "name": "Input.OTP: controlSize / ref / aria-label",
      "type": "'sm' | 'md' | 'lg' / Ref<HTMLInputElement> / string",
      "description": "ref 指向第一格；为验证码组提供可访问名称。"
    }
  ],
  "notes": [
    "默认单行32px，sm为24px，lg为36px；焦点保持浅蓝 #93B4DC 的1px细边框，不加粗。",
    "搜索和多行输入分别使用 Input.Search 和 Input.TextArea。",
    "原生 size、type、name、form、aria-* 和原生 ref 保留。className/style 面向原生输入，不代表外层容器。",
    "Input.OTP 支持粘贴、组合输入、方向键与删除；删除会将后续字符前移，不保留空格占位。空白字符会移除。mask 不提供任意字符替换。",
    "Search/Password 支持基础输入通用属性；TextArea/OTP 使用各自的原生属性，不能假定所有基础输入属性可通用。",
    "本页示例仅演示界面交互，不执行真实搜索、登录或验证码验证。"
  ]
},
{
  "name": "Form",
  "description": "管理字段值与同步/异步校验，支持受验证的提交回调并保留原生表单用法。",
  "importNames": [
    "Form",

    "Input",
    "Button"
  ],
  "code": "import { useState } from \"react\";\nimport { Form, Input, Button } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  const [form] = Form.useForm();\n  const [message, setMessage] = useState(\"\");\n  return (\n    <Form form={form} initialValues={{ email: \"\" }}\n      onFinish={values => setMessage(`本地提交成功：${values.email}`)}\n      onFinishFailed={() => setMessage(\"请检查字段错误\")}\n    >\n      <Form.Item name=\"email\" label=\"邮箱\" rules={[\n        { required: true, message: \"请输入邮箱\" },\n        { type: \"email\", message: \"请输入有效邮箱\" },\n      ]}>\n        <Input type=\"email\" />\n      </Form.Item>\n      <Button type=\"submit\" variant=\"blue\">提交</Button>\n      <Button type=\"reset\">重置</Button>\n      <p role=\"status\">{message}</p>\n    </Form>\n  );\n}",
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
      "type": "(props: FormFieldProps) => ReactElement",
      "description": "配置单个字段，关联标签、状态、帮助信息与校验。"
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
    },
    {
      "name": "Form.Item: label",
      "type": "ReactNode",
      "description": "必填；字段可访问标签。"
    },
    {
      "name": "Form.Item: children",
      "type": "ReactElement",
      "description": "必填；单个可接收注入值、事件、id 与 ARIA 属性的控件。"
    },
    {
      "name": "Form.Item: name",
      "type": "string",
      "description": "Form 中的扁平字段 key。省略时保持手动模式。"
    },
    {
      "name": "Form.Item: rules",
      "type": "FormRule[]",
      "description": "同步/异步规则，按顺序遇到首错停止。"
    },
    {
      "name": "Form.Item: initialValue",
      "type": "unknown",
      "description": "字段初始值，优先级低于 Form.initialValues；只用于初始化/重置。"
    },
    {
      "name": "Form.Item: validateTrigger",
      "type": "\"onChange\" | \"onBlur\" | (\"onChange\" | \"onBlur\")[] | false",
      "description": "覆盖此字段的自动校验时机。",
      "default": "继承 Form"
    },
    {
      "name": "Form.Item: valuePropName",
      "type": "string",
      "description": "绑定到子控件的值属性，例如 checked。",
      "default": "\"value\""
    },
    {
      "name": "Form.Item: trigger",
      "type": "string",
      "description": "取值事件名；同名子控件事件仍会调用。",
      "default": "Input: onChange；Select: onValueChange"
    },
    {
      "name": "Form.Item: getValueFromEvent",
      "type": "(...args: any[]) => unknown",
      "description": "自定义从控件事件参数中提取字段值。"
    },
    {
      "name": "Form.Item: description",
      "type": "ReactNode",
      "description": "没有错误时显示的辅助说明。"
    },
    {
      "name": "Form.Item: error",
      "type": "ReactNode",
      "description": "显式错误展示，优先于规则错误；不参与提交校验。"
    },
    {
      "name": "Form.Item: required",
      "type": "boolean",
      "description": "必填标记和传给控件的 required；规则引擎是否必填应使用 rules.required。",
      "default": "从 rules.required 推断"
    },
    {
      "name": "Form.Item rules: rule.required / whitespace",
      "type": "boolean",
      "description": "必填检查 / 拒绝纯空白字符串。"
    },
    {
      "name": "Form.Item rules: rule.type",
      "type": "\"string\" | \"number\" | \"boolean\" | \"array\" | \"email\" | \"url\" | \"integer\"",
      "description": "值类型或基础格式规则，不隐式转换类型。"
    },
    {
      "name": "Form.Item rules: rule.min / max / len",
      "type": "number",
      "description": "字符串/数组长度或数值下限、上限、相等值。"
    },
    {
      "name": "Form.Item rules: rule.pattern",
      "type": "RegExp",
      "description": "字符串正则检查。"
    },
    {
      "name": "Form.Item rules: rule.message",
      "type": "string",
      "description": "覆盖规则失败的错误文案。"
    },
    {
      "name": "Form.Item rules: rule.validator",
      "type": "(rule: FormRule, value: unknown, values: FormValues) => void | string | Promise<void | string>",
      "description": "返回 void 表示通过，返回错误字符串或抛错表示失败；支持异步。"
    }
  ],
  "notes": [
    "这是 mtone 的轻量表单 API；支持 Form.Item 和 Form.useForm()，不支持 Form.List、dependencies、嵌套路径、transform 或自动依赖重验证。",
    "字段 name 是扁平字符串 key；例如 \"user.email\" 只是一个完整 key，不会生成嵌套对象。控件以 Form 接管的值为准，不要同时传 value/defaultValue。",
    "initialValues 对每个 Form 实例只在初始化时生效，不会随 prop 改变覆盖编辑值；动态加载数据请调用 setFieldsValue。Form.initialValues 优先于字段 initialValue，Select 多选或标签模式的初始值建议在 initialValues 中设为 []。",
    "无 name 的 Form.Item 保留原有手动 error/受控值用法；没有托管字段、没有传 form/onFinish 的 Form 仍使用原生提交行为。",
    "规则按顺序执行，每个字段遇到首个错误停止。可选空值跳过内建类型/长度/范围/正则检查，但仍执行自定义 validator；若要求填写请设置 required。required 只判断空值，不等于 Checkbox 必须选中；此类业务约束用自定义 validator。",
    "异步校验不发送内置网络请求；自定义 validator 可返回错误字符串、抛出错误或返回 Promise。值变化、重置或新校验可能使旧校验失效，validateFields 会拒绝并返回 outOfDate: true；手动调用须 catch，忽略过期结果。",
    "显式 error 优先于自动错误显示，但仅是展示，不会使 validateFields 失败或阻止 onFinish；阻止提交必须使用 rules。",
    "组件注入 id、required、aria-invalid、aria-describedby 和校验中的 aria-busy；子控件需将这些属性传递到实际输入元素。内置 Input 和 Select 已适配。",
    "控件交互触发 onValuesChange；setFieldValue/setFieldsValue/resetFields 不触发该回调，也不会自动重跑校验。set 操作清除对应字段旧错误，若需校验请手动调用 validateFields。",
    "托管提交会阻止浏览器默认提交并校验；通过后调用 onFinish，失败调用 onFinishFailed。用户 onSubmit 最先执行，若调用 preventDefault 则取消本次内建提交和校验。",
    "Form 内 type=\"reset\" 按钮恢复初始值与校验状态；onReset 若 preventDefault 则取消内建重置。业务保存/请求、成功状态与提交中的 loading 由应用管理。",
    "字段卸载后不再参与校验，但值保留在表单数据中。实例读取返回浅拷贝，不要原地修改其中的数组或对象。",
    "Checkbox 等非 value 控件可设置 valuePropName=\"checked\"、trigger=\"onCheckedChange\"。trigger 负责取值，validateTrigger 负责校验。",
    "可选空值会跳过内建类型和格式校验，但仍执行自定义 validator。required 仅检查空值；要求勾选 Checkbox 时需使用自定义校验。"
  ]
},
  {
    name: "Checkbox",
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
    description: "从一组选项中选择一个值，可显示为普通单选或分段按钮。",
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
        name: "variant",
        type: '"default" | "segmented"',
        default: "default",
        description: "default 显示单选圆点，segmented 显示紧凑分段按钮。",
      },
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        description: "普通单选默认纵向排列，分段按钮默认横向排列；两者都可覆盖。",
      },
    ],
    notes: [
      "options[].label 可渲染文本或 React 节点；可用 disabled 禁用单项。",
      "纯图标分段单选应给装饰图标设置 aria-hidden，并通过视觉隐藏的文字为每个选项命名。用 Tab 进入选中的选项，再用方向键切换。",
      "两种变体沿用同一组选项、值和表单 API。",
    ],
  },
  {
    name: "Select",
    description: "带浮层列表的单选、多选与标签创建控件，支持搜索、分组与清除。",
    importNames: ["Select"],
    code: 'import { Select } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  const options = [{value:"design",label:"设计"},{value:"code",label:"开发"}];\n  return (\n    <>\n      <Select label="类别" placeholder="选择类别" options={options} />\n      <Select label="分类" searchable clearable defaultValue="design" options={options} />\n      <Select label="切换分类" searchable="popup" popupTitle="分类" options={options} />\n      <Select mode="multiple" label="标签" clearable defaultValue={["design"]} options={options} />\n    </>\n  );\n}',
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
        description: "附加样式类；可通过 CSS width 设置固定宽度或铺满容器。普通 clearable 单选铺满时还应给其清除按钮外层设 100% 宽。",
      },
      { name: "mode", type: '"single" | "multiple" | "tags"', default: '"single"', description: "单选值为 string | null，多选与标签模式均为可搜索的 string[]；只有 tags 可以创建自定义值。" },
      { name: "searchable / searchPlaceholder", type: 'boolean | "popup" / string', description: '仅单选使用。true 在可见选择框内搜索，下拉只显示选项；"popup" 用按钮打开带独立搜索框的浮层。searchPlaceholder 设置搜索提示。' },
      { name: "trigger / popupWidth / popupTitle", type: "ReactElement | string / number | string / ReactNode", description: "仅 searchable=\"popup\" 使用。SelectPopupSearchProps 支持可选的自定义触发器、宽度和标题。宽度默认 320px（数字为 px）且受视口限制。省略触发器时使用标准 Select；省略标题时用 label 或本地化默认标题。" },
      { name: "renderOption", type: "(option: SelectOption) => ReactNode", description: "自定义选项行的内容，如图标或说明；不替换选项节点、键盘和禁用行为，不更改 value、搜索或已选显示。内容不应包含独立交互控件。" },
      { name: "clearable", type: "boolean", default: "false", description: "标准触发器有可清除的选中值时，桌面悬停或键盘聚焦清除按钮会在箭头原位显示 ×；无悬停的触屏可直接点 ×。自定义浮层触发器保留原外观，清除按钮单独显示。清除不打开下拉；单选变为 null，多选与标签模式保留已选禁用项。" },
      { name: "emptyContent", type: "ReactNode", description: "替换空列表或搜索无结果的默认提示。" },
      { name: "required / form", type: "boolean / string", description: "原生必填校验、可选外部表单 ID；多选与标签模式通过重复 name 提交已选值。" },
      {
        name: "options",
        type: "readonly (SelectOption | SelectOptionGroup)[]",
        description:
          "必填。选项包含唯一字符串 value、可渲染 label、可选 disabled 和 searchText；分组为 { label, options }，可与未分组选项混用。",
      },
      {
        name: "placeholder",
        type: "string",
        description: "未选择时的提示。",
      },
      {
        name: "value",
        type: "string | null / string[]",
        description: "受控值；提供后需在回调中更新。",
      },
      {
        name: "defaultValue",
        type: "string | null / string[]",
        description: "非受控初始值。",
      },
      {
        name: "onValueChange",
        type: "((value: string | null) => void) / ((value: string[]) => void)",
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
    notes: [
      "不带搜索的普通单选按占位提示和所有选项的最宽文字定宽，不再设 160px 下限。选择或清除不跳宽，空间不足时省略长标签；搜索、多选、标签和浮层搜索模式宽度不变。",
      "富标签用可提取的静态文字估算宽度，无文字时用 searchText 或 value。带图标或自定义排版的富内容可通过 className 明确设置宽度。",
      '浮层搜索适合仓库切换等独立触发器场景；打开聚焦搜索，Enter 或点击确认，Esc 返回触发器，关闭后清空查询。字符串触发器使用下拉预设 Button；自定义按钮须转发 ref 与触发器属性。searchable={true} 的输入框内搜索保持不变。',
      "保留富文本标签。搜索按 searchText 匹配；未提供时使用字符串或数字标签，再回退到 value。输入搜索不改变已提交的选择；按 Enter 选中高亮选项或点击才提交，Esc、失焦或外部点击撤销搜索。",
      "默认值和受控值按 mode 区分。空字符串可以作为显式选项值，原生和 Form.Item 的必填检查都将其视为已选；未选择单项用 null，多选未选择用 []。Form.Item 随 mode 集成。",
      '标签模式（SelectTagsProps）通过 Enter 或点击“创建”添加去掉首尾空白的输入。已有选项的精确 value 或纯文本标签不另建，包括禁用选项；重复输入不会添加。失焦或输入法确认不创建，不按逗号等分隔符拆分批量输入。仅更新已选值数组，不修改 options。外部传入而不在 options 中的已选值显示原字符串。',
      'Select mode="multiple" 使用 SelectMultipleProps；外框最低 32px，标签可以换行。多选与标签模式都保留已选的禁用标签。',

      "同组相邻菜单或选项行之间保留 3px 间距；首项、分组标题和分隔线不额外增加间距。","默认单行外框高度为 32px（含边框）；长选中标签在行内省略。可用 className 覆盖尺寸。", "输入表面聚焦时只将现有边框改为 #93B4DC，不加粗、不加外圈；错误与禁用状态保留，强制颜色模式使用系统焦点提示。", "支持键盘选择、禁用选项和焦点恢复。", "选中项使用垂直居中的 16px Lucide Check 细线对号（1.5px 描边），无需新增属性配置。"],
  },
  {
    name: "TagSelect",
    description: "将多选选项平铺为标签，空间不足时可展开。",
    importNames: ["TagSelect"],
    code: `import { TagSelect } from "@bixlab/mtone";
import "@bixlab/mtone/styles.css";

export default function Demo() {
  return <TagSelect aria-label="主题" defaultValue={["design"]} options={[
    { value: "design", label: "产品设计" },
    { value: "research", label: "用户研究" },
  ]} />;
}`,
    props: [
      { name: "options", type: "readonly TagSelectOption[]", description: "每项包含唯一 value、可渲染 label 和可选 disabled。" },
      { name: "value / defaultValue", type: "readonly string[]", description: "受控值或初始选中值。" },
      { name: "onValueChange", type: "(value: string[]) => void", description: "标签切换时返回选中的值。" },
      { name: "disabled", type: "boolean", description: "禁用整个控件，亦继承 Fieldset 禁用。" },
      { name: "selectAll", type: "boolean", default: "false", description: "在第一位显示全选按钮；选择或取消所有可用选项，包括折叠隐藏的选项，保留禁用选项的选中状态。" },
      { name: "selectAllLabel", type: "string", default: "全选", description: "全选按钮文字。" },
      { name: "expandable", type: "boolean", default: "true", description: "选项超出一行时折叠；关闭后始终换行展示。" },
      { name: "expanded / defaultExpanded", type: "boolean", description: "受控展开状态或初始展开状态，默认折叠。" },
      { name: "onExpandedChange", type: "(expanded: boolean) => void", description: "请求切换展开状态时触发。" },
      { name: "expandLabel / collapseLabel", type: "string", description: "展开与收起按钮文字，默认「展开」与「收起」。" },
    ],
    notes: ["选项按钮、展开按钮及单行折叠视口统一采用 32px 基准高度。建议用 aria-label 或 aria-labelledby 为整组选项命名。折叠不会清除已选值。"],
  },
  {
    name: "Slider",
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
    notes: ["默认整体外框高度为 32px（含边框），增减按钮位于边框内。可用 className 定制尺寸。", "输入表面聚焦时只将现有边框改为 #93B4DC，不加粗、不加外圈；错误与禁用状态保留，强制颜色模式使用系统焦点提示。", "清空时 value 可为 null；defaultValue 应传 number。"],
  },
  {
    name: "DatePicker",
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
    notes: ["默认单行输入外框高度为 32px（含边框），可通过 --mt-height 定制。原生日历弹层尺寸由浏览器决定。", "输入表面聚焦时只将现有边框改为 #93B4DC，不加粗、不加外圈；错误与禁用状态保留，强制颜色模式使用系统焦点提示。",
      "值为 YYYY-MM-DD，清空返回空字符串，不进行 UTC 转换。",
      "日历外观和键盘操作由浏览器决定；disabledDate 不会在原生日历中绘制禁用状态。",
      "仅对支持样式的原生日期指示器使用与 Select 一致的 16px 箭头，不叠加第二个图标；其他浏览器和强制颜色模式保留原生日期界面。",
      "不支持日期区间、时间或自定义日历面板。",
    ],
  },
  {
    name: "Sidebar",
    description: "支持顶部标签、展开与图标窄栏切换的侧栏。",
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
          "折叠按钮位置；AdminLayout.Sider 使用 footer，独立 Sidebar 保持原默认。",
      },
      {
        name: "header",
        type: "ReactNode | ((collapsed: boolean) => ReactNode)",
        description:
          "可选品牌头部，与已有折叠按钮同排；AdminLayout.Sider 的 logo 通过该插槽复用。",
      },
      {
        name: "tabs",
        type: "SidebarTabsOptions",
        description: "可选顶部标签。items 为只读数组；每项包含唯一 value、label、content，可选 disabled 与 icon。tabs 可指定可访问 label、value / defaultValue / onValueChange。非空 items 代替 children；省略或为空则沿用原内容。",
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
      "NavItem 默认行高为 32px，图标与文字垂直居中。相邻项间距不变，分组标题和分隔线不受行高影响。",
      "收起为 52px 图标窄栏，NavItem 保留可访问名称；NavGroup 隐藏标题与标题操作，保留默认分组分隔（可用 divider={false} 关闭）。建议每个 NavItem 提供 icon，没有图标时显示圆形占位。",
      "收起时悬停或键盘聚焦显示提示，Escape 可关闭提示。复杂 children 请提供 aria-label 作为提示文字。",
      "受控用法：const [collapsed, setCollapsed] = useState(false); <Sidebar collapsible collapsed={collapsed} onCollapsedChange={setCollapsed}>…</Sidebar>。",
      "顶部标签复用小尺寸 32px Tabs 与蓝色下划线，NavItem 的当前项保持灰色。设置有限高度后仅中间面板滚动；收起后隐藏标签栏但保留当前导航，展开恢复。已访问的面板保持挂载，标签不接管路由。AdminLayout.Sider 可直接传 tabs，PageLayout 可在 sidebar 插槽中传入同一个 Sidebar。",
      "不接管路由、固定定位、持久化或响应式断点。不要用固定 width 覆盖收起宽度；自定义内容需自行适配窄栏。",
      "版本、部署和包信息等非导航内容，可使用 SectionGroup 分区；示例使用不收起的 Sidebar，不影响导航图标窄栏。",
      "文档目录可把 Tree 直接放进 Sidebar；见 Tree 的「侧栏文档树」示例，当前文档和异步子节点由应用维护。",
      "独立侧栏调宽时把 Sidebar 放入 Splitter.Panel；Sidebar 本身不管理拖拽宽度。AdminLayout 与 PageLayout 则可选择启用 sidebarResize。",
    ],
  },
  {
    name: "SectionGroup",
    description: "用标题、右侧操作和分隔线组织任意内容。",
    importNames: ["SectionGroup", "Tag"],
    code: 'import { SectionGroup, Tag } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <SectionGroup>\n      <SectionGroup.Section title="版本发布" actions={<Tag>8</Tag>}>mtone 0.9.0</SectionGroup.Section>\n      <SectionGroup.Section title="部署">文档站已上线</SectionGroup.Section>\n    </SectionGroup>\n  );\n}',
    props: [
      { name: "dividers", type: "boolean", default: "true", description: "在各区块之间绘制分隔线。不在首尾画线；关闭后保留间距。" },
      { name: "children", type: "ReactNode", description: "将 SectionGroup.Section 作为直接子项。" },
      { name: "Section.title", type: "ReactNode", description: "区块标题，作为该区块的可访问名称。" },
      { name: "Section.actions", type: "ReactNode", description: "标题行末端的独立操作，可放图标、按钮或多个控件。" },
      { name: "Section.headingLevel", type: "2 | 3 | 4 | 5 | 6", default: "3", description: "根据页面结构选择原生标题级别。" },
      { name: "Section.children", type: "ReactNode", description: "正文区域，可放任意组件。" },
    ],
    notes: [
      "SectionGroup 是内容布局，不处理导航选中或折叠。导航菜单继续使用 NavGroup。",
      "用 hidden 属性或条件渲染隐藏区块，分隔线会随之调整。支持 className、style 等原生属性；图标按钮请提供 aria-label。参见 Sidebar 页的「内容分区」示例。",
    ],
  },
  {
    name: "NavItem",
    description: "支持当前状态和图标的导航项，可作为按钮或原生链接，并可添加独立的尾部操作。",
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
        name: "actions",
        type: "NavItemAction | readonly NavItemAction[]",
        description: "一个或多个尾部操作：{ content: ReactNode, visibility?: 'always' | 'hover' | 'active' }。默认 always；hover 在悬停、行内键盘聚焦和无悬停设备上显示；导航本身无法通过 Tab 聚焦时操作仍可见。active 只在当前项显示。",
      },
      {
        name: "href",
        type: "string",
        description: "提供时渲染原生链接，支持 target、rel、键盘和浏览器原生打开行为。",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "禁用时阻止激活；链接移除实际 href 和 Tab 停靠点。",
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
        type: "ButtonHTMLAttributes | AnchorHTMLAttributes",
        description:
          "支持对应元素的 className、style 与适用的 DOM 属性；以 TypeScript 定义为准。",
      },
    ],
    notes: [
      "当前页使用灰色圆角底和逻辑起始侧蓝色竖标；悬停不显示竖标。",
      "默认行高 32px，图标和标签垂直居中。长纯文本标签单行省略，仍保留完整的可访问名称；可通过 --mt-height 调整。",
      "尾部操作不触发导航。建议使用提供可访问名称的 Button iconOnly；Sidebar 的图标窄栏隐藏尾部操作，窄栏子菜单弹层中的完整行仍显示。",
      "不提供 href 时仍为按钮。ref 指向实际 button 或 a；组件不接管路由。",
    ],
  },
  {
    name: "NavSubmenu",
    description: "有子项的侧边栏导航；展开时内联，收起时侧向弹出。",
    importNames: ["NavSubmenu", "NavItem", "Sidebar"],
    code: 'import { NavSubmenu, NavItem, Sidebar } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return <Sidebar collapsible><NavSubmenu label="账单与许可" defaultExpanded><NavItem active>用量</NavItem><NavItem>许可</NavItem></NavSubmenu></Sidebar>;\n}',
    props: [
      { name: "label", type: "ReactNode", description: "必填分支名称，窄栏下仍作为按钮的可访问名称。" },
      { name: "children", type: "ReactNode", description: "必填子导航，使用 NavItem。" },
      { name: "icon", type: "ReactNode", description: "可选图标；窄栏中省略时显示圆形占位。" },
      { name: "defaultExpanded", type: "boolean", default: "false", description: "非受控内联初始状态。" },
      { name: "expanded", type: "boolean", description: "受控内联状态，不控制窄栏弹出层。" },
      { name: "onExpandedChange", type: "(expanded: boolean) => void", description: "用户切换内联展开状态时调用。" },
      { name: "disabled", type: "boolean", default: "false", description: "禁用分支触发按钮。" },
    ],
    notes: [
      "只提供一层子导航。静态分组用 NavGroup；当前页状态设置在 NavItem 的 active 上，有当前子项时父项仅加粗标题。",
      "Sidebar 或 AdminLayout.Sider 收起时，子项在可键盘操作的侧向浮层中展示，选中子项关闭浮层。切回宽栏后还原内联展开状态。",
    ],
  },
  {
    name: "NavGroup",
    description: "以可选标题组织导航项，相邻组默认以细线分隔，标题末端可放置独立操作。",
    importNames: ["NavGroup", "NavItem", "Button"],
    code: `import { useState } from "react";
import { NavGroup, NavItem, Button } from "@bixlab/mtone";
import "@bixlab/mtone/styles.css";

export default function Demo() {
  const [viewCount, setViewCount] = useState(0);
  return (
    <nav aria-label="工作空间">
      <NavGroup label="个人空间">
        <NavItem active>工作笔记</NavItem>
        <NavItem>阅读记录</NavItem>
      </NavGroup>
      <NavGroup label="保存的视图" actions={<Button iconOnly size="sm" variant="ghost" aria-label="新增视图" onClick={() => setViewCount((count) => count + 1)}>+</Button>}>
        <NavItem>保存的视图：{viewCount}</NavItem>
      </NavGroup>
      <NavGroup label="工具" divider={false}>
        <NavItem>设置</NavItem>
      </NavGroup>
    </nav>
  );
}`,
    props: [
      {
        name: "label",
        type: "ReactNode",
        description: "可选分组标题。",
      },
      {
        name: "divider",
        type: "boolean",
        default: "true",
        description: "仅在前一个兄弟元素也是 NavGroup 时绘制组前分隔线。设为 false 只隐藏这一条线，不改变间距。",
      },
      {
        name: "actions",
        type: "ReactNode",
        description: "标题行末端的独立操作。可传入一个控件，或用片段组合多个控件；无标题时仍可单独显示。收起的 Sidebar 隐藏此操作区。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
    ],
    notes: [
      "组前分隔线是装饰，不会出现在无障碍树中。独立导航和 Sidebar 展开、收起时，分隔线上下留白一致；有其它导航项隔开时不画线。",
      "组内 NavItem 默认行高 32px，相邻项仍保留 3px 间距。首组不额外加上方空白；后续分组上间距仍为 12px，侧边栏自身的内边距不变。",
      '标题操作不触发导航项；建议使用 size="sm"、variant="ghost" 的 Button iconOnly 并提供可访问名称。操作区与标题分开布局，过长的标题会截断。',
    ],
  },
  {
      "name": "Breadcrumb",
      "description": "紧凑的层级路径，支持图标、下拉菜单与自定义分隔符。",
      "importNames": [
        "Breadcrumb"
      ],
      "code": "import { Home } from \"lucide-react\";\nimport { Breadcrumb } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return <Breadcrumb separator=\"/\" items={[\n    { label: \"首页\", icon: <Home size={14} />, href: \"#/\" },\n    { label: \"组件\", href: \"#/components\", menu: {\n      items: [{ key: \"menu\", label: \"Menu\", onSelect: () => { window.location.hash = \"/components/Menu\"; } }],\n      align: \"left\"\n    } },\n    { label: \"Breadcrumb\" }\n  ]} />;\n}",
      "props": [
        {
          "name": "items",
          "type": "BreadcrumbItem[]",
          "description": "必填。保留 label/href 用法；可指定 key、icon、aria-label、disabled、onClick、target、rel、separator 和 menu。"
        },
        {
          "name": "separator",
          "type": "ReactNode",
          "default": "ChevronRight 图标",
          "description": "全局分隔符；每项 separator 覆盖其后的分隔符，null/false/空字符串隐藏。最后一项不显示后置分隔符。"
        },
        {
          "name": "items[].icon / aria-label",
          "type": "ReactNode / string",
          "description": "icon 显示在文字前并对辅助技术隐藏。纯图标请传 label={null} 和可访问 aria-label；复杂图文菜单也建议提供 aria-label。"
        },
        {
          "name": "items[].menu",
          "type": "Omit<PopoverMenuProps, 'trigger'>",
          "description": "复用本库 Popover.Menu：items、onSelect、open/defaultOpen/onOpenChange、width、align。支持分组、禁用及二级菜单；默认内容自适应宽度。空菜单不渲染按钮。"
        },
        {
          "name": "items[].onClick",
          "type": "MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>",
          "description": "非末项有 href 时绑定链接；否则渲染操作按钮，可由应用路由处理。末项保持当前位置的非交互文本。"
        },
        {
          "name": "items[].disabled",
          "type": "boolean",
          "default": "false",
          "description": "禁用该项的链接、操作和菜单。"
        },
        {
          "name": "aria-label / className / style",
          "type": "原生 nav 属性",
          "default": "aria-label=\"Breadcrumb\"",
          "description": "导航可访问名称和外层样式；其余原生 nav 属性透传。"
        }
      ],
      "notes": [
        "保持 label/href API 与最后一项 aria-current=\"page\" 的行为；无 href/onClick/menu 的祖先项是普通文本，不创建无目标链接。",
        "链接或操作同时带 menu 时文字与箭头按钮独立；末项带菜单时仍单独保留当前页文本。不要在 label 内嵌入链接或按钮。",
        "菜单通过点击、Enter/Space 或 ArrowDown 展开，复用 Popover.Menu 的方向键、Esc 和焦点返回。菜单项导航通过 onSelect 交给应用路由；本组件不拼接路由参数。",
        "灰色 hover、无下划线，保留可见键盘焦点。紧凑图标与正文居中，窄容器自动换行。"
      ]
  },
  {
    name: "Tree",
    description:
      "保持紧凑风格的层级树，支持多选、级联勾选、目录模式、异步加载、拖放事件与虚拟滚动。",
    importNames: ["Tree"],
    code: 'import { useState } from "react";\nimport { Tree, type TreeKey } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  const [checked, setChecked] = useState<TreeKey[]>([]);\n  return <Tree label="资料目录" checkable defaultExpandAll\n    checkedKeys={checked}\n    onCheck={keys => setChecked(Array.isArray(keys) ? keys : keys.checked)}\n    items={[{id:"root",label:"知识库",children:[\n      {id:"notes",label:"工作笔记"},{id:"ideas",label:"灵感"}\n    ]}]} />;\n}',
    props: [
      {
        name: "items",
        type: "TreeItem[]",
        description:
          "原有数据格式：id、label、children；可含 disabled、disableCheckbox、checkable、selectable、isLeaf、icon 及自定义字段。",
        default: "[]",
      },
      {
        name: "treeData",
        type: "TreeNode[] | Record<string, unknown>[]",
        description:
          "key、title、children 数据格式；提供时优先于 items。标准化后的事件节点仍使用 id / label。",
      },
      {
        name: "fieldNames",
        type: "{ key?: string; title?: string; children?: string }",
        description:
          "映射输入数据字段。items 默认 id / label / children，treeData 默认 key / title / children。",
      },
      {
        name: "value / defaultValue",
        type: "string",
        description:
          "保留原有单选受控值或初始值；数字键、多选或清空选择请用 selectedKeys。",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "原有单选回调；仅为字符串节点键触发。",
      },
      {
        name: "selectedKeys / defaultSelectedKeys",
        type: "TreeKey[]",
        description:
          "受控或初始选中列表；selectedKeys 优先于 value，空数组可清空选择。",
      },
      {
        name: "multiple / selectable",
        type: "boolean",
        description:
          "multiple 开启多选，selectable 控制是否可选择；勾选与选择互相独立。",
        default: "false / true",
      },
      {
        name: "onSelect",
        type: "(keys: TreeKey[], info) => void",
        description:
          "info 含 selected、node、selectedNodes、event；受控时应用需更新 selectedKeys。",
      },
      {
        name: "expanded / defaultExpanded",
        type: "string[]",
        description:
          "保留原有受控或初始展开 ID；新版 expandedKeys / defaultExpandedKeys 优先。",
      },
      {
        name: "onExpandedChange",
        type: "(ids: string[]) => void",
        description:
          "保留原有展开回调，仅包含字符串键；混合或数字键请使用 onExpand。",
      },
      {
        name: "expandedKeys / defaultExpandedKeys",
        type: "TreeKey[]",
        description: "受控或初始展开节点；空数组折叠全部。",
      },
      {
        name: "defaultExpandAll / defaultExpandParent / autoExpandParent",
        type: "boolean",
        description:
          "分别控制初始全部展开、初始展开祖先、每次根据展开键派生祖先展开。默认值只在挂载时生效，不随异步数据重新应用。",
        default: "false / true / false",
      },
      {
        name: "onExpand",
        type: "(keys: TreeKey[], info: { expanded: boolean; node: TreeItem }) => void",
        description: "用户展开 / 折叠时回调。受控时应用需更新展开键。",
      },
      {
        name: "checkable / checkStrictly",
        type: "boolean",
        description: "开启复选框；checkStrictly=true 关闭父子关联。",
        default: "false / false",
      },
      {
        name: "checkedKeys",
        type: "TreeKey[] | { checked: TreeKey[]; halfChecked: TreeKey[] }",
        description:
          "受控勾选。非严格模式根据 checked 列表派生父子全选和半选；严格模式支持显式 halfChecked。",
      },
      {
        name: "defaultCheckedKeys",
        type: "TreeKey[]",
        description: "非受控初始勾选列表。",
        default: "[]",
      },
      {
        name: "onCheck",
        type: "(keys: TreeCheckedKeys, info) => void",
        description:
          "严格模式返回 { checked, halfChecked }，否则返回全选键数组。info 含 checked、node、checkedNodes、halfCheckedKeys、event。",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "禁用整棵树的选择、勾选、展开及拖放交互。",
        default: "false",
      },
      {
        name: "blockNode / showLine",
        type: "boolean",
        description: "整行占宽或仅内容占宽；showLine 显示层级线条。",
        default: "true / false",
      },
      {
        name: "showIcon",
        type: "boolean",
        description:
          "控制节点图标。默认保留原有节点 icon；目录模式默认显示文件夹 / 文件图标。根 icon 需配合 showIcon。",
      },
      {
        name: "icon / switcherIcon",
        type: "ReactNode | (info: TreeNodeInfo) => ReactNode",
        description:
          "根级节点图标或展开图标；info 含 node、expanded、selected、checked、loading。节点自身 icon 优先，节点 icon 函数接收 TreeItem。",
      },
      {
        name: "switcherLoadingIcon",
        type: "ReactNode",
        description: "自定义加载图标。",
      },
      {
        name: "titleRender",
        type: "(node: TreeItem) => ReactNode",
        description: "自定义标题内容；节点 label 仍提供默认可访问名称。",
      },
      {
        name: "indent",
        type: "number",
        default: "20",
        description: "每层新增的逻辑缩进（px），同时调整节点、引导线和连接线；负值按 0，无效值回退到 20。",
      },
      {
        name: "gap",
        type: "number",
        default: "2",
        description: "相邻行间距（px）。接受有限非负数（可含小数）；设为 0 取消间距，无效值回退到 2。普通和虚拟列表一致，不改变单行的高度或命中区域。",
      },
      {
        name: "endContent",
        type: "(info: TreeNodeInfo) => ReactNode",
        description: "在行的逻辑末端独立显示计数或简短状态；标题省略不会压缩此区域。info 含 node、expanded、selected、checked、loading。",
      },
      {
        name: "actions",
        type: "(info: TreeNodeInfo) => TreeAction | readonly TreeAction[] | null | undefined",
        description: "为可用节点渲染独立的末端按钮或菜单。TreeAction 含 content 和可选 visibility：always（默认）、hover（行悬停、进入键盘焦点时显示，无悬停设备也可用）、active（节点已选中时显示）。隐藏仍占位，操作不选择、展开或拖动节点；请为纯图标按钮提供可访问名称。",
      },
      {
        name: "filterTreeNode",
        type: "(node: TreeItem) => boolean",
        description: "高亮返回 true 的节点，不删除其他节点或自动展开祖先。",
      },
      {
        name: "loadData",
        type: "(node: TreeItem) => Promise<unknown>",
        description:
          "展开未加载分支时调用，同一节点并发去重。Promise 返回值不直接作为 children，应用必须不可变更新 items / treeData。叶节点应设置 isLeaf=true。",
      },
      {
        name: "loadedKeys / defaultLoadedKeys",
        type: "TreeKey[]",
        description:
          "受控或初始加载成功键；提供 loadedKeys 后需在 onLoad 中更新以防后续重复加载。",
      },
      {
        name: "onLoad / onLoadError",
        type: "(keys, { node }) => void / (error, node) => void",
        description:
          "加载成功或失败回调。失败显示错误提示并允许通过展开控件重试。",
      },
      {
        name: "height / itemHeight / virtual",
        type: "number / number / boolean",
        description:
          "正数 height 开启定高滚动；默认虚拟化，只挂载可见附近行。itemHeight 控制所有模式的实际行高，默认 32px，最小 24px，不包含 gap。非正数或非有限值回退到默认值；virtual=false 保留滚动容器但渲染全部节点。",
        default: "— / 32 / true",
      },
      {
        name: "draggable",
        type: "boolean | (node: TreeItem) => boolean",
        description: "启用 HTML 原生拖放，可按节点决定是否允许拖动。",
        default: "false",
      },
      {
        name: "allowDrop",
        type: "({ dragNode, dropNode, dropPosition }) => boolean",
        description:
          "可限制落点。dropPosition=-1 / 0 / 1 分别表示目标前 / 内 / 后；自身及后代始终禁止。",
      },
      {
        name: "onDrop",
        type: "(info: TreeDropInfo) => void",
        description:
          "info 含 event、node、dragNode、dragNodesKeys、dropPosition、dropToGap。应用按结果更新数据，组件不自动移动节点。",
      },
      {
        name: "onDragStart / onDragEnd / onDragOver / onDragLeave",
        type: "({ event, node }) => void",
        description: "原生拖放阶段回调。",
      },
      {
        name: "onDragEnter",
        type: "({ event, node, expandedKeys }) => void",
        description:
          "有效目标进入回调，可由应用结合受控展开键实现悬停展开；组件不自动延时展开。",
      },
      {
        name: "onRightClick / onDoubleClick",
        type: "({ event, node }) => void / (event, node) => void",
        description: "节点右键或双击回调。",
      },
      {
        name: "directory / expandAction",
        type: 'boolean / false | "click" | "doubleClick"',
        description:
          "设置 directory 开启目录模式；默认点击展开，false 禁用标题触发展开但保留箭头 / 方向键。",
        default: 'false / "click"',
      },
      {
        name: "label / className / style",
        type: "string / string / CSSProperties",
        description: "可访问名称、根类名与样式；支持其余不冲突的 div 属性。",
      },
      {
        name: "ref",
        type: "React.Ref<TreeRef>",
        description:
          "暴露 nativeElement、focus()、scrollTo({ key, align?, offset?, autoExpand? })；align 为 top / bottom / auto。autoExpand 只在非受控展开模式生效。",
      },
    ],
    notes: [
      "文档的交互配置示例可即时切换连接线、节点图标、复选框、多选，并调整 itemHeight 和 gap；使用恢复默认可重置示例。",
      "TreeKey 为 string | number；全树键必须唯一且数字有限，缺失或重复键会报错。保留原有 items / id / label、value、expanded 用法；不要混用新旧受控属性。",
      "勾选传导在 disabled、disableCheckbox 或 checkable=false 节点停止；严格模式下父子完全独立。disabled 不会隐藏节点或清除外部传入状态。",
      "支持方向键、Home / End、Enter、Space 和字符首字母定位。Space 在复选模式中切换勾选；目录多选支持 Ctrl / Command 追加、Shift 可见范围选择。",
      "loadData 只管理异步状态，不负责请求协议或合并数据；叶节点需 isLeaf=true。defaultExpandAll 仅初始化有效，加载后展开由 expandedKeys 控制。",
      "虚拟化要求标题单行、固定行高；不支持自动测量变高行。长标题省略显示。scrollTo 自动展开只适用于已存在的数据，不能自动加载未知后代。",
      "侧栏文档树可用 directory + expandAction={false} 分开标题选择与箭头展开，以 selectedKeys 标记当前文档；右方向键仍可展开。items 与 treeData 的每个节点都可分别指定 icon，包括图标组件或 Emoji。已预载分支可通过 defaultLoadedKeys 避免重复请求；加载失败后可重新展开重试。",
      "拖放使用桌面原生 HTML 拖放事件，不包含触摸拖放或键盘拖动。onDrop 不自动修改树，应用负责不可变移动和持久化数据。",
      "未实现 JSX TreeNode、Tree.useTree、motion、语义 classNames / styles，以及 showLine / draggable 的对象配置。",
      "使用 mtone 主题变量与本库复选框视觉风格。",
    ],
  },
  {
    name: "Tabs",
    description: "中性风格的标签切换，支持顶部贴合、卡片编辑、多方向布局和溢出导航。",
    importNames: ["Tabs"],
    code: 'import { Tabs } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return <Tabs items={[{value:"all",label:"全部",content:"全部文档"},{value:"saved",label:"收藏",content:"收藏文档"}]} />;\n}',
    props: [
      {
        name: "items",
        type: "TabItem[]",
        description:
          "必填；value、label、content，另可设 disabled、icon、closable、closeLabel、forceRender、destroyOnHidden。",
      },
      {
        name: "value / defaultValue",
        type: "string",
        description: "受控/初始值；省略时选择首个未禁用项。",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "用户切换及非受控有效回退时触发。",
      },
      {
        name: "placement",
        type: '"top" | "bottom" | "start" | "end"',
        description: "默认 top；start/end 为逻辑方向。",
      },
      {
        name: "variant",
        type: '"line" | "card" | "editable-card" | "attached"',
        description: "默认 line。attached 的顶部选中项与内容区相接；bottom/start/end 保留指定位置并使用 line 样式。",
      },
      {
        name: "size",
        type: '"small" | "medium" | "large"',
        description: "默认 medium。所有变体、尺寸和位置的标签项外高均为 32px（含边框）；size 仍区分字号。",
      },
      {
        name: "indicatorColor",
        type: "TabsIndicatorColor",
        default: "currentColor",
        description: "使用 line 样式时的选中指示线颜色，包含 attached 在非顶部位置的线型回退。支持主题预设 neutral/blue/green/orange/red/purple/teal/coral，或任意有效 CSS 颜色；不改变基准线和文字颜色。",
      },
      {
        name: "centered / gap",
        type: "boolean / number",
        description: "居中排列（溢出时回到起点）；间隔单位 px，最小 0。默认线型为 6px，card/editable-card 和顶部 attached 为 4px。",
      },
      {
        name: "extraStart / extraEnd",
        type: "ReactNode",
        description: "导航栏前后附加内容。",
      },
      {
        name: "activateOnFocus",
        type: "boolean",
        description: "默认 false，方向键移动焦点不立即切换。",
      },
      {
        name: "destroyOnHidden",
        type: "boolean",
        description: "默认 true，卸载隐藏面板；false 保留已访问面板状态。",
      },
      {
        name: "onEdit",
        type: '(action: "add" | "remove", value?: string) => void',
        description: "仅请求增删；缺少回调时编辑按钮禁用。",
      },
      {
        name: "hideAdd / addIcon",
        type: "boolean / ReactNode",
        description: "编辑卡片隐藏或自定义新增按钮图标。",
      },
      {
        name: "label / addLabel / moreLabel",
        type: "string",
        description: "标签列表、新增和更多按钮的可访问名称，默认随语言切换。",
      },
      {
        name: "onTabClick",
        type: "(value: string, event: MouseEvent<HTMLButtonElement>) => void",
        description: "点击标签回调。",
      },
      {
        name: "reorderable / onOrderChange",
        type: "boolean / (values: string[]) => void",
        description:
          "默认关闭；请求重排后的完整键列表，禁用标签不可作为拖动源/目标。",
      },
      {
        name: "ref / 原生属性",
        type: "Ref<HTMLDivElement> / HTMLAttributes<HTMLDivElement>",
        description: "根节点ref、className、style、dir和ARIA等。",
      },
    ],
    notes: [
      "溢出菜单中相邻选项保留 3px 间距；横向标签栏间距不变。",
      "保留旧 items/value/defaultValue/onValueChange；value 必须唯一。",
      "默认 destroyOnHidden=true 延续旧版隐藏面板卸载行为；false 时仅保留访问过的面板。forceRender 让该面板始终挂载；项目级 destroyOnHidden 可覆盖全局值。",
      "非受控选中项被删除或禁用时切换到首个可用项；无可用项时不选中且不发送字符串 null。受控模式由应用更新 value，非法或禁用 value 不自动纠正。",
      "editable-card 的增删只发送回调，不修改 items；应用需更新列表，并在受控模式下选中有效新值。关闭按钮不会选择被关闭标签。",
      "主题通过 --mt-accent-* 为指示线和其他组件提供共享色；可在 MtoneProvider tokens 内覆盖。强制色彩模式保留系统可见线条。",
      "顶部 attached 使用淡底导航栏和单条分隔线。选中项保留上边与左右边，悬停仍使用面板底色；未选中项透明无描边。",
      "线型标签文字两侧各保留 6px 外边距。卡片式与可编辑卡片式的选中标签悬停时保持原背景。",
      "溢出时保留原生滚动条并提供更多菜单（列出全部标签）；垂直导航默认最大高度320px，可用 --mt-tabs-max-height 调整。",
      "默认方向键只移动焦点，Enter/Space 激活；activateOnFocus 可改为自动激活。启用排序后 Alt+Shift+方向键请求相邻排序，原生拖放不支持触摸；回调由应用更新 items。",
      "未实现自定义 tabBar 渲染器、指示线动画引擎或更多菜单搜索。标签 label 请勿嵌入交互控件。",
    ],
  },
  {
    name: "Pagination",
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
    name: "Menubar",
    description: "桌面应用式菜单栏，协调多个操作菜单，支持子菜单、分组及键盘导航。",
    importNames: ["Menubar"],
    code: 'import { Menubar } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return <Menubar aria-label="编辑器菜单" menus={[{key:"file",label:"文件",items:[{key:"new",label:"新建"},{key:"export",label:"导出",children:[{key:"pdf",label:"PDF"},{key:"md",label:"Markdown"}]}]},{key:"edit",label:"编辑",items:[{key:"undo",label:"撤销"}]}]} onSelect={(itemKey, menuKey) => console.log(menuKey, itemKey)} />;\n}',
    props: [
      { name: "menus", type: "MenubarMenu[]", description: "必填；每个顶层菜单包含唯一 key、label、items: MenuEntry[]，可选 icon、disabled、width、align。items 与 Menu 共用，支持分组、分隔线、多级子菜单、复选项与单选组。" },
      { name: "openKey / defaultOpenKey", type: "string | null", default: "null", description: "受控打开的顶层菜单 key / 非受控初始 key；null 表示全部关闭。受控时配合 onOpenChange 更新。" },
      { name: "onOpenChange", type: "(key: string | null) => void", description: "请求打开、切换或关闭顶层菜单时调用。" },
      { name: "onSelect", type: "(itemKey: string, menuKey: string) => void", description: "普通叶子命令选中后调用；先执行条目自己的 onSelect。展开子菜单和切换勾选项不触发此回调。" },
      { name: "trigger", type: "'click' | 'hover'", default: "click", description: "默认点击打开；已有菜单打开时，悬停其他标签可切换。hover 允许直接悬停打开，点击与键盘仍可用。" },
      { name: "loop", type: "boolean", default: "true", description: "顶层方向键导航是否首尾循环。" },
      { name: "disabled", type: "boolean", default: "false", description: "禁用整条菜单栏；单个菜单也可设置 disabled。" },
      { name: "width", type: "CSSProperties['width']", description: "顶层浮层默认按内容宽度（最小 160px），不跟随标签；可指定 px 或 CSS 宽度。单个菜单 width 优先，子菜单独立按内容宽度。" },
      { name: "align", type: "'start' | 'end' | 'left' | 'right'", default: "start", description: "顶层浮层首选对齐边；单个菜单 align 优先。start/end 随 RTL 变化，left/right 是物理左右，受视口碰撞处理约束。" },
      { name: "HTML div attributes", type: "HTMLAttributes<HTMLDivElement>", description: "支持 aria-label、className、style 等根元素属性；不接受 children，通过 menus 定义菜单。" },
    ],
    notes: [
      "同组相邻菜单或选项行之间保留 3px 间距；首项、分组标题和分隔线不额外增加间距。",
      "Menubar 是多个命令菜单的协调容器，一次打开一个顶层菜单；单一浮层操作入口用 Popover.Menu，页面内操作列表用 Menu，自定义浮层内容用 Popover。Menubar 与 Popover.Menu 保留菜单语义，不嵌套额外 dialog。",
      "菜单栏作为一个 Tab 停靠点，左右方向键移动顶层焦点；Enter、Space 或向下键进入菜单，Escape 退出并返回触发项。键盘逻辑由 Base UI 管理。快捷键文字仅展示，不注册全局快捷键。",
      "RTL 同时提供 @base-ui/react/direction-provider 的 DirectionProvider direction=rtl 与 DOM dir=rtl；start/end 和左右方向键按方向上下文工作。",
      "菜单栏保持单行，窄屏时横向滚动；浮层受可用视口宽高限制。保留 mtone 紧凑高度、灰色背景与淡蓝色细边框。",
      "复选项 {type:'checkbox', key, label, checked/defaultChecked, onCheckedChange, closeOnClick?} 默认选择后不关闭。单选组 {type:'radio-group', key, label, value/defaultValue, onValueChange, children:[{key,label,...}]} 以子项 key 为值，选择后保持打开。通过各自变更回调处理，不触发 Menubar 的 onSelect。",
      "菜单 key 在同一栏内唯一，条目 key 在同级内唯一。示例命令仅更新演示状态，不执行保存、删除或剪贴板操作。",
    ],
  },
  {
    name: "Menu",
    description: "不带触发器的内联操作菜单，支持分组、子菜单和方向键导航。",
    importNames: ["Menu"],
    code: 'import { Menu } from "@bixlab/mtone";\nimport { FileText } from "lucide-react";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Menu label="文档操作" items={[{type:"group",key:"files",label:"文档",children:[{key:"open",label:"打开",icon:<FileText />},{key:"export",label:"导出",children:[{key:"pdf",label:"PDF"},{key:"markdown",label:"Markdown"}]}]},{type:"divider",key:"divider"},{key:"delete",label:"移至回收站",danger:true}]} onSelect={(key) => console.log(key)} />\n  );\n}',
    props: [
      {
        name: "items",
        type: "MenuEntry[]",
        description: "必填；普通项 key、label，可选 icon、shortcut、disabled、danger、onSelect、children（非空时为子菜单）；也支持 group 分组、divider 分隔线、checkbox 复选项、radio-group 单选组。",
      },
      {
        name: "label",
        type: "string",
        description: "菜单的可访问名称，默认随语言显示为“菜单”或 Menu；同一页面有多个菜单时分别命名。",
      },
      {
        name: "className",
        type: "string",
        description: "菜单容器的附加样式类。",
      },
      {
        name: "onSelect",
        type: "(key: string) => void",
        description: "普通叶子命令选中时调用；先执行条目的 onSelect。打开子菜单或切换复选/单选项不触发。",
      },
    ],
    notes: [
      "Menu 不渲染触发按钮或外层浮层；点击或悬停触发的操作菜单请使用 Popover.Menu。",
      "可以把 Menu 作为普通 Popover 自定义内容的一部分；选中菜单项不会替应用关闭外层 Popover，需要时在 onSelect 中更新外层的受控 open。",
      "同组相邻菜单或选项行之间保留 3px 间距；首项、分组标题和分隔线不额外增加间距。",
      "同一菜单面板任意项渲染左侧图标时，所有项保留 16px 图标列和 8px 间距；全部为空则移除该列。渲染 null 的图标不计入。支持分组、分隔线、多级子菜单及空 children 叶子项。",
      "快捷键文字仅作提示，不注册全局快捷键；可用 formatShortcut 生成平台标签，并在 ShortcutsProvider 内用 useShortcut 显式绑定同一操作。条目 key 在同级内唯一。子菜单可用鼠标、方向键与 Escape 操作；内联菜单始终可用，不需要先打开。",
      "复选项支持 checked/defaultChecked、onCheckedChange；在浮层中默认不关闭，可显式设置 closeOnClick。单选组用 value/defaultValue、onValueChange，值对应子项 key；两类选项用各自的回调，不触发外层 onSelect。",
    ],
  },
  {
    name: "ContextMenu",
    description: "在指定区域右键打开操作菜单。",
    importNames: ["ContextMenu"],
    code: 'import { ContextMenu } from "@bixlab/mtone";\nimport { Copy } from "lucide-react";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <ContextMenu items={[{key:"copy",label:"复制",icon:<Copy />},{key:"paste",label:"粘贴",shortcut:"⌘V"}]} onSelect={(key) => console.log(key)}><div style={{padding:24}}>在此区域点击右键</div></ContextMenu>\n  );\n}',
    props: [
      { name: "width", type: "CSSProperties['width']", description: "主面板宽度；默认按内容，最小160px，受可用视口约束，子菜单独立按内容宽度。右键菜单不提供trigger左右对齐属性。" },
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "items",
        type: "MenuEntry[]",
        description:
          "必填；普通项 key、label，可选 icon、shortcut、disabled、danger、onSelect、children（非空时为子菜单）；分组 {type: 'group', key, label, children}；分隔线 {type: 'divider', key}；复选项 type: 'checkbox'；单选组 type: 'radio-group'。",
      },
      {
        name: "onSelect",
        type: "(key: string) => void",
        description: "选中叶子项时调用；展开子菜单不触发。先执行项自己的 onSelect，再执行此回调。",
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
    notes: ["同一菜单面板任意项渲染左侧 icon 时，所有项保留 16px 图标列和 8px 间距；全部为空则移除该列。动态变化会同步对齐，shortcut 不参与图标判断。支持 children 子菜单、type: group 分组（label + children）与 type: divider 分隔线。icon 渲染为 null 时不占列；若自定义 icon 输出空元素或隐藏元素，仍视作图标内容。", "children 为右键区域；不接受 Popover.Menu 的 trigger 或 triggerMode。"],
  },
  {
    name: "Popover",
    description: "非模态自定义浮层，另提供 Popover.Menu 操作菜单。",
    importNames: ["Popover"],
    code: 'import { Popover } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <>\n      <Popover trigger="查看说明" title="提示" content="这里放置相关内容。" />\n      <Popover.Menu trigger="文档操作" items={[{ key: "open", label: "打开文档" }]} onSelect={(key) => console.log(key)} />\n    </>\n  );\n}',
    props: [
      {
        name: "trigger",
        type: "string | ReactElement",
        description: "必填；字符串使用 Button 的 dropdown 预设，自定义触发器可传 React 元素。",
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
        name: "label",
        type: "string",
        description: "浮层的可访问名称，优先于可见 title。无 title 和 label 时默认使用浮层内容 / Popover content。",
      },
      {
        name: "width",
        type: "number | string",
        description: "浮层宽度，数字为 px；默认随内容而非触发按钮，且自动约束在视口内。",
      },
      {
        name: "align",
        type: '"start" | "center" | "end" | "left" | "right"',
        default: "center",
        description: "沿边对齐。上下浮层的 start/end 随布局方向，left/right 为物理边；左右浮层用 start/end 对齐上/下边。",
      },
      {
        name: "unstyled",
        type: "boolean",
        default: "false",
        description: "移除 Popover 自身的背景、边框、阴影和内边距，但保留定位、键盘操作和开关行为。仅在内容自行绘制外观时启用；省略此属性则保留默认外壳。",
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
      {
        name: "Popover.Menu.items / label / onSelect",
        type: "MenuEntry[] / string / (key: string) => void",
        description: "操作浮层的必填条目、可访问名称及普通叶子命令选择回调；条目定义与内联 Menu 相同。",
      },
      {
        name: "Popover.Menu.trigger / triggerMode",
        type: 'string | ReactElement / "click" | "hover"',
        description: "必填触发器及触发方式（默认 click）；hover 仍支持点击、键盘与触屏。",
      },
      {
        name: "Popover.Menu.width / align",
        type: 'CSSProperties["width"] / "start" | "end" | "left" | "right"',
        description: "菜单面板默认随内容且最小 160px；对齐默认为 start。子菜单独立定宽。",
      },
      {
        name: "Popover.Menu.open / defaultOpen / onOpenChange",
        type: "boolean / boolean / (open: boolean) => void",
        description: "菜单浮层的受控开关、非受控初始开关及变更回调。",
      },
    ],
    notes: [
      "Popover 是非模态 dialog，可使用 Tab 操作自定义内容，Escape 关闭并恢复焦点。自定义触发器需转发 ref 与 DOM props，浮层继承 MtoneProvider 上下文。",
      "Popover.Menu（PopoverMenuProps）适合纯操作菜单：传 trigger、items 与可选 label / onSelect；保留方向键、分组、子菜单、焦点恢复和叶子选择关闭，不另嵌套 dialog。",
      "Popover.Menu 的 triggerMode 默认为 click，可选 hover。悬停支持鼠标跨间隙和进入子菜单，不抢占键盘焦点；点击、键盘与触屏仍可用。字符串用内容宽度的下拉预设 Button，也可传自定义元素。",
      "Popover.Menu 的 width 默认随内容且最小 160px，align 默认 start，可传 start/end（随方向）或 left/right（物理边）；子菜单单独定宽。受控开关用 open / onOpenChange，或用 defaultOpen 设置初始状态。",
      "普通 Popover 的 content 可组合触发器无关的 Menu 和其他内容；内联 Menu 不改变外层 Popover 的开关，应用可在 onSelect 中控制。",
    ],
  },
  {
    name: "Tooltip",
    description: "为单个触发元素提供简短说明，支持位置、箭头和不同触发方式；使用 TooltipProvider 共享延迟。",
    importNames: ["Tooltip", "TooltipProvider"],
    code: `import { Button, Tooltip, TooltipProvider } from "@bixlab/mtone";
import "@bixlab/mtone/styles.css";

export default function Demo() {
  return (
    <TooltipProvider delay={250}>
      <Tooltip content="复制当前链接" side="top" arrow>
        <Button>复制链接</Button>
      </Tooltip>
    </TooltipProvider>
  );
}`,
    props: [
      { name: "children", type: "ReactElement", description: "必填；单个触发元素，自定义元素需转发 ref 和 DOM 属性。" },
      { name: "content", type: "ReactNode", description: "必填；简短说明，不要放交互控件。" },
      { name: "trigger", type: '"hover" | "focus" | "click" | "contextMenu"', default: '"hover"', description: "默认支持悬停和键盘聚焦；focus 仅聚焦，click 点按切换，contextMenu 支持右键、菜单键或 Shift+F10。" },
      { name: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (open: boolean) => void", description: "受控状态、非受控初值和变化通知。使用 open 时在回调中更新状态。" },
      { name: "delay / closeDelay", type: "number", default: "600 / 0 ms", description: "鼠标悬停打开与离开的延迟；省略时继承 TooltipProvider 的设置。" },
      { name: "side / align", type: '"top" | "bottom" | "left" | "right" / "start" | "center" | "end"', default: '"top" / "center"', description: "优先显示方向与对齐方式；开启避让时可按可用空间调整。" },
      { name: "offset / alignOffset", type: "number", default: "6 / 0 px", description: "沿主轴离开触发元素的距离与沿对齐轴的偏移。" },
      { name: "avoidCollisions", type: "boolean", default: "true", description: "空间不足时自动调整首选方向或对齐方式；false 关闭全部避让。" },
      { name: "shift", type: "boolean", description: "省略时保留默认避让规则；true 启用沿对齐轴移动，false 仅允许翻转方向。avoidCollisions 为 false 时不生效。" },
      { name: "arrow / arrowPadding", type: "boolean / number", default: "false / 5 px", description: "是否显示指向触发元素的箭头，以及箭头距离提示边缘的最小间距。" },
      { name: "tone", type: '"default" | MtoneAccent', default: '"default"', description: "使用默认配色或 mtone 的色调预设。" },
      { name: "classNames / styles", type: "各部位 CSS 类 / CSSProperties", description: "可为 trigger、positioner、popup 与 arrow 指定独立样式。" },
      { name: "disabled / wrapDisabledTrigger", type: "boolean", default: "false", description: "前者禁用提示但不禁用触发元素；后者可包装原生 disabled 元素，使其提示仍可用。" },
      { name: "container", type: "HTMLElement | ShadowRoot | ref", description: "Portal 挂载容器，默认挂载到文档 body；自定义容器的 overflow 可能裁切内容。" },
      { name: "keepMounted", type: "boolean", default: "false", description: "关闭时仍保留浮层 DOM；默认关闭后卸载。" },
      { name: "zIndex", type: "number", description: "为此提示覆盖浮层层级，不改变应用的全局层级。" },
      { name: "TooltipProvider.delay / closeDelay / timeout", type: "number", description: "可选；共享悬停延迟，timeout 控制相邻提示快速切换的时间窗口，单位毫秒。" },
    ],
    notes: [
      "图标触发器仍需 aria-label；Tooltip 提供补充说明，不替代控件名称。不要把重要操作、唯一说明或交互控件放在提示里；复杂内容请使用 Popover。",
      "默认不渲染箭头，保持旧版外观。空间不足时位置可能不同于首选 side 和 align；自定义容器只是改变挂载位置。",
      "TooltipProvider 只管理同组的悬停延迟，不强制同一时刻仅打开一个提示。单个 Tooltip 可覆盖 delay 和 closeDelay。",
    ],
  },
{
  "name": "CardGroup",
  "description": "排列多个独立卡片，支持响应式列数与间距、跨列、纵向排列和行列分隔线。",
  "importNames": [
    "CardGroup",
    "Card"
  ],
  "code": "import { Card, CardGroup } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return (\n    <CardGroup columns={{ xs: 2, md: 3 }} gap={{ xs: 12, md: 20 }} divided>\n      <CardGroup.Item span={{ xs: 2, md: 3 }}>\n        <Card title=\"概览\">跨满当前整行</Card>\n      </CardGroup.Item>\n      <Card title=\"资料\">待整理 12 项</Card>\n      <Card title=\"笔记\">已阅读 20 项</Card>\n      <Card title=\"收藏\">常用资源</Card>\n    </CardGroup>\n  );\n}",
  "props": [
    {
      "name": "direction",
      "type": "\"horizontal\" | \"vertical\"",
      "default": "horizontal",
      "description": "horizontal 使用多列网格；vertical 固定单列并忽略 columns。"
    },
    {
      "name": "columns",
      "type": "number | Partial<Record<\"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\" | \"xxl\", number>>",
      "default": "{ xs: 1, sm: 2, lg: 3 }",
      "description": "网格列数。数字应用于全部断点；对象按视口断点逐级继承，未定义的初始值为 1。有效值取整并限制为 1–24。"
    },
    {
      "name": "gap",
      "type": "CardGroupResponsive",
      "default": "12",
      "description": "行列间距（px），支持数字或相同断点对象。有效值必须有限且非负，未定义的初始值为 12。"
    },
    {
      "name": "divided",
      "type": "boolean",
      "default": "false",
      "description": "在相邻行列的间距中显示分隔线，跟随当前列数与跨列布局调整。"
    },
    {
      "name": "CardGroup.Item.span",
      "type": "CardGroupResponsive",
      "default": "1",
      "description": "占用列数，可响应式配置；自动限制为当前总列数，不会撑出网格。"
    },
    {
      "name": "children / className / style / 原生属性",
      "type": "ReactNode / string / CSSProperties / HTMLAttributes<HTMLDivElement>",
      "description": "根节点与 Item 支持原生 div 属性。普通子元素自动包裹为 Item；显式 Item 可设置 span 或 hidden。"
    }
  ],
  "notes": [
    "CardGroup 是多个独立 Card 的外层布局；Card.Grid 是一张 Card 内的内容网格，二者不能混作同一个组件。CardGroup.Item 为静态子组件，不是独立命名导出。",
    "断点按浏览器视口计算：xs 从 0 开始，sm 576px、md 768px、lg 992px、xl 1200px、xxl 1600px；不是容器查询。缩小示例容器不会改变断点。",
    "默认手机单列；如需手机多列，可显式设置 columns={{ xs: 2, md: 3 }}。内容需适应有限列宽，过长的自定义内容仍须自行约束。",
    "direction=\"vertical\" 时 Item.span 同样限制为 1；divided 仅显示行间分隔。根 gap=0 时分隔线位于相邻项边缘。",
    "支持 Fragment 展开；隐藏项使用 CardGroup.Item hidden，不应仅用 CSS display:none 隐藏布局项，否则分隔线的行列推算不会同步。示例只演示本地布局，不读写服务器数据。"
  ]
},
  {
    "name": "Card",
    "description": "紧凑的结构化内容卡片，支持封面、操作、加载、标签页、元信息与网格。",
    "importNames": [
      "Card",
      "Button",
      "Avatar"
    ],
    "code": "import { useState } from \"react\";\nimport { Card, Button, Avatar } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  const [tab, setTab] = useState(\"overview\");\n  const [loading, setLoading] = useState(false);\n  return (\n    <Card\n      title=\"知识库\"\n      htmlTitle=\"原生悬浮提示使用 htmlTitle\"\n      extra={<Button size=\"sm\" onClick={() => setLoading(!loading)}>切换加载</Button>}\n      loading={loading}\n      tabList={[{key:\"overview\",label:\"概览\"},{key:\"notes\",label:\"笔记\"}]}\n      activeTabKey={tab}\n      onTabChange={setTab}\n      actions={[<Button key=\"save\" variant=\"ghost\" onClick={() => alert(\"本地示例\")}>收藏</Button>]}\n    >\n      {tab === \"overview\" ? <Card.Meta avatar={<Avatar name=\"林\" />} title=\"设计知识\" description=\"记录可复用的经验。\" /> : <p>这是笔记内容。</p>}\n    </Card>\n  );\n}",
    "props": [
{"name": "collapsible", "type": "boolean", "default": "false", "description": "在标题左侧显示收起/展开按钮。默认不折叠。"},
{"name": "collapsed", "type": "boolean", "description": "受控折叠状态；搭配 onCollapsedChange 更新。"},
{"name": "defaultCollapsed", "type": "boolean", "default": "false", "description": "非受控初始折叠状态，仅 collapsible 启用时生效。"},
{"name": "onCollapsedChange", "type": "(collapsed: boolean) => void", "description": "用户点击折叠按钮时请求切换状态；受控模式由父组件接受更新。"},
{"name": "collapseLabel", "type": "string", "description": "折叠按钮可访问名称；默认按状态与 locale 显示收起卡片/展开卡片（英文对应 Collapse card/Expand card）。"},
      {
        "name": "children",
        "type": "ReactNode",
        "description": "卡片主体；tabList 项未指定 content 时也用作该标签页主体。"
      },
      {
        "name": "title / extra",
        "type": "ReactNode",
        "description": "可见标题与标题栏尾部区域；无内容时不生成空标题栏。"
      },
      {
        "name": "htmlTitle",
        "type": "string",
        "description": "原生 HTML title 悬浮提示。旧 Card title 原生提示用法需迁移到此属性。"
      },
      {
        "name": "cover",
        "type": "ReactNode",
        "description": "独立封面区域，可放图片或其他内容；图片请提供合适的 alt。"
      },
      {
        "name": "actions",
        "type": "ReactNode[]",
        "description": "底部操作区域；请使用 Button 或链接等有语义的交互元素。"
      },
      {
        "name": "loading / loadingLabel",
        "type": "boolean / string",
        "description": "loading 默认 false，使用 Skeleton 显示加载态；loadingLabel 提供可访问的加载提示。"
      },
      {
        "name": "size",
        "type": "\"medium\" | \"small\"",
        "description": "默认 medium；紧凑风格提供较小 padding 的 small 变体。"
      },
      {
        "name": "variant",
        "type": "\"outlined\" | \"borderless\"",
        "description": "默认 outlined；borderless 隐藏可见边框并保留外框几何。"
      },
      {
        "name": "hoverable",
        "type": "boolean",
        "description": "默认 false，仅增加悬浮视觉反馈，不添加按钮语义、键盘操作或点击处理。"
      },
      {
        "name": "type",
        "type": "\"inner\"",
        "description": "可选嵌套卡片样式；不设置时为普通卡片。"
      },
      {
        "name": "tabList",
        "type": "{ key: string; label: ReactNode; disabled?: boolean; content?: ReactNode }[]",
        "description": "复用 mtone Tabs。每项 key 应唯一；有 content 时显示该项内容，否则显示 children。"
      },
      {
        "name": "activeTabKey / defaultActiveTabKey",
        "type": "string",
        "description": "分别为受控值与非受控初始值；默认选中第一个可用标签。"
      },
      {
        "name": "onTabChange",
        "type": "(key: string) => void",
        "description": "标签切换回调；受控模式下需由父组件更新 activeTabKey。"
      },
      {
        "name": "tabBarExtraContent",
        "type": "ReactNode",
        "description": "标签页区域的附加内容，和顶部 extra 独立。"
      },
      {
        "name": "tabProps",
        "type": "{ className?: string }",
        "description": "传给复用的 mtone Tabs 的样式类；值与回调通过 Card 的标签属性控制。"
      },
      {
        "name": "classNames / styles",
        "type": "object | ({ props: CardProps }) => object",
        "description": "分区 className / CSSProperties；键为 root、header、title、extra、cover、body、actions、tabs。"
      },
      {
        "name": "tokens",
        "type": "CardTokens",
        "description": "单张卡片主题 token：bodyPadding、bodyPaddingSM、headerPadding、headerPaddingSM、headerHeight、headerHeightSM、headerFontSize、headerFontSizeSM、headerBg、actionsBg、actionsPadding、borderRadius、gridMinWidth。尺寸数字按 px 处理，也支持 CSS 长度字符串。"
      },
      {
        "name": "Card.Meta",
        "type": "avatar?: ReactNode; title?: ReactNode; description?: ReactNode; htmlTitle?: string",
        "description": "元信息布局；支持原生 div 属性，以及 root、section、avatar、title、description 分区 classNames/styles（对象或 ({props}) => 对象）。"
      },
      {
        "name": "Card.Grid",
        "type": "hoverable?: boolean + HTMLAttributes<HTMLDivElement>",
        "description": "卡片网格项，hoverable 默认 true；作为 Card 的直接子元素使用以启用响应式网格布局。"
      },
      {
        "name": "原生属性",
        "type": "Omit<HTMLAttributes<HTMLDivElement>, \"title\">",
        "description": "支持根节点 className、style、aria-* 与适用 DOM 事件。title 已改为可见标题；原生提示使用 htmlTitle。"
      }
    ],
    "notes": [
      "折叠后标题及 extra 操作保持可见，封面、标签、正文与底部 actions 隐藏但不卸载；子组件状态保留。未设置 collapsible 时 collapsed/defaultCollapsed 不会隐藏内容。",
      "Card.Grid 是单张 Card 内部的网格项；多个独立 Card 的布局、响应式列数、跨列和分隔线请使用 CardGroup。",
      "未提供 bordered/bodyStyle/headStyle；使用 variant 与分区 styles。size 使用 medium/small，tabProps 只支持现有 mtone Tabs 的 className。",
      "迁移提醒：旧 <Card title=\"提示\"> 会改为显示标题栏；原生悬浮提示请改为 <Card htmlTitle=\"提示\">。只有 children、没有新增结构属性的 Card 维持原来的默认视觉。",
      "Card.Meta 与 Card.Grid 是 Card 的静态子组件，不是单独安装或单独命名导出的组件。",
      "不要用 hoverable 或 onClick 把普通 div 当作按钮；可交互入口优先用内部 Button 或链接，图标按钮必须有可访问名称。",
      "title 字符串不自动生成 heading 语义；可传 h2/h3。非受控标签失效时回退首个可用项；无效受控 key 无活动面板。当前演示只使用本地状态，不执行网络保存。主题 token 与兼容范围详见仓库 docs/CARD.md。"
    ]
  },
  {
  "name": "Typography",
  "description": "统一的标题、正文、段落、链接、引用与代码，按子组件独立演示，支持复制、纯文本编辑及省略展开。",
  "importNames": [
    "Typography"
  ],
  "code": "import { Typography } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return <section>\n    <Typography.Title level={2}>工作笔记</Typography.Title>\n    <Typography.Paragraph copyable>让内容清晰、有层次。</Typography.Paragraph>\n    <Typography.Text muted>更新于今天</Typography.Text>\n    <Typography.Link href=\"/docs\">查看文档</Typography.Link>\n  </section>;\n}",
  "props": [
    {"name":"Title.divider", "type":"boolean", "default":"level === 2", "description":"标题下方的整行分隔线，仅二级标题默认启用；不同于给文字添加下划线的 underline。"},
    {"name":"Code.language", "type":"string", "description":"可选语法高亮语言。仅代码块的字符串内容启用；支持当前 Shiki 依赖的所有内置语言和别名，值可在运行时指定。省略、行内、未知语言及加载失败均保持纯文本或原有子内容。"},
    {"name":"Code.block", "type":"boolean", "default":"false", "description":"Typography.Code 默认渲染行内 <code>；block 渲染 <pre><code> 并保留缩进和换行。长行在块内滚动，溢出时可用 Tab 聚焦并按左右方向键滚动。"},
    {"name":"Blockquote", "type":"BlockquoteProps", "description":"引用子组件；支持 cite 可见署名、citeUrl 来源 URL、icon、iconSize（默认 28）、color（CSS 色值）、radius（默认 4）、textWrap（默认 wrap）。它不支持 Text 的复制、编辑或省略属性；完整 API 见 Blockquote 条目。"},
    {
      "name": "muted / type",
      "type": "boolean / \"secondary\" | \"success\" | \"warning\" | \"danger\"",
      "description": "muted 保留旧版次级文字颜色；type 提供语义字色。"
    },
    {
      "name": "strong / italic / underline / delete / mark / code / keyboard",
      "type": "boolean",
      "default": "false",
      "description": "分别使用 strong/em/u/del/mark/code/kbd 语义标签，可组合使用。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "弱化文字并停用内置复制、编辑、展开按钮；不自动禁用 children 中的交互元素。"
    },
    {
      "name": "copyable",
      "type": "boolean | TypographyCopyable",
      "default": "false",
      "description": "显示复制按钮。对象支持 text: string | (() => string | Promise<string>)、onCopy(): void、onError(error: unknown): void、label?: string。默认复制完整文字而非裁切摘要。"
    },
    {
      "name": "editable",
      "type": "boolean | TypographyEditable",
      "default": "false",
      "description": "显示编辑按钮。对象支持 text?: string、editing?: boolean、onEditingChange(editing): void、onChange(text): void、onStart(): void、onCancel(): void、maxLength?: number、label?: string。"
    },
    {
      "name": "ellipsis",
      "type": "boolean | TypographyEllipsis",
      "default": "false",
      "description": "CSS 单行或多行省略。对象支持 rows?: number（默认 1）、expandable?: boolean、expanded?: boolean、defaultExpanded?: boolean、onExpandedChange(expanded): void、expandLabel?: string、collapseLabel?: string。"
    },
    {
      "name": "children / ref / 原生属性",
      "type": "ReactNode / 对应 HTML 元素 ref / HTMLAttributes",
      "description": "支持 className、style、title 与适用的 DOM 属性；Text 为 span，Title 为 heading，Paragraph 为 p。"
    }
  ],
  "notes": [
    "保持已有 Text 与 muted 用法兼容。文字、标题和段落可单独导入，也可使用 Typography.Text / Typography.Title / Typography.Paragraph / Typography.Link / Typography.Blockquote；Typography 是命名空间对象，不能直接作为 JSX 元素。",
    "Typography.Code 只从 Typography 命名空间使用，支持原生属性和 ref（指向外层 code 或 pre）；可用 tabIndex 覆盖默认 Tab 顺序。代码块使用 language=\"tsx\"、\"python\"、\"rust\" 等启用 Shiki。支持随依赖安装的所有内置语言及别名（如 py、rs、yml）；从应用部署的本地构建资源按需加载，不访问 Shiki 站点或 CDN。服务端、首次显示、未知语言及加载失败均保留原文。着色随最近主题切换，文本、缩进和换行不变。不内置复制按钮；Typography.Text 的 code 用法保持不变。",
    "编辑采用纯文本 textarea；Enter 保存、Shift + Enter 换行、Escape 取消、blur 保存，中文输入法组合输入期间不提交。受控 editing 必须配合 onEditingChange 更新；onChange 可用于业务保存。富内容请显式提供 editable.text，编辑结果不保留富文本标记。",
    "复制使用 Clipboard API，需要安全上下文及浏览器权限；失败有屏幕阅读器提示并调用 onError，不会伪报成功。富组件无法可靠提取文本时请提供 copyable.text。内置操作名称跟随 MtoneProvider 的 zh/en，可自定义 label。",
    "省略采用 CSS 裁切，不测量是否真的溢出；expandable 的展开/收起按钮始终存在。单行省略需要约束容器宽度；操作按钮位于裁切内容之外，窄容器可能换行。rows 取正整数，非法值回退 1。",
    "不支持富节点中间/后缀截断、自动溢出提示、shimmer 或 actions/classNames 配置。文字样式与交互优先遵循 mtone。"
  ]
},
  {
  "name": "Blockquote",
  "description": "Typography.Blockquote 引用块，支持署名、来源 URL、装饰图标与可选强调色。",
  "importNames": [
    "Blockquote",
    "Typography"
  ],
  "code": "import { Typography } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return <Typography.Blockquote cite=\"— mtone 设计笔记\">\n    让内容成为主角，用一致的间距建立层次。\n  </Typography.Blockquote>;\n}",
  "props": [
    {
      "name": "cite",
      "type": "ReactNode",
      "description": "可见署名，支持文本或链接；不是 HTML cite URL。"
    },
    {
      "name": "citeUrl",
      "type": "string",
      "description": "映射到原生 blockquote 的 cite 来源 URL。"
    },
    {
      "name": "icon / iconSize",
      "type": "ReactNode / number | string",
      "default": "无图标 / 28",
      "description": "装饰性图标及容器尺寸；数字为 px，字符串为 CSS 长度。图标会对屏幕阅读器隐藏，不要放置交互元素。"
    },
    {
      "name": "color",
      "type": "CSSProperties[\"color\"]",
      "default": "主题中性色",
      "description": "左边框和图标的强调色，支持 CSS 色值或 var()；不是 Mantine 调色板名称。背景保持 mtone 中性灰。"
    },
    {
      "name": "radius / textWrap",
      "type": "CSSProperties[\"borderRadius\"] / CSSProperties[\"textWrap\"]",
      "default": "4 / wrap",
      "description": "圆角与文字换行策略；radius 数字按 px，textWrap 可用 wrap/balance/pretty 等浏览器支持值。"
    },
    {
      "name": "children / ref / 原生属性",
      "type": "ReactNode / Ref<HTMLQuoteElement> / BlockquoteHTMLAttributes",
      "description": "正文支持富内容；支持 className、style、dir、aria-* 等。style 可覆盖内置样式。"
    }
  ],
  "notes": [
    "可单独导入 Blockquote 或使用 Typography.Blockquote；渲染语义 blockquote，署名放在 footer 中。不会自动为署名添加破折号。",
    "无图标或署名时不渲染占位；有图标时上方预留半个图标高度。支持继承 RTL 的逻辑方向边框与图标位置。",
    "Blockquote 是引用容器，不继承 Text 的 copyable/editable/ellipsis 等属性；需要时可在正文内组合 Typography.Text/Paragraph。",
    "不要求 Mantine API 兼容；颜色、圆角、字距与默认大小遵循 mtone。"
  ]
},
  {
  "name": "Text",
  "description": "兼容原有 muted 的行内文本，支持文字修饰与交互。",
  "importNames": [
    "Text"
  ],
  "code": "import { Text } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return <Text muted copyable>更新于今天</Text>;\n}",
  "props": [
    {
      "name": "muted / type",
      "type": "boolean / \"secondary\" | \"success\" | \"warning\" | \"danger\"",
      "description": "muted 保留旧版次级文字颜色；type 提供语义字色。"
    },
    {
      "name": "strong / italic / underline / delete / mark / code / keyboard",
      "type": "boolean",
      "default": "false",
      "description": "分别使用 strong/em/u/del/mark/code/kbd 语义标签，可组合使用。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "弱化文字并停用内置复制、编辑、展开按钮；不自动禁用 children 中的交互元素。"
    },
    {
      "name": "copyable",
      "type": "boolean | TypographyCopyable",
      "default": "false",
      "description": "显示复制按钮。对象支持 text: string | (() => string | Promise<string>)、onCopy(): void、onError(error: unknown): void、label?: string。默认复制完整文字而非裁切摘要。"
    },
    {
      "name": "editable",
      "type": "boolean | TypographyEditable",
      "default": "false",
      "description": "显示编辑按钮。对象支持 text?: string、editing?: boolean、onEditingChange(editing): void、onChange(text): void、onStart(): void、onCancel(): void、maxLength?: number、label?: string。"
    },
    {
      "name": "ellipsis",
      "type": "boolean | TypographyEllipsis",
      "default": "false",
      "description": "CSS 单行或多行省略。对象支持 rows?: number（默认 1）、expandable?: boolean、expanded?: boolean、defaultExpanded?: boolean、onExpandedChange(expanded): void、expandLabel?: string、collapseLabel?: string。"
    },
    {
      "name": "children / ref / 原生属性",
      "type": "ReactNode / 对应 HTML 元素 ref / HTMLAttributes",
      "description": "支持 className、style、title 与适用的 DOM 属性；Text 为 span，Title 为 heading，Paragraph 为 p。"
    }
  ],
  "notes": [
    "保持已有 Text 与 muted 用法兼容。文字、标题和段落可单独导入，也可使用 Typography.Text / Typography.Title / Typography.Paragraph / Typography.Link / Typography.Blockquote；Typography 是命名空间对象，不能直接作为 JSX 元素。",
    "编辑采用纯文本 textarea；Enter 保存、Shift + Enter 换行、Escape 取消、blur 保存，中文输入法组合输入期间不提交。受控 editing 必须配合 onEditingChange 更新；onChange 可用于业务保存。富内容请显式提供 editable.text，编辑结果不保留富文本标记。",
    "复制使用 Clipboard API，需要安全上下文及浏览器权限；失败有屏幕阅读器提示并调用 onError，不会伪报成功。富组件无法可靠提取文本时请提供 copyable.text。内置操作名称跟随 MtoneProvider 的 zh/en，可自定义 label。",
    "省略采用 CSS 裁切，不测量是否真的溢出；expandable 的展开/收起按钮始终存在。单行省略需要约束容器宽度；操作按钮位于裁切内容之外，窄容器可能换行。rows 取正整数，非法值回退 1。",
    "不支持富节点中间/后缀截断、自动溢出提示、shimmer 或 actions/classNames 配置。文字样式与交互优先遵循 mtone。"
  ]
},
  {
  "name": "Title",
  "description": "遵循 mtone 字号与间距的语义标题，支持 h1 至 h6 与可选整行分隔线。",
  "importNames": [
    "Title"
  ],
  "code": "import { Title } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return <>\n    <Title level={2}>项目概览</Title>\n    <Title level={2} divider={false}>不带分隔线</Title>\n    <Title level={3} divider>带分隔线的三级标题</Title>\n  </>;\n}",
  "props": [
    {
      "name": "level",
      "type": "1 | 2 | 3 | 4 | 5 | 6",
      "default": "1",
      "description": "使用对应 h1-h6 标签。按文档结构选择标题层级。"
    },
    {
      "name": "divider",
      "type": "boolean",
      "default": "level === 2",
      "description": "在标题下方绘制横贯标题整行的 1px 中性色分隔线。仅二级标题默认启用；可显式开启或关闭。与文字下划线 underline 独立。"
    },
    {
      "name": "muted / type",
      "type": "boolean / \"secondary\" | \"success\" | \"warning\" | \"danger\"",
      "description": "muted 保留旧版次级文字颜色；type 提供语义字色。"
    },
    {
      "name": "strong / italic / underline / delete / mark / code / keyboard",
      "type": "boolean",
      "default": "false",
      "description": "分别使用 strong/em/u/del/mark/code/kbd 语义标签，可组合使用。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "弱化文字并停用内置复制、编辑、展开按钮；不自动禁用 children 中的交互元素。"
    },
    {
      "name": "copyable",
      "type": "boolean | TypographyCopyable",
      "default": "false",
      "description": "显示复制按钮。对象支持 text: string | (() => string | Promise<string>)、onCopy(): void、onError(error: unknown): void、label?: string。默认复制完整文字而非裁切摘要。"
    },
    {
      "name": "editable",
      "type": "boolean | TypographyEditable",
      "default": "false",
      "description": "显示编辑按钮。对象支持 text?: string、editing?: boolean、onEditingChange(editing): void、onChange(text): void、onStart(): void、onCancel(): void、maxLength?: number、label?: string。"
    },
    {
      "name": "ellipsis",
      "type": "boolean | TypographyEllipsis",
      "default": "false",
      "description": "CSS 单行或多行省略。对象支持 rows?: number（默认 1）、expandable?: boolean、expanded?: boolean、defaultExpanded?: boolean、onExpandedChange(expanded): void、expandLabel?: string、collapseLabel?: string。"
    },
    {
      "name": "children / ref / 原生属性",
      "type": "ReactNode / 对应 HTML 元素 ref / HTMLAttributes",
      "description": "支持 className、style、title 与适用的 DOM 属性；Text 为 span，Title 为 heading，Paragraph 为 p。"
    }
  ],
  "notes": [
    "保持已有 Text 与 muted 用法兼容。文字、标题和段落可单独导入，也可使用 Typography.Text / Typography.Title / Typography.Paragraph / Typography.Link / Typography.Blockquote；Typography 是命名空间对象，不能直接作为 JSX 元素。",
    "编辑采用纯文本 textarea；Enter 保存、Shift + Enter 换行、Escape 取消、blur 保存，中文输入法组合输入期间不提交。受控 editing 必须配合 onEditingChange 更新；onChange 可用于业务保存。富内容请显式提供 editable.text，编辑结果不保留富文本标记。",
    "复制使用 Clipboard API，需要安全上下文及浏览器权限；失败有屏幕阅读器提示并调用 onError，不会伪报成功。富组件无法可靠提取文本时请提供 copyable.text。内置操作名称跟随 MtoneProvider 的 zh/en，可自定义 label。",
    "省略采用 CSS 裁切，不测量是否真的溢出；expandable 的展开/收起按钮始终存在。单行省略需要约束容器宽度；操作按钮位于裁切内容之外，窄容器可能换行。rows 取正整数，非法值回退 1。",
    "不支持富节点中间/后缀截断、自动溢出提示、shimmer 或 actions/classNames 配置。文字样式与交互优先遵循 mtone。"
  ]
},
  {
  "name": "Paragraph",
  "description": "支持复制、编辑和多行省略的语义段落。",
  "importNames": [
    "Paragraph"
  ],
  "code": "import { Paragraph } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return <Paragraph ellipsis={{ rows: 2, expandable: true }}>长段落内容……</Paragraph>;\n}",
  "props": [
    {
      "name": "muted / type",
      "type": "boolean / \"secondary\" | \"success\" | \"warning\" | \"danger\"",
      "description": "muted 保留旧版次级文字颜色；type 提供语义字色。"
    },
    {
      "name": "strong / italic / underline / delete / mark / code / keyboard",
      "type": "boolean",
      "default": "false",
      "description": "分别使用 strong/em/u/del/mark/code/kbd 语义标签，可组合使用。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "弱化文字并停用内置复制、编辑、展开按钮；不自动禁用 children 中的交互元素。"
    },
    {
      "name": "copyable",
      "type": "boolean | TypographyCopyable",
      "default": "false",
      "description": "显示复制按钮。对象支持 text: string | (() => string | Promise<string>)、onCopy(): void、onError(error: unknown): void、label?: string。默认复制完整文字而非裁切摘要。"
    },
    {
      "name": "editable",
      "type": "boolean | TypographyEditable",
      "default": "false",
      "description": "显示编辑按钮。对象支持 text?: string、editing?: boolean、onEditingChange(editing): void、onChange(text): void、onStart(): void、onCancel(): void、maxLength?: number、label?: string。"
    },
    {
      "name": "ellipsis",
      "type": "boolean | TypographyEllipsis",
      "default": "false",
      "description": "CSS 单行或多行省略。对象支持 rows?: number（默认 1）、expandable?: boolean、expanded?: boolean、defaultExpanded?: boolean、onExpandedChange(expanded): void、expandLabel?: string、collapseLabel?: string。"
    },
    {
      "name": "children / ref / 原生属性",
      "type": "ReactNode / 对应 HTML 元素 ref / HTMLAttributes",
      "description": "支持 className、style、title 与适用的 DOM 属性；Text 为 span，Title 为 heading，Paragraph 为 p。"
    }
  ],
  "notes": [
    "保持已有 Text 与 muted 用法兼容。文字、标题和段落可单独导入，也可使用 Typography.Text / Typography.Title / Typography.Paragraph / Typography.Link / Typography.Blockquote；Typography 是命名空间对象，不能直接作为 JSX 元素。",
    "编辑采用纯文本 textarea；Enter 保存、Shift + Enter 换行、Escape 取消、blur 保存，中文输入法组合输入期间不提交。受控 editing 必须配合 onEditingChange 更新；onChange 可用于业务保存。富内容请显式提供 editable.text，编辑结果不保留富文本标记。",
    "复制使用 Clipboard API，需要安全上下文及浏览器权限；失败有屏幕阅读器提示并调用 onError，不会伪报成功。富组件无法可靠提取文本时请提供 copyable.text。内置操作名称跟随 MtoneProvider 的 zh/en，可自定义 label。",
    "省略采用 CSS 裁切，不测量是否真的溢出；expandable 的展开/收起按钮始终存在。单行省略需要约束容器宽度；操作按钮位于裁切内容之外，窄容器可能换行。rows 取正整数，非法值回退 1。",
    "不支持富节点中间/后缀截断、自动溢出提示、shimmer 或 actions/classNames 配置。文字样式与交互优先遵循 mtone。"
  ]
},
  {
  "name": "Link",
  "description": "使用 mtone 中性色和轻量悬停背景的语义链接。",
  "importNames": [
    "Link"
  ],
  "code": "import { Link } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return <Link href=\"https://example.com\" target=\"_blank\">查看资料</Link>;\n}",
  "props": [
    {
      "name": "href / target / rel / ref / 原生属性",
      "type": "AnchorHTMLAttributes<HTMLAnchorElement> / Ref<HTMLAnchorElement>",
      "description": "原生 a 链接。target=\"_blank\" 且未传 rel 时添加 noopener noreferrer。"
    },
    {
      "name": "muted / type",
      "type": "boolean / TypographyTone",
      "description": "次级或语义字色，type 为 secondary/success/warning/danger。"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "default": "false",
      "description": "移除 href，从 Tab 顺序移除，阻止自身点击，并设置 aria-disabled。"
    }
  ],
  "notes": [
    "Link 只支持原生链接属性及 muted/type/disabled，不支持 Text 的 copyable/editable/ellipsis 或文字修饰布尔属性。",
    "可通过 Typography.Link 使用。禁用链接内部不要放置其他可交互元素。"
  ]
},
  {
    name: "Divider",
    description: "水平或垂直分隔线，支持标题、对齐、线型与紧凑间距。",
    importNames: ["Divider"],
    code: 'import { Divider } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return <div><Divider titlePlacement="start">基本信息</Divider><p>内容</p><Divider variant="dashed" plain>更多</Divider><span>编辑</span><Divider orientation="vertical" /><span>归档</span></div>;\n}',
    props: [
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        default: '"horizontal"',
        description: "分隔方向；默认无标题时保留原 hr 元素。",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "水平分隔线的标题，支持文字和图标；垂直模式忽略。",
      },
      {
        name: "titlePlacement",
        type: '"start" | "center" | "end"',
        default: '"center"',
        description: "标题的逻辑位置，支持 RTL。",
      },
      {
        name: "variant",
        type: '"solid" | "dashed" | "dotted"',
        default: '"solid"',
        description: "线型。",
      },
      {
        name: "size",
        type: '"small" | "medium" | "large"',
        default: '"medium"',
        description: "水平上下间距分别为 8、12、20px，不影响垂直模式。",
      },
      {
        name: "plain",
        type: "boolean",
        default: "false",
        description: "标题使用普通字重和次要文字色。",
      },
      {
        name: "titleClassName / titleStyle",
        type: "string / CSSProperties",
        description: "标题样式。",
      },
      {
        name: "className / style / ref",
        type: "DOM 属性 / CSSProperties / Ref<HTMLHRElement | HTMLDivElement>",
        description: "根元素属性与引用，无标题为 hr，有标题为 div。",
      },
    ],
    notes: [
      "保留原无参数 Divider 的水平细线及 12px 间距。",
      "分隔线不参与键盘焦点；请勿在标题中放交互控件。长标题可换行。",
      "使用 mtone 边框和文字 token；垂直高度默认 1em、左右间距 8px，可用 style 覆盖。",
      "属性以此处文档和 mtone 类型声明为准。",
    ],
  },
  {
    name: "List",
    description: "语义化列表，支持数据渲染、虚拟滚动、分组吸顶与滚动定位。",
    importNames: ["List", "ListItem"],
    code: 'import { List } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nconst items = Array.from({length: 10000}, (_, id) => ({id, title: `记录 ${id + 1}`}));\nexport default function Demo() {\n  return <List items={items} getKey={item => item.id} renderItem={item => item.title} height={240} virtual />;\n}',
    props: [
      { name: "children", type: "ReactNode", description: "未传 items 时保留原 ul/ListItem 内容模式。" },
      { name: "items / getKey", type: "readonly T[] / (item: T, index: number) => React.Key", description: "数据源与唯一稳定键；未提供 getKey 时使用原始索引，排序或增删时应提供稳定键。" },
      { name: "renderItem", type: "(item: T, index: number) => ReactNode", description: "渲染条目内容，不要返回 li 或 ListItem；外层 li 由 List 创建。未提供时将数据转换为字符串。" },
      { name: "onReorder", type: "(fromIndex: number, toIndex: number) => void", description: "非虚拟数据模式的可选受控排序回调。移动整行并实时预览插入位置；有效放下时报告两个原始数组索引，调用方更新 items；分组交错的数组需保留组的位置和顺序。拖出、按 Esc 或取消不会提交。" },
      { name: "groupBy / renderGroup", type: "(item: T) => React.Key / (key: React.Key, items: readonly T[]) => ReactNode", description: "相同键的数据合并为一组，按组首次出现顺序展示；index 保持原始数据索引。默认组标题为键字符串。" },
      { name: "stickyGroups", type: "boolean", default: "false", description: "组标题在滚动容器顶部吸顶；适用于普通和虚拟列表。" },
      { name: "height / contentWidth", type: "number / CSSProperties[\"minWidth\"]", description: "滚动视口高度和内容最小宽度；内容更宽时横向滚动。非正或非有限 height 回退 240px。" },
      { name: "virtual", type: "boolean", default: "false", description: "数据模式且提供 height 时只挂载可见行与缓冲行。未提供 height 时正常渲染全部行。" },
      { name: "estimatedItemHeight / estimatedGroupHeight / overscan", type: "number", default: "36 / 30 / 3", description: "未测量条目/组标题高度估算与前后缓冲行数；挂载后使用 ResizeObserver 实测。" },
      { name: "hoverable", type: "boolean", default: "true", description: "数据行 hover 时使用灰色背景；不改变原 ListItem。" },
      { name: "loading / loadingContent / emptyContent", type: "boolean / ReactNode / ReactNode", default: "false / 加载中… / 暂无数据", description: "数据模式的加载与空状态；loading 不清空既有记录，空数据加载时不显示空提示。" },
      { name: "onEndReached / endThreshold", type: "() => void / number", default: "— / 80", description: "提供 height 时，接近底部阈值（px）通知。加载中不通知；离开底部或数据数量/尾键改变后可再次通知。网络和结束状态由调用方管理。" },
      { name: "ref", type: "Ref<ListHandle>", description: "element 访问 ul；scrollTo 支持像素 number、{top,left}、{key,align,offset}、{index,align,offset} 或 {group,align,offset}。align=start/center/end/auto；index 是原始数据索引。" },
      { name: "原生属性", type: "HTMLAttributes<HTMLUListElement>", description: "支持 className、style、aria-label、tabIndex 和 onScroll 等。" },
    ],
    notes: [
      "List 的数据渲染仍使用 ul/li；renderItem 仅返回条目内容。ListItem 和 DocumentList 既有用法保持不变。",
      "虚拟列表通过估算未挂载行和测量可见行支持不等高内容；跳到尚未测量的位置是估算定位，滚动过程中总高度可能修正。需要精确定位时使用固定高度或关闭虚拟滚动。",
      "List 不内置网络请求、分页或选择。可在 renderItem 起始位置放置 List.SortHandle，以鼠标沿列表方向拖动；设定 onReorder 后，只能在同组内相邻的可排序行之间移动，无手柄或禁用手柄的行会阻止越过。仍请提供上移、下移等键盘操作；不支持触屏拖动。",
      "实时排序尊重系统的减少动态效果设置。手柄 onDragStart 先运行，可用 preventDefault() 取消；活动拖动由 List 根接收，List 的 onDragOver 和 onDrop 也可阻止组件接手。不传 onReorder 时，手柄只提供整行原生拖放预览，应用可继续用原生事件控制排序。",
      "自定义内容的按钮、链接与拖放可访问性由调用方负责；可为滚动容器设置 aria-label 和 tabIndex。",
    ],
  },
  {
    name: "DataList",
    description: "用于管理记录的列表，支持搜索筛选、分页、跨页选择、批量操作和行详情。",
    importNames: ["DataList"],
    code: `import { DataList, Text, Toolbar } from "@bixlab/mtone";
import "@bixlab/mtone/styles.css";

const records = [
  { id: "guide", title: "知识库使用指南" },
  { id: "notes", title: "研究笔记" },
];

export default function Demo() {
  return (
    <DataList
      aria-label="文档列表"
      items={records}
      getKey={(item) => item.id}
      getLabel={(item) => item.title}
      renderItem={(item) => <Text>{item.title}</Text>}
      search={{ match: (item, query) => item.title.includes(query) }}
      selection={{}}
      toolbar={
        <Toolbar background="gray" aria-label="文档操作"
          search={<DataList.Search placeholder="搜索文档标题" />}
          start={<DataList.Selection />} />
      }
      pagination={{ pageSize: 10 }}
    />
  );
}`,
    props: [
      { name: "items / getKey", type: "readonly T[] / (item: T) => string | number", description: "必填。提供数据与稳定唯一的条目键（字符串或有限数值）；远程模式只传当前页记录。" },
      { name: "getLabel", type: "(item: T) => string", description: "为条目选择和展开按钮提供可读名称；省略时使用键的字符串。" },
      { name: "renderItem", type: "(item: T, index: number) => ReactNode", description: "必填。仅返回行内容；index 是从 0 开始的当前页索引，不要返回 li 或 ListItem。" },
      { name: "search", type: "{ value?, defaultValue?, onChange?, match? }", description: "配置查询状态和本地匹配，不自动渲染控件。match(item, query) 接收去掉首尾空白的查询；省略 match 不自动筛选。" },
      { name: "DataList.Search", type: "DataListSearchProps（label?: string；placeholder?: string）", description: "放在当前列表的 toolbar 内，连接 search 配置。默认可访问名称为“搜索列表”，占位符为“搜索…”，随语言设置变化。" },
      { name: "filter", type: "(item: T) => boolean", description: "额外的本地筛选条件；筛选控件放在 Toolbar 插槽中。远程模式只呈现应用提供的结果。" },
      { name: "toolbar", type: "ReactNode", description: "可选的头部内容，例如 <Toolbar background=\"gray\" search={...} start={...} end={...} />。工具栏与列表、分页共享外框；不传时不渲染工具栏。" },
      { name: "pagination", type: "DataListPagination", description: "省略时不分页。本地配置为 { mode?: 'local', page?, defaultPage?, pageSize?, onPageChange? }，默认第 1 页、每页 10 条；远程配置为 { mode: 'remote', page, pageSize, total, onPageChange }。" },
      { name: "selection", type: "{ selectedKeys?, defaultSelectedKeys?, onChange?, getDisabled? }", description: "启用选择。使用稳定键保留跨页选择；全选或取消全选只影响当前页的可选条目。" },
      { name: "expansion", type: "{ expandedKeys?, defaultExpandedKeys?, onChange?, isExpandable?, renderDetail }", description: "启用行详情；renderDetail(item) 返回详情内容。展开不会改变选中状态。" },
      { name: "renderActions", type: "(item: T) => ReactNode", description: "行尾操作；业务行为由应用处理，不会触发隐式选中。" },
      { name: "DataList.Selection", type: "DataListSelectionProps（children?: (ctx: DataListBatchContext) => ReactNode）", description: "放在当前列表的 toolbar 内，连接 selection 配置。提供本页全选、已选数量与清除；已有选中项时调用可选的渲染函数。ctx.clearSelection() 清除全部选中键，包括其他页。" },
      { name: "loading / empty", type: "boolean / ReactNode", description: "加载状态与空内容；请求、错误和记录更新由应用处理。" },
      { name: "原生属性", type: "HTMLAttributes<HTMLElement>", description: "转发 section 根元素属性，例如 aria-label、className、style；行由 renderItem 提供。" },
    ],
    notes: [
      "DataList 用于行内容由应用渲染的数据管理页。仅需基础列表、分组吸顶或虚拟滚动时，使用 List。",
      "工具栏显式组合：可把 DataList.Search 放进 Toolbar.search，DataList.Selection 放进 Toolbar.start，应用的筛选和操作放进 Toolbar.end。窄容器中搜索可独占一行。两个辅助控件在工具栏外或没有相应配置时不渲染。",
      "本地搜索与筛选先于分页。输入搜索词会请求回到第 1 页；本地结果缩小时限制页码范围。",
      "远程模式不会过滤或再次切分 items。应用提供当前页记录、总数、加载及错误状态，管理请求取消；外部筛选变化时由应用重置页码。",
      "目前不提供卡片网格、内联编辑或虚拟滚动。过滤和翻页后若需批量修改，应按键操作，不以当前页的条目数组为准。",
    ],
  },
  {
    name: "ListItem",
    description: "包含图标、说明与尾部操作的列表项。",
    importNames: ["ListItem", "List", "Button"],
    code: 'import { ListItem, List, Button } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <List><ListItem description="记录项目过程" actions={<Button size="sm">打开</Button>}>研究笔记</ListItem></List>\n  );\n}',
    props: [
      { name: "sortHandle", type: "ListSortHandleProps", description: "可选拖拽手柄，在条目起始侧显示六点图标，拖动预览显示整行。传入 onDragStart、onDragEnd 等事件，排序由应用维护。" },
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
    sidebarParent: "DocumentList",
    sidebarSection: "cards",
    name: "DocumentCard",
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
    description: "使用原生 HTML 表格结构的基础展示表格。",
    importNames: ["Table"],
    code: 'import { Table } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Table striped>\n      <caption>本周项目</caption>\n      <thead><tr><th scope="col">项目</th><th scope="col">进度</th></tr></thead>\n      <tbody><tr><th scope="row">组件文档整理</th><td>进行中</td></tr></tbody>\n    </Table>\n  );\n}',
    props: [
      { name: "bordered", type: "boolean", default: "false", description: "显示外框与单元格网格线；不开启时仍保留轻量行分隔线。" },
      { name: "striped", type: "boolean", default: "false", description: "为 tbody 的行添加隔行底色。" },
      { name: "highlightOnHover", type: "boolean", default: "false", description: "指针悬停于正文行时高亮该行。" },
      { name: "原生属性 / ref", type: "TableProps / HTMLTableElement", description: "支持原生 table 属性和 ref，根元素就是 table。用 caption、thead、tbody、tfoot、tr、th、td 描述结构。" },
    ],
    notes: [
      "保持浏览器原生表格语义；需要时用 caption 或 aria-label 命名，并在 th 上指定 scope。组件不内置排序、过滤、分页和选择。",
      "需要列配置、数据源、选择、筛选、分页、展开或虚拟滚动时，请使用 DataTable。",
    ],
  },
  {
    name: "DataTable",
    description:
      "保留 mtone 紧凑风格的数据表格，支持高级排序筛选、选择、展开、固定布局与虚拟滚动。",
    importNames: ["DataTable"],
    code: 'import { DataTable } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return <DataTable dataSource={[{key:1,title:"设计规范",score:90},{key:2,title:"研究笔记",score:75}]} columns={[{key:"title",title:"标题",dataIndex:"title"},{key:"score",title:"完成度",dataIndex:"score",sorter:(a,b)=>a.score-b.score}]} rowSelection={{}} pagination={{defaultPageSize:10}} />;\n}',
    props: [
      {
        name: "data / dataSource",
        type: "T[]",
        description: "数据源，dataSource 优先；保留旧 data 用法。",
        default: "[]",
      },
      {
        name: "columns / children",
        type: "DataTableColumn<T>[] / ReactNode",
        description:
          "列定义或 DataTable.Column / DataTable.ColumnGroup JSX。列支持嵌套 dataIndex、children 分组、render、width/minWidth、align、hidden、responsive、ellipsis、fixed、rowScope、shouldCellUpdate 和 onCell/onHeaderCell。",
      },
      {
        name: "rowKey",
        type: "string | ((record: T) => React.Key)",
        description: "稳定且唯一的行键，保留数字键类型。",
        default: "key",
      },
      {
        name: "column",
        type: "Partial<DataTableColumn<T>>",
        description: "所有列的共享默认配置，单列配置优先。",
      },
      {
        name: "columns[].sorter / sortOrder",
        type: "boolean | compare | {compare?, multiple?} / ascend | descend | null",
        description:
          "本地比较、多列优先级或远程排序；defaultSortOrder、sortDirections、sortIcon 可配置。sorter=true 仅报告排序意图；使用 manual 管理服务端数据。",
      },
      {
        name: "sortDirections / showSorterTooltip",
        type: "('ascend' | 'descend')[] / boolean | {title?: ReactNode, target?: 'full-header' | 'sorter-icon'}",
        description: "排序方向循环与下一步提示；单列配置优先。title 支持富文本，target 控制整块排序按钮或仅图标触发提示。",
        default: "['ascend','descend'] / true",
      },
      {
        name: "rowClassName / rowHoverable / onScroll",
        type: "string | ((record, index, indent) => string) / boolean / UIEventHandler",
        description: "行样式、悬停反馈与滚动事件；虚拟模式 onScroll 仅报告垂直滚动。direction 支持 ltr/rtl。",
        default: "— / true / —",
      },
      {
        name: "columns[].filters / onFilter",
        type: "DataTableFilterItem[] / (value, record) => boolean",
        description:
          "菜单或树形筛选项及本地匹配逻辑。支持 filterSearch、filterMultiple、filteredValue、defaultFilteredValue、filterResetToDefaultFilteredValue、filterOnClose。",
      },
      {
        name: "columns[].filterDropdown",
        type: "ReactNode | (props: DataTableFilterDropdownProps) => ReactNode",
        description:
          "自定义筛选面板，使用 selectedKeys、setSelectedKeys、confirm、clearFilters、close 管理草稿；filterDropdownProps 支持 open/onOpenChange/className/style。",
      },
      {
        name: "rowSelection",
        type: "DataTableRowSelection<T>",
        description:
          "checkbox/radio、受控/默认选择、禁选、树关联、跨页保留、自定义选择菜单与渲染、选择回调；checkStrictly=false 开启父子关联。表头批量操作使用 Popover.Menu，而非保存字段值的 Select；支持重复执行命令、键盘导航与 Escape 关闭。标准 checkbox 和 radio 列默认保持约 32px；有批量操作菜单时为约 56px，表头和各行对齐。更宽的自定义表头或单元格可用 columnWidth 指定宽度。",
      },
      {
        name: "expandable",
        type: "DataTableExpandableConfig<T>",
        description:
          "树字段、默认/受控展开键、expandedRowRender、展开图标、行点击展开、showExpandAll、forceRender、展开回调。详情中可嵌套 DataTable。树形展开箭头默认置于首个可见数据列，选择列保持表头与各行复选框对齐；子节点默认每层缩进 15px，可用 indentSize 调整；expandIconColumnIndex 可覆盖箭头位置。",
      },
      {
        name: "pagination",
        type: "false | DataTablePagination",
        description:
          "支持 page/current、默认页、页容量、total、showSizeChanger、showQuickJumper、hideOnSinglePage、simple、disabled、showTotal、itemRender、placement/position 和变化回调。每页条数选择器使用本库 Select，支持键盘选择、Escape 取消与禁用状态，切换条数后回到第一页。",
        default: "false",
      },
      {
        name: "scroll / sticky",
        type: "{x?, y?, scrollToFirstRowOnChange?} / boolean | object",
        description:
          "横纵滚动、固定表头和粘性布局；列 fixed 使用底层类型所支持的方向值。",
      },
      {
        name: "virtual / virtualItemHeight",
        type: "boolean / number",
        description:
          "虚拟滚动。建议明确提供数字 scroll.x 与 scroll.y；缺省虚拟视口为 1000×400，virtualItemHeight 为行高估计。",
        default: "false / 38",
      },
      {
        name: "toolbar",
        type: "ReactNode",
        description: "可选的表格工具栏，放在同一外框内、表头和滚动区域之前。可传入 Toolbar；应用负责搜索、过滤和操作状态。",
      },
      {
        name: "title / footer / summary",
        type: "(currentData: T[]) => ReactNode",
        description:
          "顶部、底部和汇总内容。DataTable.Summary、Row、Cell 可组成汇总表格；virtual 模式需设置 DataTable.Summary fixed。",
      },
      {
        name: "components / onRow / onHeaderRow",
        type: 'DataTableProps<T>["components"] / function / function',
        description:
          "替换表格结构或配置行属性。编辑、拖拽、额外工具提示属于应用组合，不是自动持久化功能。",
      },
      {
        name: "size / bordered / showHeader / tableLayout",
        type: "small | middle | medium | large / boolean / boolean / auto | fixed",
        description: "紧凑尺寸、边框、表头显示和布局。",
        default: "middle / false / true",
      },
      {
        name: "loading",
        type: "boolean | {spinning?, tip?, delay?, indicator?}",
        description: "加载状态、延迟与自定义指示内容。",
        default: "false",
      },
      {
        name: "empty / locale",
        type: "ReactNode / DataTableLocale",
        description:
          "自定义空态与筛选、排序、展开和选择文字（含 selectRow、selectionAll、selectionActions）；默认跟随 MtoneProvider 语言。",
      },
      {
        name: "classNames / styles",
        type: "DataTableClassNames | function / DataTableStyles | function",
        description:
          "支持 root、section、title、footer、content、pagination，以及 body/header 下的 wrapper、row、cell；className/style 配置外层。",
      },
      {
        name: "getPopupContainer",
        type: "(trigger: HTMLElement) => HTMLElement",
        description: "筛选弹层挂载容器。",
      },
      {
        name: "ref",
        type: "DataTableRef",
        description:
          "nativeElement 与 scrollTo({key?, index?, top?, offset?, align?})。虚拟模式不支持 center 对齐。",
      },
      {
        name: "onTableChange",
        type: "(pagination, filters, sorter, extra) => void",
        description:
          "新详细回调。extra 包含 action 和 currentDataSource；多列排序返回 sorter 数组。",
      },
      {
        name: "manual",
        type: "boolean",
        description:
          "禁用本地排序、筛选和分页。远程请求由应用处理，并传受控分页和 total。",
        default: "false",
      },
      {
        name: "onChange",
        type: "(state: DataTableState) => void",
        description:
          "保留旧单参数回调。state 包含 sort、文本 filters、page、pageSize；高级筛选请用 onTableChange。",
      },
      {
        name: "sort / filters",
        type: "{key, direction: asc | desc} | null / Record<string,string>",
        description:
          "旧受控单排序与文本筛选；sort=null 显式清空。旧列 sortable/filterable 继续有效。",
      },
      {
        name: "selectable / selectedKeys / onSelectionChange",
        type: "boolean / React.Key[] / (keys) => void",
        description: "旧选择接口继续可用；复杂选择推荐 rowSelection。",
      },
    ],
    notes: [
      "需要搜索、筛选或导出时，使用 toolbar={<Toolbar ... />} 放入表格外框。Toolbar 和 title 可以同时使用；示例的交互由应用控制。",
      "旧 onChange(state)、pagination=false 默认值和文本筛选继续保留；高级事件使用 onTableChange。",
      "DataTable.EXPAND_COLUMN / DataTable.SELECTION_COLUMN 控制特殊列顺序；DataTable.SELECTION_ALL / SELECTION_INVERT / SELECTION_NONE 可用于选择菜单。",
      "列 onCell 返回 rowSpan/colSpan 可合并单元格，0 隐藏被合并的单元格；固定列需要合理宽度和足够的横向滚动空间。",
      "菜单筛选需提供 onFilter 才执行本地匹配；旧 filterable 为不区分大小写的文本包含匹配。多列 sorter.multiple 值较大者优先。",
      "编辑单元格、整行编辑、行列拖拽和自定义提示通过 render/onCell/onRow/onHeaderCell/components 组合；示例使用本地状态，不包含网络请求、自动保存、校验框架或拖拽库。列宽调整不是内置能力。",
      "虚拟滚动应提供数字视口尺寸。自定义 body 需要遵守底层 ref 契约；树、展开、合并、固定列与虚拟化的复杂组合应按业务数据验证，不能将单项支持等同于所有组合都已验收。",
      "filterDropdownProps、loading 与 sorter tooltip 只接受公开类型列出的配置，不透传其他弹层、加载指示器或提示组件属性。",
      "行键必须稳定唯一；服务端数据使用 manual，并由应用管理请求、分页 total、受控状态和失效选择键。",
      "组件结构使用无样式 @rc-component/table 引擎，交互、状态与视觉由 mtone 提供。文档站可能领先 npm，使用前核对已安装版本。",
    ],
  },
  {
    name: "Tag",
    description: "紧凑的低饱和标签，支持筛选变体、语义颜色与可选移除操作。",
    importNames: ["Tag"],
    code: 'import { Tag } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <Tag tone="green">已完成</Tag>\n  );\n}',
    props: [
      {
        name: "variant",
        type: '"default" | "filter"',
        default: "default",
        description: "filter 用于显示已生效的筛选条件，默认高 32px，长文本单行省略；普通标签不变。",
      },
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
    notes: [
      "可移除标签的存在状态由应用管理；filter 变体的移除按钮读作「移除筛选」。Tag 不是数字角标或未读计数容器。",
      "默认筛选标签使用中性色并跟随 --mt-height；使用普通 flex 容器组合多个标签，例如 flex-wrap: wrap 与 gap: 8px。",
    ],
  },
  {
    name: "Status",
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
  "name": "Avatar",
  "description": "支持图片、图标、自动缩放文字、响应式尺寸及方形头像。",
  "importNames": [
    "Avatar"
  ],
  "code": "import { Avatar } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return <Avatar name=\"张三\" size={{ xs: 24, md: 40 }} shape=\"square\" gap={4}>研究团队</Avatar>;\n}",
  "props": [
    {
      "name": "name",
      "type": "string",
      "description": "可访问名称；没有 icon 或 children 时显示前两个字符。",
      "default": "空字符串"
    },
    {
      "name": "src / srcSet / alt",
      "type": "string | ReactElement / string / string",
      "description": "图片地址或图片元素、响应式图片源及替代文本。图片元素需转发图片属性和错误事件。"
    },
    {
      "name": "icon / children",
      "type": "ReactNode",
      "description": "无图片或图片失败时优先 icon，其次 children，再次姓名缩写。"
    },
    {
      "name": "size",
      "type": "number | \"sm\" | \"md\" | \"lg\" | \"small\" | \"medium\" | \"large\" | Partial<Record<\"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\" | \"xxl\", number>>",
      "description": "像素尺寸；命名尺寸为 24 / 32 / 40px；响应式值向较大断点继承。",
      "default": "24"
    },
    {
      "name": "shape",
      "type": "\"circle\" | \"square\"",
      "description": "圆形或圆角方形。",
      "default": "circle"
    },
    {
      "name": "gap",
      "type": "number",
      "description": "文字与左右边缘的距离；超长文字自动缩小。",
      "default": "4"
    },
    {
      "name": "onError",
      "type": "(event: SyntheticEvent<HTMLImageElement>) => boolean | void",
      "description": "图片失败时触发；返回 false 保留图片、不自动回退。"
    },
    {
      "name": "crossOrigin / draggable",
      "type": "HTMLImageElement 属性",
      "description": "透传图片跨域和拖动配置。"
    },
    {
      "name": "ref / className / style / ...",
      "type": "HTMLSpanElement / 原生 span 属性",
      "description": "支持 ref 与根元素样式、事件和无障碍属性。"
    }
  ],
  "notes": [
    "保留 name/src/数字 size 的旧用法和 24px 默认尺寸；src 或 srcSet 改变后会重新尝试图片。",
    "响应式断点：xs 0、sm 576、md 768、lg 992、xl 1200、xxl 1600px。",
    "采用 mtone 的中性灰样式；复杂自定义图片元素需自行正确转发属性，建议使用字符串 src。"
  ]
},
{
    sidebarParent: "Avatar",
    sidebarSection: "groups",
  "name": "AvatarGroup",
  "description": "叠放头像，并通过可键盘操作的 +N 按钮查看溢出成员。",
  "importNames": [
    "AvatarGroup"
  ],
  "code": "import { AvatarGroup } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return <AvatarGroup items={[{name:\"张三\"},{name:\"李四\"},{name:\"王五\"}]} max={2} size={32} />;\n}",
  "props": [
    {
      "name": "items",
      "type": "AvatarProps[]",
      "description": "头像数据；与 children 二选一。"
    },
    {
      "name": "children",
      "type": "ReactNode",
      "description": "也可通过 Avatar 子元素组合；Avatar.Group 为别名。"
    },
    {
      "name": "max",
      "type": "number | { count?: number; style?: CSSProperties }",
      "description": "最多显示的普通头像数，溢出指示另外占一个位置；style 设置溢出按钮。",
      "default": "4"
    },
    {
      "name": "size / shape",
      "type": "AvatarProps[\"size\"] / AvatarProps[\"shape\"]",
      "description": "组默认尺寸和形状，单项显式值优先。",
      "default": "24 / circle"
    },
    {
      "name": "side",
      "type": "\"top\" | \"bottom\" | \"left\" | \"right\"",
      "description": "溢出成员浮层方向，自动避让边界。",
      "default": "top"
    },
    {
      "name": "className / style / ...",
      "type": "原生 span 属性",
      "description": "组容器属性。"
    }
  ],
  "notes": [
    "保留 items 和数值 max 旧接口。溢出名单点击或键盘打开，Escape 关闭。",
    "弹层位置与样式使用 side 和 max.style 配置。"
  ]
},
{
  "name": "Progress",
  "description": "紧凑的线性、圆形与仪表盘进度，支持状态、步骤、成功分段、渐变和自定义信息。",
  "importNames": [
    "Progress"
  ],
  "code": "import { Progress } from \"@bixlab/mtone\";\nimport \"@bixlab/mtone/styles.css\";\n\nexport default function Demo() {\n  return (\n    <div style={{ display: \"grid\", gap: 16, maxWidth: 460 }}>\n      <Progress value={68} label=\"上传进度\" showInfo />\n      <Progress value={80} success={{ value: 35 }} label=\"处理进度\" showInfo />\n      <div style={{ display: \"flex\", flexWrap: \"wrap\", gap: 16 }}>\n        <Progress type=\"circle\" value={68} label=\"项目进度\" showInfo />\n        <Progress type=\"dashboard\" value={75} label=\"容量\" showInfo />\n      </div>\n    </div>\n  );\n}",
  "props": [
    {
      "name": "value",
      "type": "number",
      "description": "必填；总进度百分比，限制在 0–100，NaN 和无穷大按 0 处理。"
    },
    {
      "name": "label",
      "type": "string",
      "description": "进度条的可访问名称，不是可见标题；aria-label 可覆盖。",
      "default": "Progress"
    },
    {
      "name": "type",
      "type": "\"line\" | \"circle\" | \"dashboard\"",
      "description": "线性、圆形或带缺口的仪表盘。",
      "default": "line"
    },
    {
      "name": "status",
      "type": "\"normal\" | \"active\" | \"success\" | \"exception\"",
      "description": "状态颜色及图标；active 只为连续线性条添加动画。不会修改 value，也不会因 value=100 自动切换。",
      "default": "normal"
    },
    {
      "name": "showInfo",
      "type": "boolean",
      "description": "显示百分比、状态图标或 format 内容；各类型默认隐藏以保留旧用法。",
      "default": "false"
    },
    {
      "name": "format",
      "type": "(value: number, successValue: number) => ReactNode",
      "description": "自定义视觉信息，优先于状态图标；参数是归一化后的总进度和成功进度。配合 showInfo 使用。"
    },
    {
      "name": "size",
      "type": "\"small\" | \"medium\" | number",
      "description": "small / medium：线性高度 3 / 5px，圆环直径 64 / 100px。数字表示线性高度或圆环直径（px）。",
      "default": "medium"
    },
    {
      "name": "strokeWidth",
      "type": "number",
      "description": "覆盖线宽；线性为 px（限制 1–100），圆形/仪表盘为 100×100 画布单位（限制 1–30）。",
      "default": "线性由 size 决定；圆环 6"
    },
    {
      "name": "strokeLinecap",
      "type": "\"round\" | \"butt\" | \"square\"",
      "description": "圆环采用对应 SVG 端点；线性 round 为圆角，其余为直角。",
      "default": "round"
    },
    {
      "name": "color",
      "type": "string | { from: string; to: string }",
      "description": "填充颜色，或从左到右的线性渐变；显式颜色优先于状态色。圆环渐变沿画布方向而非圆周方向。",
      "default": "普通为 #7d9c84；异常为 #b6403b"
    },
    {
      "name": "trackColor",
      "type": "string",
      "description": "未填充轨道的 CSS 颜色；默认 #efefed，可通过 --mt-progress-track 主题变量覆盖。"
    },
    {
      "name": "success",
      "type": "{ value: number; color?: string }",
      "description": "成功分段；value 是总量的百分比，限制在 0 到当前进度之间。color 默认 #548164。"
    },
    {
      "name": "steps",
      "type": "number | { count: number; gap?: number }",
      "description": "将进度显示为完整步骤，填充数量为 Math.round(value / 100 * count)。count 向下取整并限制到 0–1000，0 或非有限值关闭步骤。gap 单位为 px，默认 2、限制 0–100；圆环会按直径换算，间隔过大时会收窄以保留步骤。"
    },
    {
      "name": "gapDegree",
      "type": "number",
      "description": "仅 dashboard：缺口角度，限制 0–295；0 为完整圆环，非有限值回退到 75。",
      "default": "75"
    },
    {
      "name": "gapPosition",
      "type": "\"top\" | \"bottom\" | \"left\" | \"right\"",
      "description": "仅 dashboard：缺口方向。",
      "default": "bottom"
    },
    {
      "name": "className / style",
      "type": "string / CSSProperties",
      "description": "应用到根元素；线性宽度默认 100%，圆形可通过 size 设置直径。"
    },
    {
      "name": "HTML div attributes",
      "type": "React.HTMLAttributes<HTMLDivElement>（不含 children / color）",
      "description": "支持 id、data-*、aria-label、aria-labelledby 和 aria-valuetext 等属性。组件固定提供 progressbar 角色及归一化后的 0–100 数值。"
    }
  ],
  "notes": [
    "保留原有 <Progress value={68} label=\"上传进度\" /> 用法：5px 细线、低饱和绿色、无可见文字。",
    "导出 ProgressProps、ProgressType、ProgressStatus、ProgressColor 类型。组件不包含交互或自动计时，更新 value 即可改变进度。",
    "非有限数值安全归一化；圆环直径限制 16–4096px。线性 size 数字同线宽限制 1–100px。",
    "format 内容只作视觉显示；自定义单位或业务信息应同时设置 aria-valuetext，label 用于说明进度属于什么任务。",
    "成功分段不是额外加在 value 之外；steps 同样按成功进度四舍五入到整步。",
    "线性条渐变逐步骤应用；圆形步骤共享同一个画布线性渐变。圆环步骤过密时自动改用 butt 端点，避免圆形或方形端帽重叠。",
    "active 不应用于步骤、circle 或 dashboard。遵循 prefers-reduced-motion，关闭活动动画及线性宽度过渡。",
    "文档分别展示基础线性、状态、圆形、仪表盘、尺寸/端点、渐变、成功分段、步骤、自定义信息及动态更新。"
  ]
},
  {
    name: "PropertyList",
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
      "复杂受控流程由 open/onOpenChange 管理。",
      "标题与关闭按钮垂直居中；面板顶部内边距 12px、左右 20px，footer 上间隔 16px，footer 内上下留白各 8px。多行标题与窄屏按钮换行均受支持。",
    ],
  },
  {
    name: "Drawer",
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
    name: "FloatingWindow",
    description: "可拖动、调整尺寸并最小化的非模态浮动窗口。",
    importNames: ["FloatingWindow"],
    code: 'import { Button, FloatingWindow } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return <FloatingWindow title="任务速记" trigger={<Button>打开窗口</Button>} initialSize={{ width: 360, height: 235 }}><p>整理本周的任务。</p></FloatingWindow>;\n}',
    props: [
      { name: "title", type: "ReactNode", description: "窗口标题，用于对话框的可访问名称。" },
      { name: "trigger", type: "ReactElement | string", description: "可选打开或恢复按钮；自定义组件需转发 ref 与触发属性。" },
      { name: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (open: boolean) => void", description: "受控显示状态、非受控初始状态和显示状态回调。" },
      { name: "initialPosition", type: "{ left: number; top: number }", description: "窗口的初始视口坐标，单位 px；省略时居中。" },
      { name: "initialSize", type: "{ width: number; height: number }", default: "440 × 320", description: "窗口的初始宽高，单位 px；拖动和缩放不要求受控。" },
      { name: "minWidth / minHeight / maxWidth / maxHeight", type: "number", description: "可选尺寸限制，单位 px。默认最小 220 × 140；尺寸仍受视口约束。" },
      { name: "draggable / resizable / minimizable", type: "boolean", default: "true", description: "分别启用标题栏拖动、右下角缩放和最小化。" },
      { name: "minimizedIcon", type: "ReactNode", description: "可替换右下角恢复按钮的装饰图标。" },
      { name: "zIndex", type: "number", default: "1150", description: "按应用布局需要覆盖窗口层叠顺序。" },
      { name: "children", type: "ReactNode", description: "窗口正文；高度不足时可在窗口内滚动。" },
    ],
    notes: [
      "窗口非模态，不显示遮罩，不锁定背景滚动或焦点，按 Esc 或点击外部都不关闭。需要阻止用户与背景交互时用 Dialog。",
      "可用指针拖动标题栏或右下角手柄，也可聚焦“移动窗口”或“调整窗口大小”后用方向键调整，每步 8px，按住 Shift 为 24px。窗口位置和尺寸保持在当前视口内。",
      "最小化后点击右下角图标恢复；过程保留窗口位置、尺寸和已挂载子组件的状态。关闭会卸载窗口正文，并将焦点还给可用触发器；不提供持久化或应用级窗口管理。",
    ],
  },
  {
    name: "ConfirmDialog",
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
    name: "GlobalNotice",
    description: "持续可见的全局警示通知，可独立使用或通过 AdminLayout 的 notice 插槽跨页面展示。",
    importNames: ["GlobalNotice"],
    code: `import { GlobalNotice } from "@bixlab/mtone";
import "@bixlab/mtone/styles.css";

export default function Demo() {
  return <GlobalNotice title="管理员模式" actionLabel="退出管理模式" onAction={() => {/* 由应用处理 */}}>
    完成管理操作后请退出。
  </GlobalNotice>;
}`,
    props: [
      { name: "title", type: "ReactNode", description: "必填；简短通知标题。" },
      { name: "children", type: "ReactNode", description: "可选详情；窄屏可自然换行。" },
      { name: "icon", type: "ReactNode | false", description: "默认显示装饰性警示图标。设为 false 隐藏图标。" },
      { name: "onAction", type: "() => void", description: "提供时渲染操作按钮；操作请求、关闭与持久状态由应用负责。" },
      { name: "actionLabel", type: "string", description: "可选可见操作文字；没有文字时显示本地化无障碍名称的关闭按钮。" },
      { name: "actionRef", type: "Ref<HTMLButtonElement>", description: "操作按钮引用，便于错误后返回重试按钮。" },
      { name: "loading", type: "boolean", default: "false", description: "显示加载图标并禁用按钮。异步处理建议应用另外设置立即生效的请求锁。" },
      { name: "error", type: "ReactNode", description: "可选操作失败反馈，以警报语义公布；应用决定何时清除。" },
      { name: "原生 div 属性和 ref", type: "HTMLAttributes<HTMLDivElement>", description: "支持 className、style 与 DOM 属性，title 使用通知标题。" },
    ],
    notes: [
      "通知不会自动关闭，不执行权限、导航或网络操作。成功后由应用移除通知，并把焦点恢复到仍存在的控件。",
      "用于持续全局状态；局部反馈使用 Alert。警示颜色沿用语义警告样式，不是装饰性颜色预设。",
    ],
  },
  {
    name: "Empty",
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
    name: "ToastProvider",
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
      "必须在 ToastProvider 后代调用 useToast；建议把 ToastProvider 放在 MtoneProvider 内。",
      "单一队列管理所有位置，改变位置不会创建第二条通知；多位置会占用同一 limit。数量较多时请关闭旧通知或适当调整上限。",
      "center / center-top 是非模态提示，不是 Dialog，不锁定焦点或阻止背景操作。",
      "默认使用 Base UI 的礼貌播报、自动关闭、悬停/焦点暂停与关闭行为。保留优先级、actionProps、data、update、close 和 promise API。",
      "持续通知（timeout: 0）必须留有关闭方式；不要仅用颜色传达状态，预设图标与文字共同表达含义。",
    ],
  },
  {
    name: "MtoneProvider",
    description: "为组件及其浮层配置颜色模式、语言和主题变量。",
    importNames: ["MtoneProvider", "Button"],
    code: 'import { MtoneProvider, Button } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <MtoneProvider locale="zh" theme="system" tokens={{"--mt-primary":"#446c52"}}><Button variant="solid">保存</Button></MtoneProvider>\n  );\n}',
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
        name: "theme",
        type: 'MtoneTheme ("light" | "dark" | "system")',
        description: "浅色、深色或实时跟随设备设置；省略时继承上层主题。",
        default: "最外层为 light",
      },
      {
        name: "tokens",
        type: "Tokens",
        description:
          "CSS 自定义属性与 CSSProperties，常用 --mt-fg、--mt-bg、--mt-primary。",
      },
    ],
    notes: [
      "简单组件不使用 Provider 时也可用默认值，保持浅色。",
      "库分发预编译 CSS，不要求宿主安装 Tailwind。浮层继承 Provider 上下文。",
      "主题通过 CSS 变量传播，不是 Shadow DOM 隔离；自定义层级请检查 z-index 1200–1300。",
    ],
  },
  {
    name: "MtoneScope",
    description: "把当前 Provider 的主题变量应用到一个 div，可局部覆盖颜色模式。",
    importNames: ["MtoneScope", "MtoneProvider", "Button"],
    code: 'import { MtoneScope, MtoneProvider, Button } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <MtoneProvider tokens={{"--mt-primary":"#446c52"}}><MtoneScope theme="dark"><Button variant="solid">主题作用域</Button></MtoneScope></MtoneProvider>\n  );\n}',
    props: [
      {
        name: "children",
        type: "ReactNode",
        description: "组件内容。",
      },
      {
        name: "theme",
        type: 'MtoneTheme ("light" | "dark" | "system")',
        description: "仅覆盖此作用域及其浮层的颜色模式。",
        default: "继承上层主题",
      },
      {
        name: "原生属性",
        type: "HTMLAttributes",
        description:
          "支持对应元素的 className、style 与适用的 DOM 属性；以 TypeScript 定义为准。",
      },
    ],
    notes: [
      "通常无需手动使用；库内部用它让 Portal 浮层继承主题。可覆盖颜色模式，仍继承语言和主题变量。",
    ],
  },
  {
    name: "ShortcutsProvider",
    description: "按需注册全局键盘快捷键：用 useShortcut 绑定操作、ShortcutScope 控制作用域、formatShortcut 生成平台标签。",
    importNames: ["ShortcutsProvider", "ShortcutScope", "useShortcut", "formatShortcut"],
    code: `import { Button, ShortcutsProvider, useShortcut, formatShortcut } from "@bixlab/mtone";
import "@bixlab/mtone/styles.css";

const shortcut = "Shift+F2";

function Search({ onOpen }: { onOpen: () => void }) {
  useShortcut(shortcut, onOpen);
  return (
    <Button onClick={onOpen} rightSection={<kbd>{formatShortcut(shortcut)}</kbd>}>
      打开搜索
    </Button>
  );
}

export default function Demo() {
  return <ShortcutsProvider><Search onOpen={() => console.log("打开搜索")} /></ShortcutsProvider>;
}`,
    props: [
      { name: "ShortcutsProvider.children", type: "ReactNode", description: "包裹需要注册快捷键的应用树；推荐每个应用使用一个根 Provider。嵌套 Provider 复用同一个监听。" },
      { name: "ShortcutScope.children", type: "ReactNode", description: "定义快捷键的作用域，可嵌套；仅影响作用域内注册的动作。" },
      { name: "ShortcutScope.active", type: "boolean", default: "true", description: "设为 false 时暂停此作用域及其后代的快捷键。" },
      { name: "ShortcutScope.priority", type: "number", default: "0", description: "多个有效作用域匹配同一快捷键时，优先级较高者优先；同级优先最深的作用域。" },
      { name: "useShortcut(shortcut, callback, options?)", type: "(shortcut: string | readonly string[] | false, callback: (event: KeyboardEvent) => void, options?: ShortcutOptions) => void", description: "在 Provider 内显式注册。字符串数组表示任选一组按键，不是按键序列；false 禁用。" },
      { name: "options.enabled", type: "boolean", default: "true", description: "控制当前快捷键是否启用。" },
      { name: "options.allowInInputs", type: "boolean", default: "false", description: "默认跳过 input、textarea、select 和可编辑内容；设为 true 才在其中响应。" },
      { name: "options.preventDefault", type: "boolean", default: "true", description: "命中后阻止浏览器的默认动作；设为 false 时保留默认动作。" },
      { name: "formatShortcut(shortcut, platform?)", type: "(shortcut: string, platform?: 'mac' | 'other') => string", description: "生成平台对应的显示文字，不注册事件。可指定平台给 SSR 或测试使用。" },
    ],
    notes: [
      "Mod+K 在苹果平台匹配 Meta+K，其他平台匹配 Ctrl+K。也可明确写 Ctrl、Meta、Alt、Shift；用 + 分隔同时按下的键，不支持多步序列。",
      "默认忽略输入法组合和长按产生的重复事件。Provider 外的 useShortcut 不注册监听；应用只应显式绑定确有用途的快捷键，并保留等价的可点击操作。",
      "同一作用域重复注册同一组合时，开发环境会提示；同一个 Provider 的注册表每次按键至多调用一个匹配动作。",
      "Menu 条目的 shortcut 只显示标签。把 formatShortcut 的结果赋给 shortcut，再用 useShortcut 为同一操作显式注册，菜单本身不会重复绑定。",
      'Spotlight 加入 Provider 的监听，但继续接受 shortcut="k" 或 false；不要把 useShortcut 的组合表达式直接传给 Spotlight。',
    ],
  },
  {
    name: "AiChat",
    description: "容纳滚动消息和固定输入区域，可跟随最新消息。",
    importNames: ["AiChat"],
    code: 'import { AiChat, AiMessage } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <AiChat style={{ height: 180, width: "100%" }} aria-label="项目讨论">\n      <AiMessage from="user">下一步做什么？</AiMessage>\n      <AiMessage from="assistant">先把待确认事项列出来。</AiMessage>\n    </AiChat>\n  );\n}',
    props: [
      {
        name: "children / empty / footer",
        type: "ReactNode",
        description: "消息、空状态和底部区域。",
      },
      {
        name: "autoFollow",
        type: "boolean",
        description: "在阅读位置靠近底部时自动跟随消息；向上浏览时不强制跳回。",
        default: "true",
      },
      {
        name: "bottomThreshold",
        type: "number",
        description: "判断靠近底部的距离，单位 px。",
        default: "64",
      },
      {
        name: "scrollToBottomLabel",
        type: "string",
        description: "覆盖回到底部按钮的名称。",
      },
      {
        name: "className / style / aria-label",
        type: "HTMLAttributes<HTMLDivElement>",
        description: "设置对话高度、样式和可访问名称等。",
      },
    ],
    notes: [
      "给容器设置合适的可用高度，才能在消息区内部滚动。应用负责消息和流式请求；组件不连接模型。",
    ],
    demoLabel: "对话容器",
  },
  {
    name: "AiMessage",
    description: "展示用户、助手或系统消息及生成状态、附件内容和可选操作。",
    importNames: ["AiMessage"],
    code: 'import { AiMessage, Button } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <AiMessage\n      from="assistant"\n      status="streaming"\n      actions={<Button size="sm">复制（示例）</Button>}\n    >\n      正在整理记录。\n    </AiMessage>\n  );\n}',
    props: [
      {
        name: "from",
        type: '"user" | "assistant" | "system"',
        description: "必填；决定消息角色及默认显示名称。",
      },
      {
        name: "name / avatar / children / actions",
        type: "ReactNode",
        description: "自定义名称、头像、消息内容和操作。",
      },
      {
        name: "status / statusLabel",
        type: '"idle" | "streaming" | "error" / string',
        description: "消息状态与可覆盖的状态文字。",
        default: "idle",
      },
    ],
    notes: [
      "应用提供内容及其渲染策略；不会将字符串自动解析为 Markdown 或执行 HTML。",
    ],
    demoLabel: "消息气泡",
    sidebarParent: "AiChat",
  },
  {
    name: "AiPromptInput",
    description: "提供消息输入、提交、停止、附件选择和错误展示。",
    importNames: ["AiPromptInput"],
    code: 'import { useState } from "react";\nimport { AiPromptInput } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  const [text, setText] = useState("");\n  const [sent, setSent] = useState("");\n  return (\n    <div style={{ width: "100%" }}>\n      <AiPromptInput\n        aria-label="演示消息"\n        value={text}\n        onValueChange={setText}\n        onSubmit={(submission) => {\n          setSent(submission.text);\n          setText("");\n        }}\n      />\n      <p role="status">{sent}</p>\n    </div>\n  );\n}',
    props: [
      {
        name: "value / defaultValue / onValueChange",
        type: "string / string / (value: string) => void",
        description: "受控文本、初始文本及变化回调。",
      },
      {
        name: "onSubmit",
        type: "(submission: AiPromptSubmission) => void | Promise<void>",
        description:
          "必填；收到 text 和附件元数据。提交后的清空需要应用自行处理。",
      },
      {
        name: "status / onStop",
        type: "AiPromptStatus / () => void",
        description:
          "状态为 ready、submitted、streaming、error；忙碌时可发出停止请求。",
        default: "ready",
      },
      {
        name: "attachments / onFilesSelect / onAttachmentRemove",
        type: "readonly AiPromptAttachment[] / (files: File[]) => void / (id: string) => void",
        description: "附件由应用持有；选择文件和移除操作只回调。",
      },
      {
        name: "accept / multiple / disabled",
        type: "string / boolean / boolean",
        description: "文件类型、允许多选及禁用状态。",
        default: "— / true / false",
      },
      {
        name: "toolbar / error / placeholder",
        type: "ReactNode / ReactNode / string",
        description: "输入区的工具栏、错误提示和占位文本。",
      },
      {
        name: "submitLabel / stopLabel / attachmentLabel",
        type: "string",
        description: "自定义各按钮可访问名称。",
      },
    ],
    notes: [
      "Enter 发送，Shift+Enter 换行；输入法组合期间不会误发送。文件只交给应用，不自动上传。",
    ],
    demoLabel: "输入与附件",
    sidebarParent: "AiChat",
  },
  {
    name: "AiSuggestion",
    description: "点击后把建议提示词交给应用，用于填入输入框或其他交互。",
    importNames: ["AiSuggestion"],
    code: 'import { useState } from "react";\nimport { AiSuggestion } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  const [text, setText] = useState("");\n  return (\n    <div>\n      <AiSuggestion prompt="整理项目要点" onSelect={setText}>\n        建议：整理项目\n      </AiSuggestion>\n      <p role="status">{text}</p>\n    </div>\n  );\n}',
    props: [
      {
        name: "prompt / onSelect",
        type: "string / (prompt: string) => void",
        description: "提示词及选中回调。",
      },
      {
        name: "children / ButtonProps",
        type: "ReactNode / ButtonProps",
        description: "可替换显示内容，其余按钮属性照常使用。",
      },
    ],
    notes: ["不会自动调用模型。应用可在 onClick 阻止默认行为以取消 onSelect。"],
    demoLabel: "建议提示词",
    sidebarParent: "AiChat",
  },
  {
    name: "AiModelSelector",
    description: "用受控选择器展示应用提供的模型和可选推理强度。",
    importNames: ["AiModelSelector"],
    code: 'import { useState } from "react";\nimport { AiModelSelector } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  const [model, setModel] = useState("fast");\n  const [effort, setEffort] = useState("normal");\n  return (\n    <AiModelSelector\n      models={[\n        { value: "fast", label: "快速（模拟）" },\n        { value: "review", label: "审阅（模拟）" },\n      ]}\n      value={model}\n      onValueChange={setModel}\n      efforts={[\n        { value: "normal", label: "常规" },\n        { value: "deep", label: "深入" },\n      ]}\n      effort={effort}\n      onEffortChange={setEffort}\n    />\n  );\n}',
    props: [
      {
        name: "models / value / onValueChange",
        type: "AiModelOption[] / string / (value: string) => void",
        description: "必填；由应用维护模型选项及选择。",
      },
      {
        name: "efforts / effort / onEffortChange",
        type: "AiModelOption[] / string / (value: string) => void",
        description: "可选推理强度；没有变化回调时该选择不可编辑。",
      },
      {
        name: "disabled / modelLabel / effortLabel",
        type: "boolean / string / string",
        description: "禁用选择器，或覆盖模型及推理强度的可访问名称。",
      },
    ],
    notes: ["显示的选项由应用定义，不代表实际可用模型或服务权限。"],
    demoLabel: "模型与强度",
    sidebarParent: "AiChat",
  },
  {
    name: "AiPlan",
    description: "用步骤列表和完成进度展示应用提供的任务计划。",
    importNames: ["AiPlan"],
    code: 'import { AiPlan } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <AiPlan\n      title="整理文档"\n      status="running"\n      items={[\n        { id: "read", title: "读取目录", status: "completed" },\n        { id: "write", title: "整理提纲", status: "running" },\n      ]}\n    />\n  );\n}',
    props: [
      {
        name: "items",
        type: "AiActivityStep[]",
        description: "必填；计划步骤及状态。",
      },
      {
        name: "title / statusLabel",
        type: "string",
        description: "可覆盖折叠标题和状态文字。",
      },
      {
        name: "status",
        type: "AiActivityStatus",
        description: "状态为 pending、running、completed、error、cancelled。",
        default: "pending",
      },
      {
        name: "open / defaultOpen / onOpenChange",
        type: "boolean / boolean / (open: boolean) => void",
        description: "控制展开状态、指定初始展开状态或监听展开变化。",
      },
      {
        name: "children / 原生属性",
        type: "ReactNode / HTMLAttributes<HTMLDivElement>",
        description: "额外内容及根 div 属性。",
      },
    ],
    notes: ["计划默认展开。进度只计入 completed 步骤；不调度或执行任务。"],
    demoLabel: "执行计划",
  },
  {
    name: "AiReasoning",
    description: "以可折叠区域展示应用提供的公开文字说明。",
    importNames: ["AiReasoning"],
    code: 'import { AiReasoning } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <AiReasoning\n      defaultOpen\n      status="completed"\n      text="只比较发布时间和记录编号，结果仍需人工核对。"\n    />\n  );\n}',
    props: [
      {
        name: "text",
        type: "string",
        description: "必填；仅从调用方接收公开说明。",
      },
      {
        name: "title / statusLabel",
        type: "string",
        description: "可覆盖折叠标题和状态文字。",
      },
      {
        name: "status",
        type: "AiActivityStatus",
        description: "状态为 pending、running、completed、error、cancelled。",
        default: "pending",
      },
      {
        name: "open / defaultOpen / onOpenChange",
        type: "boolean / boolean / (open: boolean) => void",
        description: "控制展开状态、指定初始展开状态或监听展开变化。",
      },
      {
        name: "children / 原生属性",
        type: "ReactNode / HTMLAttributes<HTMLDivElement>",
        description: "额外内容及根 div 属性。",
      },
    ],
    notes: ["公开说明按文本呈现；不会获取模型隐含推理。默认收起。"],
    demoLabel: "公开说明",
    sidebarParent: "AiPlan",
  },
  {
    name: "AiTask",
    description: "展示任务状态、可选步骤和由应用提供的过程摘要。",
    importNames: ["AiTask"],
    code: 'import { AiTask } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <AiTask\n      title="核对版本"\n      defaultOpen\n      status="running"\n      steps={[\n        { id: "tag", title: "查看发布标签", status: "completed" },\n        { id: "file", title: "比对内容", status: "running" },\n      ]}\n    />\n  );\n}',
    props: [
      {
        name: "steps",
        type: "AiActivityStep[]",
        description: "步骤名称、说明及状态。",
      },
      {
        name: "title / statusLabel",
        type: "string",
        description: "可覆盖折叠标题和状态文字。",
      },
      {
        name: "status",
        type: "AiActivityStatus",
        description: "状态为 pending、running、completed、error、cancelled。",
        default: "pending",
      },
      {
        name: "open / defaultOpen / onOpenChange",
        type: "boolean / boolean / (open: boolean) => void",
        description: "控制展开状态、指定初始展开状态或监听展开变化。",
      },
      {
        name: "children / 原生属性",
        type: "ReactNode / HTMLAttributes<HTMLDivElement>",
        description: "额外内容及根 div 属性。",
      },
    ],
    notes: ["默认收起；不会执行任务。用 title 自定义摘要标题，例如“过程摘要”。只显示调用方提供的公开说明和步骤。"],
    demoLabel: "子任务",
    sidebarParent: "AiPlan",
  },
  {
    name: "AiQueue",
    description: "根据状态展示待完成事项与已结束事项。",
    importNames: ["AiQueue"],
    code: 'import { AiQueue } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <AiQueue\n      items={[\n        { id: "first", title: "整理目录", status: "completed" },\n        { id: "second", title: "检查引用", status: "pending" },\n      ]}\n    />\n  );\n}',
    props: [
      {
        name: "items",
        type: "AiActivityStep[]",
        description:
          "必填；completed 和 cancelled 分入已结束，其余分入待完成。",
      },
      {
        name: "title / statusLabel",
        type: "string",
        description: "可覆盖折叠标题和状态文字。",
      },
      {
        name: "status",
        type: "AiActivityStatus",
        description: "状态为 pending、running、completed、error、cancelled。",
        default: "pending",
      },
      {
        name: "open / defaultOpen / onOpenChange",
        type: "boolean / boolean / (open: boolean) => void",
        description: "控制展开状态、指定初始展开状态或监听展开变化。",
      },
      {
        name: "children / 原生属性",
        type: "ReactNode / HTMLAttributes<HTMLDivElement>",
        description: "额外内容及根 div 属性。",
      },
    ],
    notes: ["默认展开；只呈现状态，不负责排队或重试。"],
    demoLabel: "任务队列",
    sidebarParent: "AiPlan",
  },
  {
    name: "AiSubagent",
    description: "展示应用提供的代理名称、工作描述及结果。",
    importNames: ["AiSubagent"],
    code: 'import { AiSubagent } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <AiSubagent\n      name="文档校对"\n      status="completed"\n      defaultOpen\n      description="核对目录和页码"\n      result="发现一处需要核实的页码。"\n    />\n  );\n}',
    props: [
      {
        name: "name / description / result",
        type: "string / ReactNode / ReactNode",
        description: "name 必填，未传 title 时用作标题。",
      },
      {
        name: "title / statusLabel",
        type: "string",
        description: "可覆盖折叠标题和状态文字。",
      },
      {
        name: "status",
        type: "AiActivityStatus",
        description: "状态为 pending、running、completed、error、cancelled。",
        default: "pending",
      },
      {
        name: "open / defaultOpen / onOpenChange",
        type: "boolean / boolean / (open: boolean) => void",
        description: "控制展开状态、指定初始展开状态或监听展开变化。",
      },
      {
        name: "children / 原生属性",
        type: "ReactNode / HTMLAttributes<HTMLDivElement>",
        description: "额外内容及根 div 属性。",
      },
    ],
    notes: ["不创建、联系或控制代理。默认收起。"],
    demoLabel: "子代理状态",
    sidebarParent: "AiPlan",
  },
  {
    name: "AiTool",
    description: "按纯文本展示工具输入、输出及状态。",
    importNames: ["AiTool"],
    code: 'import { AiTool } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <AiTool\n      name="检索示例"\n      defaultOpen\n      status="completed"\n      input={JSON.stringify({ keyword: "目录" })}\n      output="匹配到 2 条示例记录"\n    />\n  );\n}',
    props: [
      {
        name: "name / input / output",
        type: "string",
        description: "name 必填；input 和 output 为纯文本，默认标题取 name。",
      },
      {
        name: "title / statusLabel",
        type: "string",
        description: "可覆盖折叠标题和状态文字。",
      },
      {
        name: "status",
        type: "AiActivityStatus",
        description: "状态为 pending、running、completed、error、cancelled。",
        default: "pending",
      },
      {
        name: "open / defaultOpen / onOpenChange",
        type: "boolean / boolean / (open: boolean) => void",
        description: "控制展开状态、指定初始展开状态或监听展开变化。",
      },
      {
        name: "children / 原生属性",
        type: "ReactNode / HTMLAttributes<HTMLDivElement>",
        description: "额外内容及根 div 属性。",
      },
    ],
    notes: ["不调用工具或执行输入、输出中的文本。默认收起。"],
    demoLabel: "工具调用记录",
    sidebarParent: "AiPlan",
  },
  {
    name: "AiCheckpoint",
    description: "展示检查点信息，并把恢复请求交给应用。",
    importNames: ["AiCheckpoint"],
    code: 'import { useState } from "react";\nimport { AiCheckpoint } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  const [restored, setRestored] = useState(false);\n  return (\n    <div>\n      <AiCheckpoint\n        label="整理前"\n        description="演示检查点"\n        onRestore={() => setRestored(true)}\n      />\n      {restored && <p role="status">已收到恢复请求（模拟）。</p>}\n    </div>\n  );\n}',
    props: [
      {
        name: "label / description / children",
        type: "string / ReactNode / ReactNode",
        description: "标签、说明及补充内容。",
      },
      {
        name: "onRestore / restoreLabel / disabled",
        type: "() => void / string / boolean",
        description: "点击时通知应用；未提供回调时按钮禁用。",
      },
    ],
    notes: ["不会自行保存或恢复应用状态。"],
    demoLabel: "检查点",
    sidebarParent: "AiPlan",
  },
  {
    name: "AiConfirmation",
    description: "展示待确认事项、受控决定和按钮状态。",
    importNames: ["AiConfirmation"],
    code: 'import { useState } from "react";\nimport { AiConfirmation } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  const [state, setState] = useState<"pending" | "approved" | "rejected">(\n    "pending",\n  );\n  return (\n    <AiConfirmation\n      title="保存示例摘要？"\n      description="仅演示确认界面，不会保存文件。"\n      state={state}\n      onConfirm={() => setState("approved")}\n      onReject={() => setState("rejected")}\n    />\n  );\n}',
    props: [
      {
        name: "title / description / children",
        type: "string / ReactNode / ReactNode",
        description: "操作标题、必要说明及补充内容。",
      },
      {
        name: "state / busy",
        type: '"pending" | "approved" | "rejected" / boolean',
        description: "决定由调用方维护；busy 时禁用待确认按钮。",
        default: "pending / false",
      },
      {
        name: "onConfirm / onReject",
        type: "() => void",
        description: "相应决定的回调；未传的按钮禁用。",
      },
      {
        name: "confirmLabel / rejectLabel",
        type: "string",
        description: "覆盖确认或拒绝的按钮文字。",
      },
    ],
    notes: ["不替应用授权、执行或保存决定；示例的点击仅改变本地显示。"],
    demoLabel: "确认请求",
    sidebarParent: "AiPlan",
  },
  {
    name: "AiSources",
    description: "集中展示引文来源和说明，可折叠并显示数量。",
    importNames: ["AiSources"],
    code: 'import { AiSources } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <AiSources\n      defaultOpen\n      sources={[\n        { id: "one", title: "项目准备说明", description: "示例来源一" },\n        { id: "two", title: "当前文档", url: "#/components/AiSources" },\n      ]}\n    />\n  );\n}',
    props: [
      {
        name: "sources",
        type: "AiSource[]",
        description: "必填；条目包含 id、title，及可选 url、description。",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        description: "初始展开来源列表。",
        default: "false",
      },
      {
        name: "label / className / style",
        type: "string / string / CSSProperties",
        description: "可覆盖显示名称及局部样式。",
      },
    ],
    notes: [
      "仅将有效的 HTTP(S)、站内根路径或锚点显示为可点链接；无效 URL 显示为纯文本。组件不会访问或验证来源内容。",
    ],
    demoLabel: "来源列表",
  },
  {
    name: "AiInlineCitation",
    description: "在句子中插入来源编号或标题。",
    importNames: ["AiInlineCitation"],
    code: 'import { AiInlineCitation } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <p>\n      整理前请核对原始记录。{" "}\n      <AiInlineCitation\n        index={1}\n        source={{\n          id: "one",\n          title: "查看来源示例",\n          url: "#/components/AiSources?section=ai-sources",\n        }}\n      />\n    </p>\n  );\n}',
    props: [
      {
        name: "source",
        type: "AiSource",
        description: "必填；提供 id、title 及可选的 url、description。",
      },
      {
        name: "index",
        type: "number",
        description: "显示编号；省略时显示标题。",
      },
      {
        name: "className / style",
        type: "string / CSSProperties",
        description: "可覆盖局部样式。",
      },
    ],
    notes: [
      "仅有效的 HTTP(S)、站内根路径或锚点会渲染为链接；无效或缺省 URL 显示为文本。",
    ],
    demoLabel: "行内引用",
    sidebarParent: "AiSources",
  },
  {
    name: "AiContext",
    description: "展示调用方报告的词元使用量和预格式化费用。",
    importNames: ["AiContext"],
    code: 'import { AiContext } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <AiContext\n      usedTokens={4200}\n      maxTokens={8000}\n      inputTokens={3200}\n      outputTokens={1000}\n      cost="¥0.08（模拟）"\n    />\n  );\n}',
    props: [
      {
        name: "usedTokens / maxTokens",
        type: "number",
        description: "用量必填；可选上限，用于显示进度。",
      },
      {
        name: "inputTokens / outputTokens / cost",
        type: "number / number / string",
        description: "可选输入、输出计数及应用已格式化的费用。",
      },
      {
        name: "label / className / style",
        type: "string / string / CSSProperties",
        description: "可覆盖显示名称及局部样式。",
      },
    ],
    notes: ["不估算词元或价格，不读取计费账户。"],
    demoLabel: "上下文用量",
    sidebarParent: "AiSources",
  },
  {
    name: "AiFileTree",
    description: "从应用数据展示文件和目录，并回传选择。",
    importNames: ["AiFileTree"],
    code: 'import { useState } from "react";\nimport { AiFileTree } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  const [selected, setSelected] = useState<string | null>(null);\n  return (\n    <div>\n      <AiFileTree\n        items={[\n          {\n            id: "src",\n            name: "src",\n            kind: "folder",\n            children: [\n              { id: "main", name: "main.tsx" },\n              { id: "test", name: "main.test.tsx" },\n            ],\n          },\n        ]}\n        defaultExpandedIds={["src"]}\n        selectedId={selected}\n        onSelect={setSelected}\n      />\n      <p role="status">{selected ? "已选：" + selected : "请选择文件"}</p>\n    </div>\n  );\n}',
    props: [
      {
        name: "items",
        type: "AiFileNode[]",
        description: "必填；节点含 id、name，及可选 kind、children、disabled。",
      },
      {
        name: "selectedId / defaultSelectedId / onSelect",
        type: "string | null / string / (id: string, node: AiFileNode) => void",
        description: "受控选中键、初始键和选择回调。",
      },
      {
        name: "defaultExpandedIds",
        type: "string[]",
        description: "初始展开节点键。",
      },
      {
        name: "label / className / style",
        type: "string / string / CSSProperties",
        description: "可覆盖显示名称及局部样式。",
      },
    ],
    notes: [
      "不读取本地文件、检查权限或自动打开文件。为节点提供稳定唯一的 id。",
    ],
    demoLabel: "文件树",
    sidebarParent: "AiSources",
  },
  {
    name: "AiStackTrace",
    description: "展示错误文本和可折叠的堆栈帧。",
    importNames: ["AiStackTrace"],
    code: 'import { AiStackTrace } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <AiStackTrace\n      defaultOpen\n      message="Error: Missing project name"\n      frames={[\n        {\n          file: "src/project.ts",\n          line: 24,\n          column: 8,\n          functionName: "readProject",\n        },\n      ]}\n    />\n  );\n}',
    props: [
      {
        name: "message / frames",
        type: "string / AiStackFrame[]",
        description: "必填；每帧含 file，可附 line、column、functionName。",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        description: "初始展开。",
        default: "false",
      },
      {
        name: "label / className / style",
        type: "string / string / CSSProperties",
        description: "可覆盖显示名称及局部样式。",
      },
    ],
    notes: ["不捕获错误、不解释异常或打开文件。"],
    demoLabel: "堆栈信息",
    sidebarParent: "AiSources",
  },
  {
    name: "AiTerminal",
    description: "以可聚焦的纯文本区域展示命令输出及状态。",
    importNames: ["AiTerminal"],
    code: 'import { AiTerminal } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return <AiTerminal status="success" output={"$ npm test\\nPASS 3 tests"} />;\n}',
    props: [
      { name: "output", type: "string", description: "必填；显示文本输出。" },
      {
        name: "status",
        type: "AiTerminalStatus",
        description: "idle、running、success 或 error。",
        default: "idle",
      },
      {
        name: "label / className / style",
        type: "string / string / CSSProperties",
        description: "可覆盖显示名称及局部样式。",
      },
    ],
    notes: ["不是交互式终端，不接收命令，也不创建进程。"],
    demoLabel: "终端输出",
    sidebarParent: "AiSources",
  },
  {
    name: "AiTestResults",
    description: "可折叠查看测试结果和状态汇总。",
    importNames: ["AiTestResults"],
    code: 'import { AiTestResults } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function Demo() {\n  return (\n    <AiTestResults\n      defaultOpen\n      results={[\n        { id: "one", name: "保存标题", status: "passed", durationMs: 15 },\n        {\n          id: "two",\n          name: "空记录提示",\n          status: "failed",\n          details: "期望看到空状态提示",\n        },\n      ]}\n    />\n  );\n}',
    props: [
      {
        name: "results",
        type: "AiTestResult[]",
        description:
          "必填；每项含 id、name、status，可附 durationMs、details。",
      },
      {
        name: "defaultOpen",
        type: "boolean",
        description: "初始展开。",
        default: "false",
      },
      {
        name: "label / className / style",
        type: "string / string / CSSProperties",
        description: "可覆盖显示名称及局部样式。",
      },
    ],
    notes: ["状态为 passed、failed、skipped 或 running；组件不执行测试。"],
    demoLabel: "测试结果",
    sidebarParent: "AiSources",
  },
];


export const componentDocs: ComponentDoc[] = componentReferences.map((doc) => ({
  ...doc,
  category: categoryByName.get(doc.name)!,
}));

const docsByName = new Map(componentDocs.map((doc) => [doc.name, doc]));
export const componentDocGroups = componentCategories.map((label) => ({
  label,
  members: taxonomy[label].map((name) => docsByName.get(name)!),
}));

export function familyDocHref(name: string): string | undefined {
  const doc = docsByName.get(name);
  return doc?.sidebarParent && doc.sidebarSection
    ? `#/components/${doc.sidebarParent}?section=${doc.sidebarSection}`
    : undefined;
}
