import * as React from "react";
import { createReactBlockSpec } from "@blocknote/react";
import { Tooltip } from "@bixlab/mtone";
import { AudioLines, FileText, Film } from "lucide-react";
import type { BlockEditorBlock } from "./block-editor";
import { safeLink } from "./editor-link";
import { AudioPlayer } from "./editor-audio-player";

export const mediaKinds = [
  ["video", "视频", "Video", Film],
  ["audio", "音频", "Audio", AudioLines],
  ["file", "附件", "File", FileText],
] as const;

type MediaKind = (typeof mediaKinds)[number][0];
export type MediaBlock = Extract<BlockEditorBlock, { type: MediaKind }>;
export type MediaTarget = {
  kind: MediaKind;
  anchor: string;
  media?: MediaBlock;
};

export function isMediaBlock(block: BlockEditorBlock): block is MediaBlock {
  return mediaKinds.some(([kind]) => kind === block.type);
}

const mediaProps = {
  url: { default: "" },
  caption: { default: "" },
};

export const safeMediaUrl = (raw: string) =>
  /^https?:\/\//i.test(raw.trim()) ? safeLink(raw) : undefined;

export const mediaWidth = (width: number) =>
  Number.isFinite(width) ? Math.min(100, Math.max(25, width)) : 100;

function MediaFigure({
  kind,
  url: rawUrl,
  caption,
  name,
  width,
  onSelect,
}: {
  kind: MediaKind;
  url: string;
  caption: string;
  name?: string;
  width?: number;
  onSelect?: () => void;
}) {
  const url = safeMediaUrl(rawUrl);
  const label = name || mediaKinds.find(([key]) => key === kind)?.[2];
  const fileName =
    url && kind === "file"
      ? name?.trim() ||
        new URL(url).pathname.split("/").pop() ||
        new URL(url).hostname
      : undefined;
  const fileLink = fileName && (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <FileText size={16} aria-hidden />
      <span>{fileName}</span>
    </a>
  );
  const figureNote = !fileLink && caption.trim();
  const figure = (
    <figure
      tabIndex={figureNote ? 0 : onSelect ? -1 : undefined}
      onKeyDown={
        onSelect &&
        ((event) => {
          if (
            event.target !== event.currentTarget ||
            event.key !== "Enter" ||
            event.nativeEvent.isComposing
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          onSelect();
        })
      }
      className="mt-block-editor-media"
      data-kind={kind}
      onClick={
        onSelect &&
        ((event) => {
          const target = event.target as Element;
          if (
            event.currentTarget.contains(target) &&
            !target.closest("a, video, [data-mt-audio-control]")
          )
            onSelect();
        })
      }
      style={
        width === undefined ? undefined : { width: `${mediaWidth(width)}%` }
      }
    >
      {url && kind === "video" && (
        <video
          src={url}
          controls
          preload="none"
          playsInline
          aria-label={label}
        />
      )}
      {url && kind === "audio" && <AudioPlayer key={url} url={url} />}
      {fileLink &&
        (caption.trim() ? (
          <Tooltip content={caption}>{fileLink}</Tooltip>
        ) : (
          fileLink
        ))}
      {!url && (
        <span>{name || mediaKinds.find(([key]) => key === kind)?.[2]}</span>
      )}
    </figure>
  );
  return figureNote ? <Tooltip content={caption}>{figure}</Tooltip> : figure;
}

export const video = createReactBlockSpec(
  {
    type: "video",
    propSchema: { ...mediaProps, width: { default: 100 } },
    content: "none",
  },
  {
    meta: { fileBlockAccept: ["video/*"] },
    render: ({ block, editor }) => (
      <MediaFigure
        kind="video"
        {...block.props}
        onSelect={() => {
          if (!editor.isEditable) return;
          editor.setTextCursorPosition(block.id);
          editor.focus();
        }}
      />
    ),
  },
)();

export const audio = createReactBlockSpec(
  { type: "audio", propSchema: mediaProps, content: "none" },
  {
    meta: { fileBlockAccept: ["audio/*"] },
    render: ({ block, editor }) => (
      <MediaFigure
        kind="audio"
        {...block.props}
        onSelect={() => {
          if (!editor.isEditable) return;
          editor.setTextCursorPosition(block.id);
          editor.focus();
        }}
      />
    ),
  },
)();

export const file = createReactBlockSpec(
  {
    type: "file",
    propSchema: { ...mediaProps, name: { default: "" } },
    content: "none",
  },
  {
    render: ({ block, editor }) => (
      <MediaFigure
        kind="file"
        {...block.props}
        onSelect={() => {
          if (!editor.isEditable) return;
          editor.setTextCursorPosition(block.id);
          editor.focus();
        }}
      />
    ),
  },
)();
