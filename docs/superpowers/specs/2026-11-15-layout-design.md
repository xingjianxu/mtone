# Layout 设计

用户已批准桌面设计图并要求 Ant Design 风格组合 API，复用已有组件。
采用 Layout + Layout.Sider/Header/Content/Footer；不采用固定业务 AppShell，因为需要自由嵌套与配置。

- 左列顶部 logo 与收起按钮，下方复用 Sidebar/NavGroup/NavItem；右列 Header 左 Breadcrumb、右 actions，下方 Content。
- Layout.Sider 直接复用 Sidebar 状态/上下文/Tooltip，扩展 Sidebar header 插槽，不重写导航逻辑。
- 默认宽度 240px、收起 52px、Header 64px，为实现者选择。Content 与侧栏内容独立滚动，外层 fullHeight 使用 100dvh，也可指定有限高度嵌入。
- breakpoint 可选数字 px；开启后小于阈值请求收起，恢复宽屏请求展开；受控模式仍由父组件决定。移动端采用窄栏，不另造抽屉。
- collapsed/defaultCollapsed/onCollapsedChange 沿用 Sidebar 约定；宽度至少 40px（本版不支持零宽隐藏）。保留现有 Sidebar 行为。
- Header 支持 breadcrumb 和 extra 插槽，窄屏换行；所有语义区域可命名，已有蓝色焦点提示保留。
- 不内置路由、持久化、业务菜单、主题模式切换。示例动作只更新本地预览。
