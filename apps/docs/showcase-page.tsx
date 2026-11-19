import React from "react";
import { MtoneProvider } from "../../packages/mtone/src";
import { AppShowcase } from "./app-showcase";
import { ThemeSelect, type ThemePreference } from "./theme-preference";
import "./showcase-page.css";

export function ShowcasePage({ preference }: { preference: ThemePreference }) {
  return (
    <MtoneProvider theme={preference.theme}>
      <div className="showcase-page">
        <main className="showcase-page-main" aria-label="独立应用示例">
          <AppShowcase toolbarExtra={<ThemeSelect {...preference} />} />
        </main>
      </div>
    </MtoneProvider>
  );
}
