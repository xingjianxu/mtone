import { useCallback, useRef, useState } from "react";
import {
  Button,
  TableOfContents,
  type TableOfContentsHandle,
} from "../../../packages/mtone/src";

export default function Demo() {
  const compact = false;
  const article = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const contents = useRef<TableOfContentsHandle>(null);
  const getArticle = useCallback(() => article.current, []);
  const getScroller = useCallback(() => scroller.current, []);
  const [extra, setExtra] = useState(false);
  const [subtle, setSubtle] = useState(false);
  const [observe, setObserve] = useState(true);
  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <div style={{ width: "100%", minWidth: 0 }}>
        {!compact && (
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <Button onClick={() => setExtra((value) => !value)}>
              {extra ? "移除章节" : "追加章节"}
            </Button>
            <Button onClick={() => setSubtle((value) => !value)}>
              切换目录样式
            </Button>
            <Button onClick={() => setObserve((value) => !value)}>
              {observe ? "关闭自动刷新" : "启用自动刷新"}
            </Button>
            <Button onClick={() => contents.current?.refresh()}>
              手动刷新
            </Button>
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <TableOfContents
            ref={contents}
            root={getArticle}
            scrollContainer={getScroller}
            offset={12}
            variant={subtle ? "subtle" : "default"}
            observe={observe}
            emptyContent="暂无标题"
            style={{ flex: "0 1 160px", minWidth: 120 }}
          />
          <div
            ref={scroller}
            tabIndex={0}
            aria-label="示例文章滚动区域"
            style={{
              height: compact ? 200 : 320,
              overflowY: "auto",
              flex: "1 1 200px",
              minWidth: 0,
              border: "1px solid var(--mt-border)",
              borderRadius: 6,
              padding: "0 16px",
            }}
          >
            <article ref={article}>
              <h2>快速开始</h2>
              <p>
                目录自动采集这篇文章中的标题，不干扰文档网站自身的导航。滚动文章或点击左侧目录查看活动项变化。
              </p>
              <h3>安装与引入</h3>
              <p style={{ marginBottom: 80 }}>
                引入组件及 mtone 样式即可使用，无需额外依赖。
              </p>
              <h2>滚动与偏移</h2>
              <p style={{ marginBottom: 80 }}>
                本例使用独立滚动容器，顶部保留 12px。页面滚动时省略
                scrollContainer 即可。
              </p>
              <h3>动态内容</h3>
              <p style={{ marginBottom: 80 }}>
                默认自动更新 DOM
                中新增、删除或更改的标题。关闭自动刷新后，可点击手动刷新。
              </p>
              {extra && (
                <>
                  <h2>新增章节</h2>
                  <p style={{ marginBottom: 80 }}>
                    动态加入的章节也会出现在目录中。
                  </p>
                </>
              )}
              <h2>使用建议</h2>
              <p style={{ marginBottom: 240 }}>
                为需要分享的标题提供稳定 id；普通点击不会改变网站 hash 路由。
              </p>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
