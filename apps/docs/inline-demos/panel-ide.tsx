import React from "react";
import { CircleAlert, List, Terminal, Trash2 } from "lucide-react";
import { Button, ButtonGroup, Input, Panel, Splitter, type TabsSize } from "../../../packages/mtone/src";

const placements = [
  { value: "top", label: "顶部" },
  { value: "bottom", label: "底部" },
  { value: "left", label: "左侧" },
  { value: "right", label: "右侧" },
] as const;
type Placement = (typeof placements)[number]["value"];
const tabSizes = ["sm", "md", "lg"] as const;

// Paint the editor-facing edge without affecting the separator's hit area.
const editorSeam = `
  .panel-ide-splitter[data-dock="top"] > .mt-splitter-separator {
    box-shadow: inset 0 -1px var(--mt-border);
  }
  .panel-ide-splitter[data-dock="bottom"] > .mt-splitter-separator {
    box-shadow: inset 0 1px var(--mt-border);
  }
  .panel-ide-splitter[data-dock="left"] > .mt-splitter-separator {
    box-shadow: inset -1px 0 var(--mt-border);
  }
  .panel-ide-splitter[data-dock="right"] > .mt-splitter-separator {
    box-shadow: inset 1px 0 var(--mt-border);
  }
`;

export default function Demo() {
  const [dock, setDock] = React.useState<Placement>("bottom");
  const [tabPlacement, setTabPlacement] = React.useState<Placement>("top");
  const [size, setSize] = React.useState<TabsSize>("md");
  const [collapsed, setCollapsed] = React.useState(false);
  const ignoreResizeUntilNextInteraction = React.useRef(false);
  const changeCollapsed = (next: boolean) => {
    // Double-click follows two pointer sessions. Their trailing resize callbacks
    // must not save a size produced by changing the collapse constraints.
    ignoreResizeUntilNextInteraction.current = true;
    setCollapsed(next);
  };
  const toggleCollapsed = () => changeCollapsed(!collapsed);
  const [tab, setTab] = React.useState("terminal");
  const [log, setLog] = React.useState("VITE ready");
  const [terminal, setTerminal] = React.useState("");
  const [remembered, setRemembered] = React.useState<Partial<Record<Placement, number>>>({});
  const [available, setAvailable] = React.useState(0);
  const frame = React.useRef<HTMLDivElement>(null);
  const vertical = dock === "top" || dock === "bottom";
  const first = dock === "top" || dock === "left";
  // The Splitter owns the outer extent. Reserve only what its pinned rail needs.
  const sideRail = tabPlacement === "left" || tabPlacement === "right";
  const headerSize = vertical
    ? (sideRail ? 132 : size === "lg" ? (tabPlacement === "top" ? 38 : 37) : 34)
    : (sideRail ? 44 : 144);
  const expandedMinSize = vertical ? Math.max(80, headerSize) : 144;
  const defaultSize = vertical ? 142 : 224;

  React.useLayoutEffect(() => {
    const frameElement = frame.current;
    if (!frameElement) return;
    const measure = () => {
      const separator = frameElement.querySelector<HTMLElement>("[data-separator]");
      const total = vertical ? frameElement.clientHeight : frameElement.clientWidth;
      const edge = vertical ? separator?.offsetHeight : separator?.offsetWidth;
      setAvailable(Math.max(0, total - (edge ?? 0)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frameElement);
    return () => observer.disconnect();
  }, [dock, vertical]);

  const desired = collapsed ? headerSize : remembered[dock] ?? defaultSize;
  const paneSize = collapsed
    ? headerSize
    : Math.min(Math.max(expandedMinSize, desired), Math.max(expandedMinSize, available - 64));
  const sizes = available > headerSize ? [paneSize, available - paneSize] : undefined;
  if (sizes && !first) sizes.reverse();

  const workbench = <Splitter.Panel key="workbench" id="panel-demo-workbench"
    label="工作面板" min={headerSize} defaultSize={defaultSize}>
    <Panel label="工作区标签" collapsed={collapsed} onCollapsedChange={changeCollapsed}
      value={tab} onValueChange={setTab} tabPlacement={tabPlacement} size={size}
      actions={<Button iconOnly size="sm" variant="ghost" aria-label="清空终端记录" onClick={() => setLog("")}><Trash2 size={14} /></Button>}
      items={[
        { value: "problems", label: "问题", icon: <CircleAlert />, content: "没有发现问题。" },
        { value: "output", label: "输出", icon: <List />, content: <code>编译完成</code> },
        { value: "terminal", label: "终端", icon: <Terminal />, content: <>
          {log && <pre style={{ margin: "0 0 8px" }}>{log}</pre>}
          <Input aria-label="输入命令" placeholder="输入命令" value={terminal} onChange={event => setTerminal(event.target.value)} />
        </> },
      ]}
    />
  </Splitter.Panel>;
  const editor = <Splitter.Panel key="editor" id="panel-demo-editor" label="代码编辑器" defaultSize="60%">
    <div style={{ padding: 10, whiteSpace: "nowrap", overflow: "hidden", borderBottom: "1px solid var(--mt-border)" }}>index.ts</div>
    <pre style={{ margin: 0, padding: 10, overflow: "auto" }}>
      <span style={{ color: "var(--mt-accent-blue)" }}>const</span>{" name = 'mtone';\nconsole.log(name);"}
    </pre>
  </Splitter.Panel>;
  return <div style={{ display: "grid", gap: 10, width: "100%", minWidth: 0 }}>
    <style>{editorSeam}</style>
    <div style={{ display: "flex", alignItems: "center", gap: "8px 14px", flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span aria-hidden="true">停靠</span>
        <ButtonGroup connected aria-label="停靠位置">
          {placements.map(({ value, label }) => <Button key={value} size="sm" toggle
            pressed={dock === value} onClick={() => setDock(value)}>{label}</Button>)}
        </ButtonGroup>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span aria-hidden="true">标签栏</span>
        <ButtonGroup connected aria-label="标签位置">
          {placements.map(({ value, label }) => <Button key={value} size="sm" toggle
            pressed={tabPlacement === value} onClick={() => setTabPlacement(value)}>{label}</Button>)}
        </ButtonGroup>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span aria-hidden="true">高度</span>
        <ButtonGroup connected aria-label="标签高度">
          {tabSizes.map(value => <Button key={value} size="sm" toggle
            pressed={size === value} onClick={() => setSize(value)}>{value}</Button>)}
        </ButtonGroup>
      </div>
    </div>
    <div ref={frame} style={{ height: 320, minWidth: 0, border: "1px solid var(--mt-border)", borderRadius: 6, overflow: "hidden" }}>
      <Splitter
        key={dock}
        className="panel-ide-splitter"
        data-dock={dock}
        orientation={vertical ? "vertical" : "horizontal"}
        sizes={sizes}
        onDraggerDoubleClick={toggleCollapsed}
        onKeyDownCapture={(event) => {
          const target = event.target as HTMLElement;
          if (event.defaultPrevented || event.key !== "Enter"
            || target.parentElement !== event.currentTarget || !target.hasAttribute("data-separator")) return;
          event.preventDefault();
          if (!event.repeat) toggleCollapsed();
        }}
        style={{ width: "100%", height: "100%" }}
        onResizeStart={() => { ignoreResizeUntilNextInteraction.current = false; }}
        onResize={(next) => {
          if (ignoreResizeUntilNextInteraction.current) return;
          const resized = next[first ? 0 : 1];
          // Keep native constraints stable across disclosure changes so that
          // controlled writes cannot use the previous collapsed bounds.
          if (collapsed && resized <= headerSize + 1) return;
          setRemembered(previous => ({ ...previous, [dock]: Math.max(expandedMinSize, resized) }));
          if (collapsed) setCollapsed(false);
        }}
      >
        {first ? [workbench, editor] : [editor, workbench]}
      </Splitter>
    </div>
  </div>;
}
