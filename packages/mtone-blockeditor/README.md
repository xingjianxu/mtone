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

Use a new `documentKey` to load a different `initialContent`; do not feed the change event back as a controlled value. Persist and validate the returned BlockNote JSON in your app. Set `readOnly` for view-only presentation, not for access control.

For Next.js, dynamically load the editor in a client component with `ssr: false`. To support on-screen keyboard layout in Chromium, add `interactive-widget=resizes-content` to the viewport settings. The editor supports basic tables, collapsible blocks, semantic callouts, and images by HTTP(S) URL. Pass `uploadImage(file)` to connect your own image storage; the package supplies neither storage nor a backend. Code stays editable in BlockNote, with mtone Typography.Code used for highlighted preview and read-only display. Cell merging, collaboration, and AI are not included. See the [shared documentation](https://xingjianxu.github.io/mtone/#/components/BlockEditor).

## Development

From the repository root, use `npm run build:docs` to build both workspace packages and the shared site. `npm run build -w @bixlab/mtone-blockeditor` builds the editor package alone after its mtone peer is built.
