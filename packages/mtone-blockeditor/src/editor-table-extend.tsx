import * as React from "react";
import { getColspan } from "@blocknote/core";
import { TableHandlesExtension } from "@blocknote/core/extensions";
import {
  TableHandlesController,
  useBlockNoteEditor,
  useExtension,
  useExtensionState,
  type ExtendButtonProps,
} from "@blocknote/react";
import { Button } from "@bixlab/mtone";
import { Plus } from "lucide-react";

const Chinese = React.createContext(false);
const keepSelection = (event: React.MouseEvent) => event.preventDefault();

function ExtendTable({ orientation }: ExtendButtonProps) {
  const zh = React.useContext(Chinese);
  const editor = useBlockNoteEditor();
  const handles = useExtension(TableHandlesExtension);
  const state = useExtensionState(TableHandlesExtension);
  if (!state) return null;
  const row = orientation === "addOrRemoveRows";
  return (
    <Button
      type="button"
      variant="soft"
      size="small"
      iconOnly
      className="mt-block-editor-table-extend"
      data-orientation={row ? "row" : "column"}
      aria-label={
        row
          ? zh
            ? "在表格底部添加行"
            : "Add row to bottom"
          : zh
            ? "在表格右侧添加列"
            : "Add column to right"
      }
      onMouseDown={keepSelection}
      onClick={() => {
        const { block } = state;
        const index =
          (row
            ? block.content.rows.length
            : (block.content.rows[0]?.cells.reduce(
                (width, cell) => width + getColspan(cell),
                0,
              ) ?? 0)) - 1;
        if (index < 0) return;
        handles.addRowOrColumn(
          index,
          row
            ? { orientation: "row", side: "below" }
            : { orientation: "column", side: "right" },
        );
        editor.focus();
      }}
    >
      <Plus size={14} aria-hidden />
    </Button>
  );
}

const NoHandle = () => null;

export function EditorTableExtend({ zh }: { zh: boolean }) {
  return (
    <Chinese.Provider value={zh}>
      <TableHandlesController
        tableHandle={NoHandle}
        extendButton={ExtendTable}
        tableCellHandle={NoHandle}
      />
    </Chinese.Provider>
  );
}
