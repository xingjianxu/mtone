import { useState } from "react";
import {
  CascaderPanel,
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
      <CascaderPanel
        aria-label="地区面板"
        options={options}
        multiple
        searchable
      />
      <small>
        上下键切换同级，左右键进入或返回层级，Enter / 空格选择；弹层可用 Escape
        关闭。
      </small>
    </div>
  );
}
