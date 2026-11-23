import React from "react";
import { FileSearch, PanelLeft, Terminal } from "lucide-react";
import { Button, ButtonGroup, Input, Panel, type PanelProps } from "../../../packages/mtone/src";

const positions = [
  { value: "top", label: "标签在顶部" },
  { value: "bottom", label: "标签在底部" },
  { value: "left", label: "标签在左侧" },
  { value: "right", label: "标签在右侧" },
] as const;
type Placement = NonNullable<PanelProps["tabPlacement"]>;

export default function Demo() {
  const [placement, setPlacement] = React.useState<Placement>("top");
  const [message, setMessage] = React.useState("工作区就绪");
  return <div style={{ display: "grid", gap: 10, width: "100%", minWidth: 0 }}>
    <ButtonGroup aria-label="标签位置" style={{ flexWrap: "wrap" }}>
      {positions.map(({ value, label }) =>
        <Button key={value} size="sm" toggle pressed={placement === value} onClick={() => setPlacement(value)}>
          {label}
        </Button>,
      )}
    </ButtonGroup>
    <div style={{ height: 212, minWidth: 0, border: "1px solid var(--mt-border)", borderRadius: 6, overflow: "hidden" }}>
      <Panel
        label="面板标签"
        tabPlacement={placement}
        defaultValue="files"
        actions={<Button iconOnly size="sm" variant="ghost" aria-label="工作区信息"
          onClick={() => setMessage("已打开工作区信息")}><PanelLeft size={15} /></Button>}
        items={[
          { value: "files", label: "文件", icon: <FileSearch />, content: <p style={{ margin: 0 }}>src/index.ts</p> },
          { value: "terminal", label: "终端", icon: <Terminal />, content: <Input aria-label="面板命令" placeholder="输入命令" /> },
        ]}
      />
    </div>
    <output>{message}</output>
  </div>;
}
