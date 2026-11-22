import { createHighlighterCore } from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";
import type { CodeToken } from "./typography-code-tokens";
import { grammarLoaders } from "./typography-language-loaders.generated";
import { resolveCodeLanguage } from "./typography-language";

const themes = { light: "github-light", dark: "github-dark" } as const;
const createHighlighter = () =>
  createHighlighterCore({
    themes: [
      import("@shikijs/themes/github-light"),
      import("@shikijs/themes/github-dark"),
    ],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  });
let highlighter: ReturnType<typeof createHighlighter> | undefined;
const loaded = new Map<string, Promise<void>>();
const color = (value?: string) =>
  value && /^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value) ? value : undefined;

export async function highlightCode(
  text: string,
  language: string,
): Promise<CodeToken[]> {
  const id = resolveCodeLanguage(language);
  if (!id) return [{ text }];
  highlighter ??= createHighlighter().catch((error: unknown) => {
    highlighter = undefined;
    throw error;
  });
  const shiki = await highlighter;
  let grammar = loaded.get(id);
  if (!grammar) {
    grammar = shiki
      .loadLanguage(grammarLoaders[id]())
      .catch((error: unknown) => {
        loaded.delete(id);
        throw error;
      });
    loaded.set(id, grammar);
  }
  await grammar;

  // Shiki operates on normalized lines. Restore every original separator so
  // copying from the DOM preserves even mixed LF, CRLF, and CR input exactly.
  const pieces = text.split(/(\r\n|\n|\r)/);
  const lines = pieces.filter((_, index) => index % 2 === 0);
  const highlighted = shiki.codeToTokensWithThemes(lines.join("\n"), {
    lang: id,
    themes,
  });
  if (highlighted.length !== lines.length) return [{ text }];
  return highlighted.flatMap((line, index) => {
    const ending = pieces[index * 2 + 1];
    const tokens = line.map(({ content, variants }) => ({
      text: content,
      light: color(variants.light?.color),
      dark: color(variants.dark?.color),
    }));
    if (tokens.map((token) => token.text).join("") !== lines[index])
      return [{ text: lines[index] + (ending ?? "") }];
    return ending ? [...tokens, { text: ending }] : tokens;
  });
}
