import React, { useState } from "react";
import {
  Cascader,
  CascaderPanel,
  type CascaderOption,
  type CascaderPath,
} from "../../packages/mtone/src";

const options: CascaderOption[] = [
  {
    value: "zhejiang",
    label: "浙江",
    children: [
      {
        value: "hangzhou",
        label: "杭州",
        children: [
          { value: "xihu", label: "西湖区" },
          { value: "binjiang", label: "滨江区" },
        ],
      },
      {
        value: "ningbo",
        label: "宁波",
        children: [{ value: "haishu", label: "海曙区" }],
      },
    ],
  },
  {
    value: "jiangsu",
    label: "江苏",
    children: [
      {
        value: "nanjing",
        label: "南京",
        children: [{ value: "gulou", label: "鼓楼区" }],
      },
      { value: "suzhou", label: "苏州（暂不可选）", disabled: true },
    ],
  },
];
const lazyOptions: CascaderOption[] = [
  { value: "projects", label: "项目", isLeaf: false },
];
async function loadOptions(): Promise<CascaderOption[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    { value: "mtone", label: "mtone" },
    { value: "website", label: "文档站" },
  ];
}
export function CascaderExample({
  compact = false,
  panelOnly = false,
}: {
  compact?: boolean;
  panelOnly?: boolean;
}) {
  const [value, setValue] = useState<CascaderPath>([]);
  if (panelOnly)
    return (
      <CascaderPanel
        aria-label="地区面板"
        options={options}
        multiple
        searchable
      />
    );
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
      <Cascader
        aria-label="地区"
        options={options}
        value={value}
        onValueChange={setValue}
        searchable
        allowClear
        placeholder="选择地区，可搜索完整路径"
      />
      <small>当前路径：{JSON.stringify(value)}</small>
      {!compact && (
        <>
          <h4>多选与父子联动</h4>
          <Cascader
            aria-label="多选地区"
            options={options}
            multiple
            searchable
            allowClear
            defaultValue={[["zhejiang", "hangzhou", "xihu"]]}
          />
          <small>
            选中父节点会勾选其已加载、可用的叶节点；默认将完整选中的子树合并为父级标签。
          </small>
          <h4>任意层级与悬停展开</h4>
          <Cascader
            aria-label="任意层级"
            options={options}
            changeOnSelect
            expandTrigger="hover"
            allowClear
            placeholder="也可以选择省、市"
          />
          <h4>异步加载</h4>
          <Cascader
            aria-label="异步项目"
            options={lazyOptions}
            loadOptions={loadOptions}
            allowClear
          />
          <small>
            展开“项目”后加载。搜索只匹配已加载路径，不会遍历远程数据。
          </small>
          <h4>尺寸、状态与只读</h4>
          <Cascader
            aria-label="小尺寸"
            options={options}
            size="sm"
            placeholder="小尺寸"
          />
          <Cascader
            aria-label="校验错误"
            options={options}
            status="error"
            placeholder="请选择地区"
          />
          <Cascader
            aria-label="只读地区"
            options={options}
            readOnly
            defaultValue={["zhejiang", "hangzhou", "xihu"]}
          />
          <h4>独立面板</h4>
          <CascaderPanel
            aria-label="地区面板"
            options={options}
            multiple
            searchable
          />
          <small>
            上下键切换同级，左右键进入或返回层级，Enter / 空格选择；弹层可用
            Escape 关闭。
          </small>
        </>
      )}
    </div>
  );
}
