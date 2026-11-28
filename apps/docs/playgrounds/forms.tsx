import { useState } from "react";
import { Search, Star } from "lucide-react";
import * as M from "../../../packages/mtone/src";
import {
  choice as c,
  flag as f,
  number as n,
  playground as p,
  sizes,
  text as t,
} from "./frame";

export const choices = [
  { value: "design", label: "设计" },
  { value: "development", label: "开发" },
  { value: "review", label: "审核", disabled: true },
  { value: "release", label: "发布" },
];
const cities = [
  {
    value: "north",
    label: "华北",
    children: [
      { value: "beijing", label: "北京" },
      { value: "huhehaote", label: "呼和浩特" },
    ],
  },
  {
    value: "east",
    label: "华东",
    children: [
      { value: "shanghai", label: "上海" },
      { value: "hangzhou", label: "杭州" },
    ],
  },
];
export const treeItems: M.TreeItem[] = [
  {
    id: "docs",
    label: "项目文档",
    children: [
      { id: "start", label: "快速开始" },
      {
        id: "design",
        label: "组件设计",
        children: [
          { id: "styles", label: "样式规范" },
          { id: "accessibility", label: "可访问性指南与跨平台组件验证清单" },
        ],
      },
    ],
  },
  {
    id: "archive",
    label: "归档",
    children: [{ id: "archive-2025", label: "往年记录" }],
  },
  { id: "release", label: "发布记录" },
];
const variant = c("外观", "outlined", [
  "outlined",
  "filled",
  "borderless",
  "underlined",
]);
const state = c("校验状态", "default", ["default", "warning", "error"], true);
const formSize = c("尺寸", "md", sizes);

function FormPreview({
  trigger,
  disabled,
  initial,
}: {
  trigger: "onChange" | "onBlur" | "submit";
  disabled: boolean;
  initial: string;
}) {
  const [result, setResult] = useState("");
  return (
    <M.Form
      initialValues={{ project: initial }}
      validateTrigger={trigger === "submit" ? false : trigger}
      onFinish={(values) => setResult(String(values.project))}
    >
      <M.Fieldset disabled={disabled}>
        <M.Form.Item
          name="project"
          label="项目名称"
          rules={[{ required: true, message: "请填写项目名称" }]}
        >
          <M.Input placeholder="输入项目名称" />
        </M.Form.Item>
        <M.Button type="submit">保存</M.Button>
        <output>{result}</output>
      </M.Fieldset>
    </M.Form>
  );
}

