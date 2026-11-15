import React, { useEffect, useState } from "react";
import {
  Search,
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
  Copy,
  Check,
  Layers,
  Code2,
  BookOpen,
} from "lucide-react";
import * as M from "../../packages/mtone/src";
import { componentDocs, type ComponentDoc } from "./catalog";
import { ComponentExample } from "./examples";
import { ShowcasePage } from "./showcase-page";
export type Route =
  | { kind: "gallery" | "showcase" | "start" | "theme" | "not-found" }
  | { kind: "component"; name: string };
export function parseRoute(hash: string): Route {
  if (hash === "#/components/Modal") return { kind: "component", name: "Dialog" };
  if (!hash || hash === "#" || hash === "#/" || hash === "#/gallery")
    return { kind: "gallery" };
  if (hash === "#/showcase" || hash === "#/apps") return { kind: "showcase" };
  if (hash === "#/start") return { kind: "start" };
  if (hash === "#/theme") return { kind: "theme" };
  const m = hash.match(/^#\/components\/([A-Za-z]+)$/);
  return m && componentDocs.some((d) => d.name === m[1])
    ? { kind: "component", name: m[1] }
    : { kind: "not-found" };
}
export function searchDocs(query: string) {
  const q = query.trim().toLowerCase();
  return componentDocs.filter((d) =>
    `${d.name} ${d.category} ${d.description}`.toLowerCase().includes(q),
  );
}
const groups = Array.from(new Set(componentDocs.map((d) => d.category)));
function CodeBlock({ code }: { code: string }) {
  const [status, setStatus] = useState("");
  return (
    <div className="code-box">
      <div className="code-head">
        <span>TSX</span>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setStatus("已复制");
            } catch {
              setStatus("复制失败，请手动选择代码");
            }
          }}
          aria-label="复制代码"
        >
          {status === "已复制" ? <Check size={14} /> : <Copy size={14} />}{" "}
          {status || "复制"}
        </button>
      </div>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
      <span className="sr-only" role="status">
        {status}
      </span>
    </div>
  );
}
function Demo({ name }: { name: string }) {
  return (
    <div className="example-stage">
      <ComponentExample name={name} />
    </div>
  );
}
function ComponentPage({ doc }: { doc: ComponentDoc }) {
  const [source, setSource] = useState(true);
  return (
    <>
      <div className="eyebrow">{doc.category} / COMPONENT</div>
      <h1>{doc.name}</h1>
      <p className="lead">{doc.description}</p>
      <div className="page-meta">
        <span>mtone 0.1.0</span>
        <span>React 19.2</span>
        <a
          href="https://github.com/xingjianxu/mtone/tree/master/packages/mtone/src"
          target="_blank"
          rel="noreferrer"
        >
          查看源码 <ArrowUpRight size={13} />
        </a>
      </div>
      <section id="usage">
        <h2>
          使用示例{" "}
          <a
            href={`#/components/${doc.name}`}
            aria-label={`${doc.name} 固定链接`}
          >
            #
          </a>
        </h2>
        <p>
          下方运行实际组件，展示多种状态；下方代码提供独立的基础用法，可直接复制。
        </p>
        <Demo name={doc.name} />
        <button className="source-toggle" onClick={() => setSource(!source)}>
          <Code2 size={14} />
          {source ? "收起基础用法代码" : "显示基础用法代码"}
        </button>
        {source && <CodeBlock code={doc.code} />}
      </section>
      <section id="props">
        <h2>属性与接口</h2>
        <p>以下列出主要公开属性。完整继承类型可查看包内 TypeScript 声明。</p>
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
      <section id="notes">
        <h2>使用建议与边界</h2>
        <ul className="notes">
          {doc.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </section>
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
            'import { Button, MtoneProvider } from "@bixlab/mtone";\nimport "@bixlab/mtone/styles.css";\n\nexport default function App() {\n  return (\n    <MtoneProvider locale="zh" density="compact">\n      <Button onClick={() => console.log("create")}>新建文档</Button>\n    </MtoneProvider>\n  );\n}'
          }
        />
        <p>样式只需导入一次。简单组件无需 Provider，使用默认中文与紧凑密度。</p>
      </section>
      <section id="ai-coding">
        <h2>与 AI 一起编程</h2>
        <p><a href="./llms.txt">打开 llms.txt</a>，将内容提供给支持文件或网页上下文的 AI 编程工具。它包含安装方式、组件入口、重要 API、示例与文档链接。</p>
        <CodeBlock code={'先读取 node_modules/@bixlab/mtone/llms.txt 和 dist/index.d.ts。使用已安装版本的 mtone 组件实现一个设置页，导入 styles.css，复用组件，不猜测其他 UI 库的 API。最后执行类型检查并验证键盘交互。'} />
        <p>从包含此文件的新版 npm 包安装后，可在 node_modules/@bixlab/mtone/llms.txt 读取。当前改动尚待下一次 npm 发布；已安装的旧版本可能没有该文件。</p>
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
        <h2>主题与密度</h2>
        <CodeBlock
          code={
            '<MtoneProvider\n  locale="zh"\n  density="comfortable"\n  tokens={{ "--mt-primary": "#466751", "--mt-radius": "6px" }}\n>\n  <Button>保存</Button>\n</MtoneProvider>'
          }
        />
        <p>
          默认 compact 为紧凑布局；comfortable
          提供更舒适的控件高度。弹层继承所属 Provider 的主题。
        </p>
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
                ["--mt-focus", "统一焦点色（默认 #5378AA），独立于 --mt-primary"],
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
          <li>浅色主题为当前基线；并未提供完整暗色配色。</li>
        </ul>
      </section>
    </>
  );
}
export function DocsApp() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  const [query, setQuery] = useState("");
  const [mobile, setMobile] = useState(false);
  const [density, setDensity] = useState<"compact" | "comfortable">("compact");
  const results = searchDocs(query);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobile(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  useEffect(() => {
    const change = () => {
      setRoute(parseRoute(window.location.hash));
      setMobile(false);
      setQuery("");
      window.scrollTo?.(0, 0);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    document.title = `${route.kind === "component" ? route.name : route.kind === "gallery" ? "组件总览" : route.kind === "showcase" ? "应用示例" : route.kind === "start" ? "快速开始" : route.kind === "theme" ? "主题与样式" : "页面未找到"} · mtone`;
  }, [route]);
  if (route.kind === "showcase") return <ShowcasePage />;
  const doc =
    route.kind === "component"
      ? componentDocs.find((d) => d.name === route.name)
      : undefined;
  return (
    <M.MtoneProvider density={density}>
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
            <span className="brand-mark">m</span> mtone <small>0.1.0</small>
          </a>
          <div className="top-actions">
            <span className="top-tag">组件文档</span>
            <button
              onClick={() =>
                setDensity(density === "compact" ? "comfortable" : "compact")
              }
            >
              {density === "compact" ? "紧凑" : "舒适"}
            </button>
            <a
              href="https://github.com/xingjianxu/mtone"
              target="_blank"
              rel="noreferrer"
            >
              GitHub <ArrowUpRight size={14} />
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
        <aside className={`docs-sidebar ${mobile ? "is-open" : ""}`}>
          <label className="search">
            <Search size={15} />
            <input
              aria-label="搜索组件"
              placeholder="搜索组件…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button aria-label="清除搜索" onClick={() => setQuery("")}>
                <X size={13} />
              </button>
            )}
          </label>
          <nav
            aria-label="文档导航"
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("a")) setMobile(false);
            }}
          >
            <div className="nav-heading">开始使用</div>
            <a
              href="#/start"
              aria-current={route.kind === "start" ? "page" : undefined}
            >
              <BookOpen size={15} />
              快速开始
            </a>
            <a
              href="#/gallery"
              aria-current={route.kind === "gallery" ? "page" : undefined}
            >
              <Layers size={15} />
              Component gallery
            </a>
            <a href="./showcase.html" target="_blank" rel="noopener noreferrer" >
              <Layers size={15} />应用示例
            </a>
            <a
              href="#/theme"
              aria-current={route.kind === "theme" ? "page" : undefined}
            >
              主题与样式
            </a>
            {results.length === 0 ? (
              <p className="no-results" role="status">
                没有匹配的组件。
              </p>
            ) : (
              groups.map((group) => {
                const members = results.filter((d) => d.category === group);
                return (
                  members.length > 0 && (
                    <div key={group}>
                      <div className="nav-heading">{group}</div>
                      {members.map((d) => (
                        <a
                          key={d.name}
                          href={`#/components/${d.name}`}
                          aria-current={
                            doc?.name === d.name ? "page" : undefined
                          }
                        >
                          {d.name}
                        </a>
                      ))}
                    </div>
                  )
                );
              })
            )}
          </nav>
          <div className="sidebar-foot">BASE UI · TAILWIND · LUCIDE</div>
        </aside>
        <div className="content-layout">
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
                    {componentDocs.length} 个文档条目 · 含别名与 Provider
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
                                href={`#/components/${d.name}`}
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
              <ComponentPage key={doc.name} doc={doc} />
            ) : route.kind === "start" ? (
              <Start />
            ) : route.kind === "theme" ? (
              <Theme />
            ) : (
              <>
                <h1>页面未找到</h1>
                <p>这个组件或文档路径不存在。</p>
                <a href="#/gallery">返回组件总览</a>
              </>
            )}
            <footer>
              mtone · 有样式的组件，无多余的噪音。
              <a href="https://github.com/xingjianxu/mtone/issues">
                反馈问题 ↗
              </a>
            </footer>
          </main>
          {doc && (
            <aside className="page-outline">
              <span>本页内容</span>
              {[
                ["usage", "使用示例"],
                ["props", "属性与接口"],
                ["notes", "使用建议"],
              ].map(([id, title]) => (
                <button
                  key={id}
                  onClick={() =>
                    document
                      .getElementById(id)
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  {title}
                </button>
              ))}
            </aside>
          )}
        </div>
      </M.ToastProvider>
    </M.MtoneProvider>
  );
}
