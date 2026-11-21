import Demo0 from "./usage";
import source0 from "./usage.tsx?raw";
import Demo1 from "./danger";
import source1 from "./danger.tsx?raw";
import Demo2 from "./button-state";
import source2 from "./button-state.tsx?raw";
import Demo3 from "./button-blue";
import source3 from "./button-blue.tsx?raw";
import SectionsDemo from "./button-sections";
import sectionsSource from "./button-sections.tsx?raw";

import IconOnlyDemo from "./icon-only";
import iconOnlySource from "./icon-only.tsx?raw";

import ToggleDemo from "./button-toggle";
import toggleSource from "./button-toggle.tsx?raw";

export const buttonDocSections = [
  {
    id: "usage",
    title: "外观",
    Demo: Demo0,
    source: source0.replace("../../../packages/mtone/src", "@bixlab/mtone"),
  },
  {
    id: "icon-only",
    title: "纯图标按钮",
    note: "使用 iconOnly 获得等宽高按钮，并通过 aria-label 或 aria-labelledby 提供明确的操作名称。IconButton 仍作为兼容导出。",
    Demo: IconOnlyDemo,
    source: iconOnlySource.replace("../../../packages/mtone/src", "@bixlab/mtone"),
  },
  {
    id: "button-toggle",
    title: "开关按钮",
    description:
      "保持按钮名称不变，以背景或图标显示按下状态。图标示例包括收藏、受控置顶与自定义书签。",
    Demo: ToggleDemo,
    source: toggleSource.replace(
      "../../../packages/mtone/src",
      "@bixlab/mtone",
    ),
  },
  {
    id: "button-sections",
    title: "左右内容",
    Demo: SectionsDemo,
    source: sectionsSource.replace(
      "../../../packages/mtone/src",
      "@bixlab/mtone",
    ),
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
