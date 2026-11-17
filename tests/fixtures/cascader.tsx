import React from "react";
import { createRoot } from "react-dom/client";
import {
  MtoneProvider,
  Cascader,
  CascaderPanel,
  CascaderOption,
} from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";
const options: CascaderOption[] = [
  {
    value: "asia",
    label: "Asia",
    children: [
      {
        value: "cn",
        label: "China",
        children: [
          { value: "bj", label: "Beijing" },
          { value: "sh", label: "Shanghai" },
        ],
      },
    ],
  },
  {
    value: "eu",
    label: "Europe",
    children: [{ value: "fr", label: "France" }],
  },
];
createRoot(document.getElementById("root")!).render(
  <MtoneProvider locale="en">
    <main style={{ maxWidth: 340, margin: 12, display: "grid", gap: 16 }}>
      <Cascader aria-label="Location" options={options} allowClear />
      <Cascader aria-label="Search location" options={options} searchable />
      <Cascader aria-label="Multiple" options={options} multiple />
      <CascaderPanel aria-label="Panel" options={options} />
      <button>After</button>
    </main>
  </MtoneProvider>,
);
