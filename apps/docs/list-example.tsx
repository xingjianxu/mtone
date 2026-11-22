import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  List,

  ListItem,
  Tag,
  type ListHandle,
} from "../../packages/mtone/src";
import ListSortingDemo from "./secondary-demos/list-sorting";
const records = Array.from({ length: 10000 }, (_, id) => ({
  id,
  title: `记录 ${id + 1}`,
  group: `分组 ${Math.floor(id / 100) + 1}`,
}));
const getKey = (item: (typeof records)[number]) => item.id;
const groupBy = (item: (typeof records)[number]) => item.group;
export function ListExample({ compact = false }: { compact?: boolean }) {
  const ref = useRef<ListHandle>(null);
  const [count, setCount] = useState(30);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  if (compact)
    return (
      <List>
        <ListItem description="保持既有用法">设计规范</ListItem>
        <ListItem>研究笔记</ListItem>
      </List>
    );
  return (
    <div className="demo-stack" style={{ width: "100%", minWidth: 0 }}>
      <h3>基础与富内容</h3>
      <List aria-label="基础列表">
        <ListItem
          description="现有 children 和 ListItem 继续可用"
          actions={<Tag>文档</Tag>}
        >
          设计规范
        </ListItem>
        <ListItem description="用 actions 组合按钮">研究笔记</ListItem>
      </List>
      <List
        aria-label="富内容列表"
        items={records.slice(0, 3)}
        getKey={getKey}
        renderItem={(item, index) => (
          <div>
            <strong>{item.title}</strong>
            <p style={{ margin: "4px 0" }}>
              {"列表项可以有不同的内容高度。".repeat(index + 1)}
            </p>
            <Button size="sm">查看详情</Button>
          </div>
        )}
      />
      <h3>一万条记录：虚拟滚动与定位</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button onClick={() => ref.current?.scrollTo({ key: 4999 })}>
          跳至第 5000 条
        </Button>
        <Button onClick={() => ref.current?.scrollTo(0)}>回到顶部</Button>
      </div>
      <List
        ref={ref}
        aria-label="虚拟列表"
        tabIndex={0}
        items={records}
        getKey={getKey}
        renderItem={(item) => item.title}
        height={240}
        virtual
        estimatedItemHeight={36}
      />
      <h3>可变行高</h3>
      <Button onClick={() => setExpanded((value) => !value)}>
        切换首行高度
      </Button>
      <List
        aria-label="可变行高列表"
        items={records.slice(0, 100)}
        getKey={getKey}
        height={160}
        virtual
        overscan={5}
        renderItem={(item) => (
          <div style={{ minHeight: item.id === 0 && expanded ? 100 : 18 }}>
            {item.title}
          </div>
        )}
      />
      <h3>分组与吸顶</h3>
      <List
        aria-label="分组列表"
        tabIndex={0}
        items={records.slice(0, 400)}
        getKey={getKey}
        groupBy={groupBy}
        stickyGroups
        renderGroup={(key, items) => (
          <span>
            {key} · {items.length} 条
          </span>
        )}
        height={200}
        virtual
        renderItem={(item) => item.title}
      />
      <h3>横向滚动</h3>
      <List
        aria-label="横向列表"
        items={records.slice(0, 100)}
        getKey={getKey}
        height={160}
        virtual
        contentWidth={900}
        renderItem={(item) => (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr",
              gap: 24,
            }}
          >
            <span>{item.title}</span>
            <span>项目资料与长内容展示</span>
            <span>已归档</span>
          </div>
        )}
      />
      <h3>滚动加载更多</h3>
      <p>示例最多加载 90 条；加载中和已通知状态不会重复请求。</p>
      <List
        aria-label="增量列表"
        tabIndex={0}
        items={records.slice(0, count)}
        getKey={getKey}
        height={180}
        virtual
        renderItem={(item) => item.title}
        loading={loading}
        onEndReached={
          count < 90
            ? () => {
                setLoading(true);
                timer.current = setTimeout(() => {
                  setCount((n) => Math.min(n + 30, 90));
                  setLoading(false);
                }, 400);
              }
            : undefined
        }
      />
      <small role="status">已加载 {count} 条</small>
      <h3>受控排序</h3>
      <ListSortingDemo />
      <h3>空状态与加载状态</h3>
      <List items={[]} emptyContent="暂无记录" />
      <List items={[]} loading />
    </div>
  );
}
