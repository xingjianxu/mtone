import React, { lazy, Suspense } from "react";
import editorSource from "./block-editor-example.tsx?raw";
import type { DocSection } from "./doc-section";

const BlockEditorExample = lazy(() => import("./block-editor-example"));
const FillHeightExample = lazy(() =>
  import("./block-editor-example").then(({ BlockEditorFillHeightExample }) => ({
    default: BlockEditorFillHeightExample,
  })),
);
const FormatsExample = lazy(() =>
  import("./block-editor-example").then(({ BlockEditorFormatsExample }) => ({
    default: BlockEditorFormatsExample,
  })),
);

const MediaExample = lazy(() =>
  import("./block-editor-example").then(({ BlockEditorMediaExample }) => ({
    default: BlockEditorMediaExample,
  })),
);

const UploadExample = lazy(() =>
  import("./block-editor-example").then(({ BlockEditorUploadExample }) => ({
    default: BlockEditorUploadExample,
  })),
);

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
  {
    id: "fill-height",
    title: "填满父容器",
    Demo: () => (
      <Suspense fallback={<p role="status">正在加载编辑器…</p>}>
        <FillHeightExample />
      </Suspense>
    ),
    source: editorSource,
  },
  {
    id: "formats",
    title: "表格、代码与内容块",
    Demo: () => (
      <Suspense fallback={<p role="status">正在加载编辑器…</p>}>
        <FormatsExample />
      </Suspense>
    ),
    source: editorSource,
  },
  {
    id: "media",
    title: "视频、音频与附件",
    Demo: () => (
      <Suspense fallback={<p role="status">正在加载编辑器…</p>}>
        <MediaExample />
      </Suspense>
    ),
    source: editorSource,
  },
  {
    id: "upload",
    title: "上传与嵌入链接",
    Demo: () => (
      <Suspense fallback={<p role="status">正在加载编辑器…</p>}>
        <UploadExample />
      </Suspense>
    ),
    source: editorSource,
  },
];
