import React, { lazy, Suspense } from "react";
import editorSource from "./block-editor-example.tsx?raw";
import type { DocSection } from "./doc-section";

const BlockEditorExample = lazy(() => import("./block-editor-example"));

export const blockEditorDocSections: readonly DocSection[] = [
  {
    id: "usage",
    title: "编辑与只读",
    Demo: () => (
      <Suspense fallback={<p role="status">正在加载编辑器…</p>}>
        <BlockEditorExample />
      </Suspense>
    ),
    source: editorSource,
  },
];
