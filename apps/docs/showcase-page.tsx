import React from "react";
import { MtoneProvider } from "../../packages/mtone/src";
import { AppShowcase } from "./app-showcase";
import "./showcase-page.css";

export function ShowcasePage() {
  return <MtoneProvider><div className="showcase-page">
    <main className="showcase-page-main" aria-label="独立应用示例"><AppShowcase /></main>
  </div></MtoneProvider>;
}
