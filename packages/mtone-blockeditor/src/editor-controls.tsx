import * as React from "react";
import { flip, offset, shift } from "@floating-ui/react";
import {
  filterSuggestionItems,
  FormattingToolbarExtension,
  insertOrUpdateBlockForSlashMenu,
  SideMenuExtension,
  SuggestionMenu,
} from "@blocknote/core/extensions";
import {
  BlockPopover,
  FormattingToolbarController,
  PositionPopover,
  SideMenuController,
  SuggestionMenuController,
  useEditorState,
  useExtensionState,
  type SuggestionMenuProps,
} from "@blocknote/react";
import {
  Button,
  Popover,
  Select,
  Tooltip,
  TooltipProvider,
  type MenuEntry,
} from "@bixlab/mtone";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  IndentDecrease,
  IndentIncrease,
  Type,
  Code,
  Ellipsis,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Info,
  Minus,
  ChevronRight,
  Table2,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Pilcrow,
  Plus,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";
import type {
  BlockEditorBlock,
  BlockEditorInput,
  BlockEditorProps,
  Editor,
} from "./block-editor";
import { EditorLinkForm, linkTarget } from "./editor-link";
import {
  isMediaBlock,
  MediaForm,
  mediaKinds,
  type MediaTarget,
} from "./editor-media";
import {
  CodeControls,
  ImageForm,
  TableControls,
  formatActions,
  type ImageTarget,
} from "./editor-formats";
type Language = "en" | "zh";
type Suggestion = {
  title: string;
  aliases: string[];
  group: string;
  icon: React.ReactNode;
  run: () => void;
  opensForm?: boolean;
};
const blockKinds = [
  ["正文", "Paragraph", Pilcrow, { type: "paragraph" }],
  ["一级标题", "Heading 1", Heading1, { type: "heading", props: { level: 1 } }],
  ["二级标题", "Heading 2", Heading2, { type: "heading", props: { level: 2 } }],
  ["三级标题", "Heading 3", Heading3, { type: "heading", props: { level: 3 } }],
  ["项目列表", "Bullet list", List, { type: "bulletListItem" }],
  ["编号列表", "Numbered list", ListOrdered, { type: "numberedListItem" }],
  ["待办项", "Checklist", ListChecks, { type: "checkListItem" }],
  ["引用", "Quote", Quote, { type: "quote" }],
  ["代码块", "Code block", Code, { type: "codeBlock" }],
  ["分割线", "Divider", Minus, { type: "divider" }],
  [
    "表格",
    "Table",
    Table2,
    {
      type: "table",
      content: {
        type: "tableContent",
        rows: [{ cells: [[], []] }, { cells: [[], []] }],
      },
    },
  ],
  ["折叠块", "Toggle", ChevronRight, { type: "toggleListItem" }],
  ["提示块", "Callout", Info, { type: "callout" }],
] as const satisfies readonly (readonly [
  string,
  string,
  typeof Bold,
  BlockEditorInput,
])[];

