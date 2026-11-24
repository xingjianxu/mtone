import React from "react";
import { Button, Dialog, Switch } from "@bixlab/mtone";
import {
  BlockEditor,
  type BlockEditorBlock,
  type BlockEditorInput,
} from "@bixlab/mtone-blocknote";
import "@bixlab/mtone-blocknote/styles.css";

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
        <Switch label="只读预览" checked={readOnly} onCheckedChange={setReadOnly} />
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
      />
    </div>
  );
}
