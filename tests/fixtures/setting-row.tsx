import React from "react";
import { createRoot } from "react-dom/client";
import { MtoneProvider } from "../../packages/mtone/src";
import SettingRowUsage from "../../apps/docs/inline-demos/setting-row-usage";
import "../../packages/mtone/dist/styles.css";

createRoot(document.getElementById("root")!).render(
  <MtoneProvider theme="system" locale="zh"><SettingRowUsage /></MtoneProvider>,
);
