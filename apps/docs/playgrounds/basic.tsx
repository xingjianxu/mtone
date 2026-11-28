import { lazy, Suspense, useState } from "react";
import { FileText, Plus, Save, Star } from "lucide-react";
import * as M from "../../../packages/mtone/src";
import {
  choice as c,
  flag as f,
  number as n,
  playground as p,
  sizes,
  text as t,
} from "./frame";

const EditableBlocks = lazy(() => import("./block-editor-preview"));
const typographyFields = {
  strong: f("加粗"),
  italic: f("斜体"),
  underline: f("下划线"),
  mark: f("标记", false, true),
  delete: f("删除线", false, true),
  code: f("行内代码", false, true),
  keyboard: f("键盘标记", false, true),
  muted: f("次要文案", false, true),
  copyable: f("可复制", false, true),
  editable: f("可编辑", false, true),
  ellipsis: f("过长省略", false, true),
  type: c(
    "语义",
    "default",
    ["default", "secondary", "success", "warning", "danger"],
    true,
  ),
};
function TypographyPreview({
  type,
  kind,
  ...props
}: {
  type: "default" | "secondary" | "success" | "warning" | "danger";
  kind: "text" | "title" | "paragraph" | "link" | "quote" | "code";
} & Omit<React.ComponentProps<typeof M.Typography.Text>, "type" | "ref">) {
  const tone = type === "default" ? undefined : type;
  const message = "为每个组件提供一个可以直接调整配置的交互示例。";
  return (
    <div style={{ inlineSize: "min(100%, 24rem)" }}>
      {kind === "title" ? (
        <M.Typography.Title {...props} type={tone} level={2}>
          组件交互示例
        </M.Typography.Title>
      ) : kind === "paragraph" ? (
        <M.Typography.Paragraph {...props} type={tone}>
          {message}
        </M.Typography.Paragraph>
      ) : kind === "link" ? (
        <M.Typography.Link
          href="#/components/Typography?section=Link"
          type={tone}
        >
          阅读组件文档
        </M.Typography.Link>
      ) : kind === "quote" ? (
        <M.Typography.Blockquote cite="mtone">
          {message}
        </M.Typography.Blockquote>
      ) : kind === "code" ? (
        <M.Typography.Code block language="ts">
          {"const label = '组件文档';"}
        </M.Typography.Code>
      ) : (
        <M.Typography.Text {...props} type={tone}>
          {message}
        </M.Typography.Text>
      )}
    </div>
  );
}
function ShortcutPreview({
  active,
  enabled,
  preventDefault,
  allowInInputs,
  keyName,
}: {
  active: boolean;
  enabled: boolean;
  preventDefault: boolean;
  allowInInputs: boolean;
  keyName: string;
}) {
  return (
    <M.ShortcutsProvider>
      <M.ShortcutScope active={active}>
        <ShortcutTarget
          enabled={enabled}
          preventDefault={preventDefault}
          allowInInputs={allowInInputs}
          keyName={keyName}
        />
      </M.ShortcutScope>
    </M.ShortcutsProvider>
  );
}
function ShortcutTarget({
  keyName,
  ...props
}: {
  keyName: string;
  enabled: boolean;
  preventDefault: boolean;
  allowInInputs: boolean;
}) {
  const [count, setCount] = useState(0);
  // The shortcut participates only while this particular preview has focus.
  const [focused, setFocused] = useState(false);
  M.useShortcut(keyName, () => setCount((n) => n + 1), {
    ...props,
    enabled: props.enabled && focused,
  });
  return (
    <div
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <p>
        聚焦示例输入框，按 <kbd>{keyName}</kbd>。
      </p>
      <M.Input aria-label="快捷键示例输入框" />
      <output aria-live="polite">已触发 {count} 次</output>
    </div>
  );
}
function Survey({
  required,
  showOther,
  showNotes,
  submitLabel,
}: {
  required: boolean;
  showOther: boolean;
  showNotes: boolean;
  submitLabel: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div style={{ maxWidth: 480 }}>
      <M.Questionnaire
        submitLabel={submitLabel}
        onSubmit={() => setSubmitted(true)}
        items={[
          {
            id: "topic",
            type: "single",
            title: "你想了解什么？",
            required,
            choices: [
              { value: "layout", label: "页面布局" },
              { value: "data", label: "数据展示" },
            ],
            other: showOther
              ? { label: "其他主题", placeholder: "输入主题" }
              : undefined,
          },
          ...(showNotes
            ? [{ id: "notes", type: "text" as const, title: "补充建议" }]
            : []),
        ]}
      />
      {submitted && <p role="status">示例已提交，未发送数据。</p>}
    </div>
  );
}
const providerSample = (
  <M.DatePicker label="选择日期" defaultValue="2026-11-18" clearable />
);
export const basicPlaygrounds = {
  Button: p(
    "Button",
    {
      variant: c("外观", "outline", [
        "blue",
        "solid",
        "outline",
        "soft",
        "ghost",
      ]),
      size: c("尺寸", "md", sizes),
      danger: f("危险操作"),
      disabled: f("禁用", false, true),
      loading: f("加载中", false, true),
      toggle: f("开关按钮", false, true),
      iconOnly: f("纯图标", false, true),
      arrow: { ...f("下拉箭头", false, true), disabled: (o) => !!o.iconOnly },
      leading: { ...f("左侧图标", false, true), disabled: (o) => !!o.iconOnly },
      label: t("按钮文字", "保存", true),
    },
    ({ label, arrow, leading, ...props }) => (
      <M.Button
        {...props}
        aria-label={props.iconOnly ? label || "保存" : undefined}
        preset={arrow && !props.iconOnly ? "dropdown" : undefined}
        leftSection={
          leading && !props.iconOnly ? <Save size={14} /> : undefined
        }
      >
        {props.iconOnly ? <Save size={14} /> : label}
      </M.Button>
    ),
  ),
  ButtonGroup: p(
    "ButtonGroup",
    {
      connected: f("连体", true),
      size: c("尺寸", "md", sizes),
      danger: f("危险操作", false, true),
      dropdown: f("分割菜单", false, true),
    },
    ({ danger, dropdown, ...props }) => (
      <M.ButtonGroup {...props}>
        <M.Button danger={danger}>{danger ? "删除" : "保存"}</M.Button>
        {dropdown ? (
          <M.Popover.Menu
            trigger={<M.Button preset="dropdown">更多</M.Button>}
            items={[{ key: "draft", label: "保存草稿" }]}
          />
        ) : (
          <M.Button>取消</M.Button>
        )}
      </M.ButtonGroup>
    ),
  ),
  Typography: p(
    "Typography",
    {
      kind: c("组件", "text", [
        ["text", "Text"],
        ["title", "Title"],
        ["paragraph", "Paragraph"],
        ["link", "Link"],
        ["quote", "Blockquote"],
        ["code", "Code"],
      ]),
      ...(Object.fromEntries(
        Object.entries(typographyFields).map(([key, field]) => [
          key,
          {
            ...field,
            when: (o: Record<string, unknown>) => {
              if (o.kind === "code" || o.kind === "quote") return false;
              return o.kind !== "link" || key === "type";
            },
          },
        ]),
      ) as typeof typographyFields),
    },
    (props) => <TypographyPreview {...props} />,
  ),
  HoverMarquee: p(
    "HoverMarquee",
    {
      mode: c("模式", "loop", [
        ["loop", "循环"],
        ["single", "滚到末尾停住"],
      ]),
      width: n("容器宽度（px）", 220, 110, 360, false, 10),
      label: t("标题", "跨平台界面组件设计与长标题展示的使用指南", true),
    },
    ({ width, label, ...props }) => (
      <div className="docs-playground-box" style={{ width, maxWidth: "100%" }}>
        <M.HoverMarquee {...props}>{label}</M.HoverMarquee>
      </div>
    ),
  ),
  SettingRow: p(
    "SettingRow",
    {
      type: c("控件", "switch", [
        ["switch", "开关"],
        ["input", "输入"],
        ["button", "按钮"],
      ]),
      description: f("说明", true),
      shortcut: f("快捷键", false, true),
      title: t("标题", "自动保存", true),
    },
    ({ type, description, shortcut, title }) => (
      <M.SettingRow.Group aria-label="预览设置组">
        <M.SettingRow
          title={title}
          description={description ? "定期保存未提交的草稿。" : undefined}
          shortcut={shortcut ? <kbd>⇧ F2</kbd> : undefined}
          control={(attrs) =>
            type === "switch" ? (
              <M.Switch {...attrs} defaultChecked />
            ) : type === "input" ? (
              <M.Input {...attrs} defaultValue="每 5 分钟" />
            ) : (
              <M.Button {...attrs}>配置</M.Button>
            )
          }
        />
      </M.SettingRow.Group>
    ),
  ),
  Questionnaire: p(
    "Questionnaire",
    {
      required: f("必答", true),
      showOther: f("其他选项", true),
      showNotes: f("补充输入", true),
      submitLabel: t("提交文案", "提交", true),
    },
    (props) => <Survey {...props} />,
  ),
  MtoneProvider: p(
    "MtoneProvider",
    {
      theme: c("外观", "light", ["light", "dark", "system"]),
      locale: c("语言", "zh", ["zh", "en"]),
      tokens: f("预览自定义圆角", false, true),
    },
    ({ tokens, ...props }) => (
      <M.MtoneProvider
        {...props}
        tokens={tokens ? { "--mt-radius": "16px" } : undefined}
      >
        <div
          className="docs-playground-box"
          style={{ background: "var(--mt-bg)", color: "var(--mt-fg)" }}
        >
          {providerSample}
        </div>
      </M.MtoneProvider>
    ),
  ),
  MtoneScope: p(
    "MtoneScope",
    {
      theme: c("局部外观", "dark", ["light", "dark", "system"]),
      withOverlay: f("浮层", true),
    },
    ({ withOverlay, ...props }) => (
      <M.MtoneScope {...props}>
        <div
          className="docs-playground-box"
          style={{ background: "var(--mt-bg)", color: "var(--mt-fg)" }}
        >
          {withOverlay ? (
            providerSample
          ) : (
            <M.Button>仅当前区域应用主题</M.Button>
          )}
        </div>
      </M.MtoneScope>
    ),
  ),
  ShortcutsProvider: p(
    "ShortcutsProvider",
    {
      active: f("作用域启用", true),
      enabled: f("快捷键启用", true),
      keyName: c("组合键", "Shift+F2", ["Shift+F2", "Shift+F3"]),
      allowInInputs: f("输入时触发", true, true),
      preventDefault: f("阻止默认", true, true),
    },
    (props) => <ShortcutPreview {...props} />,
  ),
  BlockEditor: p(
    "BlockEditor",
    {
      readOnly: f("只读"),
      borderless: f("无边框"),
      fillHeight: f("填满容器", false, true),
      locale: c("语言", "zh", ["zh", "en"], true),
    },
    (props) => (
      <div style={props.fillHeight ? { height: 315 } : undefined}>
        <Suspense fallback={<p role="status">正在加载编辑器…</p>}>
          <EditableBlocks {...props} />
        </Suspense>
      </div>
    ),
  ),
};
