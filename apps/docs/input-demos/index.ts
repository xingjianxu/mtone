import Demo0 from "./input-clear";
import source0 from "./input-clear.tsx?raw";
import Demo1 from "./input-sizes";
import source1 from "./input-sizes.tsx?raw";
import Demo2 from "./input-variants";
import source2 from "./input-variants.tsx?raw";
import Demo3 from "./input-status";
import source3 from "./input-status.tsx?raw";
import Demo4 from "./input-search-submit";
import source4 from "./input-search-submit.tsx?raw";
import Demo5 from "./input-search-loading";
import source5 from "./input-search-loading.tsx?raw";
import Demo6 from "./input-password";
import source6 from "./input-password.tsx?raw";
import Demo7 from "./input-textarea";
import source7 from "./input-textarea.tsx?raw";
import Demo8 from "./input-otp";
import source8 from "./input-otp.tsx?raw";
import Demo9 from "./input-form";
import source9 from "./input-form.tsx?raw";

export const inputDocSections = [
  {
    id: "usage",
    title: "基础输入",
    children: [
      {
        id: "input-clear",
        title: "前后缀与清除",
        Demo: Demo0,
        source: source0.replace("../../../packages/mtone/src", "@bixlab/mtone"),
      },
      {
        id: "input-sizes",
        title: "尺寸",
        Demo: Demo1,
        source: source1.replace("../../../packages/mtone/src", "@bixlab/mtone"),
      },
      {
        id: "input-variants",
        title: "外观",
        Demo: Demo2,
        source: source2.replace("../../../packages/mtone/src", "@bixlab/mtone"),
      },
      {
        id: "input-status",
        title: "校验与禁用",
        Demo: Demo3,
        source: source3.replace("../../../packages/mtone/src", "@bixlab/mtone"),
      },
    ],
  },
  {
    id: "input-search",
    title: "Input.Search",
    children: [
      {
        id: "input-search-submit",
        title: "提交搜索",
        Demo: Demo4,
        source: source4.replace("../../../packages/mtone/src", "@bixlab/mtone"),
      },
      {
        id: "input-search-loading",
        title: "加载中",
        Demo: Demo5,
        source: source5.replace("../../../packages/mtone/src", "@bixlab/mtone"),
      },
    ],
  },
  {
    id: "input-password",
    title: "Input.Password",
    Demo: Demo6,
    source: source6.replace("../../../packages/mtone/src", "@bixlab/mtone"),
  },
  {
    id: "input-textarea",
    title: "Input.TextArea",
    Demo: Demo7,
    source: source7.replace("../../../packages/mtone/src", "@bixlab/mtone"),
  },
  {
    id: "input-otp",
    title: "Input.OTP",
    Demo: Demo8,
    source: source8.replace("../../../packages/mtone/src", "@bixlab/mtone"),
  },
  {
    id: "input-form",
    title: "表单集成",
    Demo: Demo9,
    source: source9.replace("../../../packages/mtone/src", "@bixlab/mtone"),
  },
];
