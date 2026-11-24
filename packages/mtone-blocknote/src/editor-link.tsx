import * as React from "react";
import { Button, Input } from "@bixlab/mtone";
import type { Editor } from "./block-editor";

export function linkTarget(editor: Editor) {
  const { selection, schema, doc } = editor.prosemirrorState;
  const { from, to, $from } = selection;
  const link = schema.marks.link;
  if (from !== to || !link)
    return { from, to, doc, href: editor.getSelectedLinkUrl() };
  const parent = $from.parent;
  const offset = $from.parentOffset;
  const node = parent.childAfter(offset);
  const match =
    (node.node?.marks ?? []).find((mark) => mark.type === link) ??
    parent.childBefore(offset).node?.marks.find((mark) => mark.type === link);
  if (!match) return { from, to, doc };
  let start: number | undefined;
  let end: number | undefined;
  parent.forEach((child, childOffset) => {
    if (!match.isInSet(child.marks)) {
      if (childOffset < offset) {
        start = undefined;
        end = undefined;
      }
      return;
    }
    if (end !== undefined && childOffset !== end) return;
    if (start === undefined && childOffset > offset) return;
    start ??= childOffset;
    end = childOffset + child.nodeSize;
  });
  if (start === undefined || end === undefined || offset > end)
    return { from, to, doc };
  return {
    doc,
    from: $from.start() + start,
    to: Math.min(doc.content.size, $from.start() + end),
    href: match.attrs.href as string,
  };
}

export function safeLink(raw: string) {
  const value = raw.trim();
  if (
    !/^(https?:\/\/|mailto:|tel:)/i.test(value) ||
    /[\s\x00-\x1f\x7f]/.test(value)
  )
    return undefined;
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.hostname && !url.username && !url.password
        ? url.href
        : undefined;
    }
    return url.pathname &&
      (url.protocol === "mailto:" || url.protocol === "tel:")
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

export function EditorLinkForm({
  editor,
  target,
  zh,
  onClose,
}: {
  editor: Editor;
  target: ReturnType<typeof linkTarget>;
  zh: boolean;
  onClose: () => void;
}) {
  const [url, setUrl] = React.useState(target.href ?? "");
  const [error, setError] = React.useState<
    "invalid" | "stale" | "unsupported"
  >();
  const input = React.useRef<HTMLInputElement>(null);
  const errorId = React.useId();
  React.useEffect(() => {
    input.current?.focus();
  }, []);
  function apply(remove = false) {
    const href = remove ? undefined : safeLink(url);
    if (!remove && !href) {
      setError("invalid");
      return;
    }
    const { tr, schema, doc } = editor.prosemirrorState;
    const mark = schema.marks.link;
    if (target.doc !== doc) {
      setError("stale");
      return;
    }
    if (!mark || !doc.resolve(target.from).parent.type.allowsMarkType(mark)) {
      setError("unsupported");
      return;
    }
    let to = target.to;
    if (href && target.from === to) {
      tr.insertText(href, target.from, to);
      to += href.length;
    }
    tr.removeMark(target.from, to, mark);
    if (href) tr.addMark(target.from, to, mark.create({ href }));
    editor.prosemirrorView.dispatch(tr);
    onClose();
  }
  return (
    <div
      role="group"
      aria-label={zh ? "编辑链接" : "Edit link"}
      className="mt-block-editor-link"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
        if (event.key === "Enter" && event.target === input.current) {
          event.preventDefault();
          apply();
        }
      }}
    >
      <Input
        ref={input}
        aria-label={zh ? "链接地址" : "Link URL"}
        value={url}
        inputMode="url"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => {
          setUrl(event.target.value);
          setError(undefined);
        }}
        placeholder="https://example.com"
      />
      <Button type="button" onClick={() => apply()}>
        {zh ? "应用链接" : "Apply link"}
      </Button>
      {target.href && (
        <Button type="button" onClick={() => apply(true)}>
          {zh ? "移除链接" : "Remove link"}
        </Button>
      )}
      <Button type="button" onClick={onClose}>
        {zh ? "取消" : "Cancel"}
      </Button>
      {error && (
        <small id={errorId} role="alert">
          {error === "stale"
            ? zh
              ? "正文已修改。请关闭后重新选择链接位置。"
              : "The document changed. Close the form and choose the link position again."
            : error === "unsupported"
              ? zh
                ? "这里不支持链接。请选择一段普通正文。"
                : "Links aren't supported here. Choose normal text."
              : zh
                ? "请输入有效的 https、http、mailto 或 tel 链接。"
                : "Enter a valid https, http, mailto, or tel URL."}
        </small>
      )}
    </div>
  );
}
