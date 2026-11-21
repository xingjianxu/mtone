import React from "react";
import { MtoneProvider, type MtoneAccent } from "../../packages/mtone/src";
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

const statusDotStyle = {
  display: "inline-block",
  inlineSize: 8,
  blockSize: 8,
  borderRadius: "50%",
  marginInlineEnd: 8,
  backgroundColor: "var(--mt-accent-green)",
};

const override = { "--mt-accent-green": "#528a72" };
const statusExample = `function StatusMark({ label }: { label: string }) {
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

<StatusMark label="已同步" />`;

function StatusMark({ label }: { label: string }) {
  return <span><span aria-hidden="true" style={statusDotStyle} />{label}</span>;
}

export function ColorPresets() {
  return (
    <>
      <div className="eyebrow">THEME COLOR PRESETS</div>
      <h1 id={colorPresetsHeading} tabIndex={-1}>颜色预设</h1>
      <p className="lead">
        这些共享颜色可用于 mtone 组件，也可用于自己的界面。色板直接读取当前主题的 CSS 变量；用顶部的主题开关比较浅色和深色。
      </p>

      <section aria-labelledby="accent-palette-heading">
        <h2 id="accent-palette-heading">共享色板</h2>
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

      <section>
        <h2>在自己的界面中复用</h2>
        <p>
          导入 <code>@bixlab/mtone/styles.css</code> 后，在 CSS 或内联样式中写 <code>var(--mt-accent-green)</code> 即可。
          例如用它绘制状态点，同时保留文字，避免仅靠颜色传达状态。
        </p>
        <div className="theme-sample"><StatusMark label="已同步" /></div>
        <CodeBlock code={statusExample} />
      </section>

      <section>
        <h2>仅覆盖某个 Provider 的预设色</h2>
        <p>
          在 <code>MtoneProvider</code> 的 <code>tokens</code> 中覆盖同名变量。覆盖只应用于该作用域，不改变外部色板。
          自定义值不会随浅色和深色自动换色；需要两套颜色时，请为不同主题分别提供值，并检查对比度。
        </p>
        <div className="theme-samples">
          <div className="theme-sample"><StatusMark label="默认绿色" /></div>
          <MtoneProvider tokens={override}>
            <div className="theme-sample"><StatusMark label="局部覆盖" /></div>
          </MtoneProvider>
        </div>
        <CodeBlock code={`import { MtoneProvider } from "@bixlab/mtone";

// 复用上面的 StatusMark
<MtoneProvider tokens={{ "--mt-accent-green": "${override["--mt-accent-green"]}" }}>
  <StatusMark label="局部覆盖" />
</MtoneProvider>`} />
      </section>

      <a className="back-gallery" href="#/theme">← 返回主题与样式</a>
    </>
  );
}