export const formPlaygrounds = {
  Input: p(
    "Input",
    {
      variant,
      controlSize: formSize,
      allowClear: f("可清空", true),
      status: state,
      showCount: f("字数", false, true),
      disabled: f("禁用", false, true),
      readOnly: f("只读", false, true),
      withIcon: f("前缀图标", false, true),
      placeholder: t("占位文本", "输入项目名称", true),
      maxLength: n("最大字符数", 32, 1, 120, true),
    },
    ({ status, withIcon, ...props }) => (
      <M.Input
        defaultValue="组件文档"
        aria-label="示例输入框"
        {...props}
        status={status === "default" ? undefined : status}
        prefix={withIcon && <Search size={14} />}
      />
    ),
  ),
  Form: p(
    "Form",
    {
      trigger: c("校验时机", "onBlur", [
        ["onChange", "输入时"],
        ["onBlur", "失焦时"],
        ["submit", "仅提交"],
      ]),
      disabled: f("禁用表单"),
      initial: t("初始项目名称", "", true),
    },
    (props) => <FormPreview {...props} />,
    { remountOn: ["initial"] },
  ),
  Fieldset: p(
    "Fieldset",
    {
      variant: c("外观", "default", ["default", "filled", "unstyled"]),
      disabled: f("禁用"),
      radius: n("圆角", 6, 0, 24, true),
      legend: t("分组标题", "通知设置", true),
    },
    (props) => (
      <M.Fieldset {...props}>
        <div className="docs-playground-actions">
          <M.Input aria-label="邮箱地址" placeholder="邮箱地址" />
          <M.Checkbox label="启用通知" />
        </div>
      </M.Fieldset>
    ),
  ),
  Checkbox: p(
    "Checkbox",
    {
      initial: f("初始勾选"),
      indeterminate: f("半选"),
      disabled: f("禁用"),
      label: t("标签", "订阅更新", true),
    },
    ({ initial, ...props }) => (
      <M.Checkbox {...props} defaultChecked={initial} />
    ),
    { remountOn: ["initial"] },
  ),
  Switch: p(
    "Switch",
    {
      initial: f("初始开启", true),
      disabled: f("禁用"),
      label: t("标签", "自动保存", true),
    },
    ({ initial, ...props }) => <M.Switch {...props} defaultChecked={initial} />,
    { remountOn: ["initial"] },
  ),
  RadioGroup: p(
    "RadioGroup",
    {
      variant: c("外观", "default", [
        ["default", "单选"],
        ["segmented", "分段"],
      ]),
      orientation: c("方向", "horizontal", ["horizontal", "vertical"]),
      disabled: f("禁用"),
      initial: c(
        "默认选项",
        "design",
        ["design", "development", "release"],
        true,
      ),
    },
    ({ initial, ...props }) => (
      <M.RadioGroup
        label="工作类别"
        options={choices}
        {...props}
        defaultValue={initial}
      />
    ),
    { remountOn: ["initial"] },
  ),
  Select: p(
    "Select",
    {
      mode: c("选择模式", "single", [
        ["single", "单选"],
        ["multiple", "多选"],
        ["tags", "标签"],
      ]),
      search: {
        ...c("搜索方式", "inline", [
          ["none", "关闭"],
          ["inline", "框内"],
          ["popup", "浮层"],
        ]),
        when: (o) => o.mode === "single",
      },
      clearable: f("可清空", true),
      disabled: f("禁用", false, true),
      required: f("必选", false, true),
      popupWidth: {
        ...n("浮层宽度（0 为自动）", 0, 0, 320, true, 20),
        when: (o) => o.mode === "single" && o.search === "popup",
      },
      placeholder: t("占位文本", "选择工作类别", true),
      render: f("自定义选项内容", false, true),
      group: f("选项分组", false, true),
    },
    ({ mode, search, popupWidth, render, group, ...props }) => {
      const common = {
        ...props,
        label: "工作类别",
        options: group
          ? [
              { label: "进行中", options: choices.slice(0, 2) },
              { label: "后续", options: choices.slice(2) },
            ]
          : choices,
        renderOption: render
          ? (option: M.SelectOption) => (
              <>
                <Star size={13} /> {option.label}
              </>
            )
          : undefined,
      };
      if (mode === "single")
        return search === "popup" ? (
          <M.Select
            key="popup"
            {...common}
            searchable="popup"
            popupWidth={popupWidth || undefined}
          />
        ) : (
          <M.Select key="single" {...common} searchable={search === "inline"} />
        );
      return <M.Select key={mode} mode={mode} {...common} />;
    },
  ),
  TagSelect: p(
    "TagSelect",
    {
      selectAll: f("全选按钮", true),
      expandable: f("允许折叠", true),
      disabled: f("禁用"),
      selectAllLabel: t("全选文案", "全部", true),
    },
    (props) => (
      <div style={{ maxWidth: 330 }}>
        <M.TagSelect
          options={[
            ...choices,
            { value: "test", label: "自动化测试" },
            { value: "docs", label: "文档编写" },
            { value: "security", label: "安全评估" },
          ]}
          {...props}
        />
      </div>
    ),
  ),
  Slider: p(
    "Slider",
    {
      disabled: f("禁用"),
      initial: n("起始值", 30, 0, 100),
      step: n("步长", 5, 1, 25, true),
      max: n("上限", 100, 25, 150, true),
      min: n("下限", 0, 0, 24, true),
    },
    ({ initial, ...props }) => (
      <div style={{ width: "min(100%, 22rem)" }}>
        <M.Slider
          label="完成度"
          defaultValue={Math.max(props.min, Math.min(props.max, initial))}
          {...props}
        />
      </div>
    ),
    { remountOn: ["initial", "max", "min"] },
  ),
  NumberInput: p(
    "NumberInput",
    {
      initial: n("起始值", 3, 0, 100),
      step: n("步长", 1, 1, 10),
      disabled: f("禁用"),
      max: n("上限", 12, 1, 100, true),
      min: n("下限", 0, 0, 1, true),
    },
    ({ initial, ...props }) => (
      <M.NumberInput
        label="成员数"
        defaultValue={Math.max(props.min, Math.min(props.max, initial))}
        {...props}
      />
    ),
    { remountOn: ["initial", "min", "max"] },
  ),
  DatePicker: p(
    "DatePicker",
    {
      clearable: f("可清空", true),
      disabled: f("禁用"),
      limit: f("限制日期范围", false, true),
      weekdays: f("禁用周末", false, true),
    },
    ({ limit, weekdays, ...props }) => (
      <M.DatePicker
        label="日期"
        {...props}
        defaultValue="2026-11-18"
        min={limit ? "2026-11-01" : undefined}
        max={limit ? "2026-11-30" : undefined}
        disabledDate={
          weekdays
            ? (date) => [0, 6].includes(new Date(date + "T12:00:00").getDay())
            : undefined
        }
      />
    ),
  ),
  Rate: p(
    "Rate",
    {
      count: n("星标数", 5, 2, 10),
      size: c("尺寸", "medium", ["small", "medium", "large"]),
      allowHalf: f("半颗星", true),
      allowClear: f("可清空", true),
      disabled: f("禁用", false, true),
      keyboard: f("键盘操作", true, true),
      character: c(
        "符号",
        "star",
        [
          ["star", "星标"],
          ["heart", "爱心"],
        ],
        true,
      ),
    },
    ({ character, ...props }) => (
      <M.Rate
        defaultValue={2}
        {...props}
        character={character === "heart" ? "♥" : undefined}
      />
    ),
  ),
  Mentions: p(
    "Mentions",
    {
      prefix: c("触发符", "@", ["@", "#", "@ + #"]),
      size: formSize,
      placement: c("弹出位置", "bottom", ["top", "bottom"]),
      autoSize: f("随内容增高", false, true),
      loading: f("加载中", false, true),
      disabled: f("禁用", false, true),
      readOnly: f("只读", false, true),
    },
    ({ prefix, ...props }) => (
      <M.Mentions
        {...props}
        aria-label="提及成员"
        placeholder="输入 @ 或 # 试试"
        prefix={prefix === "@ + #" ? ["@", "#"] : prefix}
        options={[
          { value: "Lin", label: "林同学" },
          { value: "Xu", label: "徐同学" },
        ]}
      />
    ),
  ),
  AutoComplete: p(
    "AutoComplete",
    {
      size: formSize,
      allowClear: f("可清空", true),
      autoHighlight: f("自动高亮", true),
      backfill: f("键盘回填", false, true),
      loading: f("加载中", false, true),
      placement: c("弹出位置", "bottom", ["top", "bottom"], true),
      popupWidth: n("浮层宽度（0 为自动）", 0, 0, 340, true, 20),
      disabled: f("禁用", false, true),
      status: state,
    },
    ({ popupWidth, status, ...props }) => (
      <M.AutoComplete
        {...props}
        aria-label="城市搜索"
        placeholder="输入 sh 或 be"
        options={[
          { value: "shanghai", label: "上海" },
          { value: "beijing", label: "北京" },
          { value: "shenzhen", label: "深圳" },
        ]}
        popupWidth={popupWidth || undefined}
        status={status === "default" ? undefined : status}
      />
    ),
  ),
  Cascader: p(
    "Cascader",
    {
      multiple: f("多选"),
      searchable: f("可搜索", true),
      expandTrigger: c("展开方式", "click", ["click", "hover"]),
      changeOnSelect: f("任意层可选", false, true),
      disabled: f("禁用", false, true),
      readOnly: f("只读", false, true),
      allowClear: f("可清空", true, true),
    },
    ({ multiple, ...props }) =>
      multiple ? (
        <M.Cascader key="multiple" multiple options={cities} {...props} />
      ) : (
        <M.Cascader key="single" options={cities} {...props} />
      ),
  ),
  CascaderPanel: p(
    "CascaderPanel",
    {
      multiple: f("多选"),
      expandTrigger: c("展开方式", "click", ["click", "hover"]),
      changeOnSelect: f("任意层可选", false, true),
      disabled: f("禁用", false, true),
    },
    ({ multiple, ...props }) =>
      multiple ? (
        <M.CascaderPanel key="multiple" multiple options={cities} {...props} />
      ) : (
        <M.CascaderPanel key="single" options={cities} {...props} />
      ),
  ),
  TreeSelect: p(
    "TreeSelect",
    {
      multiple: f("多选"),
      searchable: f("可搜索", true),
      allowClear: f("可清空", true),
      checkStrictly: {
        ...f("独立勾选", false, true),
        when: (o) => !!o.multiple,
      },
      showCheckedStrategy: {
        ...c("已选显示", "leaf", ["all", "parent", "leaf"], true),
        when: (o) => !!o.multiple,
      },
      maxTagCount: {
        ...n("最多显示标签数", 2, 0, 5, true),
        when: (o) => !!o.multiple,
      },
      disabled: f("禁用", false, true),
    },
    ({
      multiple,
      checkStrictly,
      showCheckedStrategy,
      maxTagCount,
      ...props
    }) =>
      multiple ? (
        <M.TreeSelect
          key="multiple"
          multiple
          items={treeItems}
          {...props}
          checkStrictly={checkStrictly}
          showCheckedStrategy={showCheckedStrategy}
          maxTagCount={maxTagCount}
        />
      ) : (
        <M.TreeSelect key="single" items={treeItems} {...props} />
      ),
  ),
  Transfer: p(
    "Transfer",
    {
      showSearch: f("搜索框", true),
      oneWay: f("单向移动"),
      pagination: f("分页"),
      disabled: f("禁用", false, true),
      loading: f("加载中", false, true),
      showSelectAll: f("全选", true, true),
      height: n("列表高度", 220, 140, 360, true, 10),
    },
    ({ pagination, ...props }) => (
      <M.Transfer
        {...props}
        pagination={pagination && { pageSize: 3 }}
        items={choices.map((o) => ({
          key: o.value,
          label: o.label,
          disabled: o.disabled,
        }))}
      />
    ),
  ),
  CheckCard: p(
    "CheckCard",
    {
      size: formSize,
      multiple: f("多选"),
      bordered: f("边框", true),
      disabled: f("禁用", false, true),
      loading: f("加载中", false, true),
    },
    ({ multiple, ...props }) =>
      multiple ? (
        <M.CheckCard.Group
          key="multiple"
          {...props}
          legend="工作类别"
          multiple
          options={[
            { value: "design", title: "设计", description: "组件与交互" },
            { value: "review", title: "评审", description: "可访问性与一致性" },
          ]}
        />
      ) : (
        <M.CheckCard.Group
          key="single"
          {...props}
          legend="工作类别"
          options={[
            { value: "design", title: "设计", description: "组件与交互" },
            { value: "review", title: "评审", description: "可访问性与一致性" },
          ]}
        />
      ),
  ),
  Upload: p(
    "Upload",
    {
      multiple: f("多文件"),
      disabled: f("禁用"),
      accept: t("文件类型", "", true),
      max: n("大小上限（MB）", 5, 1, 20, true),
    },
    ({ max, ...props }) => (
      <M.Upload
        {...props}
        maxSize={max * 1024 * 1024}
        upload={async (file) => ({ name: file.name })}
      />
    ),
  ),
};
