import { useState, type ReactNode } from "react";
import { AlertCircle, Bell, FileText, Info } from "lucide-react";
import * as M from "../../../packages/mtone/src";
import {
  alignments,
  choice as c,
  flag as f,
  number as n,
  playground as p,
  sides,
  text as t,
} from "./frame";

const menuItems: { key: string; label: string }[] = [
  { key: "open", label: "打开文档" },
  { key: "copy", label: "创建副本" },
  { key: "archive", label: "归档" },
];
const trigger = <M.Button>打开示例</M.Button>;
const body = <p>这里是示例内容。设置变化后，再与预览交互查看效果。</p>;
const notify = c("状态", "info", ["info", "success", "warning", "error"]);
const side = c("位置", "bottom", sides);
const align = c("对齐", "center", alignments);
const placements = [
  "top",
  "topLeft",
  "topRight",
  "bottom",
  "bottomLeft",
  "bottomRight",
  "left",
  "leftTop",
  "leftBottom",
  "right",
  "rightTop",
  "rightBottom",
] as const;
const popupWidth = n("宽度（0 为自动）", 0, 0, 280, true, 20);
const isDisabled = f("禁用", false, true);

function MenuPreview({
  groups,
  nested,
  icons,
}: {
  groups: boolean;
  nested: boolean;
  icons: boolean;
}) {
  const [selected, setSelected] = useState("");
  const entries = menuItems.map((item) => ({
    ...item,
    icon: icons ? <FileText size={14} /> : undefined,
  }));
  return (
    <div style={{ width: "min(100%, 16rem)" }}>
      <M.Menu
        label="菜单交互预览"
        items={[
          ...(groups
            ? [
                {
                  type: "group" as const,
                  key: "actions",
                  label: "常用操作",
                  children: entries.slice(0, 2),
                },
              ]
            : entries.slice(0, 2)),
          { type: "divider", key: "divider" },
          ...(nested
            ? [{ key: "more", label: "更多", children: entries.slice(2) }]
            : entries.slice(2)),
        ]}
        onSelect={setSelected}
      />
      <output>{selected ? `已选择：${selected}` : ""}</output>
    </div>
  );
}
function Feedback({
  children,
}: {
  children: (set: (text: string) => void) => ReactNode;
}) {
  const [msg, set] = useState("");
  return (
    <>
      {children(set)}
      <div aria-live="polite">{msg}</div>
    </>
  );
}
function AlertPreview({
  dismissible,
  icon,
  ...props
}: {
  tone: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  dismissible: boolean;
  icon: boolean;
}) {
  const [closed, set] = useState(false);
  return closed ? (
    <M.Button onClick={() => set(false)}>恢复提醒</M.Button>
  ) : (
    <M.Alert
      tone={props.tone}
      title={props.title}
      onClose={dismissible ? () => set(true) : undefined}
    >
      {icon && <Info size={13} />} {props.message}
    </M.Alert>
  );
}
function NoticePreview({
  icon,
  allowClose,
  simulate,
  title,
}: {
  icon: boolean;
  allowClose: boolean;
  simulate: "ready" | "loading" | "error";
  title: string;
}) {
  const [closed, set] = useState(false);
  if (closed)
    return <M.Button onClick={() => set(false)}>重新进入管理模式</M.Button>;
  return (
    <M.GlobalNotice
      title={title}
      icon={icon ? <Bell size={16} /> : false}
      loading={simulate === "loading"}
      error={simulate === "error" ? "退出未成功，请重试" : undefined}
      onAction={allowClose ? () => set(true) : undefined}
      actionLabel="退出管理员模式"
    >
      可临时管理共享文档。
    </M.GlobalNotice>
  );
}
function ToastAction({
  type,
  action,
}: {
  type: "success" | "error" | "info";
  action: boolean;
}) {
  const toast = M.useToast();
  return (
    <M.Button
      onClick={() =>
        toast.add({
          title: "项目文档",
          body: "已完成模拟操作。",
          type,
          actionProps: action ? { children: "知道了" } : undefined,
        })
      }
    >
      显示通知
    </M.Button>
  );
}
function PopoverPreview({
  withTitle,
  width,
  ...props
}: Pick<M.PopoverProps, "side" | "align" | "unstyled"> & {
  withTitle: boolean;
  width: number;
}) {
  return (
    <M.Popover
      {...props}
      width={width || undefined}
      title={withTitle ? "项目详情" : undefined}
      trigger={trigger}
      content={
        <M.Card variant="borderless" title={withTitle ? undefined : "项目详情"}>
          {body}
        </M.Card>
      }
    />
  );
}
const settings = [
  {
    value: "general",
    label: "常规",
    content: (
      <M.SettingRow
        id="playground-autosave"
        title="自动保存"
        control={(attrs) => <M.Switch {...attrs} defaultChecked />}
      />
    ),
  },
  {
    value: "notifications",
    label: "通知",
    content: (
      <M.SettingRow
        title="项目更新"
        control={(attrs) => <M.Switch {...attrs} />}
      />
    ),
  },
];
export const overlayPlaygrounds = {
  Dialog: p(
    "Dialog",
    {
      modal: f("仅显式关闭", true),
      title: t("标题", "编辑文档"),
      description: f("说明", true, true),
      footer: f("底部操作", true, true),
    },
    ({ description, footer, ...props }) => (
      <M.Dialog
        {...props}
        trigger={trigger}
        description={description ? "修改项目文档信息。" : undefined}
        footer={footer ? <M.Button>保存</M.Button> : undefined}
      >
        <M.Input aria-label="文档名称" defaultValue="项目文档" />
      </M.Dialog>
    ),
  ),
  Drawer: p(
    "Drawer",
    {
      placement: c("打开方向", "right", [
        ["right", "右侧"],
        ["left", "左侧"],
      ]),
      title: t("标题", "文档属性"),
      description: f("说明", true, true),
      footer: f("底部操作", false, true),
    },
    ({ description, footer, ...props }) => (
      <M.Drawer
        {...props}
        trigger={trigger}
        description={description ? "不离开当前页面即可查看属性。" : undefined}
        footer={footer ? <M.Button>保存</M.Button> : undefined}
      >
        {body}
      </M.Drawer>
    ),
  ),
  FloatingWindow: p(
    "FloatingWindow",
    {
      draggable: f("可移动", true),
      resizable: f("可缩放", true),
      minimizable: f("可最小化", true),
      width: n("初始宽度", 310, 220, 420, true, 10),
      height: n("初始高度", 220, 150, 360, true, 10),
      title: t("标题", "浮动预览", true),
    },
    ({ width, height, ...props }) => (
      <M.FloatingWindow
        {...props}
        trigger={trigger}
        initialSize={{ width, height }}
      >
        {body}
      </M.FloatingWindow>
    ),
    { remountOn: ["width", "height"] },
  ),
  ConfirmDialog: p(
    "ConfirmDialog",
    {
      danger: f("危险操作", true),
      title: t("标题", "删除草稿？"),
      confirmText: t("确认文字", "删除", true),
      cancelText: t("取消文字", "取消", true),
    },
    (props) => (
      <Feedback>
        {(set) => (
          <M.ConfirmDialog
            {...props}
            description="只影响此演示。"
            trigger={trigger}
            onConfirm={() => set("已确认（演示）")}
          />
        )}
      </Feedback>
    ),
  ),
  Popconfirm: p(
    "Popconfirm",
    {
      placement: c("位置", "top", placements),
      arrow: f("箭头", true),
      showCancel: f("取消按钮", true),
      disabled: isDisabled,
      autoAdjustOverflow: f("防止溢出", true, true),
      okText: t("确认文字", "确定", true),
      cancelText: t("取消文字", "取消", true),
    },
    (props) => (
      <Feedback>
        {(set) => (
          <M.Popconfirm
            {...props}
            trigger={trigger}
            title="归档当前文档？"
            description="你可以稍后恢复。"
            onConfirm={() => set("已归档（演示）")}
          />
        )}
      </Feedback>
    ),
  ),
  Popover: p(
    "Popover",
    {
      side,
      align,
      width: popupWidth,
      withTitle: f("标题", true),
      unstyled: f("自定义外观", false, true),
    },
    (props) => <PopoverPreview {...props} />,
  ),
  Tooltip: p(
    "Tooltip",
    {
      side,
      align,
      trigger: c("触发", "hover", ["hover", "focus", "click", "contextMenu"]),
      arrow: f("箭头", true, true),
      delay: n("打开延时（ms）", 100, 0, 1000, true, 50),
      closeDelay: n("关闭延时（ms）", 0, 0, 1000, true, 50),
      offset: n("间距", 8, 0, 20, true),
      avoidCollisions: f("自动避让", true, true),
      disabled: isDisabled,
      content: t("内容", "查看项目详情", true),
    },
    (props) => (
      <M.Tooltip {...props}>
        <M.Button variant="outline">查看详情</M.Button>
      </M.Tooltip>
    ),
  ),
  HoverCard: p(
    "HoverCard",
    {
      side,
      align,
      withArrow: f("箭头", true),
      openDelay: n("打开延时（ms）", 200, 0, 1000, true, 50),
      closeDelay: n("关闭延时（ms）", 150, 0, 1000, true, 50),
      width: popupWidth,
      disabled: isDisabled,
    },
    ({ width, ...props }) => (
      <M.HoverCard
        {...props}
        width={width || undefined}
        trigger={<M.Button variant="outline">悬停看资料</M.Button>}
        title="项目介绍"
        content={body}
      />
    ),
  ),
  Menu: p(
    "Menu",
    {
      groups: f("分组", true),
      nested: f("子菜单", true),
      icons: f("图标", true),
    },
    (props) => <MenuPreview {...props} />,
  ),
  ContextMenu: p(
    "ContextMenu",
    {
      width: popupWidth,
      nested: f("子菜单", true),
      description: t("触发区域", "在此右键"),
    },
    ({ width, nested, description }) => (
      <Feedback>
        {(set) => (
          <M.ContextMenu
            width={width || undefined}
            items={
              nested
                ? [
                    ...menuItems,
                    {
                      key: "extra",
                      label: "更多",
                      children: [{ key: "link", label: "复制链接" }],
                    },
                  ]
                : menuItems
            }
            onSelect={set}
          >
            <div className="docs-playground-box" style={{ padding: 18 }}>
              {description}
            </div>
          </M.ContextMenu>
        )}
      </Feedback>
    ),
  ),
  Menubar: p(
    "Menubar",
    {
      trigger: c("打开方式", "click", ["click", "hover"]),
      loop: f("循环导航", true),
      disabled: isDisabled,
      width: popupWidth,
      align: c("对齐", "start", ["start", "end"], true),
    },
    ({ width, ...props }) => (
      <Feedback>
        {(set) => (
          <M.Menubar
            {...props}
            width={width || undefined}
            menus={[
              { key: "file", label: "文件", items: menuItems },
              {
                key: "edit",
                label: "编辑",
                items: [{ key: "undo", label: "撤销" }],
              },
            ]}
            onSelect={set}
          />
        )}
      </Feedback>
    ),
  ),
  Spotlight: p(
    "Spotlight",
    {
      limit: n("显示条数", 4, 1, 6),
      closeOnSelect: f("选择后关闭", true),
      resetQueryOnClose: f("关闭后清空搜索", true, true),
      title: t("标题", "查找操作", true),
      placeholder: t("占位文本", "输入关键字", true),
    },
    (props) => (
      <Feedback>
        {(set) => (
          <M.Spotlight
            {...props}
            trigger={trigger}
            shortcut={false}
            actions={[
              ...menuItems,
              { key: "help", label: "帮助" },
              { key: "save", label: "保存文档" },
            ].map((item) => ({
              id: String(item.key),
              label: item.label,
              onSelect: () => set(String(item.label)),
            }))}
          />
        )}
      </Feedback>
    ),
  ),
  SettingsDialog: p(
    "SettingsDialog",
    {
      searchEnabled: f("搜索", true),
      modal: f("仅显式关闭", true),
      title: t("标题", "工作区设置", true),
    },
    ({ searchEnabled, ...props }) => (
      <M.SettingsDialog
        {...props}
        trigger={trigger}
        categories={settings}
        searchIndex={
          searchEnabled
            ? [
                {
                  category: "general",
                  id: "playground-autosave",
                  label: "自动保存",
                },
              ]
            : undefined
        }
        categoriesLabel="设置导航"
      />
    ),
  ),
  Alert: p(
    "Alert",
    {
      tone: notify,
      dismissible: f("可关闭", true),
      icon: f("信息图标", false, true),
      title: t("标题", "项目提醒"),
      message: t("正文", "文档将在下午同步。", true),
    },
    (props) => <AlertPreview {...props} />,
  ),
  GlobalNotice: p(
    "GlobalNotice",
    {
      icon: f("图标", true),
      allowClose: f("退出操作", true),
      simulate: c("状态", "ready", [
        ["ready", "正常"],
        ["loading", "处理中"],
        ["error", "失败"],
      ]),
      title: t("标题", "正在使用管理员模式", true),
    },
    (props) => <NoticePreview {...props} />,
  ),
  Empty: p(
    "Empty",
    {
      title: t("标题", "暂无资料"),
      description: t("说明", "上传第一份项目文档。", true),
      action: f("操作按钮", true),
    },
    ({ action, ...props }) => (
      <Feedback>
        {(set) => (
          <M.Empty
            {...props}
            action={
              action ? (
                <M.Button onClick={() => set("已触发创建操作（演示）")}>
                  新建
                </M.Button>
              ) : undefined
            }
          />
        )}
      </Feedback>
    ),
  ),
  Skeleton: p(
    "Skeleton",
    {
      lines: n("占位行数", 3, 1, 6),
      width: n("宽度（%）", 75, 20, 100),
      animated: f("显示加载占位", true),
    },
    ({ lines, width, animated }) => (
      <div aria-label="内容占位预览" style={{ display: "grid", gap: 8 }}>
        {animated
          ? Array.from({ length: lines }, (_, i) => (
              <M.Skeleton
                key={i}
                style={{ width: `${Math.max(16, width - i * 5)}%`, height: 14 }}
              />
            ))
          : body}
      </div>
    ),
  ),
  Spinner: p(
    "Spinner",
    { visible: f("显示", true), label: t("读屏标签", "加载项目中") },
    ({ visible, label }) =>
      visible ? <M.Spinner label={label} /> : <M.Text muted>加载已完成</M.Text>,
  ),
  LoadingOverlay: p(
    "LoadingOverlay",
    {
      visible: f("显示遮罩", true),
      opacity: n("不透明度", 0.65, 0, 1, false, 0.05),
      blur: n("模糊", 0, 0, 10, true),
      radius: n("圆角", 6, 0, 24, true),
      label: t("读屏标签", "载入项目", true),
      custom: f("自定义加载内容", false, true),
    },
    ({ custom, ...props }) => (
      <div
        className="docs-playground-box"
        style={{ position: "relative", minHeight: 118 }}
      >
        <M.LoadingOverlay
          {...props}
          loader={custom ? <M.Text>正在更新…</M.Text> : undefined}
        />
        {body}
        <M.Button>保存更改</M.Button>
      </div>
    ),
  ),
  Result: p(
    "Result",
    {
      status: c("状态", "success", [
        "success",
        "error",
        "info",
        "warning",
        "403",
        "404",
        "500",
      ]),
      actions: f("操作按钮", true),
      title: t("标题", "操作结果", true),
      subTitle: t("说明", "此示例可切换不同结果。", true),
      custom: f("自定义图标", false, true),
    },
    ({ actions, custom, ...props }) => (
      <Feedback>
        {(set) => (
          <M.Result
            {...props}
            icon={custom ? <AlertCircle size={36} /> : undefined}
            extra={
              actions ? (
                <M.Button onClick={() => set("已继续（演示）")}>继续</M.Button>
              ) : undefined
            }
          />
        )}
      </Feedback>
    ),
  ),
  ToastProvider: p(
    "ToastProvider",
    {
      position: c("位置", "top-right", [
        "top-right",
        "bottom-right",
        "top-left",
        "bottom-left",
        "top-center",
        "bottom-center",
        "center",
        "center-top",
      ]),
      type: c("类型", "success", ["success", "error", "info"]),
      timeout: n("时长（ms）", 3500, 800, 8000, true, 200),
      limit: n("同时显示条数", 3, 1, 5, true),
      action: f("带操作按钮", false, true),
    },
    ({ type, action, ...props }) => (
      <M.ToastProvider {...props}>
        <ToastAction type={type} action={action} />
      </M.ToastProvider>
    ),
  ),
};
