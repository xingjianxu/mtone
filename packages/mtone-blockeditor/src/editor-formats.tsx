import * as React from "react";
import { Button, Input, Select } from "@bixlab/mtone";
import type {
  BlockEditorBlock,
  BlockEditorProps,
  Editor,
} from "./block-editor";
import { safeImageUrl } from "./editor-blocks";

type TableBlock = Extract<BlockEditorBlock, { type: "table" }>;
export type ImageBlock = Extract<BlockEditorBlock, { type: "image" }>;
export type ImageTarget = { anchor: string; image?: ImageBlock };

export function formatActions(editor: Editor, zh: boolean) {
  const focus = (apply: () => void) => () => {
    apply();
    editor.focus();
  };
  const accents = [
    ["default", "默认", "Default"],
    ["neutral", "中性", "Neutral"],
    ["blue", "蓝色", "Blue"],
    ["green", "绿色", "Green"],
    ["orange", "橙色", "Orange"],
    ["red", "红色", "Red"],
    ["purple", "紫色", "Purple"],
    ["teal", "青色", "Teal"],
    ["coral", "珊瑚色", "Coral"],
  ] as const;
  return [
    ...(["textColor", "backgroundColor"] as const).map((style) => ({
      key: style,
      label:
        style === "textColor"
          ? zh
            ? "文字色"
            : "Text color"
          : zh
            ? "高亮色"
            : "Highlight color",
      children: accents.map(([value, chinese, english]) => ({
        key: value,
        label: zh ? chinese : english,
        onSelect: focus(() => editor.addStyles({ [style]: value })),
      })),
    })),
    {
      key: "alignment",
      label: zh ? "对齐方式" : "Alignment",
      children: (
        [
          ["left", "左对齐", "Align left"],
          ["center", "居中", "Align center"],
          ["right", "右对齐", "Align right"],
          ["justify", "两端对齐", "Justify"],
        ] as const
      ).map(([textAlignment, chinese, english]) => ({
        key: textAlignment,
        label: zh ? chinese : english,
        onSelect: focus(() => {
          const blocks = editor.getSelection()?.blocks ?? [
            editor.getTextCursorPosition().block,
          ];
          editor.transact(() => {
            for (const block of blocks) {
              if ("textAlignment" in block.props)
                editor.updateBlock(block, { props: { textAlignment } });
            }
          });
        }),
      })),
    },
  ];
}

const languages = [
  ["text", "Plain text"],
  ["bash", "Bash"],
  ["c", "C"],
  ["cpp", "C++"],
  ["css", "CSS"],
  ["go", "Go"],
  ["html", "HTML"],
  ["java", "Java"],
  ["javascript", "JavaScript"],
  ["json", "JSON"],
  ["jsx", "JSX"],
  ["markdown", "Markdown"],
  ["python", "Python"],
  ["rust", "Rust"],
  ["sql", "SQL"],
  ["tsx", "TSX"],
  ["typescript", "TypeScript"],
  ["yaml", "YAML"],
];

export function CodeControls({
  editor,
  block,
  zh,
  showPreview,
  setShowPreview,
}: {
  editor: Editor;
  block: Extract<BlockEditorBlock, { type: "codeBlock" }>;
  zh: boolean;
  showPreview: boolean;
  setShowPreview: (value: boolean) => void;
}) {
  const options = languages.map(([value, label]) => ({
    value,
    label: value === "text" && zh ? "纯文本" : label,
  }));
  if (!options.some(({ value }) => value === block.props.language))
    options.push({ value: block.props.language, label: block.props.language });
  return (
    <div
      className="mt-block-editor-format-controls"
      role="group"
      aria-label={zh ? "代码块设置" : "Code block settings"}
    >
      <Select
        label={zh ? "代码语言" : "Code language"}
        searchable
        options={options}
        value={block.props.language}
        onValueChange={(language) => {
          if (language && editor.getBlock(block.id))
            editor.updateBlock(block.id, { props: { language } });
        }}
      />
      <Button
        size="small"
        aria-pressed={showPreview}
        onClick={() => setShowPreview(!showPreview)}
      >
        {zh ? "高亮预览" : "Highlight preview"}
      </Button>
    </div>
  );
}

function selectedCell(editor: Editor) {
  const { $from } = editor.prosemirrorState.selection;
  for (let d = $from.depth; d > 1; d--) {
    const role = $from.node(d).type.spec.tableRole;
    if (role === "cell" || role === "header_cell")
      return { row: $from.index(d - 2), column: $from.index(d - 1) };
  }
  return { row: 0, column: 0 };
}

