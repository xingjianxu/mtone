import * as React from "react";
import { Button, Select } from "@bixlab/mtone";
import { useEditorState } from "@blocknote/react";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowLeft,
  ArrowLeftToLine,
  ArrowRight,
  ArrowRightToLine,
  ArrowUp,
  ArrowUpToLine,
  ChevronDown,
  Columns2,
  PanelTop,
  Rows2,
  Trash2,
} from "lucide-react";
import { EditorToolbarMenu } from "./editor-toolbar-menu";
import type { BlockEditorBlock, Editor } from "./block-editor";

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

type TableAxis = "row" | "column";
type TableAction =
  "insert-before" | "insert-after" | "move-before" | "move-after" | "remove";
type TableContent = TableBlock["content"];
const emptyCell = () => ({
  type: "tableCell" as const,
  props: {
    colspan: 1,
    rowspan: 1,
    backgroundColor: "default",
    textColor: "default",
    textAlignment: "left" as const,
  },
  content: [],
});

function rectangularWidth(content: TableContent) {
  const width = content.rows[0]?.cells.length ?? 0;
  return content.rows.every(
    ({ cells }) =>
      cells.length === width &&
      cells.every(
        (cell) =>
          Array.isArray(cell) ||
          (cell.props.colspan === 1 && cell.props.rowspan === 1),
      ),
  )
    ? width
    : 0;
}

// Reorders or resizes one axis without touching marks, widths on the other
// axis, or unrelated content. Header counts describe the leading positions.
function editAxis<T>(
  values: T[],
  index: number,
  action: TableAction,
  empty: () => T,
) {
  if (action === "insert-before" || action === "insert-after") {
    values.splice(index + Number(action === "insert-after"), 0, empty());
  } else if (action === "remove") {
    values.splice(index, 1);
  } else {
    const [moved] = values.splice(index, 1);
    values.splice(index + (action === "move-before" ? -1 : 1), 0, moved);
  }
}

function canEditAxis(action: TableAction, index: number, count: number) {
  return action === "remove"
    ? count > 1
    : action === "move-before"
      ? index > 0
      : action === "move-after"
        ? index + 1 < count
        : true;
}

const tableAxes = [
  [
    "row",
    "行操作",
    "Row actions",
    Rows2,
    [
      ["insert-before", "向上添加行", "Add row above", ArrowUpToLine],
      ["insert-after", "向下添加行", "Add row below", ArrowDownToLine],
      ["move-before", "上移行", "Move row up", ArrowUp],
      ["move-after", "下移行", "Move row down", ArrowDown],
      ["remove", "删除行", "Delete row", Trash2],
    ],
  ],
  [
    "column",
    "列操作",
    "Column actions",
    Columns2,
    [
      ["insert-before", "向左添加列", "Add column left", ArrowLeftToLine],
      ["insert-after", "向右添加列", "Add column right", ArrowRightToLine],
      ["move-before", "左移列", "Move column left", ArrowLeft],
      ["move-after", "右移列", "Move column right", ArrowRight],
      ["remove", "删除列", "Delete column", Trash2],
    ],
  ],
] as const;

