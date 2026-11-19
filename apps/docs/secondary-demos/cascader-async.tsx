import { useState } from "react";
import {
  Cascader,
  type CascaderOption,
  type CascaderPath,
} from "../../../packages/mtone/src";

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

export default function Demo() {
  const [value, setValue] = useState<CascaderPath>([]);
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
      <Cascader
        aria-label="异步项目"
        options={lazyOptions}
        loadOptions={loadOptions}
        allowClear
      />
      <small>展开“项目”后加载。搜索只匹配已加载路径，不会遍历远程数据。</small>
    </div>
  );
}
