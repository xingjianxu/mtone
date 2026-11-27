# @bixlab/mtone-blockeditor

An optional React block editor using mtone controls and the BlockNote editing engine. The package is not part of, installed by, or exported by `@bixlab/mtone`.

Install `npm install @bixlab/mtone @bixlab/mtone-blockeditor` and import both stylesheets:

```tsx
"use client";

import { BlockEditor } from "@bixlab/mtone-blockeditor";
import "@bixlab/mtone/styles.css";
import "@bixlab/mtone-blockeditor/styles.css";

export default function Notes() {
  return <BlockEditor
    documentKey="notes"
    label="Project notes"
    locale="en"
    initialContent={[{ type: "paragraph", content: "Start here." }]}
    onChange={(blocks) => console.log(JSON.stringify(blocks))}
  />;
}
```

Use a new `documentKey` to load a different `initialContent`; do not feed the change event back as a controlled value. Persist and validate the returned BlockNote JSON in your app. Set `readOnly` for view-only presentation, not for access control. Use `borderless` to remove the outer frame while retaining the editor controls and keyboard focus indicator. Enable `fillHeight` in a parent with a definite height to fill it without introducing an internal scroll area. Long content can still grow, and without a definite parent height the editor keeps its 15rem content minimum. Select text to open the single-row toolbar for block type, formatting, alignment, colors, indentation, and links. Text and background colors share a grouped menu with independent defaults. The trailing More button opens Undo and Redo; narrow toolbars scroll horizontally. Table, image and media actions float next to the active block. Select a table cell to use the contextual toolbar to move, insert, and delete rows and columns. The editor no longer renders separate row and column grips. Type `/` to insert content.

For Next.js, dynamically load the editor in a client component with `ssr: false`. To support on-screen keyboard layout in Chromium, add `interactive-widget=resizes-content` to the viewport settings. The editor supports basic tables, collapsible blocks, semantic callouts, and images by HTTP(S) URL. Code stays editable in BlockNote with live Shiki highlighting and a monospace font. Grammar files are loaded on demand from the application assets, not a CDN. The optional preview and read-only display still use mtone Typography.Code. Use `/Video`, `/Audio`, or `/File` with a direct HTTP(S) URL to add media. Media and image captions are shown in tooltips on hover or keyboard focus; video supports a responsive width percentage (25–100), and files support an optional display name and open in a new tab. Neither autoplays. Audio uses mtone playback, seek, volume and speed controls in both editing and read-only mode; narrower layouts move volume and speed into More. Video uses native controls. Cell merging, collaboration, and AI are not included. See the [shared documentation](https://xingjianxu.github.io/mtone/#/components/BlockEditor).

## Native BlockNote extensions

Pass a React ref typed as `BlockEditorRef` to call `ref.current?.focus()` or
`ref.current?.getEditor()`. The second returns the actual BlockNote instance,
not a copy. The ref is unavailable until mount. Re-read it after changing
`documentKey`; do not destroy, mount, or keep using the old instance. In
read-only mode, the ref still provides the instance, but `focus()` is a no-op.
The read-only UI does not limit imperative calls or enforce permissions.

When using the native APIs, declare `@blocknote/core` and `@blocknote/react`
as direct dependencies of your app and match the versions in this package
(currently both `0.57.0`). Multiple copies can break React context.

- Pass `inlineContentSpecs={{ mention }}` with a native spec from
  `createReactInlineContentSpec`. The key must match its type; built-in text
  and link specs cannot be replaced. The specs are read once per document key
  and preserve mtone's built-in blocks and styles. Supply the same specs when
  displaying saved documents, including in read-only mode.
- Pass `renderExtensions={(editor) => <MyNativeControllers editor={editor} />}`
  to mount controls inside the BlockNote view. The slot is not mounted in
  read-only mode. Put hooks in the returned component, not in the callback.
- Use `BlockEditorRef<typeof inlineContentSpecs>`,
  `BlockEditorInput<typeof inlineContentSpecs>`, and
  `BlockEditorBlock<typeof inlineContentSpecs>` for typed native access and
  document data. Keep custom node props serializable.

See the [interactive native @ mention example](https://xingjianxu.github.io/mtone/#/components/BlockEditor?section=native-extensions)
for asynchronous `getItems`, a custom candidate list, and a separately rendered
inline token. mtone does not wrap the mentions API; your app owns the directory
request, failure handling, and the stable IDs stored in the document.

## Document statistics

`getBlockEditorStats(blocks)` is independent of the editor instance. Pass saved blocks, initial content, or the latest blocks from `onChange`.

```ts
import { getBlockEditorStats } from "@bixlab/mtone-blockeditor";

const stats = getBlockEditorStats([{ type: "paragraph", content: "你好 world" }]);
// { wordCount: 3, characterCount: 8, nonWhitespaceCharacterCount: 7, blockCount: 1 }
```

Each Han character counts as one word, and each run of other letters or numbers counts as one word. Internal apostrophes do not split words. Punctuation and emoji do not count as words. Character counts use Unicode grapheme clusters when `Intl.Segmenter` is available and Unicode code points otherwise. The totals include nested blocks, code, table cell text, and link labels, but not metadata such as media captions, link URLs, or custom inline labels. Blocks and cells are counted independently without adding separator characters. The block count includes nested, empty, and non-text blocks; table cells are not blocks.

## Upload or embed a file

Without an upload callback, the editor only asks for a direct HTTP(S) URL. Pass `uploadFile(file): Promise<string>` to enable both Upload and Embed link for images, video, audio, and attachments. Upload supports selecting or dropping one file at a time and retrying after an error. Return a durable direct HTTP(S) URL for the saved file, not a `blob:` URL. The package does not transmit or store files itself: validate type, size, and permissions in your upload service. Cancel closes the panel and ignores any pending result; it does not cancel a request started by your callback. The existing `uploadImage` is an image-only fallback when `uploadFile` is not provided.

## Development

From the repository root, use `npm run build:docs` to build both workspace packages and the shared site. `npm run build -w @bixlab/mtone-blockeditor` builds the editor package alone after its mtone peer is built.
