import React from "react";
import { createRoot } from "react-dom/client";
import { PageLayout, Sidebar, Splitter } from "../../packages/mtone/src";
import "../../packages/mtone/dist/styles.css";

const query = new URLSearchParams(location.search);
const mode = query.get("mode");
const narrow = query.has("narrow");
const controlled = query.has("controlled");
const changed = query.has("changed");

createRoot(document.getElementById("root")!).render(
  mode === "sidebar" ? (
    <div style={{ width: 840 }}>
      <PageLayout title="Page" sidebarResize={{ defaultWidth: 240, storageKey: "page" }}
        sidebar={<Sidebar storageKey="page-nav" collapsible>Navigation</Sidebar>}>
        <div style={{ minHeight: 140 }}>Page content</div>
      </PageLayout>
    </div>
  ) : (
    <Splitter storageKey="test-split" sizes={controlled ? ["25%", "75%"] : undefined}
      style={{ width: narrow ? 480 : 720, height: 200 }}>
      <Splitter.Panel id={changed ? "new-left" : "left"} min={80} max={350} defaultSize={160}
        collapsible groupResizeBehavior="preserve-pixel-size" data-testid="left">Left</Splitter.Panel>
      <Splitter.Panel id="right" min={80}>Right</Splitter.Panel>
    </Splitter>
  ),
);