export function TableControls({
  editor,
  block,
  zh,
}: {
  editor: Editor;
  block: TableBlock;
  zh: boolean;
}) {
  type Action =
    "add-row" | "remove-row" | "add-column" | "remove-column" | "header";
  const canResize = (content: TableBlock["content"]) => {
    const width = content.rows[0]?.cells.length;
    return (
      !!width &&
      content.rows.every(
        ({ cells }) =>
          cells.length === width &&
          cells.every(
            (cell) =>
              Array.isArray(cell) ||
              (cell.props.colspan === 1 && cell.props.rowspan === 1),
          ),
      )
    );
  };
  function operate(action: Action) {
    const live = editor.getBlock(block.id);
    if (live?.type !== "table") return;
    const { content } = live;
    if (action === "header") {
      editor.updateBlock(live, {
        content: { ...content, headerRows: content.headerRows ? 0 : 1 },
      });
      editor.focus();
      return;
    }
    if (!canResize(content)) return;
    const width = content.rows[0].cells.length;
    const position = selectedCell(editor);
    const row = Math.min(position.row, content.rows.length - 1);
    const column = Math.min(position.column, width - 1);
    const rows = [...content.rows];
    const columnWidths = Array.from(
      { length: width },
      (_, i) => content.columnWidths[i],
    );
    let { headerRows, headerCols } = content;
    if (action === "add-row")
      rows.splice(row + 1, 0, {
        cells: Array.from({ length: width }, () => []),
      });
    if (action === "remove-row" && rows.length > 1) {
      rows.splice(row, 1);
      if (headerRows && row < headerRows) headerRows--;
    }
    if (action === "add-column" || (action === "remove-column" && width > 1)) {
      for (let i = 0; i < rows.length; i++) {
        const cells: TableBlock["content"]["rows"][number]["cells"][number][] =
          [...rows[i].cells];
        if (action === "add-column") cells.splice(column + 1, 0, []);
        else cells.splice(column, 1);
        // BlockNote returns canonical tableCell objects. New cells can use the shorthand empty array.
        rows[i] = {
          cells: cells.map((cell) =>
            Array.isArray(cell)
              ? {
                  type: "tableCell" as const,
                  props: {
                    colspan: 1,
                    rowspan: 1,
                    backgroundColor: "default",
                    textColor: "default",
                    textAlignment: "left" as const,
                  },
                  content: cell,
                }
              : cell,
          ),
        };
      }
      if (action === "add-column")
        columnWidths.splice(column + 1, 0, undefined);
      else {
        columnWidths.splice(column, 1);
        if (headerCols && column < headerCols) headerCols--;
      }
    }
    editor.updateBlock(live, {
      content: { ...content, rows, columnWidths, headerRows, headerCols },
    });
    editor.focus();
  }
  const rectangular = canResize(block.content);
  return (
    <div
      className="mt-block-editor-format-controls"
      role="group"
      aria-label={zh ? "表格操作" : "Table actions"}
    >
      {(
        [
          ["add-row", "添加行", "Add row", !rectangular],
          [
            "remove-row",
            "删除行",
            "Delete row",
            !rectangular || block.content.rows.length <= 1,
          ],
          ["add-column", "添加列", "Add column", !rectangular],
          [
            "remove-column",
            "删除列",
            "Delete column",
            !rectangular || (block.content.rows[0]?.cells.length ?? 0) <= 1,
          ],
          ["header", "表头行", "Header row", false],
        ] as const
      ).map(([action, chinese, english, disabled]) => (
        <Button
          key={action}
          size="small"
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          aria-pressed={
            action === "header" ? Boolean(block.content.headerRows) : undefined
          }
          onClick={() => operate(action)}
        >
          {zh ? chinese : english}
        </Button>
      ))}
    </div>
  );
}

export function ImageForm({
  editor,
  target,
  zh,
  onClose,
  uploadImage,
}: {
  editor: Editor;
  target: ImageTarget;
  zh: boolean;
  onClose: () => void;
  uploadImage?: BlockEditorProps["uploadImage"];
}) {
  const [url, setUrl] = React.useState(target.image?.props.url ?? "");
  const [alt, setAlt] = React.useState(target.image?.props.alt ?? "");
  const [caption, setCaption] = React.useState(
    target.image?.props.caption ?? "",
  );
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    ref.current?.focus();
  }, []);
  function save() {
    const safe = safeImageUrl(url);
    if (!safe) {
      setError(
        zh
          ? "请输入有效的 HTTP(S) 图片地址。"
          : "Enter a valid HTTP(S) image URL.",
      );
      return;
    }
    const anchor = editor.getBlock(target.anchor);
    if (!anchor) {
      setError(
        zh
          ? "原位置已变更，请重新选择。"
          : "The original block is no longer available.",
      );
      return;
    }
    const props = { url: safe, alt, caption };
    if (target.image && anchor.type === "image")
      editor.updateBlock(anchor, { props });
    else if (anchor.type === "paragraph" && !anchor.content.length)
      editor.updateBlock(anchor, { type: "image", props });
    else editor.insertBlocks([{ type: "image", props }], anchor, "after");
    onClose();
  }
  return (
    <div
      className="mt-block-editor-link"
      role="group"
      aria-label={zh ? "图片设置" : "Image settings"}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)
          return;
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
        if (
          event.key === "Enter" &&
          (event.target as HTMLElement).tagName === "INPUT" &&
          (event.target as HTMLInputElement).type !== "file"
        ) {
          event.preventDefault();
          if (!busy) save();
        }
      }}
    >
      <Input
        ref={ref}
        aria-label={zh ? "图片地址" : "Image URL"}
        value={url}
        onChange={(event) => setUrl(event.target.value)}
      />
      <Input
        aria-label={zh ? "替代文本" : "Alternative text"}
        value={alt}
        onChange={(event) => setAlt(event.target.value)}
      />
      <Input
        aria-label={zh ? "图片说明" : "Caption"}
        value={caption}
        onChange={(event) => setCaption(event.target.value)}
      />
      {uploadImage && (
        <Input
          type="file"
          accept="image/*"
          aria-label={zh ? "上传图片" : "Upload image"}
          disabled={busy}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            event.target.value = "";
            setBusy(true);
            setError("");
            try {
              const uploaded = safeImageUrl(await uploadImage(file));
              if (!uploaded) throw new Error();
              setUrl(uploaded);
            } catch {
              setError(
                zh
                  ? "上传失败或未返回有效的图片地址。"
                  : "Upload failed or did not return a valid image URL.",
              );
            } finally {
              setBusy(false);
            }
          }}
        />
      )}
      <Button size="small" disabled={busy} onClick={save}>
        {zh ? "应用图片" : "Apply image"}
      </Button>
      <Button size="small" variant="ghost" onClick={onClose}>
        {zh ? "取消" : "Cancel"}
      </Button>
      {error && <small role="alert">{error}</small>}
    </div>
  );
}
