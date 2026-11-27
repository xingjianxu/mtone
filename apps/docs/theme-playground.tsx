import React from "react";
import {
  Button, Input, MtoneScope, NavGroup, NavItem, Select,
  mtoneOriginalTheme, type MtoneTheme, type MtoneThemePreset,
} from "../../packages/mtone/src";
import { CodeBlock } from "./code-block";

const meadow: MtoneThemePreset = {
  id: "meadow",
  name: "苔绿",
  tokens: {
    "--mt-height": "36px",
    "--mt-radius": "8px",
    "--mt-option-row-gap": "6px",
  },
  light: {
    "--mt-bg": "#fafcf9",
    "--mt-primary": "#315d48",
    "--mt-solid-hover": "#244a39",
    "--mt-focus": "#518665",
    "--mt-nav-hover": "#edf4ee",
    "--mt-nav-selected": "#dcece0",
    "--mt-nav-current-text": "#254a38",
    "--mt-nav-current-indicator": "#3c7655",
  },
  dark: {
    "--mt-bg": "#202824",
    "--mt-primary": "#afdabb",
    "--mt-solid-hover": "#c2e7cd",
    "--mt-focus": "#9dccaa",
    "--mt-nav-hover": "#283a31",
    "--mt-nav-selected": "#31463a",
    "--mt-nav-current-text": "#d6f0de",
    "--mt-nav-current-indicator": "#a1d1b0",
  },
};

const modes = [
  ["light", "浅色"],
  ["dark", "深色"],
  ["system", "跟随系统"],
] as const;

export function ThemePlayground() {
  const [preset, setPreset] = React.useState(mtoneOriginalTheme);
  const [mode, setMode] = React.useState<MtoneTheme>("light");
  const [active, setActive] = React.useState("docs");
  return (
    <section aria-labelledby="theme-playground-heading">
      <h2 id="theme-playground-heading">主题演示</h2>
      <div className="theme-samples">
        <div className="theme-sample" role="group" aria-label="主题方案">
          {[mtoneOriginalTheme, meadow].map((option) => (
            <Button key={option.id} aria-pressed={preset === option}
              variant={preset === option ? "solid" : "outline"} onClick={() => setPreset(option)}>
              {option === mtoneOriginalTheme ? "原调（Original）" : "苔绿（自定义示例）"}
            </Button>
          ))}
        </div>
        <div className="theme-sample" role="group" aria-label="预览模式">
          {modes.map(([value, label]) => (
            <Button key={value} aria-pressed={mode === value}
              variant={mode === value ? "solid" : "outline"} onClick={() => setMode(value)}>
              {label}
            </Button>
          ))}
        </div>
      </div>
      <MtoneScope role="region" aria-label="主题预览" theme={mode} themePreset={preset} className="theme-sample">
        <div style={{ display: "grid", gap: 10, inlineSize: "100%", maxInlineSize: 420 }}>
          <NavGroup label="工作区">
            <NavItem active={active === "docs"} onClick={() => setActive("docs")}>文档</NavItem>
            <NavItem active={active === "starred"} onClick={() => setActive("starred")}>收藏</NavItem>
          </NavGroup>
          <Input aria-label="名称" placeholder="输入名称" />
          <Select label="范围" placeholder="请选择" options={[{ value: "all", label: "所有文档" }, { value: "starred", label: "仅收藏" }]} />
          <div><Button variant="solid">保存</Button></div>
        </div>
      </MtoneScope>
      <p>「原调」是内置默认主题。苔绿只用来演示自定义，不改变文档站的全局主题。</p>
      <CodeBlock code={`import { MtoneProvider, type MtoneThemePreset } from "@bixlab/mtone";

const meadow: MtoneThemePreset = ${JSON.stringify(meadow, null, 2)};

<MtoneProvider themePreset={meadow} theme="system">
  <App />
</MtoneProvider>`} />
    </section>
  );
}
