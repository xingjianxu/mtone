import React from "react";
import {
  BlockEditor,
  type BlockEditorInput,
} from "../../../packages/mtone-blockeditor/src";
import "../../../packages/mtone-blockeditor/src/styles.css";

const content: BlockEditorInput[] = [
  { type: "heading", props: { level: 2 }, content: "项目笔记" },
  { type: "paragraph", content: "在此编辑正文。输入 / 插入新的内容块。" },
  { type: "bulletListItem", content: "整理组件示例" },
];
export default function BlockEditorPreview(props: {
  readOnly: boolean;
  borderless: boolean;
  fillHeight: boolean;
  locale: "zh" | "en";
}) {
  return (
    <BlockEditor label="项目笔记编辑器" initialContent={content} {...props} />
  );
}
