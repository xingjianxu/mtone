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

export default function Demo() {
  const [value, setValue] = useState<CascaderPath>([]);
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 560 }}>
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
    </div>
  );
}
