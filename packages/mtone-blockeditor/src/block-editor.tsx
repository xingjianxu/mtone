"use client";

import * as React from "react";
import {
  BlockNoteEditor,
  type Block,
  type PartialBlock,
} from "@blocknote/core";
import { SuggestionMenu } from "@blocknote/core/extensions";
import { en, zh } from "@blocknote/core/locales";
import { BlockNoteViewEditor, BlockNoteViewRaw } from "@blocknote/react";
import { useMtone } from "@bixlab/mtone";
import { EditorControls } from "./editor-controls";
import { safeLink } from "./editor-link";

import { schema, setCodePresentation } from "./editor-blocks";

type TextSchema = typeof schema.blockSchema;
export type BlockEditorBlock = Block<TextSchema>;
export type BlockEditorInput = PartialBlock<TextSchema>;
export type Editor = BlockNoteEditor<TextSchema>;

export interface BlockEditorProps {
  /** Change the key to load a different document. */
  documentKey?: string | number;
  /** Read once per document key. */
  initialContent?: readonly BlockEditorInput[];
  onChange?: (blocks: BlockEditorBlock[]) => void;
  readOnly?: boolean;
  label?: string;
  locale?: "zh" | "en";
  className?: string;
  /** Optional host upload; return an HTTP(S) URL for the stored file. */
  uploadImage?: (file: File) => Promise<string>;
}

export function BlockEditor({ documentKey, ...props }: BlockEditorProps) {
  const [client, setClient] = React.useState(false);
  React.useEffect(() => setClient(true), []);
  if (!client)
    return (
      <div className={props.className} data-mtone-block-editor-placeholder="" />
    );
  return (
    <EditorInstance
      key={
        documentKey === undefined ? "" : `${typeof documentKey}:${documentKey}`
      }
      {...props}
    />
  );
}

function EditorInstance({
  initialContent,
  onChange,
  readOnly = false,
  locale: explicitLocale,
  label,
  className,
  uploadImage,
}: BlockEditorProps) {
  const { locale: inheritedLocale, theme } = useMtone();
  const locale = explicitLocale ?? inheritedLocale;
  const name = label ?? (locale === "zh" ? "块编辑器" : "Block editor");
  const [editor] = React.useState<Editor>(() =>
    BlockNoteEditor.create({
      schema,
      tables: { headers: true },
      links: {
        isValidLink: (href) => Boolean(safeLink(href)),
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        onClick: (event) => {
          event.preventDefault();
          return false;
        },
      },
      dictionary: locale === "zh" ? zh : en,
      initialContent: initialContent?.length
        ? structuredClone([...initialContent])
        : undefined,
      domAttributes: {
        editor: { "aria-label": name, "aria-multiline": "true" },
      },
    }),
  );
  const [previewCodeId, setPreviewCodeId] = React.useState<string>();
  React.useLayoutEffect(() => {
    setCodePresentation(editor, { id: previewCodeId, readOnly });
  }, [editor, previewCodeId, readOnly]);
  const composing = React.useRef(false);
  React.useEffect(() => {
    editor.domElement?.setAttribute("aria-label", name);
    editor.domElement?.setAttribute("aria-readonly", String(readOnly));
    if (readOnly) editor.getExtension(SuggestionMenu)?.closeMenu();
  }, [editor, name, readOnly]);
  return (
    <div
      className={["mt-block-editor", className].filter(Boolean).join(" ")}
      data-read-only={readOnly ? "" : undefined}
      onCompositionStartCapture={() => {
        composing.current = true;
      }}
      onCompositionEndCapture={() => {
        composing.current = false;
      }}
      onKeyDownCapture={(event) => {
        if (event.key !== "Escape" && event.key !== "Enter") return;
        if (
          event.nativeEvent.isComposing ||
          composing.current ||
          event.nativeEvent.keyCode === 229
        ) {
          event.stopPropagation(); // Do not cancel the input method's default action.
          return;
        }
        if (event.key === "Escape") {
          const menu = editor.getExtension(SuggestionMenu);
          if (!menu?.shown()) return;
          event.stopPropagation();
          event.preventDefault();
          menu.closeMenu();
        }
      }}
    >
      <BlockNoteViewRaw
        editor={editor}
        theme={theme === "system" ? undefined : theme}
        editable={!readOnly}
        renderEditor={false}
        formattingToolbar={false}
        slashMenu={false}
        sideMenu={false}
        linkToolbar={false}
        filePanel={false}
        tableHandles={false}
        comments={false}
        emojiPicker={false}
        onChange={
          readOnly || !onChange ? undefined : () => onChange(editor.document)
        }
      >
        {!readOnly && (
          <EditorControls
            editor={editor}
            locale={locale}
            uploadImage={uploadImage}
            previewCodeId={previewCodeId}
            setPreviewCodeId={setPreviewCodeId}
          />
        )}
        <BlockNoteViewEditor />
      </BlockNoteViewRaw>
    </div>
  );
}
