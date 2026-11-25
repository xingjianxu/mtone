import React from "react";
import { Button, MtoneProvider, type MtoneAccent } from "../../packages/mtone/src";
import { CodeBlock } from "./code-block";

export const colorPresetsHref = "#/theme/color-presets";
export const colorPresetsHeading = "color-presets-title";

const presetLabels: Record<MtoneAccent, string> = {
  neutral: "中性色",
  blue: "蓝色",
  green: "绿色",
  orange: "橙色",
  red: "红色",
  purple: "紫色",
  teal: "青色",
  coral: "珊瑚色",
};

// Some role-specific variables are optional overrides. Match the component
// paint expressions so the samples also show their effective defaults.
const semanticColors = [
  ["键盘焦点", "--mt-focus"],
  ["信息提示底色", "--mt-alert-info-bg"],
  ["警告提示底色", "--mt-alert-warning-bg"],
  ["侧栏当前项标记", "--mt-nav-current-indicator", "var(--mt-blue, #2383e2)"],
  ["日历当天文字", "--mt-calendar-today-ink", "var(--mt-blue, #2383e2)"],
  ["拖放目标边缘", "--mt-drop-target-edge", "var(--mt-indicator, #5378aa)"],
  ["通知默认图标", "--mt-toast-default-icon-ink", "var(--mt-indicator, #5378aa)"],
  ["强调操作底色（Button 的 blue 变体）", "--mt-action-emphasis-bg", "#2783de"],
] as const;

function SemanticSwatch({ paint }: { paint: string }) {
  const chip = React.useRef<HTMLSpanElement>(null);
  const [value, setValue] = React.useState("");
  React.useLayoutEffect(() => {
    if (!chip.current) return;
    const color = getComputedStyle(chip.current).backgroundColor;
    const rgb = /^rgb\((\d+), (\d+), (\d+)\)$/.exec(color);
    setValue(
      rgb
        ? `#${rgb.slice(1).map((channel) => Number(channel).toString(16).padStart(2, "0")).join("").toUpperCase()}`
        : color,
    );
  }, [paint]);

  return (
    <span className="semantic-swatch">
      <span ref={chip} aria-hidden="true" style={{ backgroundColor: paint }} />
      <code>{value}</code>
    </span>
  );
}

const accentDotStyle = {
  display: "inline-block",
  inlineSize: 8,
  blockSize: 8,
  borderRadius: "50%",
  marginInlineEnd: 8,
  backgroundColor: "var(--mt-accent-green)",
};

const override = { "--mt-accent-green": "#528a72" };
const accentExample = `function AccentMark({ label }: { label: string }) {
  return (
    <span>
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          inlineSize: 8,
          blockSize: 8,
          borderRadius: "50%",
          marginInlineEnd: 8,
          backgroundColor: "var(--mt-accent-green)",
        }}
      />
      {label}
    </span>
  );
}

<AccentMark label="绿色点缀" />`;

function AccentMark({ label }: { label: string }) {
  return <span><span aria-hidden="true" style={accentDotStyle} />{label}</span>;
}

