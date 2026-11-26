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

Use a new `documentKey` to load a different `initialContent`; do not feed the change event back as a controlled value. Persist and validate the returned BlockNote JSON in your app. Set `readOnly` for view-only presentation, not for access control. Use `borderless` to remove the outer frame while retaining the editor controls and keyboard focus indicator. Enable `fillHeight` in a parent with a definite height to fill it without introducing an internal scroll area. Long content can still grow, and without a definite parent height the editor keeps its 15rem content minimum. Select text to open the single-row toolbar for block type, formatting, alignment, colors, indentation, and links. Text and background colors share a grouped menu with independent defaults. The trailing More button opens Undo and Redo; narrow toolbars scroll horizontally. Table, image and media actions float next to the active block. Hover a table to access its row and column grips: drag to reorder or click for insert and delete actions. The bottom and right plus buttons append a row or column. Type `/` to insert content.

For Next.js, dynamically load the editor in a client component with `ssr: false`. To support on-screen keyboard layout in Chromium, add `interactive-widget=resizes-content` to the viewport settings. The editor supports basic tables, collapsible blocks, semantic callouts, and images by HTTP(S) URL. Code stays editable in BlockNote with live Shiki highlighting and a monospace font. Grammar files are loaded on demand from the application assets, not a CDN. The optional preview and read-only display still use mtone Typography.Code. Use `/Video`, `/Audio`, or `/File` with a direct HTTP(S) URL to add media. Media and image captions are shown in tooltips on hover or keyboard focus; video supports a responsive width percentage (25–100), and files support an optional display name and open in a new tab. Neither autoplays. Audio uses mtone playback, seek, volume and speed controls in both editing and read-only mode; narrower layouts move volume and speed into More. Video uses native controls. Cell merging, collaboration, and AI are not included. See the [shared documentation](https://xingjianxu.github.io/mtone/#/components/BlockEditor).

## Focus the editor

Pass a React ref typed as `BlockEditorRef` to `BlockEditor` and call `ref.current?.focus()` to return focus to the editable document. The ref is unavailable until the editor mounts; calling focus in read-only mode is a no-op. This interface does not expose the underlying editor instance.

## Document statistics

`getBlockEditorStats(blocks)` is independent of the editor instance. Pass saved blocks, initial content, or the latest blocks from `onChange`.

```ts
import { getBlockEditorStats } from "@bixlab/mtone-blockeditor";

const stats = getBlockEditorStats([{ type: "paragraph", content: "你好 world" }]);
// { wordCount: 3, characterCount: 8, nonWhitespaceCharacterCount: 7, blockCount: 1 }
```

Each Han character counts as one word, and each run of other letters or numbers counts as one word. Internal apostrophes do not split words. Punctuation and emoji do not count as words. Character counts use Unicode grapheme clusters when `Intl.Segmenter` is available and Unicode code points otherwise. The totals include nested blocks, code, table cell text, and link labels, but not metadata such as media captions or link URLs. Blocks and cells are counted independently without adding separator characters. The block count includes nested, empty, and non-text blocks; table cells are not blocks.

## Upload or embed a file

Without an upload callback, the editor only asks for a direct HTTP(S) URL. Pass `uploadFile(file): Promise<string>` to enable both Upload and Embed link for images, video, audio, and attachments. Upload supports selecting or dropping one file at a time and retrying after an error. Return a durable direct HTTP(S) URL for the saved file, not a `blob:` URL. The package does not transmit or store files itself: validate type, size, and permissions in your upload service. Cancel closes the panel and ignores any pending result; it does not cancel a request started by your callback. The existing `uploadImage` is an image-only fallback when `uploadFile` is not provided.

## Development

From the repository root, use `npm run build:docs` to build both workspace packages and the shared site. `npm run build -w @bixlab/mtone-blockeditor` builds the editor package alone after its mtone peer is built.
