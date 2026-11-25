import { SyntaxHighlightingExtension } from "@blocknote/core/extensions";

// BlockNote decorates editable text without changing the document. Keep the
// Shiki setup and language grammars lazy; the host page serves these assets.
export const editorCodeHighlight = SyntaxHighlightingExtension({
  async createHighlighter() {
    const [
      { createBundledHighlighter },
      { createJavaScriptRegexEngine },
      { bundledLanguages },
    ] = await Promise.all([
      import("shiki/core"),
      import("shiki/engine/javascript"),
      import("shiki/langs"),
    ]);
    return createBundledHighlighter({
      langs: bundledLanguages,
      themes: {
        "github-light": () => import("@shikijs/themes/github-light"),
        "github-dark": () => import("@shikijs/themes/github-dark"),
      },
      engine: createJavaScriptRegexEngine,
    })({ langs: [], themes: ["github-light", "github-dark"] });
  },
});
