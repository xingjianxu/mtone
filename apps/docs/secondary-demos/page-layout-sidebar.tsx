import { useState } from "react";
import {
  Breadcrumb,
  Button,
  NavGroup,
  NavItem,
  PageLayout,
  Select,
  Sidebar,
  Switch,
  Tabs,
  Tag,
  Topbar,
} from "../../../packages/mtone/src";

import { PlaygroundFrame } from "../playgrounds/toolbar-frame";

const headerSpanOptions = [
  ["full", "跨整页"],
  ["header", "页头跨整页，标签留在主栏"],
  ["main", "仅主栏"],
] as const;

const switches = [
  ["bordered", "边框布局"],
  ["topbar", "顶栏"],
  ["tabs", "标签页"],
  ["sidebar", "侧栏"],
  ["actions", "页头操作"],
  ["details", "页头详情"],
  ["resize", "拖拽调宽"],
] as const;

const defaults = {
  bordered: true,
  topbar: true,
  tabs: true,
  sidebar: true,
  actions: true,
  details: true,
  resize: false,
};
const wrap = {
  display: "flex",
  alignItems: "center",
  gap: "8px 12px",
  flexWrap: "wrap",
} as const;
const tabItems = [
  {
    value: "files",
    label: "文件",
    content: "项目需求说明、原型文件和会议纪要",
  },
  {
    value: "history",
    label: "交付记录",
    content: "最近交付：项目需求说明（第 2 版）",
  },
];

export default function Demo() {
  const [visible, setVisible] = useState(defaults);
  const [position, setPosition] = useState<"left" | "right">("left");
  const [span, setSpan] =
    useState<(typeof headerSpanOptions)[number][0]>("header");
  const [width, setWidth] = useState<"full" | "sm" | "md">("md");
  const [tab, setTab] = useState("files");
  const [reviewed, setReviewed] = useState(false);
  function reset() {
    setVisible(defaults);
    setPosition("left");
    setSpan("header");
    setWidth("md");
    setTab("files");
    setReviewed(false);
  }

  const renderSwitches = (items: (typeof switches)[number][]) =>
    items.map(([key, label]) => (
      <Switch
        key={key}
        label={label}
        checked={visible[key]}
        disabled={key === "resize" && !visible.sidebar}
        onCheckedChange={(checked) =>
          setVisible((current) => ({ ...current, [key]: checked }))
        }
      />
    ));
  return (
    <PlaygroundFrame
      name="PageLayout"
      onReset={reset}
      start={
        <>
          {renderSwitches(switches.slice(0, 5))}
          <Button
            disabled={!visible.sidebar}
            onClick={() => setPosition(position === "left" ? "right" : "left")}
          >
            侧栏：{position === "left" ? "左侧" : "右侧"}
          </Button>
          <div role="group" aria-label="页头跨度" style={wrap}>
            {headerSpanOptions.map(([value, label]) => (
              <Button
                key={value}
                variant={span === value ? "solid" : "outline"}
                disabled={!visible.sidebar}
                aria-pressed={span === value}
                onClick={() => setSpan(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </>
      }
      advanced={
        <>
          {renderSwitches(switches.slice(5))}
          <Select
            label="布局宽度"
            value={width}
            options={[
              { value: "full", label: "铺满可用宽度" },
              { value: "sm", label: "限宽 720px" },
              { value: "md", label: "限宽 960px" },
            ]}
            onValueChange={(next) => {
              if (next === "full" || next === "sm" || next === "md")
                setWidth(next);
            }}
          />
        </>
      }
    >
      <PageLayout
        headingLevel={3}
        bordered={visible.bordered}
        style={visible.bordered ? { minBlockSize: 400 } : undefined}
        maxWidth={width === "full" ? undefined : width}
        title="项目资料库"
        topbar={
          visible.topbar && (
            <Topbar
              as="div"
              breadcrumb={
                <Breadcrumb items={[{ label: "项目" }, { label: "资料库" }]} />
              }
              extra={
                reviewed ? (
                  <Tag tone="green">已审阅</Tag>
                ) : (
                  <Button size="small" onClick={() => setReviewed(true)}>
                    标记已审阅
                  </Button>
                )
              }
            />
          )
        }
        actions={visible.actions && <Button>新建资料</Button>}
        description={visible.details && "查看项目文件和交付记录。"}
        extra={visible.details && "本周更新"}
        tabs={
          visible.tabs && (
            <Tabs items={tabItems} value={tab} onValueChange={setTab} />
          )
        }
        sidebarPosition={position}
        headerSpan={span}
        sidebarResize={visible.resize}
        sidebar={
          visible.sidebar && (
            <Sidebar aria-label="资料分类">
              <NavGroup label="资料分类">
                <NavItem active>全部资料</NavItem>
                <NavItem>项目文档</NavItem>
                <NavItem>参考材料</NavItem>
              </NavGroup>
            </Sidebar>
          )
        }
      >
        <div
          style={{
            padding: 12,
            background: "var(--mt-subtle)",
            borderRadius: 4,
          }}
        >
          共 3 份资料，最近更新于本周。
        </div>
      </PageLayout>
    </PlaygroundFrame>
  );
}
