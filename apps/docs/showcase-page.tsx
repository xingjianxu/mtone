import React from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { MtoneProvider } from "../../packages/mtone/src";
import { AppShowcase } from "./app-showcase";
import "./showcase-page.css";

export function ShowcasePage() {
  return <MtoneProvider><div className="showcase-page">
    <header className="showcase-page-header"><span><BookOpen size={17} aria-hidden="true" /> mtone / App Showcase</span><a href="./index.html#/gallery"><ArrowLeft size={14} aria-hidden="true" />返回组件文档</a></header>
    <main className="showcase-page-main" aria-label="独立应用示例"><AppShowcase /></main>
  </div></MtoneProvider>;
}
