"use client";

import * as React from "react";
import {
  BlockNoteEditor,
  BlockNoteSchema,
  type CustomInlineContentConfig,
  type InlineContentSpec,
  type Block,
  type PartialBlock,
} from "@blocknote/core";
import { SuggestionMenu } from "@blocknote/core/extensions";
import { en, zh } from "@blocknote/core/locales";
import { BlockNoteViewEditor, BlockNoteViewRaw } from "@blocknote/react";
import { useMtone } from "@bixlab/mtone";
import { EditorTableExtend } from "./editor-table-extend";
import { EditorControls } from "./editor-controls";
import { editorCodeHighlight } from "./editor-code-highlight";
import { safeLink } from "./editor-link";
import { safeMediaUrl } from "./editor-media";
import { AudioLocale } from "./editor-audio-player";

import { schema, setCodePresentation } from "./editor-blocks";

type TextSchema = typeof schema.blockSchema;
type InlineSpecs = Record<string, InlineContentSpec<CustomInlineContentConfig>>;
type NoInlineSpecs = Record<never, never>;
type InlineSchema<Extra extends InlineSpecs> =
  typeof schema.inlineContentSchema & {
    [Key in keyof Extra]: Extra[Key]["config"];
  };

export type BlockEditorBlock<Extra extends InlineSpecs = NoInlineSpecs> = Block<
  TextSchema,
  InlineSchema<Extra>,
  typeof schema.styleSchema
>;
export type BlockEditorInput<Extra extends InlineSpecs = NoInlineSpecs> =
  PartialBlock<TextSchema, InlineSchema<Extra>, typeof schema.styleSchema>;
export type BlockEditorInstance<Extra extends InlineSpecs = NoInlineSpecs> =
  BlockNoteEditor<TextSchema, InlineSchema<Extra>, typeof schema.styleSchema>;
export type Editor = BlockEditorInstance;

export interface BlockEditorRef<Extra extends InlineSpecs = NoInlineSpecs> {
  /** Focus the editable document. Does nothing in read-only mode. */
  focus(): void;
  /** Return the native editor for this mounted document. Re-read the ref after remounts. */
  getEditor(): BlockEditorInstance<Extra>;
}

export interface BlockEditorProps<Extra extends InlineSpecs = NoInlineSpecs> {
  /** Change the key to load a different document. */
  documentKey?: string | number;
  /** Read once per document key. */
  initialContent?: readonly BlockEditorInput<Extra>[];
  onChange?: (blocks: BlockEditorBlock<Extra>[]) => void;
  /** Additional native inline specs, read once per document key. Built-ins cannot be replaced. */
  inlineContentSpecs?: Extra;
  /** Mount edit-only controllers inside the native BlockNote view. */
  renderExtensions?: (editor: BlockEditorInstance<Extra>) => React.ReactNode;
  readOnly?: boolean;
  /** Hide the outer frame without changing editor content or controls. */
  borderless?: boolean;
  /** Fill a parent with a definite height; content may still grow beyond it. */
  fillHeight?: boolean;
  label?: string;
  locale?: "zh" | "en";
  className?: string;
  /**
   * Upload images, video, audio, or attachments through the host application.
   * Return a durable HTTP(S) URL. Takes precedence over uploadImage.
   * Provide this when the document mounts to enable native paste and drop.
   */
  uploadFile?: (file: File) => Promise<string>;
  /** Legacy image-only upload fallback when uploadFile is not provided. */
  uploadImage?: (file: File) => Promise<string>;
}

export function BlockEditor<Extra extends InlineSpecs = NoInlineSpecs>({
  documentKey,
  ref,
  ...props
}: BlockEditorProps<Extra> & { ref?: React.Ref<BlockEditorRef<Extra>> }) {
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
      editorRef={ref}
    />
  );
}

function documentSchema<Extra extends InlineSpecs>(extra?: Extra) {
  if (!extra || !Object.keys(extra).length) return schema;
  for (const [name, spec] of Object.entries(extra)) {
    if (
      Object.hasOwn(schema.inlineContentSpecs, name) ||
      spec.config.type !== name
    ) {
      throw new Error(`Invalid BlockEditor inline content spec: ${name}`);
    }
  }
  // Build a fresh schema: BlockNote's extend() mutates the receiver.
  return BlockNoteSchema.create({
    blockSpecs: schema.blockSpecs,
    inlineContentSpecs: { ...schema.inlineContentSpecs, ...extra },
    styleSpecs: schema.styleSpecs,
  });
}

function EditorInstance<Extra extends InlineSpecs>({
  initialContent,
  onChange,
  inlineContentSpecs,
  renderExtensions,
  readOnly = false,
  borderless = false,
  fillHeight = false,
  locale: explicitLocale,
  label,
  className,
  uploadImage,
  uploadFile,
  editorRef,
}: BlockEditorProps<Extra> & { editorRef?: React.Ref<BlockEditorRef<Extra>> }) {
  const { locale: inheritedLocale, theme } = useMtone();
  const locale = explicitLocale ?? inheritedLocale;
  const name = label ?? (locale === "zh" ? "块编辑器" : "Block editor");
  const nativeUploader = React.useRef(uploadFile);
  React.useLayoutEffect(() => {
    nativeUploader.current = uploadFile;
    return () => {
      nativeUploader.current = undefined;
    };
  }, [uploadFile]);
  const [editor] = React.useState(() =>
    BlockNoteEditor.create({
      // The native constructor merges the exact spec configs described by InlineSchema.
      schema: documentSchema(inlineContentSpecs) as unknown as BlockNoteSchema<
        TextSchema,
        InlineSchema<Extra>,
        typeof schema.styleSchema
      >,
      extensions: [editorCodeHighlight],
      uploadFile: uploadFile
        ? async (file) => {
            const upload = nativeUploader.current;
            if (!upload) throw new Error("File upload is unavailable.");
            const result = await upload(file);
            if (!nativeUploader.current)
              throw new Error("File upload is unavailable.");
            const url = typeof result === "string" && safeMediaUrl(result);
            if (!url)
              throw new Error("Upload did not return a valid HTTP(S) URL.");
            return url;
          }
        : undefined,
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
  React.useImperativeHandle(
    editorRef,
    () => ({
      getEditor: () => editor,
      focus() {
        if (!readOnly && editor.domElement?.isConnected) editor.focus();
      },
    }),
    [editor, readOnly],
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
      data-borderless={borderless ? "" : undefined}
      data-fill-height={fillHeight ? "" : undefined}
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
        <AudioLocale.Provider value={locale}>
          <BlockNoteViewEditor />
        </AudioLocale.Provider>
        {!readOnly && <EditorTableExtend zh={locale === "zh"} />}
        {!readOnly && (
          <EditorControls
            // Built-in controls target the base blocks and treat extra inline content as opaque.
            editor={editor as unknown as Editor}
            locale={locale}
            uploadImage={uploadImage}
            uploadFile={uploadFile}
            previewCodeId={previewCodeId}
            setPreviewCodeId={setPreviewCodeId}
          />
        )}
        {!readOnly && renderExtensions?.(editor)}
      </BlockNoteViewRaw>
    </div>
  );
}
