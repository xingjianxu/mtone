import * as React from "react";
import { getColspan, getRowspan } from "@blocknote/core";
import { TableHandlesExtension } from "@blocknote/core/extensions";
import {
  TableHandlesController,
  useBlockNoteEditor,
  useExtension,
  useExtensionState,
  type ExtendButtonProps,
  type TableHandleProps,
} from "@blocknote/react";
import { Button, Menu, Popover } from "@bixlab/mtone";
import {
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  Grip,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";

const Chinese = React.createContext(false);
const keepSelection = (event: React.MouseEvent) => event.preventDefault();

function TableGrip({ orientation, hideOtherElements }: TableHandleProps) {
  const zh = React.useContext(Chinese);
  const editor = useBlockNoteEditor();
  const handles = useExtension(TableHandlesExtension);
  const state = useExtensionState(TableHandlesExtension);
  const [dragging, setDragging] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const frozen = React.useRef(false);
  React.useEffect(
    () => () => {
      if (frozen.current) handles.unfreezeHandles();
    },
    [handles],
  );

  const row = orientation === "row";
  const index = row ? state?.rowIndex : state?.colIndex;
  if (!state || index === undefined) return null;
  const { block } = state;
  const name = row
    ? zh
      ? "行操作"
      : "Row actions"
    : zh
      ? "列操作"
      : "Column actions";
  const cells = row
    ? handles.getCellsAtRowHandle(block, index)
    : handles.getCellsAtColumnHandle(block, index);
  const draggable =
    cells.length > 0 &&
    cells.every(({ cell }) =>
      row ? getRowspan(cell) === 1 : getColspan(cell) === 1,
    );
  const count = row
    ? block.content.rows.length
    : (block.content.rows[0]?.cells.reduce(
        (total, cell) => total + getColspan(cell),
        0,
      ) ?? 0);
  const GripIcon = row ? GripVertical : Grip;
  function changeOpen(next: boolean) {
    frozen.current = next;
    if (next) handles.freezeHandles();
    else handles.unfreezeHandles();
    hideOtherElements(next);
    setOpen(next);
  }
  const apply = (action: () => void) => () => {
    action();
    changeOpen(false);
    editor.focus();
  };
  const earlierIcon = row ? (
    <ArrowUpToLine size={14} />
  ) : (
    <ArrowLeftToLine size={14} />
  );
  const laterIcon = row ? (
    <ArrowDownToLine size={14} />
  ) : (
    <ArrowRightToLine size={14} />
  );

  return (
    // Menu triggers open on mouse-down. Use a click-triggered popover to let
    // the same grip begin a native drag before opening the command list.
    <Popover
      open={open}
      onOpenChange={changeOpen}
      label={name}
      side={row ? "left" : "top"}
      trigger={
        <Button
          type="button"
          variant="soft"
          size="small"
          iconOnly
          className="mt-block-editor-table-grip"
          data-orientation={orientation}
          aria-label={name}
          draggable={draggable}
          data-dragging={dragging || undefined}
          onDragStart={(event) => {
            setDragging(true);
            hideOtherElements(true);
            if (row) handles.rowDragStart(event);
            else handles.colDragStart(event);
          }}
          onDragEnd={() => {
            handles.dragEnd();
            hideOtherElements(false);
            setDragging(false);
          }}
        >
          <GripIcon size={14} aria-hidden />
        </Button>
      }
      content={
        <Menu
          label={name}
          items={[
            {
              key: "delete",
              label: row
                ? zh
                  ? "删除行"
                  : "Delete row"
                : zh
                  ? "删除列"
                  : "Delete column",
              icon: <Trash2 size={14} />,
              danger: true,
              disabled: count <= 1,
              onSelect: apply(() =>
                handles.removeRowOrColumn(index, orientation),
              ),
            },
            {
              key: "add-before",
              label: row
                ? zh
                  ? "向上添加行"
                  : "Add row above"
                : zh
                  ? "向左添加列"
                  : "Add column left",
              icon: earlierIcon,
              onSelect: apply(() =>
                handles.addRowOrColumn(
                  index,
                  row
                    ? { orientation: "row", side: "above" }
                    : { orientation: "column", side: "left" },
                ),
              ),
            },
            {
              key: "add-after",
              label: row
                ? zh
                  ? "向下添加行"
                  : "Add row below"
                : zh
                  ? "向右添加列"
                  : "Add column right",
              icon: laterIcon,
              onSelect: apply(() =>
                handles.addRowOrColumn(
                  index,
                  row
                    ? { orientation: "row", side: "below" }
                    : { orientation: "column", side: "right" },
                ),
              ),
            },
          ]}
        />
      }
    />
  );
}

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
            : (block.content.rows[0]?.cells.length ?? 0)) - 1;
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

const NoCellHandle = () => null;

export function EditorTableHandles({ zh }: { zh: boolean }) {
  return (
    <Chinese.Provider value={zh}>
      <TableHandlesController
        tableHandle={TableGrip}
        extendButton={ExtendTable}
        tableCellHandle={NoCellHandle}
      />
    </Chinese.Provider>
  );
}
