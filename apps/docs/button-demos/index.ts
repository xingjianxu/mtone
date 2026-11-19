import Demo0 from "./usage";
import source0 from "./usage.tsx?raw";
import Demo1 from "./danger";
import source1 from "./danger.tsx?raw";
import Demo2 from "./button-state";
import source2 from "./button-state.tsx?raw";
import Demo3 from "./button-blue";
import source3 from "./button-blue.tsx?raw";

export const buttonDocSections = [
  {
    id: "usage",
    title: "外观",
    Demo: Demo0,
    source: source0.replace("../../../packages/mtone/src", "@bixlab/mtone"),
  },
  {
    id: "danger",
    title: "危险操作",
    Demo: Demo1,
    source: source1.replace("../../../packages/mtone/src", "@bixlab/mtone"),
  },
  {
    id: "button-state",
    title: "加载与禁用",
    Demo: Demo2,
    source: source2.replace("../../../packages/mtone/src", "@bixlab/mtone"),
  },
  {
    id: "button-blue",
    title: "蓝色按钮",
    Demo: Demo3,
    source: source3.replace("../../../packages/mtone/src", "@bixlab/mtone"),
  },
];
