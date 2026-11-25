import * as React from "react";
import { createReactBlockSpec } from "@blocknote/react";
import { Button, Input, Tooltip } from "@bixlab/mtone";
import { AudioLines, FileText, Film } from "lucide-react";
import type { BlockEditorBlock, Editor } from "./block-editor";
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

const safeMediaUrl = (raw: string) =>
  /^https?:\/\//i.test(raw.trim()) ? safeLink(raw) : undefined;

const mediaWidth = (width: number) =>
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

export function MediaForm({
  editor,
  target,
  zh,
  onClose,
}: {
  editor: Editor;
  target: MediaTarget;
  zh: boolean;
  onClose: () => void;
}) {
  const { kind, media } = target;
  const [, chinese, english] = mediaKinds.find(([key]) => key === kind)!;
  const [url, setUrl] = React.useState(media?.props.url ?? "");
  const [caption, setCaption] = React.useState(media?.props.caption ?? "");
  const [name, setName] = React.useState(
    media?.type === "file" ? media.props.name : "",
  );
  const [width, setWidth] = React.useState(
    String(media?.type === "video" ? media.props.width : 100),
  );
  const [error, setError] = React.useState("");
  const ref = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => ref.current?.focus({ preventScroll: true }), []);

  const save = () => {
    const safe = safeMediaUrl(url);
    if (!safe) {
      setError(
        zh ? "请输入有效的 HTTP(S) 地址。" : "Enter a valid HTTP(S) URL.",
      );
      return;
    }
    const anchor = editor.getBlock(target.anchor);
    if (!anchor || (media && anchor.type !== kind)) {
      setError(
        zh
          ? "原位置已变更，请重新选择。"
          : "The original block is no longer available.",
      );
      return;
    }
    const props = { url: safe, caption };
    const next =
      kind === "file"
        ? { type: kind, props: { ...props, name } }
        : kind === "video"
          ? {
              type: kind,
              props: {
                ...props,
                width: width === "" ? 100 : mediaWidth(Number(width)),
              },
            }
          : { type: kind, props };
    if (media || (anchor.type === "paragraph" && !anchor.content.length))
      editor.updateBlock(anchor, next);
    else editor.insertBlocks([next], anchor, "after");
    onClose();
  };

  return (
    <div
      className="mt-block-editor-link"
      role="group"
      aria-label={zh ? `${chinese}设置` : `${english} settings`}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)
          return;
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        } else if (
          event.key === "Enter" &&
          (event.target as HTMLElement).tagName === "INPUT"
        ) {
          event.preventDefault();
          save();
        }
      }}
    >
      <Input
        ref={ref}
        aria-label={zh ? `${chinese}地址` : `${english} URL`}
        value={url}
        onChange={(event) => setUrl(event.target.value)}
      />
      {kind === "file" && (
        <Input
          aria-label={zh ? "附件名称" : "File name"}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      )}
      <Input
        aria-label={zh ? `${chinese}说明` : "Caption"}
        value={caption}
        onChange={(event) => setCaption(event.target.value)}
      />
      {kind === "video" && (
        <Input
          type="number"
          min={25}
          max={100}
          aria-label={zh ? "视频宽度（%）" : "Video width (%)"}
          value={width}
          onChange={(event) => setWidth(event.target.value)}
        />
      )}
      <Button type="button" size="small" onClick={save}>
        {zh ? `应用${chinese}` : `Apply ${english.toLowerCase()}`}
      </Button>
      <Button type="button" size="small" variant="ghost" onClick={onClose}>
        {zh ? "取消" : "Cancel"}
      </Button>
      {error && <small role="alert">{error}</small>}
    </div>
  );
}
