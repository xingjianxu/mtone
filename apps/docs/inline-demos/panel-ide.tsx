import React from "react";
import { Trash2 } from "lucide-react";
import { Button, ButtonGroup, Input, Panel, Splitter } from "../../../packages/mtone/src";

const placements = [
  { value: "top", label: "顶部" },
  { value: "bottom", label: "底部" },
  { value: "left", label: "左侧" },
  { value: "right", label: "右侧" },
] as const;
type Dock = (typeof placements)[number]["value"];

export default function Demo() {
  const [dock, setDock] = React.useState<Dock>("bottom");
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
  const [remembered, setRemembered] = React.useState<Partial<Record<Dock, number>>>({});
  const [available, setAvailable] = React.useState(0);
  const frame = React.useRef<HTMLDivElement>(null);
  const vertical = dock === "top" || dock === "bottom";
  const first = dock === "top" || dock === "left";
  const headerSize = vertical ? 34 : 144;
  const expandedMinSize = vertical ? 80 : headerSize;
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
      value={tab} onValueChange={setTab}
      actions={<Button iconOnly size="sm" variant="ghost" aria-label="清空终端记录" onClick={() => setLog("")}><Trash2 size={14} /></Button>}
      items={[
        { value: "problems", label: "问题", content: "没有发现问题。" },
        { value: "output", label: "输出", content: <code>编译完成</code> },
        { value: "terminal", label: "终端", content: <>
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
    <ButtonGroup connected aria-label="停靠位置">
      {placements.map(({ value, label }) => <Button key={value} size="sm" toggle
        pressed={dock === value} onClick={() => setDock(value)}>{label}</Button>)}
    </ButtonGroup>
    <div ref={frame} style={{ height: 320, minWidth: 0, border: "1px solid var(--mt-border)", borderRadius: 6, overflow: "hidden" }}>
      <Splitter
        key={dock}
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