export function ColorPresets() {
  return (
    <>
      <div className="eyebrow">THEME COLOR PRESETS</div>
      <h1 id={colorPresetsHeading} tabIndex={-1}>颜色预设</h1>
      <p className="lead">
        这里分为两层：需要让使用者选颜色时，使用共享色板；组件的选中、焦点、提示和操作状态按实际用途引用语义颜色。用顶部的主题开关比较浅色和深色。
      </p>

      <section aria-labelledby="accent-palette-heading">
        <h2 id="accent-palette-heading">按颜色命名的共享色板</h2>
        <p>适用于 Tabs 指示线等可主动选色的场景。公开的色板名保持不变。</p>
        <ul className="accent-palette" role="list" aria-label="共享颜色预设">
          {Object.entries(presetLabels).map(([name, label]) => {
            const token = `--mt-accent-${name}`;
            return (
              <li key={name}>
                <span className="accent-palette-swatch" aria-hidden="true" style={{ backgroundColor: `var(${token})` }} />
                <strong>{label}</strong>
                <code>{token}</code>
              </li>
            );
          })}
        </ul>
        <p>珊瑚色浅色为 <code>#D1634B</code>，深色为 <code>#FD8C73</code>。适合指示线等装饰；若用作文字颜色，请另行检查对比度。</p>
      </section>

      <section aria-labelledby="selection-surfaces-heading">
        <h2 id="selection-surfaces-heading">语义颜色</h2>
        <p>根据用途而非颜色值使用这些变量。数字相同不代表用途相同：换选中背景，不应该连带改掉键盘焦点或信息提示。</p>
        <div className="props-scroll">
          <table className="props-table" aria-label="常用语义颜色">
            <thead>
              <tr>
                <th scope="col">用途</th><th scope="col">变量</th>
                <th scope="col">浅色</th><th scope="col">深色</th>
              </tr>
            </thead>
            <tbody>
              {semanticColors.map(([label, token, fallback]) => {
                const paint = fallback ? `var(${token}, ${fallback})` : `var(${token})`;
                return (
                  <tr key={token}>
                    <td>{label}</td><td><code>{token}</code></td>
                    {(["light", "dark"] as const).map((theme) => (
                      <td key={theme}>
                        <MtoneProvider theme={theme}>
                          <SemanticSwatch paint={paint} />
                        </MtoneProvider>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <h3>浅蓝选中背景</h3>
        <p>
          使用 <code>--mt-select-surface</code> 表示浅蓝选中状态或定位到的设置项。
          它不同于蓝色指示线、键盘焦点边框和信息提示色。
        </p>
        <ul className="accent-palette" role="list">
          {(["light", "dark"] as const).map((theme) => (
            <li key={theme}>
              <MtoneProvider theme={theme}>
                <div className="accent-palette-swatch" aria-hidden="true" style={{ backgroundColor: "var(--mt-select-surface)" }} />
              </MtoneProvider>
              <strong>{theme === "light" ? "浅色主题" : "深色主题"}</strong>
              <code>{theme === "light" ? "#E9EEF4" : "#293746"}</code>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>在自己的界面中复用</h2>
        <p>
          导入 <code>@bixlab/mtone/styles.css</code> 后，在 CSS 或内联样式中写 <code>var(--mt-accent-green)</code> 即可。
          例如用它绘制绿色点缀。若要表达成功状态，应使用相应的语义颜色，并保留文字。
        </p>
        <div className="theme-sample"><AccentMark label="绿色点缀" /></div>
        <CodeBlock code={accentExample} />
      </section>

      <section>
        <h2>仅覆盖某个 Provider 的预设色</h2>
        <p>
          在 <code>MtoneProvider</code> 的 <code>tokens</code> 中覆盖同名变量。覆盖只应用于该作用域，不改变外部色板。
          自定义值不会随浅色和深色自动换色；需要两套颜色时，请为不同主题分别提供值，并检查对比度。
        </p>
        <div className="theme-samples">
          <div className="theme-sample"><AccentMark label="默认绿色" /></div>
          <MtoneProvider tokens={override}>
            <div className="theme-sample"><AccentMark label="局部覆盖" /></div>
          </MtoneProvider>
        </div>
        <CodeBlock code={`import { MtoneProvider } from "@bixlab/mtone";

// 复用上面的 AccentMark
<MtoneProvider tokens={{ "--mt-accent-green": "${override["--mt-accent-green"]}" }}>
  <AccentMark label="局部覆盖" />
</MtoneProvider>`} />
      </section>

      <section aria-labelledby="role-overrides-heading">
        <h2 id="role-overrides-heading">只覆盖一个用途</h2>
        <p>
          这里仅覆盖强调按钮的底色，不改变共享的蓝色、键盘焦点和信息提示。用 <code>tokens</code> 可以让 mtone 的浮层也收到相同覆盖。
          未设置新的角色变量时，组件仍按原先的方式读取 <code>--mt-blue</code>、<code>--mt-indicator</code> 等旧变量。
        </p>
        <div className="theme-samples">
          <div className="theme-sample"><Button variant="blue">默认主操作</Button></div>
          <MtoneProvider tokens={{ "--mt-action-emphasis-bg": "#4a557d", "--mt-action-emphasis-hover-bg": "#3d496c" }}>
            <div className="theme-sample"><Button variant="blue">局部主操作</Button></div>
          </MtoneProvider>
        </div>
        <CodeBlock code={`<MtoneProvider tokens={{
  "--mt-action-emphasis-bg": "#4a557d",
  "--mt-action-emphasis-hover-bg": "#3d496c",
}}>
  <Button variant="blue">局部主操作</Button>
</MtoneProvider>`} />
      </section>

      <a className="back-gallery" href="#/theme">← 返回主题与样式</a>
    </>
  );
}
