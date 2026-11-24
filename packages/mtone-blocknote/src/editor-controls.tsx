import * as React from "react";
import {
  filterSuggestionItems,
  insertOrUpdateBlockForSlashMenu,
  SideMenuExtension,
  SuggestionMenu,
} from "@blocknote/core/extensions";
import {
  SideMenuController,
  SuggestionMenuController,
  useEditorState,
  useExtensionState,
  type SuggestionMenuProps,
} from "@blocknote/react";
import {
  Button,
  Popover,
  Toolbar,
  Tooltip,
  TooltipProvider,
  type MenuEntry,
} from "@bixlab/mtone";
import {
  Bold,
  Code,
  Ellipsis,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Pilcrow,
  Plus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import type {
  BlockEditorBlock,
  BlockEditorInput,
  Editor,
} from "./block-editor";
import { EditorLinkForm, linkTarget } from "./editor-link";
type Language = "en" | "zh";
type Suggestion = {
  title: string;
  aliases: string[];
  group: string;
  icon: React.ReactNode;
  run: () => void;
};
const blockKinds = [
  ["正文", "Paragraph", Pilcrow, { type: "paragraph" }],
  ["一级标题", "Heading 1", Heading1, { type: "heading", props: { level: 1 } }],
  ["二级标题", "Heading 2", Heading2, { type: "heading", props: { level: 2 } }],
  ["项目列表", "Bullet list", List, { type: "bulletListItem" }],
  ["编号列表", "Numbered list", ListOrdered, { type: "numberedListItem" }],
  ["待办项", "Checklist", ListChecks, { type: "checkListItem" }],
  ["引用", "Quote", Quote, { type: "quote" }],
  ["代码块", "Code block", Code, { type: "codeBlock" }],
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

export function EditorControls({
  editor,
  locale,
}: {
  editor: Editor;
  locale: Language;
}) {
  const zh = locale === "zh";
  const [link, setLink] = React.useState<ReturnType<typeof linkTarget>>();
  const styles = useEditorState({
    editor,
    selector: ({ editor: stateEditor }) => stateEditor.getActiveStyles(),
  });
  const formatButtons = [
    ["bold", "粗体", "Bold", Bold],
    ["italic", "斜体", "Italic", Italic],
    ["underline", "下划线", "Underline", Underline],
    ["strike", "删除线", "Strikethrough", Strikethrough],
    ["code", "行内代码", "Inline code", Code],
  ] as const;
  const keepSelection = (event: React.MouseEvent) => event.preventDefault();
  const closeLink = () => {
    setLink(undefined);
    editor.focus();
  };
  const openInsert = () => {
    editor.focus();
    editor
      .getExtension(SuggestionMenu)
      ?.openSuggestionMenu("/", {
        deleteTriggerCharacter: false,
        ignoreQueryLength: true,
      });
  };
  const getItems = React.useCallback(
    async (query: string) =>
      filterSuggestionItems(
        blockKinds.map(
          ([chinese, english, Icon, block], index): Suggestion => ({
            title: zh ? chinese : english,
            aliases: [chinese, english],
            group:
              index < 3
                ? zh
                  ? "基本"
                  : "Basic"
                : index < 6
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
        );
      },
    [editor, locale, zh],
  );
  return (
    <>
      <TooltipProvider delay={420}>
        <Toolbar
          className="mt-block-editor-toolbar"
          aria-label={zh ? "编辑工具" : "Editor formatting"}
          start={
            <>
              <Button
                type="button"
                iconOnly
                size="small"
                aria-label={zh ? "添加块" : "Add block"}
                onMouseDown={keepSelection}
                onClick={openInsert}
              >
                <Plus size={16} aria-hidden />
              </Button>
              {formatButtons.map(([style, chinese, english, Icon]) => (
                <Tooltip key={style} content={zh ? chinese : english}>
                  <Button
                    type="button"
                    size="small"
                    iconOnly
                    aria-label={zh ? chinese : english}
                    aria-pressed={Boolean(styles?.[style])}
                    onMouseDown={keepSelection}
                    onClick={() => {
                      editor.toggleStyles({ [style]: true });
                      editor.focus();
                    }}
                  >
                    <Icon size={15} aria-hidden />
                  </Button>
                </Tooltip>
              ))}
              <Button
                type="button"
                size="small"
                iconOnly
                aria-label={zh ? "链接" : "Link"}
                aria-expanded={Boolean(link)}
                onMouseDown={keepSelection}
                onClick={() =>
                  link ? closeLink() : setLink(linkTarget(editor))
                }
              >
                <Link2 size={16} aria-hidden />
              </Button>
            </>
          }
          end={
            <>
              <Button
                type="button"
                size="small"
                iconOnly
                aria-label={zh ? "撤销" : "Undo"}
                onMouseDown={keepSelection}
                onClick={() => {
                  editor.undo();
                  editor.focus();
                }}
              >
                <Undo2 size={16} aria-hidden />
              </Button>
              <Button
                type="button"
                size="small"
                iconOnly
                aria-label={zh ? "重做" : "Redo"}
                onMouseDown={keepSelection}
                onClick={() => {
                  editor.redo();
                  editor.focus();
                }}
              >
                <Redo2 size={16} aria-hidden />
              </Button>
              <Popover.Menu
                trigger={
                  <Button
                    type="button"
                    size="small"
                    iconOnly
                    aria-label={zh ? "当前块操作" : "Current block actions"}
                  >
                    <Ellipsis size={16} aria-hidden />
                  </Button>
                }
                items={blockActions(
                  editor,
                  locale,
                  () => editor.getTextCursorPosition().block,
                )}
              />
            </>
          }
        />
      </TooltipProvider>
      {link && (
        <EditorLinkForm
          target={link}
          editor={editor}
          zh={zh}
          onClose={closeLink}
        />
      )}
      <SuggestionMenuController
        triggerCharacter="/"
        getItems={getItems}
        suggestionMenuComponent={SuggestionList}
        onItemClick={(item) => {
          item.run();
          editor.focus();
        }}
      />
      <SideMenuController sideMenu={SideActions} />
    </>
  );
}
