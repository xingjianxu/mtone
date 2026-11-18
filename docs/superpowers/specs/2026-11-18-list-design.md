# List 数据列表增强

保留现有 `<List><ListItem /></List>` 与 DocumentList 用法，在同一组件增加数据模式。

选择复用原生 ul/li 语义、自有轻量窗口化逻辑，不引入其他 UI 库，不改变既有内容布局。相比仅扩展示例，组件本身承担分组、可变高度测量、滚动定位与边界回调；相比整体替换旧 List，保留现有 API 和样式。

数据模式使用 items、getKey、renderItem（内容而非 li）；支持 groupBy/renderGroup、stickyGroups、height、contentWidth、virtual、estimatedItemHeight、overscan、onEndReached、loading/emptyContent。ref 提供元素与 scrollTo（像素、索引、key、group）。窗口化使用估算与 ResizeObserver 测量，不承诺未挂载行的精确高度；内容变动重新测量，稳定 key 保持测量缓存。

保持 mtone 紧凑样式、灰色 hover、浅蓝 1px 焦点。外部数据受控；不内置网络请求或排序库。提供富内容、1 万行、分组吸顶、横向滚动、加载更多与受控排序（拖放及键盘可用按钮）示例。排序不会改变 items。
