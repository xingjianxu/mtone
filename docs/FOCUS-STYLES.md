# Focus 样式

所有组件使用 `--mt-focus`（默认 `#5378AA`，与 Input 保持一致）。
`--mt-primary` 只控制选中/主操作颜色，不影响焦点色；Provider 的 focus token 也传入 Portal 内容。

- 按钮、链接、选项、标签移除、滑块、分页、树、表格、上传及弹层关闭按钮：键盘焦点使用蓝色轮廓。
- NumberInput / MultiSelect：使用 focus-within 在整个组合输入外显示单个轮廓；内部文本输入不叠加轮廓，步进按钮用内描边避免裁剪。
- 菜单/选项的 Base UI highlighted 状态使用同色内轮廓（含 aria-activedescendant 导航）。
- Input 的错误红色边框保持不变，蓝色焦点轮廓独立显示；不覆盖语义错误色。
- 原生 disabled 不可获得焦点；组合输入禁用时不显示 focus-within 轮廓。原有可聚焦 aria-disabled 控件保持键盘提示行为；新增辅助控件规则会跳过 aria-disabled。
- 文档站自身控件的默认焦点色同样为蓝色，避免全局绿色轮廓污染库演示。

自定义：`<MtoneProvider tokens={{ "--mt-focus": "#5378AA" }}>…</MtoneProvider>`。
