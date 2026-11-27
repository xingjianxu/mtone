import React, { lazy, Suspense } from "react";
import mentionsSource from "./block-editor-mentions-example.tsx?raw";
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

const MentionsExample = lazy(() =>
  import("./block-editor-example").then(({ BlockEditorMentionsExample }) => ({
    default: BlockEditorMentionsExample,
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
  {
    id: "native-extensions",
    title: "原生扩展：异步 @ 提及",
    note: "在正文中输入 @lin，使用方向键和回车，或点击候选。只读预览仍显示已插入的提及。",
    Demo: () => (
      <Suspense fallback={<p role="status">正在加载编辑器…</p>}>
        <MentionsExample />
      </Suspense>
    ),
    source: mentionsSource,
  },
];
