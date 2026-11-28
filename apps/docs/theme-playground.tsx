import React from "react";
import {
  Button, Input, MtoneScope, NavGroup, NavItem, Select, Switch,
  mtoneAzureTheme, mtoneOriginalTheme, type MtoneTheme, type MtoneThemePreset,
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

const presets = [
  [mtoneAzureTheme, "澄蓝（Azure，默认）"],
  [mtoneOriginalTheme, "原调（Original）"],
  [meadow, "苔绿（自定义示例）"],
] as const;

const modes = [
  ["light", "浅色"],
  ["dark", "深色"],
  ["system", "跟随系统"],
] as const;

export function ThemePlayground() {
  const [preset, setPreset] = React.useState(mtoneAzureTheme);
  const [mode, setMode] = React.useState<MtoneTheme>("light");
  const [active, setActive] = React.useState("docs");
  return (
    <section aria-labelledby="theme-playground-heading">
      <h2 id="theme-playground-heading">主题演示</h2>
      <div className="theme-samples">
        <div className="theme-sample" role="group" aria-label="主题方案">
          {presets.map(([option, label]) => (
            <Button key={option.id} aria-pressed={preset === option}
              variant={preset === option ? "solid" : "outline"} onClick={() => setPreset(option)}>
              {label}
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
          <div className="theme-playground-actions" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <Switch label="显示快捷入口" defaultChecked />
            <Button toggle defaultPressed>固定视图</Button>
            <Button variant="solid">保存</Button>
          </div>
        </div>
      </MtoneScope>
      <p>「澄蓝」是内置默认主题：浅色模式用浅蓝选中背景和深蓝文字，开关及切换按钮开启时用深蓝。仍可选「原调」保留原来的配色。「苔绿」只用于演示自定义配色。</p>
      <CodeBlock code={`import { MtoneProvider, mtoneOriginalTheme, type MtoneThemePreset } from "@bixlab/mtone";

// 不指定 themePreset 时使用澄蓝（mtoneAzureTheme）。
// 如需保留原来的配色，设置 themePreset={mtoneOriginalTheme}。
const meadow: MtoneThemePreset = ${JSON.stringify(meadow, null, 2)};

<MtoneProvider themePreset={meadow} theme="system">
  <App />
</MtoneProvider>`} />
    </section>
  );
}
