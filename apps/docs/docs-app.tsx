import packageInfo from "../../packages/mtone/package.json";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
  Copy,
  Check,
  Layers,
  BookOpen,
} from "lucide-react";
import * as M from "../../packages/mtone/src";
import { componentCategories, componentDocGroups, componentDocs, type ComponentDoc } from "./catalog";
import { blockEditorDocSections } from "./block-editor-demos";
import { ComponentExample } from "./examples";
import { standaloneTypographySections, focusTypographySection, isTypographySection, typographySectionId, handleTypographyNavigation } from "./typography-navigation";
import { componentSectionHref, focusDocSection, type DocSection, type OutlineEntry } from "./doc-section";
import { inputDocSections } from "./input-demos";
import { buttonDocSections } from "./button-demos";
import { dataTableDocSections } from "./table-example";
import { dataListDocSections } from "./data-list-demos";
import { secondaryDocSections } from "./secondary-demo-registry";
import { inlineDocSections } from "./inline-demo-registry";
import { aiDocSections } from "./ai-demos";
import { componentDocHref, nestedComponentDoc } from "./component-navigation";
import { componentLlmsPath, globalLlmsPath } from "./llms-reference";
import { ShowcasePage } from "./showcase-page";
import { ThemeSelect, useThemePreference } from "./theme-preference";
import { CodeBlock, DemoSource } from "./code-block";
import { ColorPresets, colorPresetsHeading, colorPresetsHref } from "./color-presets";
export type Route =
  | { kind: "gallery" | "showcase" | "start" | "theme" | "color-presets" | "not-found" }
  | { kind: "component"; name: string; section?: string };
