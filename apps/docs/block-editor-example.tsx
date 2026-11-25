import React from "react";
import { Button, Dialog, Switch } from "@bixlab/mtone";
import {
  BlockEditor,
  type BlockEditorBlock,
  type BlockEditorInput,
} from "@bixlab/mtone-blockeditor";
import "@bixlab/mtone-blockeditor/styles.css";
import flowImage from "./block-editor-image.svg?no-inline";

const initialContent: readonly BlockEditorInput[] = [
  { type: "heading", props: { level: 1 }, content: "产品发布周记" },
  {
    type: "paragraph",
    content:
      "这里是一篇可直接编辑的文档。输入 / 添加块，或选择正文后调整样式。",
  },
  { type: "heading", props: { level: 2 }, content: "发布前检查" },
  { type: "checkListItem", props: { checked: true }, content: "整理本周变更" },
  { type: "checkListItem", content: "核对文档和演示" },
  { type: "quote", content: "先把关键信息写清楚。" },
];

export default function BlockEditorExample() {
  const [readOnly, setReadOnly] = React.useState(false);
  const [borderless, setBorderless] = React.useState(false);
  const [saved, setSaved] =
    React.useState<readonly BlockEditorInput[]>(initialContent);
  const [copy, setCopy] = React.useState(0);
  const draft = React.useRef<readonly BlockEditorInput[]>(initialContent);
  const update = (blocks: BlockEditorBlock[]) => {
    draft.current = blocks;
  };
  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: 10 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <Switch
          label="只读预览"
          checked={readOnly}
          onCheckedChange={setReadOnly}
        />
        <Switch
          label="无边框"
          checked={borderless}
          onCheckedChange={setBorderless}
        />
        <Button
          type="button"
          onClick={() => {
            setSaved(draft.current);
            setCopy(copy + 1);
          }}
        >
          保留当前草稿
        </Button>
        <Dialog
          title="草稿快照"
          trigger={<Button type="button">打开草稿快照</Button>}
        >
          <BlockEditor
            documentKey={copy}
            initialContent={saved}
            label="草稿正文"
          />
        </Dialog>
      </div>
      <BlockEditor
        label="发布周记正文"
        initialContent={initialContent}
        onChange={update}
        readOnly={readOnly}
        borderless={borderless}
      />
    </div>
  );
}

const richerContent: readonly BlockEditorInput[] = [
  {
    type: "heading",
    props: { level: 3 },
    content: "提交前检查",
  },
  {
    type: "paragraph",
    content: [
      { type: "text", text: "运行 ", styles: {} },
      { type: "text", text: "npm run build", styles: { code: true } },
      {
        type: "text",
        text: "，并核对发布清单。",
        styles: { textColor: "blue", backgroundColor: "teal" },
      },
    ],
  },
  {
    type: "table",
    content: {
      type: "tableContent",
      headerRows: 1,
      rows: [{ cells: ["检查项", "状态"] }, { cells: ["文档", "已更新"] }],
    },
  },
  {
    type: "codeBlock",
    props: { language: "typescript" },
    content: "const release = { ready: true };\nconsole.log(release);",
  },
  { type: "divider" },
  {
    type: "toggleListItem",
    content: "展开发布记录",
    children: [{ type: "paragraph", content: "文档与构建产物已经核对。" }],
  },
  {
    type: "callout",
    props: { tone: "tip" },
    content: "正式发布前，从干净项目安装一次。",
  },
];

export function BlockEditorFormatsExample() {
  const [readOnly, setReadOnly] = React.useState(false);
  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: 10 }}>
      <Switch label="仅阅读" checked={readOnly} onCheckedChange={setReadOnly} />
      <BlockEditor
        label="格式示例正文"
        initialContent={[
          ...richerContent,
          {
            type: "image",
            props: {
              url: new URL(flowImage, window.location.href).href,
              alt: "草稿、审核、发布的流程图",
              caption: "发布流程",
            },
          },
        ]}
        readOnly={readOnly}
      />
    </div>
  );
}

export function BlockEditorMediaExample() {
  const [readOnly, setReadOnly] = React.useState(false);
  const asset = (filename: string) =>
    new URL(
      `${import.meta.env.BASE_URL}block-editor-media/${filename}`,
      window.location.href,
    ).href;
  return (
    <div style={{ inlineSize: "100%", display: "grid", gap: 10 }}>
      <Switch
        label="媒体只读预览"
        checked={readOnly}
        onCheckedChange={setReadOnly}
      />
      <BlockEditor
        label="媒体块示例正文"
        initialContent={[
          {
            type: "video",
            props: {
              url: asset("sample.webm"),
              caption: "两秒测试画面",
              width: 75,
            },
          },
          {
            type: "audio",
            props: { url: asset("chime.mp3"), caption: "发布提示音" },
          },
          {
            type: "file",
            props: {
              url: asset("release-notes.txt"),
              name: "发布清单.txt",
              caption: "文本附件",
            },
          },
          { type: "paragraph", content: "在此输入 / 插入更多内容。" },
        ]}
        readOnly={readOnly}
      />
    </div>
  );
}
