# Focus 样式

## 带边框的输入表面

Input、Input.Search、Input.TextArea、Select、MultiSelect、NumberInput、DatePicker、Table 筛选输入及 Spotlight 中复用的 Input，聚焦只改变现有边框颜色为 `#93B4DC`，不修改边框宽度、尺寸或 padding，不显示额外外部蓝圈。

- 原生/单个输入使用 `:focus`，鼠标与键盘一致。
- MultiSelect / NumberInput 用 `:focus-within` 覆盖子输入、下拉按钮、步进按钮、标签移除等获得焦点的情形。
- 错误态保留红色边框；禁用控件不激活聚焦样式。
- forced-colors 下恢复 `Highlight` 系统轮廓，不靠浅蓝色区分焦点。

## 保留独立键盘提示的例外

按钮、链接、checkbox、radio、switch、slider thumb、分页、树、表格选择框、上传文件选择、菜单/选项、分段控件、Tab 及弹层关闭按钮继续使用 `--mt-focus`（默认 `#5378AA`）轮廓，不应用输入外框规则。

MultiSelect 的下拉按钮、chip 与移除按钮，以及 NumberInput 步进按钮继续保留自身键盘焦点提示，用来区分复合字段内具体正在操作的对象；只有输入容器外圈被移除。被裁剪容器内的步进按钮使用内轮廓。

`--mt-primary` 不参与焦点配色。`--mt-focus` 控制上述非输入控件的键盘指示，不改变本次固定的 `#93B4DC` 输入边框。

浏览器回归 `tests/field-focus.browser.mjs` 比较鼠标/键盘状态与原始 bounding box、全部四边 border-width、padding，并检查复合子控件、错误/禁用状态及 forced-colors 回退。