export function parseRoute(hash: string): Route {
  if (hash === "#/components/Panel?section=tab-placement")
    return { kind: "component", name: "Panel", section: "ide" };
  const typography = hash.match(/^#\/components\/Typography\?section=([A-Za-z]+)$/);
  if (typography && isTypographySection(typography[1]))
    return { kind: "component", name: "Typography", section: typography[1] };
  if (typography && !isTypographySection(typography[1]) && !/^(usage|props|notes)$/.test(typography[1])) return { kind: "not-found" };
  const legacyTypography = hash.match(/^#\/components\/([A-Za-z]+)$/);
  if (legacyTypography && standaloneTypographySections.some(({ name }) => name === legacyTypography[1]))
    return { kind: "component", name: "Typography", section: legacyTypography[1] };
  if (!hash || hash === "#" || hash === "#/" || hash === "#/gallery")
    return { kind: "gallery" };
  if (hash === "#/showcase" || hash === "#/apps") return { kind: "showcase" };
  if (hash === "#/start") return { kind: "start" };
  if (hash === colorPresetsHref) return { kind: "color-presets" };
  if (hash === "#/theme") return { kind: "theme" };
  const m = hash.match(/^#\/components\/([A-Za-z]+)(?:\?section=([A-Za-z][A-Za-z0-9-]*))?$/);
  return m && componentDocs.some((d) => d.name === m[1] && !d.sidebarSection)
    ? { kind: "component", name: m[1], ...(m[2] ? { section: m[2] } : {}) }
    : { kind: "not-found" };
}
export function searchDocs(query: string) {
  const q = query.trim().toLowerCase();
  return componentDocs.filter((d) =>
    `${d.name} ${d.category} ${d.description}`.toLowerCase().includes(q),
  );
}
const groups = componentCategories;
const sidebarGroups = componentDocGroups.map(({ label, members }) => ({
  label,
  members: members.filter((doc) =>
    !doc.sidebarParent && !isTypographySection(doc.name),
  ),
}));
export { componentDocHref };
const llmsHref = import.meta.env.BASE_URL + globalLlmsPath;

function CopyControl({ name, copy }: { name: string; copy: () => Promise<void> }) {
  const [status, setStatus] = useState("");
  return <>
    <button type="button" className="component-copy-button" aria-label={name} onClick={async () => {
      setStatus("");
      try {
        await copy();
        setStatus("已复制");
      } catch {
        setStatus("复制失败，请手动复制");
      }
    }}>{status === "已复制" ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}</button>
    <span className="sr-only" role="status">{status}</span>
  </>;
}

async function fetchLlmsText(href: string) {
  const response = await fetch(href);
  if (!response.ok || !/^text\/plain(?:;|$)/i.test(response.headers.get("Content-Type") ?? "")) {
    throw new Error("The reference is not available as plain text");
  }
  return response.text();
}

async function copyLlms(href: string) {
  const clipboard = navigator.clipboard;
  if (typeof ClipboardItem !== "undefined" && typeof clipboard?.write === "function") {
    // Schedule the clipboard write in the click gesture; Safari requires this
    // even when the plain-text asset is still being loaded.
    const data = fetchLlmsText(href).then((text) => new Blob([text], { type: "text/plain" }));
    void data.catch(() => undefined); // The browser may reject permission before consuming the data.
    await clipboard.write([new ClipboardItem({ "text/plain": data })]);
  } else {
    if (!clipboard?.writeText) throw new Error("Clipboard unavailable");
    await clipboard.writeText(await fetchLlmsText(href));
  }
}

function ComponentReference({ name }: { name: string }) {
  const href = import.meta.env.BASE_URL + componentLlmsPath(name);
  return <span className="component-reference">
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${name} llms.txt`}>llms.txt</a>
    <CopyControl name={`复制 ${name} llms.txt 内容`} copy={() => copyLlms(href)} />
  </span>;
}

function ImportLine({ code, name }: { code: string; name: string }) {
  return <div className="component-import">
    <code>{code}</code>
    <CopyControl name="复制导入语句" copy={() => navigator.clipboard.writeText(code)} />
    <ComponentReference name={name} />
  </div>;
}
function DocDemo({ item, level, owner }: { item: DocSection; level: number; owner: string }) {
  const Heading = level === 2 ? "h2" : level === 3 ? "h3" : "h4";
  const nested = nestedComponentDoc(owner, item.id.startsWith("typography-")
    ? standaloneTypographySections.find(({ name }) => typographySectionId(name) === item.id)?.name
    : item.id);
  return <section className="component-doc-section">
    <Heading id={item.id} tabIndex={-1}>{item.title}</Heading>
    {nested && <div className="component-reference-section"><ComponentReference name={nested.name} /></div>}
    {item.note && <p>{item.note}</p>}
    {item.relatedLink && <p>另见：<a className="docs-inline-link" href={item.relatedLink.href}>{item.relatedLink.label}</a>。</p>}
    {item.Demo && <div className="component-demo-card">
      <div className="component-demo-stage example-stage"><item.Demo /></div>
      {item.source && <DemoSource code={item.source} />}
    </div>}
    {item.children?.map((child) => <DocDemo key={child.id} item={child} level={level + 1} owner={owner} />)}
  </section>;
}
export const docSections: Record<string, readonly DocSection[]> = {
  ...inlineDocSections,
  ...secondaryDocSections,
  ...aiDocSections,
  Input: inputDocSections,
  Button: buttonDocSections,
  DataTable: dataTableDocSections,
  DataList: dataListDocSections,
  BlockEditor: blockEditorDocSections,
};

const outlineOffset = () => (document.querySelector(".topbar")?.getBoundingClientRect().bottom ?? 68) + 32;

function outlineItems(entries: readonly OutlineEntry[], level = 2): M.TableOfContentsItem[] {
  return entries.flatMap(({ id, title, children }) => [
    { id, label: title, level },
    ...outlineItems(children ?? [], level + 1),
  ]);
}

function ComponentPage({ doc, section }: { doc: ComponentDoc; section?: string }) {
  const sections = docSections[doc.name] ?? [];
  const apiChildren = doc.name === "Typography"
    ? standaloneTypographySections
    : componentDocs.filter((item) => item.sidebarParent === doc.name)
        .map((item) => ({ name: item.name, label: item.name }));

  const items = useMemo(() => outlineItems([
    ...(docSections[doc.name] ?? []),
    { id: "props", title: "API" },
    ...(doc.notes.length ? [{ id: "notes", title: "使用注意" }] : []),
  ]), [doc.name, doc.notes.length]);
  const fallbackActiveId =
    doc.name === "Typography" && section && isTypographySection(section)
      ? typographySectionId(section)
      : section;
  const reference = nestedComponentDoc(doc.name, section) ?? doc;
  const importCode = `import { ${reference.importNames.join(", ")} } from "${reference.packageName ?? "@bixlab/mtone"}";`;
  return (
    <>
      <h1>{doc.name}</h1>
      <ImportLine key={reference.name} code={importCode} name={reference.name} />
      <aside className="component-outline">
        <M.TableOfContents
          aria-label="本页目录"
          title={null}
          items={items}
          listStyle="nested"
          indent={14}
          collapseBelow={1110}
          observe={false}
          offset={outlineOffset}
          fallbackActiveId={fallbackActiveId}
          highlightLastAtEnd
          getHref={({ id }) => componentSectionHref(doc.name, id)}
          onItemClick={({ id }, event) => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (window.location.hash === componentSectionHref(doc.name, id)) {
              // No hashchange will fire. Let the TOC close its mobile disclosure
              // before measuring and scrolling to the target.
              queueMicrotask(() => focusDocSection(id));
            }
          }}
        />
      </aside>
      {sections.map((item) => <DocDemo key={item.id} item={item} level={2} owner={doc.name} />)}
      <section id="props" tabIndex={-1}>
        <h2>API</h2>
        <div className="props-scroll">
          <table className="props-table">
            <thead>
              <tr>
                <th>属性</th>
                <th>类型 / 默认值</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              {doc.props.map((p) => (
                <tr key={p.name}>
                  <td>
                    <code>{p.name}</code>
                  </td>
                  <td>
                    <code>{p.type}</code>
                    {p.default && <small>默认：{p.default}</small>}
                  </td>
                  <td>{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {doc.props.length === 0 && <p>此组件无额外配置属性。</p>}
      </section>
      {apiChildren.map(({ name, label }) => {
        const child = componentDocs.find((item) => item.name === name)!;
        return (
          <section key={name} aria-label={`${name} 属性与接口`}>
            <h3>{label} · 属性与接口</h3>
            <div className="props-scroll">
              <table className="props-table">
                <thead><tr><th>属性</th><th>类型 / 默认值</th><th>说明</th></tr></thead>
                <tbody>{child.props.map((prop) => <tr key={prop.name}>
                  <td><code>{prop.name}</code></td>
                  <td><code>{prop.type}</code>{prop.default && <small>默认：{prop.default}</small>}</td>
                  <td>{prop.description}</td>
                </tr>)}</tbody>
              </table>
            </div>
            <ul className="notes">{child.notes.map((note, index) => <li key={index}>{note}</li>)}</ul>
          </section>
        );
      })}
      {doc.notes.length > 0 && <section id="notes" tabIndex={-1}>
        <h2>使用注意</h2>
        <ul className="notes">
          {doc.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </section>}
      <a className="back-gallery" href="#/gallery">
        ← 返回组件总览
      </a>
    </>
  );
}
function Start() {
  return (
    <>
      <div className="eyebrow">GETTING STARTED</div>
      <h1>从一个组件开始。</h1>
      <p className="lead">有样式的组件，无需复制源码，也不用配置 Tailwind。</p>
      <section>
        <h2>安装</h2>
        <p>
          正式版本通过 npm 发布。安装一个包即可使用全部组件，不需要逐个添加组件源码。
        </p>
        <CodeBlock
          code={
            "npm install @bixlab/mtone"
          }
        />
        <p>
          宿主项目需要 React 与 ReactDOM ^19.2.0。组件包为 ESM，包含 TypeScript
          类型。
        </p>
      </section>
      <section>
        <h2>导入样式与组件</h2>
        <CodeBlock
          code={
            'import { Button, MtoneProvider } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function App() {\n  return (\n    <MtoneProvider locale="zh">\n      <Button onClick={() => console.log("create")}>新建文档</Button>\n    </MtoneProvider>\n  );\n}'
          }
        />
        <p>样式只需导入一次。简单组件无需 Provider，使用默认中文与 32px 控件基准。</p>
      </section>
      <section id="ai-coding">
        <h2>与 AI 一起编程</h2>
        <p><a href={llmsHref} target="_blank" rel="noopener noreferrer">打开 llms.txt</a>，将内容提供给支持文件或网页上下文的 AI 编程工具。它包含安装方式、组件入口、重要 API、示例与文档链接。</p>
        <CodeBlock code={'先读取 node_modules/@bixlab/mtone/llms.txt 和 dist/index.d.ts。使用已安装版本的 mtone 组件实现一个设置页，导入 styles.css，复用组件，不猜测其他 UI 库的 API。最后执行类型检查并验证键盘交互。'} />
        <p>从 npm 安装的 @bixlab/mtone 自 0.6.0 起包含此文件，可在 <code>node_modules/@bixlab/mtone/llms.txt</code> 读取。</p>
        <p>网站文件跟随仓库 master，可能领先 npm。优先使用已安装包中的文件和类型声明；llms.txt 不会被所有 AI 工具自动读取，也不能代替完整类型、测试或后端实现。</p>
      </section>
      <section>
        <h2>你会获得什么</h2>
        <p>
          Base UI 交互逻辑、Lucide 图标、预编译 Tailwind
          样式，以及全部非编辑器组件。表格、树和上传提供基础能力；具体限制写在对应组件页。
        </p>
        <M.Alert title="范围说明">
          不包含块编辑器、后端接口或数据库。上传需接入你的服务；演示不会发送文件。
        </M.Alert>
      </section>
    </>
  );
}
function Theme() {
  return (
    <>
      <div className="eyebrow">THEMING & STYLES</div>
      <h1>安静的界面，一致的细节。</h1>
      <p className="lead">
        通过 Provider 与 CSS 变量调整主题，而不是逐个覆盖组件。
      </p>
      <section>
        <h2>主题与控件尺寸</h2>
        <p className="theme-release-note">
          当前文档预览统一 32px 控件基准，移除了密度切换；已安装版本请以包内类型声明为准。
        </p>
        <CodeBlock
          code={
            '<MtoneProvider\n  locale="zh"\n  theme="system"\n  tokens={{ "--mt-primary": "#466751", "--mt-radius": "6px" }}\n>\n  <main style={{ background: "var(--mt-bg)" }}>\n    <Button>保存</Button>\n  </main>\n</MtoneProvider>'
          }
        />
        <p>
          <code>theme</code> 支持 <code>light</code>、<code>dark</code> 和 <code>system</code>。
          应用未指定时保持浅色；<code>system</code> 实时跟随设备设置，不用刷新。
          下拉菜单、弹窗和通知继承所在作用域的主题，可用 <code>MtoneScope</code> 局部覆盖。
          Provider 不绘制应用画布，需要时在应用自己的容器上使用 <code>background: var(--mt-bg)</code>。
        </p>
        <p>
          文档站和应用示例默认跟随系统，也可在顶部手动切换；所选主题会记住。
          默认单行控件统一采用 32px 基准高度，不再区分密度。升级时移除 Provider 上的 density 属性；独立 size 变体与 CSS 变量定制仍可使用。
        </p>
      </section>
      <section>
        <h2>同页使用不同主题</h2>
        <div className="theme-samples">
          {(["light", "dark"] as const).map((theme) => (
            <M.MtoneScope key={theme} theme={theme} className="theme-sample">
              <strong>{theme === "light" ? "浅色" : "深色"}</strong>
              <M.Button variant="solid">保存</M.Button>
              <M.Select
                label="显示选项"
                placeholder="选择一项"
                options={[{ value: "all", label: "全部内容" }, { value: "starred", label: "仅收藏" }]}
              />
            </M.MtoneScope>
          ))}
        </div>
        <CodeBlock code={'<MtoneScope theme="dark">\n  <Button variant="solid">保存</Button>\n</MtoneScope>'} />
      </section>
      <section>
        <h2>设计变量</h2>
        <div className="props-scroll">
          <table className="props-table">
            <thead>
              <tr>
                <th>变量</th>
                <th>作用</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["--mt-fg", "正文颜色"],
                ["--mt-muted", "次要文字"],
                ["--mt-bg", "页面与浮层背景"],
                ["--mt-subtle", "轻底色"],
                ["--mt-border", "边框"],
                ["--mt-primary", "主操作颜色"],
                ["--mt-hover", "悬停背景"],
                ["--mt-height", "控件高度"],
                ["--mt-radius", "圆角"],
                ["--mt-focus", "统一焦点色，独立于 --mt-primary"],
                ["--mt-select-surface", "浅蓝选中与设置定位底色，和焦点、提示色独立。"],
                ["--mt-accent-*", "八种按色相命名的可选预设色，与组件语义颜色分开。"],
              ].map(([k, v]) => (
                <tr key={k}>
                  <td>
                    <code>{k}</code>
                  </td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>查看<a className="docs-inline-link" href={colorPresetsHref}>颜色预设</a>，比较浅色与深色的实际色板并查看复用示例。</p>
      </section>
      <section>
        <h2>宿主样式与无障碍</h2>
        <ul className="notes">
          <li>不导出全局 Tailwind Preflight，也不重置宿主标题与正文。</li>
          <li>
            优先用 tokens 调整样式；任意 Tailwind utility 的覆盖优先级不作保证。
          </li>
          <li>
            浮层 z-index 为 1200–1300，需与应用自身层级协调；这不是 Shadow DOM
            隔离。
          </li>
          <li>
            图标按钮需要 aria-label；输入应有可访问标签。保留可见焦点样式。
          </li>
        </ul>
      </section>
    </>
  );
}
export function DocsApp() {
  return <M.ShortcutsProvider><DocsBody /></M.ShortcutsProvider>;
}

function DocsBody() {
  const preference = useThemePreference();
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  const [query, setQuery] = useState("");
  const [mobile, setMobile] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const sidebarAlignmentHash = useRef<string | null>(window.location.hash);
  const results = searchDocs(query).filter((doc) => query.trim() || !doc.sidebarParent);
  useLayoutEffect(() => {
    // Align on initial load or after Spotlight, not on ordinary sidebar navigation.
    const align = sidebarAlignmentHash.current === window.location.hash;
    sidebarAlignmentHash.current = null;
    const sidebar = sidebarRef.current;
    if (!align || route.kind !== "component" || !sidebar) return;
    const current = sidebar.querySelector('nav a[aria-current="page"]');
    if (!current) return;
    const row = current.getBoundingClientRect();
    const viewportTop = sidebar.getBoundingClientRect().top + sidebar.clientTop;
    // Move only this scrollport; scrollIntoView can also move the main page.
    sidebar.scrollTop += row.top + row.height / 2 - viewportTop - sidebar.clientHeight / 2;
  }, [route]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobile(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  useEffect(() => {
    const change = () => {
      const nextRoute = parseRoute(window.location.hash);
      setRoute(nextRoute);
      setMobile(false);
      setQuery("");
      if (nextRoute.kind !== "component" || !nextRoute.section) window.scrollTo?.(0, 0);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    document.title = `${route.kind === "component" ? route.name : route.kind === "gallery" ? "组件总览" : route.kind === "showcase" ? "应用示例" : route.kind === "start" ? "快速开始" : route.kind === "theme" ? "主题与样式" : route.kind === "color-presets" ? "颜色预设" : "页面未找到"} · mtone`;
  }, [route]);
  useEffect(() => {
    if (route.kind === "component" && route.section) {
      if (route.name === "Typography" && isTypographySection(route.section)) focusTypographySection(route.section);
      else focusDocSection(route.section);
    } else if (route.kind === "color-presets") {
      document.getElementById(colorPresetsHeading)?.focus({ preventScroll: true });
    }
  }, [route]);
  if (route.kind === "showcase") return <ShowcasePage preference={preference} />;
  const doc =
    route.kind === "component"
      ? componentDocs.find((d) => d.name === route.name)
      : undefined;
  return (
    <M.MtoneProvider theme={preference.theme}>
      <M.ToastProvider>
        <a
          className="skip-link"
          href="#main-content"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("main-content")?.focus();
          }}
        >
          跳到主要内容
        </a>
        <header className="topbar">
          <a href="#/gallery" className="brand">
            <span className="brand-mark">m</span> mtone <small>{packageInfo.version}</small>
          </a>
          <div className="top-actions">
            <M.Spotlight
              title="搜索组件"
              placeholder="按名称、分类或描述搜索组件…"
              nothingFound="没有匹配的组件，试试其他关键词。"
              limit={componentDocs.length}
              actions={groups.flatMap((group) =>
                componentDocs.filter((item) => item.category === group).map((item) => ({
                  id: item.name,
                  label: item.name,
                  description: item.description,
                  keywords: item.category,
                  group,
                  onSelect: () => {
                    setMobile(false);
                    const href = componentDocHref(item.name);
                    const nextRoute = parseRoute(href);
                    if (nextRoute.kind === "component" &&
                      (route.kind !== "component" || route.name !== nextRoute.name)) {
                      sidebarAlignmentHash.current = href;
                    }
                    window.location.hash = href;
                  },
                })),
              )}
              filter={(value, action) =>
                `${action.label} ${action.group} ${action.description}`.toLowerCase().includes(value.trim().toLowerCase())
              }
              onOpenChange={(open) => { if (open) setMobile(false); }}
              trigger={
                <button className="docs-search-trigger" aria-label="搜索组件" aria-keyshortcuts="Control+k Meta+k">
                  <Search size={15} aria-hidden="true" />
                  <span className="docs-search-label">搜索组件…</span>
                  <kbd aria-hidden="true">Ctrl / ⌘ K</kbd>
                </button>
              }
            />
            <ThemeSelect {...preference} />
            <a
              href="https://github.com/xingjianxu/mtone"
              className="docs-repo-link"
              aria-label="GitHub"
              target="_blank"
              rel="noreferrer"
            >
              <span>GitHub</span> <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <button
              className="mobile-menu"
              aria-label={mobile ? "关闭导航" : "打开导航"}
              aria-expanded={mobile}
              onClick={() => setMobile(!mobile)}
            >
              {mobile ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>
        {mobile && (
          <button
            className="nav-backdrop"
            aria-label="关闭导航"
            onClick={() => setMobile(false)}
          />
        )}
        <aside ref={sidebarRef} className={`docs-sidebar ${mobile ? "is-open" : ""}`}>
          <nav
            aria-label="文档导航"
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("a")) setMobile(false);
            }}
          >
            <M.NavGroup label="开始使用">
              <M.NavItem
                href="#/start"
                active={route.kind === "start"}
                icon={<BookOpen size={15} aria-hidden="true" />}
              >
                快速开始
              </M.NavItem>
              <M.NavItem
                href="#/gallery"
                active={route.kind === "gallery"}
                icon={<Layers size={15} aria-hidden="true" />}
              >
                Component gallery
              </M.NavItem>
              <M.NavItem href="./showcase.html" target="_blank" rel="noopener noreferrer" icon={<Layers size={15} aria-hidden="true" />}>
                应用示例
              </M.NavItem>
              <M.NavItem
                href="#/theme"
                active={route.kind === "theme"}
              >
                主题与样式
              </M.NavItem>
              <M.NavItem href={colorPresetsHref} active={route.kind === "color-presets"}>
                颜色预设
              </M.NavItem>
              <M.NavItem href={llmsHref} target="_blank" rel="noopener noreferrer">llms.txt</M.NavItem>
            </M.NavGroup>
            {sidebarGroups.map(({ label, members }) => (
              <M.NavGroup key={label} label={label}>
                {members.map((docItem) => (
                  <M.NavItem
                    key={docItem.name}
                    href={componentDocHref(docItem.name)}
                    active={doc?.name === docItem.name || doc?.sidebarParent === docItem.name}
                  >
                    {docItem.name}
                  </M.NavItem>
                ))}
              </M.NavGroup>
            ))}
          </nav>
          <div className="sidebar-foot">BASE UI · TAILWIND · LUCIDE</div>
        </aside>
        <div className={`content-layout ${doc ? "component-content-layout" : ""}`}>
          <main id="main-content" tabIndex={-1}>
            {route.kind === "gallery" ? (
              <>
                <div className="eyebrow">THE COMPONENT COLLECTION</div>
                <h1>为内容留出空间。</h1>
                <p className="lead">
                  从基础操作到复杂信息，探索 mtone
                  的真实组件。选择一个组件，查看示例、代码和 API。
                </p>
                <div className="intro-actions">
                  <a className="primary-link" href="#/start">
                    开始使用 <ArrowRight size={15} />
                  </a>
                  <a href="./showcase.html" target="_blank" rel="noopener noreferrer">探索应用示例 <ArrowRight size={15} /></a>
                  <span>
                    {componentDocs.length} 个文档条目
                  </span>
                </div>
                <div className="gallery-filter">
                  <Search size={16} />
                  <input
                    aria-label="筛选组件总览"
                    placeholder="按名称或描述筛选组件"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                {results.length === 0 && (
                  <M.Empty
                    title="没有匹配的组件"
                    description="试试其他名称或清除搜索条件。"
                  />
                )}
                {groups.map((g) => {
                  const entries = results.filter((d) => d.category === g);
                  return (
                    entries.length > 0 && (
                      <section key={g}>
                        <h2>
                          {g}
                          <span className="section-count">
                            {entries.length}
                          </span>
                        </h2>
                        <div className="gallery-grid">
                          {entries.map((d) => (
                            <article className="gallery-card" key={d.name}>
                              <div className="gallery-preview">
                                <ComponentExample name={d.name} compact />
                              </div>
                              <a
                                className="gallery-card-title"
                                href={componentDocHref(d.name)}
                              >
                                <strong>{d.name}</strong>
                                <ArrowUpRight size={15} />
                              </a>
                              <p>{d.description}</p>
                            </article>
                          ))}
                        </div>
                      </section>
                    )
                  );
                })}
              </>

            ) : doc ? (
              <ComponentPage key={doc.name} doc={doc} section={route.kind === "component" ? route.section : undefined} />
            ) : route.kind === "start" ? (
              <Start />
            ) : route.kind === "theme" ? (
              <Theme />
            ) : route.kind === "color-presets" ? (
              <ColorPresets />
            ) : (
              <>
                <h1>页面未找到</h1>
                <p>这个组件或文档路径不存在。</p>
                <a href="#/gallery">返回组件总览</a>
              </>
            )}
            <footer className="docs-footer">
              mtone · 有样式的组件，无多余的噪音。
              <a href="https://github.com/xingjianxu/mtone/issues">
                反馈问题 ↗
              </a>
            </footer>
          </main>
        </div>
      </M.ToastProvider>
    </M.MtoneProvider>
  );
}
