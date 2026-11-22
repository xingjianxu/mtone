import { execFileSync } from "node:child_process";
import { languageAliasNames, languageNames } from "@shikijs/langs";
import { expect, it } from "vitest";
import { highlightCode } from "../packages/mtone/src/typography-highlight";
import { resolveCodeLanguage } from "../packages/mtone/src/typography-language";

it("keeps all generated loaders and aliases in sync with pinned Shiki", () => {
  execFileSync(process.execPath, ["scripts/generate-typography-languages.mjs", "--check"]);
  for (const alias of languageAliasNames) {
    expect(languageNames).toContain(resolveCodeLanguage(alias));
  }
  expect(resolveCodeLanguage("__proto__")).toBeUndefined();
});

it("loads and tokenizes with every bundled grammar using the JavaScript engine", async () => {
  const source = "example = 42 // comment";
  for (const id of languageNames) {
    const tokens = await highlightCode(source, id);
    expect(tokens.map(({ text }) => text).join(""), id).toBe(source);
    expect(tokens.some(({ light, dark }) => light && dark), id).toBe(true);
  }
}, 60_000);
