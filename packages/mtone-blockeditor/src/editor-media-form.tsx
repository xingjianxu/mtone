import * as React from "react";
import { Button, Input, Tabs } from "@bixlab/mtone";
import { Upload } from "lucide-react";
import type {
  BlockEditorBlock,
  BlockEditorProps,
  Editor,
} from "./block-editor";
import {
  mediaKinds,
  mediaWidth,
  safeMediaUrl,
  type MediaTarget,
} from "./editor-media";

export type ImageTarget = {
  anchor: string;
  image?: Extract<BlockEditorBlock, { type: "image" }>;
};
type Target = MediaTarget | ({ kind: "image" } & ImageTarget);

function MediaField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mt-block-editor-media-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function MediaForm({
  editor,
  target,
  zh,
  upload,
  onClose,
}: {
  editor: Editor;
  target: Target;
  zh: boolean;
  upload?: BlockEditorProps["uploadFile"];
  onClose: () => void;
}) {
  const { kind } = target;
  const existing = target.kind === "image" ? target.image : target.media;
  const [, chinese, english] =
    kind === "image"
      ? [kind, "图片", "Image"]
      : mediaKinds.find(([key]) => key === kind)!;
  const accept = kind === "file" ? undefined : `${kind}/*`;
  const [source, setSource] = React.useState(
    upload && !existing?.props.url ? "upload" : "embed",
  );
  const [url, setUrl] = React.useState(existing?.props.url ?? "");
  const [caption, setCaption] = React.useState(existing?.props.caption ?? "");
  const [alt, setAlt] = React.useState(
    existing?.type === "image" ? existing.props.alt : "",
  );
  const [name, setName] = React.useState(
    existing?.type === "file" ? existing.props.name : "",
  );
  const [width, setWidth] = React.useState(
    String(existing?.type === "video" ? existing.props.width : 100),
  );
  const [file, setFile] = React.useState<File>();
  const [dragging, setDragging] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [uploadFailed, setUploadFailed] = React.useState(false);
  const [error, setError] = React.useState("");
  const input = React.useRef<HTMLInputElement>(null);
  const picker = React.useRef<HTMLInputElement>(null);
  const choose = React.useRef<HTMLButtonElement>(null);
  const activeUpload = React.useRef<object | null>(null);
  const uploading = Boolean(upload && source === "upload");
  React.useLayoutEffect(() => {
    (input.current ?? choose.current)?.focus({ preventScroll: true });
    return () => {
      activeUpload.current = null;
    };
  }, []);

  const close = () => {
    activeUpload.current = null;
    onClose();
  };

  function selectFile(files: FileList | File[]) {
    if (!uploading || activeUpload.current || !files.length) return;
    setDragging(false);
    setUploadFailed(false);
    if (files.length !== 1) {
      setError(zh ? "一次只能选择一个文件。" : "Choose one file at a time.");
      return;
    }
    const next = files[0];
    if (accept && next.type && !next.type.startsWith(`${kind}/`)) {
      setError(
        zh
          ? `请选择${chinese}文件。`
          : `Choose a file matching ${english.toLowerCase()}.`,
      );
      return;
    }
    if (kind === "file" && (!name || name === file?.name)) setName(next.name);
    setFile(next);
    setError("");
  }

  function commit(safe: string) {
    const anchor = editor.getBlock(target.anchor);
    if (!anchor || (existing && anchor.type !== kind)) {
      setError(
        zh
          ? "原位置已变更，请重新选择。"
          : "The original block is no longer available.",
      );
      return;
    }
    const props = { url: safe, caption };
    const next =
      kind === "image"
        ? { type: kind, props: { ...props, alt } }
        : kind === "file"
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

    if (existing || (anchor.type === "paragraph" && !anchor.content.length)) {
      editor.updateBlock(anchor, next);
    } else {
      editor.insertBlocks([next], anchor, "after");
    }
    close();
  }

  async function save() {
    if (activeUpload.current) return;
    if (!uploading || !upload) {
      const safe = safeMediaUrl(url);
      if (!safe) {
        setError(
          zh ? "请输入有效的 HTTP(S) 地址。" : "Enter a valid HTTP(S) URL.",
        );
        return;
      }
      commit(safe);
      return;
    }
    if (!file) return;
    const attempt = {};
    activeUpload.current = attempt;
    setBusy(true);
    setError("");
    setUploadFailed(false);
    try {
      const result = await upload(file);
      if (activeUpload.current !== attempt) return;
      const safe = typeof result === "string" && safeMediaUrl(result);
      if (!safe) {
        setUploadFailed(true);
        setError(
          zh
            ? "上传未返回有效的 HTTP(S) 地址。"
            : "Upload did not return a valid HTTP(S) URL.",
        );
        return;
      }
      commit(safe);
    } catch {
      if (activeUpload.current !== attempt) return;
      setUploadFailed(true);
      setError(zh ? "上传失败，请重试。" : "Upload failed. Try again.");
    } finally {
      if (activeUpload.current === attempt) {
        activeUpload.current = null;
        setBusy(false);
      }
    }
  }

  const embed = (
    <MediaField label={zh ? `${chinese}地址` : `${english} URL`}>
      <Input
        ref={input}
        placeholder="https://"
        value={url}
        onChange={(event) => {
          setUrl(event.target.value);
          setError("");
        }}
      />
    </MediaField>
  );
  const uploadArea = (
    <div
      className="mt-block-editor-upload-area"
      data-dragging={dragging || undefined}
      onDragOver={(event) => {
        if (!Array.from(event.dataTransfer.types).includes("Files")) return;
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = busy ? "none" : "copy";
        if (!busy) setDragging(true);
      }}
      onDragLeave={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        )
          setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        selectFile(event.dataTransfer.files);
      }}
    >
      <input
        ref={picker}
        type="file"
        accept={accept}
        aria-label={zh ? "本地文件" : "Local file"}
        disabled={busy}
        hidden
        onChange={(event) => {
          if (event.currentTarget.files) selectFile(event.currentTarget.files);
          event.currentTarget.value = "";
        }}
      />
      <Button
        ref={choose}
        type="button"
        variant="ghost"
        size="small"
        disabled={busy}
        leftSection={<Upload size={15} aria-hidden />}
        onClick={() => picker.current?.click()}
      >
        {file
          ? zh
            ? "更换文件"
            : "Change file"
          : zh
            ? "选择文件"
            : "Choose file"}
      </Button>
      <span className="mt-block-editor-upload-label" title={file?.name}>
        {file?.name ?? (zh ? "或把文件拖到这里" : "or drop a file here")}
      </span>
    </div>
  );

  return (
    <div
      className="mt-block-editor-media-form"
      role="group"
      aria-label={zh ? `${chinese}设置` : `${english} settings`}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229)
          return;
        if (event.key === "Escape") {
          event.stopPropagation();
          close();
        } else if (
          event.key === "Enter" &&
          event.target instanceof HTMLInputElement &&
          event.target.type !== "file"
        ) {
          event.preventDefault();
          void save();
        }
      }}
    >
      {upload ? (
        <Tabs
          size="sm"
          gap={0}
          label={zh ? "文件来源" : "File source"}
          value={source}
          onValueChange={(value) => {
            if (busy) return;
            setSource(value);
            setError("");
            setDragging(false);
          }}
          items={[
            {
              value: "upload",
              label: zh ? "上传" : "Upload",
              content: uploadArea,
            },
            {
              value: "embed",
              label: zh ? "嵌入链接" : "Embed link",
              disabled: busy,
              content: embed,
            },
          ]}
        />
      ) : (
        embed
      )}
      {kind === "file" && (
        <MediaField label={zh ? "附件名称" : "File name"}>
          <Input
            disabled={busy}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </MediaField>
      )}
      {kind === "image" && (
        <MediaField label={zh ? "替代文本" : "Alternative text"}>
          <Input
            disabled={busy}
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
          />
        </MediaField>
      )}
      <MediaField label={zh ? `${chinese}说明` : "Caption"}>
        <Input
          disabled={busy}
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
        />
      </MediaField>
      {kind === "video" && (
        <MediaField label={zh ? "视频宽度（%）" : "Video width (%)"}>
          <Input
            disabled={busy}
            type="number"
            min={25}
            max={100}
            value={width}
            onChange={(event) => setWidth(event.target.value)}
          />
        </MediaField>
      )}
      <div className="mt-block-editor-media-form-actions">
        <Button
          type="button"
          size="small"
          disabled={busy || (uploading && !file)}
          onClick={save}
        >
          {uploading
            ? uploadFailed
              ? zh
                ? "重试上传"
                : "Retry upload"
              : zh
                ? "上传并应用"
                : "Upload and apply"
            : zh
              ? `应用${chinese}`
              : `Apply ${english.toLowerCase()}`}
        </Button>
        <Button type="button" size="small" variant="ghost" onClick={close}>
          {zh ? "取消" : "Cancel"}
        </Button>
      </div>
      {busy && <small role="status">{zh ? "正在上传…" : "Uploading…"}</small>}
      {error && <small role="alert">{error}</small>}
    </div>
  );
}