function SlashList({
  items,
  selectedIndex,
  onItemClick,
  loadingState,
  zh,
}: SuggestionMenuProps<Suggestion> & { zh: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null);
  // Scroll this list only; scrollIntoView can move the entire surrounding Dialog.
  React.useLayoutEffect(() => {
    const list = ref.current;
    const row = list?.querySelector('[aria-selected="true"]');
    if (!list || !row) return;
    const container = list.getBoundingClientRect();
    const item = row.getBoundingClientRect();
    if (item.bottom > container.bottom)
      list.scrollTop += item.bottom - container.bottom;
    else if (item.top < container.top)
      list.scrollTop += item.top - container.top;
  }, [items, selectedIndex]);
  return (
    <div
      className="mt-block-editor-suggestions"
      id="bn-suggestion-menu"
      aria-label={zh ? "插入块" : "Insert block"}
      role="listbox"
      ref={ref}
    >
      {items.length === 0 && (
        <div
          role="option"
          aria-disabled="true"
          aria-selected="false"
          className="mt-block-editor-empty"
        >
          {loadingState === "loaded"
            ? zh
              ? "没有匹配的块"
              : "No matching blocks"
            : zh
              ? "正在加载…"
              : "Loading…"}
        </div>
      )}
      {items.map((item, index) => (
        <React.Fragment key={item.title}>
          {item.group !== items[index - 1]?.group && (
            <div
              className="mt-block-editor-suggestion-group"
              aria-hidden="true"
            >
              {item.group}
            </div>
          )}
          <div
            id={`bn-suggestion-menu-item-${index}`}
            role="option"
            aria-selected={index === selectedIndex}
            className="mt-block-editor-option"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onItemClick?.(item)}
          >
            {item.icon}
            {item.title}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

function cloneBlock({
  type,
  props,
  content,
  children,
}: BlockEditorBlock): BlockEditorInput {
  return {
    type,
    props,
    content,
    children: children.map(cloneBlock),
  } as BlockEditorInput;
}

function blockActions(
  editor: Editor,
  locale: Language,
  getBlock: () => BlockEditorBlock,
): MenuEntry[] {
  const zh = locale === "zh";
  const run = (callback: (block: BlockEditorBlock) => void) => () => {
    // Read the current block at activation, not when its menu element was constructed.
    const block = editor.getBlock(getBlock().id);
    if (!block) return;
    callback(block);
    requestAnimationFrame(() => {
      if (editor.domElement?.isConnected) editor.focus();
    });
  };
  return [
    {
      key: "insert",
      label: zh ? "下方插入" : "Insert below",
      onSelect: run((block) => {
        const [newBlock] = editor.insertBlocks(
          [{ type: "paragraph" }],
          block,
          "after",
        );
        editor.setTextCursorPosition(newBlock);
      }),
    },
    {
      key: "copy",
      label: zh ? "复制块" : "Duplicate block",
      onSelect: run((block) => {
        const [newBlock] = editor.insertBlocks(
          [cloneBlock(block)],
          block,
          "after",
        );
        editor.setTextCursorPosition(newBlock);
      }),
    },
    {
      key: "up",
      label: zh ? "上移" : "Move up",
      onSelect: run((block) => {
        editor.moveBlocksUp(block);
      }),
    },
    {
      key: "down",
      label: zh ? "下移" : "Move down",
      onSelect: run((block) => {
        editor.moveBlocksDown(block);
      }),
    },
    {
      key: "remove",
      label: zh ? "删除块" : "Delete block",
      danger: true,
      onSelect: run((block) => {
        if (
          editor.document.length === 1 &&
          editor.document[0].id === block.id
        ) {
          editor.replaceBlocks([block], [{ type: "paragraph" }]);
        } else editor.removeBlocks([block]);
      }),
    },
  ];
}

const keepSelection = (event: React.MouseEvent) => event.preventDefault();

const blockFloatingMiddleware = [
  offset(8),
  flip({ padding: 8 }),
  shift({ padding: 8 }),
];
const blockFloatingProps = {
  placement: "top-start" as const,
  middleware: blockFloatingMiddleware,
};
const blockFloatingElement = { style: { zIndex: 40 } };
const noFocusTrap = { disabled: true };

function useCompactToolbar(editor: Editor) {
  const [compact, setCompact] = React.useState(false);
  React.useLayoutEffect(() => {
    const frame = editor.domElement?.closest(".mt-block-editor");
    if (!frame) return;
    const sync = () =>
      setCompact(Math.min(frame.clientWidth, window.innerWidth) < 520);
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(frame);
    window.addEventListener("resize", sync);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [editor]);
  return compact;
}

const textBlockChoices = blockKinds.filter(([, , , block]) =>
  [
    "paragraph",
    "heading",
    "bulletListItem",
    "numberedListItem",
    "checkListItem",
    "quote",
    "toggleListItem",
  ].includes(block.type),
);
const alignmentActions = [
  ["left", "左对齐", "Align left", AlignLeft],
  ["center", "居中", "Align center", AlignCenter],
  ["right", "右对齐", "Align right", AlignRight],
] as const;

function SelectionToolbar({
  editor,
  zh,
  openLink,
}: {
  editor: Editor;
  zh: boolean;
  openLink: () => void;
}) {
  const styles = useEditorState({
    editor,
    selector: ({ editor: stateEditor }) => stateEditor.getActiveStyles(),
  });
  const { block, canNest, canOutdent } = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      block: current.getTextCursorPosition().block as BlockEditorBlock,
      canNest: current.canNestBlock(),
      canOutdent: current.canUnnestBlock(),
    }),
  });
  const alignment =
    "textAlignment" in block.props ? block.props.textAlignment : undefined;
  const blockChoice = textBlockChoices.find(
    ([, , , choice]) =>
      choice.type === block.type &&
      (choice.type !== "heading" ||
        !("level" in block.props) ||
        choice.props.level === block.props.level),
  );
  const [panel, setPanel] = React.useState<"more" | "block" | "color">();
  const moreOpen = panel === "more";
  const [groupKey, setGroupKey] = React.useState<string>();
  const groups = formatActions(editor, zh);
  const activeGroup = groups.find((group) => group.key === groupKey);
  const switchPanel = (next: "more" | "block" | "color") => {
    setPanel(panel === next ? undefined : next);
    setGroupKey(undefined);
  };
  const closePanel = () => {
    setPanel(undefined);
    setGroupKey(undefined);
  };
  const nest = (unindent: boolean) => {
    if (unindent && editor.canUnnestBlock()) editor.unnestBlock();
    if (!unindent && editor.canNestBlock()) editor.nestBlock();
    editor.focus();
    closePanel();
  };
  const formatButtons = [
    ["bold", "粗体", "Bold", Bold],
    ["italic", "斜体", "Italic", Italic],
    ["underline", "下划线", "Underline", Underline],
    ["strike", "删除线", "Strikethrough", Strikethrough],
    ["code", "行内代码", "Inline code", Code],
  ] as const;
  const compact = useCompactToolbar(editor);
  const applyStyle = (style: (typeof formatButtons)[number][0]) => {
    editor.toggleStyles({ [style]: true });
    editor.focus();
  };
  return (
    <TooltipProvider delay={420}>
      <div className="mt-block-editor-toolbar-panel mt-block-editor-selection-panel">
        <div
          className="mt-block-editor-toolbar"
          role="group"
          aria-label={zh ? "编辑工具" : "Editor formatting"}
        >
          {!compact && (
            <Button
              type="button"
              size="small"
              variant="ghost"
              className="mt-block-editor-block-type"
              aria-label={zh ? "块类型" : "Block type"}
              aria-expanded={panel === "block"}
              disabled={!blockChoice}
              leftSection={<Type size={15} aria-hidden />}
              rightSection={<ChevronDown size={13} aria-hidden />}
              onMouseDown={keepSelection}
              onClick={() => switchPanel("block")}
            >
              {blockChoice
                ? blockChoice[zh ? 0 : 1]
                : zh
                  ? "块类型"
                  : "Block type"}
            </Button>
          )}
          {formatButtons
            .slice(0, compact ? 2 : undefined)
            .map(([style, chinese, english, Icon]) => (
              <Tooltip key={style} content={zh ? chinese : english}>
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  iconOnly
                  aria-label={zh ? chinese : english}
                  aria-pressed={Boolean(styles?.[style])}
                  onMouseDown={keepSelection}
                  onClick={() => applyStyle(style)}
                >
                  <Icon size={15} aria-hidden />
                </Button>
              </Tooltip>
            ))}
          {!compact && (
            <span
              className="mt-block-editor-toolbar-divider"
              aria-hidden="true"
            />
          )}
          {!compact && (
            <>
              {alignmentActions.map(([key, chinese, english, Icon]) => (
                <Button
                  key={key}
                  type="button"
                  size="small"
                  variant="ghost"
                  iconOnly
                  className="mt-block-editor-align-button"
                  aria-pressed={alignment === key}
                  aria-label={zh ? chinese : english}
                  disabled={!alignment}
                  onMouseDown={keepSelection}
                  onClick={() => {
                    groups
                      .find((group) => group.key === "alignment")
                      ?.children.find((action) => action.key === key)
                      ?.onSelect();
                    closePanel();
                  }}
                >
                  <Icon size={16} aria-hidden />
                </Button>
              ))}
              <Button
                type="button"
                size="small"
                variant="ghost"
                iconOnly
                aria-label={zh ? "颜色" : "Color"}
                aria-expanded={panel === "color"}
                onMouseDown={keepSelection}
                onClick={() => switchPanel("color")}
              >
                <span className="mt-block-editor-color-icon" aria-hidden="true">
                  A
                </span>
              </Button>
              <Button
                type="button"
                size="small"
                variant="ghost"
                iconOnly
                aria-label={zh ? "增加缩进" : "Increase indent"}
                disabled={!canNest}
                onMouseDown={keepSelection}
                onClick={() => nest(false)}
              >
                <IndentIncrease size={16} aria-hidden />
              </Button>
              <Button
                type="button"
                size="small"
                variant="ghost"
                iconOnly
                aria-label={zh ? "减少缩进" : "Decrease indent"}
                disabled={!canOutdent}
                onMouseDown={keepSelection}
                onClick={() => nest(true)}
              >
                <IndentDecrease size={16} aria-hidden />
              </Button>
            </>
          )}
          <Button
            type="button"
            size="small"
            variant="ghost"
            iconOnly
            aria-label={zh ? "链接" : "Link"}
            onMouseDown={keepSelection}
            onClick={openLink}
          >
            <Link2 size={16} aria-hidden />
          </Button>
          <span
            className="mt-block-editor-toolbar-divider"
            aria-hidden="true"
          />
          <Button
            type="button"
            size="small"
            variant="ghost"
            iconOnly
            aria-label={zh ? "更多格式" : "More formatting"}
            aria-expanded={moreOpen}
            onMouseDown={keepSelection}
            onClick={() => switchPanel("more")}
          >
            <Ellipsis size={16} aria-hidden />
          </Button>
        </div>
        {panel === "block" && blockChoice && (
          <div className="mt-block-editor-toolbar-options">
            <div role="group" aria-label={zh ? "转换块类型" : "Turn into"}>
              {textBlockChoices.map(([chinese, english, Icon, choice]) => (
                <Button
                  key={english}
                  type="button"
                  size="small"
                  variant="ghost"
                  aria-pressed={blockChoice[1] === english}
                  leftSection={<Icon size={15} aria-hidden />}
                  onMouseDown={keepSelection}
                  onClick={() => {
                    const active = editor.getBlock(block.id);
                    if (!active || !Array.isArray(active.content)) return;
                    editor.updateBlock(active, choice);
                    editor.focus();
                    closePanel();
                  }}
                >
                  {zh ? chinese : english}
                </Button>
              ))}
            </div>
          </div>
        )}
        {(panel === "more" || panel === "color") && (
          <div className="mt-block-editor-toolbar-options">
            <div role="group" aria-label={zh ? "更多格式" : "More formatting"}>
              {compact && moreOpen && blockChoice && (
                <Button
                  type="button"
                  size="small"
                  variant="ghost"
                  onMouseDown={keepSelection}
                  onClick={() => switchPanel("block")}
                >
                  {zh ? "转换块类型" : "Turn into"}
                </Button>
              )}
              {compact &&
                moreOpen &&
                formatButtons.slice(2).map(([style, chinese, english]) => (
                  <Button
                    key={style}
                    type="button"
                    size="small"
                    variant="ghost"
                    aria-pressed={Boolean(styles?.[style])}
                    onMouseDown={keepSelection}
                    onClick={() => {
                      applyStyle(style);
                      closePanel();
                    }}
                  >
                    {zh ? chinese : english}
                  </Button>
                ))}
              {groups
                .filter(
                  (group) => panel !== "color" || group.key !== "alignment",
                )
                .map((group) => (
                  <Button
                    key={group.key}
                    type="button"
                    size="small"
                    variant="ghost"
                    aria-expanded={groupKey === group.key}
                    onMouseDown={keepSelection}
                    onClick={() =>
                      setGroupKey(
                        groupKey === group.key ? undefined : group.key,
                      )
                    }
                  >
                    {group.label}
                  </Button>
                ))}
              {compact && moreOpen && (
                <>
                  <Button
                    type="button"
                    size="small"
                    variant="ghost"
                    disabled={!canNest}
                    onMouseDown={keepSelection}
                    onClick={() => nest(false)}
                  >
                    {zh ? "增加缩进" : "Increase indent"}
                  </Button>
                  <Button
                    type="button"
                    size="small"
                    variant="ghost"
                    disabled={!canOutdent}
                    onMouseDown={keepSelection}
                    onClick={() => nest(true)}
                  >
                    {zh ? "减少缩进" : "Decrease indent"}
                  </Button>
                </>
              )}
              {moreOpen && (
                <>
                  <Button
                    type="button"
                    size="small"
                    variant="ghost"
                    onMouseDown={keepSelection}
                    onClick={() => {
                      editor.undo();
                      editor.focus();
                      closePanel();
                    }}
                  >
                    {zh ? "撤销" : "Undo"}
                  </Button>
                  <Button
                    type="button"
                    size="small"
                    variant="ghost"
                    onMouseDown={keepSelection}
                    onClick={() => {
                      editor.redo();
                      editor.focus();
                      closePanel();
                    }}
                  >
                    {zh ? "重做" : "Redo"}
                  </Button>
                </>
              )}
            </div>
            {activeGroup && (
              <div
                role="group"
                aria-label={
                  typeof activeGroup.label === "string"
                    ? activeGroup.label
                    : undefined
                }
              >
                {activeGroup.children?.map((item) => (
                  <Button
                    key={item.key}
                    type="button"
                    size="small"
                    variant="ghost"
                    onMouseDown={keepSelection}
                    onClick={() => {
                      item.onSelect?.();
                      closePanel();
                      setGroupKey(undefined);
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export function EditorControls({
  editor,
  locale,
  uploadImage,
  previewCodeId,
  setPreviewCodeId,
}: {
  editor: Editor;
  locale: Language;
  uploadImage?: BlockEditorProps["uploadImage"];
  previewCodeId?: string;
  setPreviewCodeId: (id: string | undefined) => void;
}) {
  const zh = locale === "zh";
  const [image, setImage] = React.useState<ImageTarget>();
  const [media, setMedia] = React.useState<MediaTarget>();
  const activeBlock = useEditorState({
    editor,
    selector: ({ editor: stateEditor }) =>
      stateEditor.getTextCursorPosition().block as BlockEditorBlock,
  });
  const [link, setLink] = React.useState<ReturnType<typeof linkTarget>>();
  const [focused, setFocused] = React.useState(() =>
    editor.isFocused({ includeEditorUI: true }),
  );
  const [codeSelectOpen, setCodeSelectOpen] = React.useState(false);
  const [dismissedId, setDismissedId] = React.useState<string>();
  const hasTextToolbar = useExtensionState(FormattingToolbarExtension, {
    editor,
  });
  React.useEffect(
    () =>
      editor.onFocusChange((_editor, state) => setFocused(state.focused), {
        includeEditorUI: true,
      }),
    [editor],
  );
  React.useEffect(() => {
    const dom = editor.domElement;
    if (!dom) return;
    const reset = () => setDismissedId(undefined);
    dom.addEventListener("pointerdown", reset);
    const unsubscribe = editor.onSelectionChange(reset);
    return () => {
      dom.removeEventListener("pointerdown", reset);
      unsubscribe();
    };
  }, [editor]);

  const closeLink = () => {
    setLink(undefined);
    editor.focus();
  };
  const openLink = React.useCallback(() => {
    setImage(undefined);
    setMedia(undefined);
    setLink(linkTarget(editor));
  }, [editor]);
  const SelectedTextToolbar = React.useMemo(
    () =>
      function SelectedTextToolbar() {
        return <SelectionToolbar editor={editor} zh={zh} openLink={openLink} />;
      },
    [editor, zh, openLink],
  );
  const openInsert = React.useCallback(
    (block: BlockEditorBlock) => {
      editor.setTextCursorPosition(block.id, "end");
      const active = editor.getTextCursorPosition().block;
      if (active.type === "codeBlock") {
        const [next] = editor.insertBlocks(
          [{ type: "paragraph" }],
          active.id,
          "after",
        );
        editor.setTextCursorPosition(next.id);
      }
      editor.focus();
      editor.getExtension(SuggestionMenu)?.openSuggestionMenu("/", {
        deleteTriggerCharacter: false,
        ignoreQueryLength: true,
      });
    },
    [editor],
  );
  const getItems = React.useCallback(
    async (query: string) =>
      filterSuggestionItems(
        [
          ...blockKinds.map(
            ([chinese, english, Icon, block], index): Suggestion => ({
              title: zh ? chinese : english,
              aliases: [chinese, english],
              group:
                index < 4
                  ? zh
                    ? "基本"
                    : "Basic"
                  : index < 7
                    ? zh
                      ? "列表"
                      : "Lists"
                    : zh
                      ? "其他"
                      : "More",
              icon: <Icon size={16} aria-hidden />,
              run: () => insertOrUpdateBlockForSlashMenu(editor, block),
            }),
          ),
          {
            title: zh ? "图片" : "Image",
            aliases: ["图片", "Image", "photo"],
            group: zh ? "其他" : "More",
            icon: <ImageIcon size={16} aria-hidden />,
            opensForm: true,
            run: () => {
              setLink(undefined);
              setImage({ anchor: editor.getTextCursorPosition().block.id });
            },
          },
          ...mediaKinds.map(([kind, chinese, english, Icon]): Suggestion => ({
            title: zh ? chinese : english,
            aliases: [chinese, english, kind],
            group: zh ? "其他" : "More",
            icon: <Icon size={16} aria-hidden />,
            opensForm: true,
            run: () => {
              setLink(undefined);
              setMedia({
                kind,
                anchor: editor.getTextCursorPosition().block.id,
              });
            },
          })),
        ],
        query,
      ),
    [editor, zh],
  );
  const SuggestionList = React.useMemo(
    () =>
      function SuggestionList(props: SuggestionMenuProps<Suggestion>) {
        return <SlashList {...props} zh={zh} />;
      },
    [zh],
  );
  const SideActions = React.useMemo(
    () =>
      function SideActions() {
        const block = useExtensionState(SideMenuExtension, {
          editor,
          selector: (state) => state?.block as BlockEditorBlock | undefined,
        });
        const extension = editor.getExtension(SideMenuExtension);
        if (!block) return null;
        return (
          <div className="mt-block-editor-side-actions">
            <Button
              type="button"
              variant="ghost"
              size="small"
              iconOnly
              aria-label={zh ? "添加块" : "Add block"}
              onMouseDown={keepSelection}
              onClick={() => openInsert(block)}
            >
              <Plus size={16} aria-hidden />
            </Button>
            <Popover.Menu
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  iconOnly
                  aria-label={zh ? "此块的操作" : "Actions for this block"}
                >
                  <Ellipsis size={16} aria-hidden />
                </Button>
              }
              onOpenChange={(open) => {
                if (open) extension?.freezeMenu();
                else extension?.unfreezeMenu();
              }}
              items={blockActions(editor, locale, () => block)}
            />
          </div>
        );
      },
    [editor, locale, zh, openInsert],
  );
  const blockToolsOpen =
    activeBlock &&
    (activeBlock.type === "table" ||
      activeBlock.type === "image" ||
      isMediaBlock(activeBlock) ||
      activeBlock.type === "codeBlock" ||
      activeBlock.type === "callout") &&
    (focused || codeSelectOpen) &&
    dismissedId !== activeBlock.id &&
    (!hasTextToolbar ||
      activeBlock.type === "image" ||
      isMediaBlock(activeBlock)) &&
    !image &&
    !media &&
    !link;
  return (
    <>
      {!image &&
        !media &&
        !link &&
        activeBlock?.type !== "image" &&
        !isMediaBlock(activeBlock) && (
          <FormattingToolbarController formattingToolbar={SelectedTextToolbar} />
        )}
      {blockToolsOpen && (
        <BlockPopover
          blockId={activeBlock.id}
          useFloatingOptions={{
            ...blockFloatingProps,
            open: true,
            onOpenChange: (open, _event, reason) => {
              if (!open) setDismissedId(activeBlock.id);
              if (reason === "escape-key") editor.focus();
            },
          }}
          useDismissProps={{ enabled: !codeSelectOpen }}
          focusManagerProps={noFocusTrap}
          elementProps={blockFloatingElement}
        >
          <div className="mt-block-editor-toolbar-panel">
            {activeBlock?.type === "table" && (
              <TableControls editor={editor} block={activeBlock} zh={zh} />
            )}
            {activeBlock?.type === "codeBlock" && (
              <CodeControls
                editor={editor}
                block={activeBlock}
                zh={zh}
                onLanguageOpenChange={setCodeSelectOpen}
                showPreview={previewCodeId === activeBlock.id}
                setShowPreview={(open) =>
                  setPreviewCodeId(open ? activeBlock.id : undefined)
                }
              />
            )}
            {activeBlock?.type === "callout" && (
              <div className="mt-block-editor-format-controls">
                <Select
                  label={zh ? "提示类型" : "Callout tone"}
                  onOpenChange={setCodeSelectOpen}
                  value={activeBlock.props.tone}
                  options={[
                    { value: "info", label: zh ? "信息" : "Info" },
                    { value: "tip", label: zh ? "提示" : "Tip" },
                    { value: "warning", label: zh ? "警告" : "Warning" },
                  ]}
                  onValueChange={(tone) => {
                    if (tone === "info" || tone === "tip" || tone === "warning")
                      editor.updateBlock(activeBlock, { props: { tone } });
                  }}
                />
              </div>
            )}
            {isMediaBlock(activeBlock) && (
              <div className="mt-block-editor-format-controls">
                <Button
                  size="small"
                  onMouseDown={keepSelection}
                  onClick={() =>
                    setMedia({
                      kind: activeBlock.type,
                      anchor: activeBlock.id,
                      media: activeBlock,
                    })
                  }
                >
                  {zh ? "编辑媒体" : "Edit media"}
                </Button>
              </div>
            )}
            {activeBlock?.type === "image" && !image && (
              <div className="mt-block-editor-format-controls">
                <Button
                  size="small"
                  onMouseDown={keepSelection}
                  onClick={() => {
                    setLink(undefined);
                    setImage({ anchor: activeBlock.id, image: activeBlock });
                  }}
                >
                  {zh ? "编辑图片" : "Edit image"}
                </Button>
              </div>
            )}
          </div>
        </BlockPopover>
      )}
      {image && (
        <BlockPopover
          blockId={image.anchor}
          useFloatingOptions={{ ...blockFloatingProps, open: true }}
          useDismissProps={{ enabled: false }}
          focusManagerProps={noFocusTrap}
          elementProps={blockFloatingElement}
        >
          <div className="mt-block-editor-toolbar-panel">
            <ImageForm
              key={image.anchor}
              editor={editor}
              target={image}
              zh={zh}
              uploadImage={uploadImage}
              onClose={() => {
                setImage(undefined);
                editor.focus();
              }}
            />
          </div>
        </BlockPopover>
      )}
      {media && (
        <BlockPopover
          blockId={media.anchor}
          useFloatingOptions={{ ...blockFloatingProps, open: true }}
          useDismissProps={{ enabled: false }}
          focusManagerProps={noFocusTrap}
          elementProps={blockFloatingElement}
        >
          <div className="mt-block-editor-toolbar-panel">
            <MediaForm
              key={media.anchor}
              editor={editor}
              target={media}
              zh={zh}
              onClose={() => {
                setMedia(undefined);
                editor.focus();
              }}
            />
          </div>
        </BlockPopover>
      )}
      {link && (
        <PositionPopover
          position={{ from: link.from, to: link.to }}
          useFloatingOptions={{ ...blockFloatingProps, open: true }}
          useDismissProps={{ enabled: false }}
          focusManagerProps={noFocusTrap}
          elementProps={blockFloatingElement}
        >
          <div className="mt-block-editor-toolbar-panel">
            <EditorLinkForm
              target={link}
              editor={editor}
              zh={zh}
              onClose={closeLink}
            />
          </div>
        </PositionPopover>
      )}
      {!image && !media && !link && (
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={getItems}
          suggestionMenuComponent={SuggestionList}
          onItemClick={(item) => {
            item.run();
            if (!item.opensForm) editor.focus();
          }}
        />
      )}
      <SideMenuController sideMenu={SideActions} />
    </>
  );
}
