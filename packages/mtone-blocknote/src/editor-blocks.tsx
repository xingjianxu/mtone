import * as React from "react";
import { createRoot } from "react-dom/client";
import {
  BlockNoteSchema,
  createCodeBlockSpec,
  defaultBlockSpecs,
} from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Image, Typography } from "@bixlab/mtone";
import { Info, Lightbulb, TriangleAlert } from "lucide-react";
import { safeLink } from "./editor-link";

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
    render: ({ block }) => {
      const url = safeImageUrl(block.props.url);
      return (
        <figure className="mt-block-editor-image">
          {url && (
            <Image
              src={url}
              alt={block.props.alt}
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          )}
          {block.props.caption && (
            <figcaption>{block.props.caption}</figcaption>
          )}
        </figure>
      );
    },
  },
)();

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
  const render = () =>
    root.render(<CodePreview text={text} language={language} />);
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
  },
});
