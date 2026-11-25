import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  BlockNoteSchema,
  createCodeBlockSpec,
  defaultBlockSpecs,
} from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Image, Tooltip, Typography } from "@bixlab/mtone";
import { Info, Lightbulb, TriangleAlert } from "lucide-react";
import { safeLink } from "./editor-link";
import { audio, file, video } from "./editor-media";

export function safeImageUrl(raw: string) {
  return /^https?:\/\//i.test(raw.trim()) ? safeLink(raw) : undefined;
}

const callout = createReactBlockSpec(
  {
    type: "callout",
    propSchema: {
      tone: { default: "info", values: ["info", "tip", "warning"] as const },
    },
    content: "inline",
  },
  {
    render: ({ block, contentRef }) => {
      const Icon =
        { info: Info, tip: Lightbulb, warning: TriangleAlert }[
          block.props.tone
        ] ?? Info;
      return (
        <aside className="mt-block-editor-callout" data-tone={block.props.tone}>
          <span contentEditable={false}>
            <Icon size={16} aria-hidden />
          </span>
          <div ref={contentRef} />
        </aside>
      );
    },
  },
)();

const image = createReactBlockSpec(
  {
    type: "image",
    propSchema: {
      url: { default: "" },
      alt: { default: "" },
      caption: { default: "" },
    },
    content: "none",
  },
  {
    render: function ImageBlockView({ block, editor }) {
      const mode = codePresentation(editor);
      const readOnly = React.useSyncExternalStore(
        React.useCallback(
          (update) => {
            mode.listeners.add(update);
            return () => {
              mode.listeners.delete(update);
            };
          },
          [mode],
        ),
        () => mode.state.readOnly,
        () => false,
      );
      const url = safeImageUrl(block.props.url);
      const figure = (
        <figure
          className="mt-block-editor-image"
          tabIndex={block.props.caption.trim() ? 0 : undefined}
          onClick={
            readOnly
              ? undefined
              : (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  editor.setTextCursorPosition(block.id);
                  editor.focus();
                }
          }
        >
          {url && (
            <Image
              src={url}
              preview={readOnly}
              alt={block.props.alt}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          )}
        </figure>
      );
      return block.props.caption.trim() ? (
        <Tooltip content={block.props.caption}>{figure}</Tooltip>
      ) : figure;
    },
  },
)();

type CodePresentation = { id?: string; readOnly: boolean };
const codePresentations = new WeakMap<
  object,
  {
    state: CodePresentation;
    listeners: Set<() => void>;
  }
>();
function codePresentation(editor: object) {
  let presentation = codePresentations.get(editor);
  if (!presentation) {
    presentation = { state: { readOnly: false }, listeners: new Set() };
    codePresentations.set(editor, presentation);
  }
  return presentation;
}
export function setCodePresentation(editor: object, state: CodePresentation) {
  const presentation = codePresentation(editor);
  presentation.state = state;
  for (const update of presentation.listeners) update();
}

function CodePreview({ text, language }: { text: string; language: string }) {
  return (
    <Typography.Code block language={language}>
      {text}
    </Typography.Code>
  );
}

const codeBlock = createCodeBlockSpec();
const renderCode = codeBlock.implementation.render!;
codeBlock.implementation.render = function (block, editor) {
  const original = renderCode.call(this, block, editor);
  if (!("renderType" in this) || this.renderType !== "nodeView")
    return original;

  const frame = document.createElement("div");
  frame.dataset.codeId = block.id;
  frame.className = "mt-block-editor-code";
  const source = document.createElement("div");
  source.className = "mt-block-editor-code-source";
  source.append(original.dom);
  const preview = document.createElement("div");
  preview.className = "mt-block-editor-code-preview";
  preview.contentEditable = "false";
  frame.append(source, preview);
  const root = createRoot(preview);
  let text = block.content.map((item) => item.text).join("");
  let language = block.props.language;
  const presentation = codePresentation(editor);
  const render = () => {
    const { id, readOnly } = presentation.state;
    const currentId =
      frame.closest<HTMLElement>("[data-node-type=blockContainer]")?.dataset
        .id ?? block.id;
    const selected = id === currentId;
    frame.toggleAttribute("data-preview", selected);
    root.render(
      readOnly || selected ? (
        <CodePreview text={text} language={language} />
      ) : null,
    );
  };
  presentation.listeners.add(render);
  render();
  return {
    ...original,
    dom: frame,
    ignoreMutation: (mutation) =>
      preview.contains(mutation.target) ||
      (original.ignoreMutation?.(mutation) ?? false),
    update(node) {
      text = node.textContent;
      language =
        typeof node.attrs.language === "string" ? node.attrs.language : "text";
      render();
      return true;
    },
    destroy() {
      presentation.listeners.delete(render);
      original.destroy?.();
      // NodeViews may be destroyed during a parent React commit.
      queueMicrotask(() => root.unmount());
    },
  };
};

const {
  paragraph,
  heading,
  bulletListItem,
  numberedListItem,
  checkListItem,
  quote,
  table,
  divider,
  toggleListItem,
} = defaultBlockSpecs;
export const schema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph,
    heading,
    bulletListItem,
    numberedListItem,
    checkListItem,
    quote,
    codeBlock,
    table,
    divider,
    toggleListItem,
    callout,
    image,
    video,
    audio,
    file,
  },
});
