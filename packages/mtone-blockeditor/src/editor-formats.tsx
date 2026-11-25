import * as React from "react";
import { Button, Select } from "@bixlab/mtone";
import { ArrowDownToLine, ArrowRightToLine, PanelTop, Rows2, Columns2 } from "lucide-react";
import type {
  BlockEditorBlock,
  Editor,
} from "./block-editor";

type TableBlock = Extract<BlockEditorBlock, { type: "table" }>;

export function formatActions(editor: Editor, zh: boolean) {
  const focus = (apply: () => void) => () => {
    apply();
    editor.focus();
  };
  return [
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
  onLanguageOpenChange,
}: {
  editor: Editor;
  block: Extract<BlockEditorBlock, { type: "codeBlock" }>;
  zh: boolean;
  showPreview: boolean;
  setShowPreview: (value: boolean) => void;
  onLanguageOpenChange: (open: boolean) => void;
}) {
  const options = languages.map(([value, label]) => ({
    value,
    label: value === "text" && zh ? "纯文本" : label,
  }));
  if (!options.some(({ value }) => value === block.props.language))
    options.push({ value: block.props.language, label: block.props.language });
  return (
    <div
      className="mt-block-editor-format-controls mt-block-editor-table-actions"
      role="group"
      aria-label={zh ? "代码块设置" : "Code block settings"}
    >
      <Select
        label={zh ? "代码语言" : "Code language"}
        searchable
        onOpenChange={onLanguageOpenChange}
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
        onMouseDown={(event) => event.preventDefault()}
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
      className="mt-block-editor-format-controls mt-block-editor-table-actions"
      role="group"
      aria-label={zh ? "表格操作" : "Table actions"}
    >
      {(
        [
          ["add-row", "添加行", "Add row", ArrowDownToLine, !rectangular],
          [
            "remove-row",
            "删除行",
            "Delete row",
            Rows2,
            !rectangular || block.content.rows.length <= 1,
          ],
          ["add-column", "添加列", "Add column", ArrowRightToLine, !rectangular],
          [
            "remove-column",
            "删除列",
            "Delete column",
            Columns2,
            !rectangular || (block.content.rows[0]?.cells.length ?? 0) <= 1,
          ],
          ["header", "表头行", "Header row", PanelTop, false],
        ] as const
      ).map(([action, chinese, english, Icon, disabled]) => (
        <Button
          key={action}
          size="small"
          variant="ghost"
          iconOnly
          title={zh ? chinese : english}
          aria-label={zh ? chinese : english}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          aria-pressed={
            action === "header" ? Boolean(block.content.headerRows) : undefined
          }
          onClick={() => operate(action)}
        >
          <Icon size={15} aria-hidden />
        </Button>
      ))}
    </div>
  );
}