export function TableControls({
  editor,
  block,
  zh,
  onMenuOpenChange,
}: {
  editor: Editor;
  block: TableBlock;
  zh: boolean;
  onMenuOpenChange: (open: boolean) => void;
}) {
  const surface = React.useRef<HTMLDivElement>(null);
  const [menu, setMenu] = React.useState<TableAxis>();
  const cell = useEditorState({
    editor,
    selector: ({ editor: current }) => selectedCell(current),
  });
  const width = rectangularWidth(block.content);
  React.useEffect(() => {
    onMenuOpenChange(Boolean(menu));
    return () => onMenuOpenChange(false);
  }, [menu, onMenuOpenChange]);

  function operate(axis: TableAxis, action: TableAction) {
    const live = editor.getBlock(block.id);
    if (
      live?.type !== "table" ||
      editor.getTextCursorPosition().block.id !== live.id
    )
      return;
    const { content } = live;
    const width = rectangularWidth(content);
    if (!width) return;
    const count = axis === "row" ? content.rows.length : width;
    const index = Math.min(selectedCell(editor)[axis], count - 1);
    if (!canEditAxis(action, index, count)) return;
    const rows = [...content.rows];
    let { headerRows, headerCols, columnWidths } = content;
    const headerCount = axis === "row" ? headerRows : headerCols;
    let nextHeaders = headerCount;
    if (headerCount) {
      if (action === "remove" && index < headerCount)
        nextHeaders = headerCount - 1;
      if (action === "insert-before" && index < headerCount)
        nextHeaders = headerCount + 1;
      if (action === "insert-after" && index + 1 < headerCount)
        nextHeaders = headerCount + 1;
    }
    if (axis === "row") {
      editAxis(rows, index, action, () => ({
        cells: Array.from({ length: width }, emptyCell),
      }));
      headerRows = nextHeaders;
    } else {
      for (let i = 0; i < rows.length; i++) {
        const cells: TableContent["rows"][number]["cells"][number][] = [
          ...rows[i].cells,
        ];
        editAxis(cells, index, action, emptyCell);
        rows[i] = {
          ...rows[i],
          cells: cells.map((cell) =>
            Array.isArray(cell) ? { ...emptyCell(), content: cell } : cell,
          ),
        };
      }
      columnWidths = Array.from({ length: width }, (_, i) => columnWidths[i]);
      editAxis(columnWidths, index, action, () => undefined);
      headerCols = nextHeaders;
    }
    editor.updateBlock(live, {
      content: { ...content, rows, columnWidths, headerRows, headerCols },
    });
    editor.focus();
  }

  const headerLabel = zh ? "表头行" : "Header row";
  return (
    <div
      ref={surface}
      className="mt-block-editor-format-controls mt-block-editor-table-actions"
      role="group"
      aria-label={zh ? "表格操作" : "Table actions"}
    >
      {tableAxes.map(([axis, chinese, english, Icon, actions]) => {
        const name = zh ? chinese : english;
        const count = axis === "row" ? block.content.rows.length : width;
        const index = Math.min(cell?.[axis] ?? 0, count - 1);
        return (
          <EditorToolbarMenu
            key={axis}
            surface={surface}
            label={name}
            open={menu === axis}
            setOpen={(open) => {
              setMenu((current) =>
                open ? axis : current === axis ? undefined : current,
              );
            }}
            onEscape={() => editor.focus()}
            trigger={{
              "aria-label": name,
              title: name,
              disabled: !width,
              leftSection: <Icon size={15} aria-hidden />,
              rightSection: <ChevronDown size={12} aria-hidden />,
              children: zh
                ? axis === "row"
                  ? "行"
                  : "列"
                : axis === "row"
                  ? "Row"
                  : "Column",
            }}
            items={actions.map(([action, zhLabel, enLabel, ActionIcon]) => ({
              key: action,
              label: zh ? zhLabel : enLabel,
              icon: <ActionIcon size={14} aria-hidden />,
              danger: action === "remove",
              disabled: !canEditAxis(action, index, count),
              onSelect: () => operate(axis, action),
            }))}
          />
        );
      })}
      <Button
        size="small"
        variant="ghost"
        iconOnly
        title={headerLabel}
        aria-label={headerLabel}
        aria-pressed={Boolean(block.content.headerRows)}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          const live = editor.getBlock(block.id);
          if (live?.type !== "table") return;
          editor.updateBlock(live, {
            content: {
              ...live.content,
              headerRows: live.content.headerRows ? 0 : 1,
            },
          });
          editor.focus();
        }}
      >
        <PanelTop size={15} aria-hidden />
      </Button>
    </div>
  );
}
