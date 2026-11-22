import { readFileSync, writeFileSync } from "node:fs";
import { languageNames, languageAliasNames } from "@shikijs/langs";

const filename = new URL("../packages/mtone/src/typography-languages.generated.ts", import.meta.url);
const loaderFilename = new URL("../packages/mtone/src/typography-language-loaders.generated.ts", import.meta.url);
const names = [...languageNames].sort();
const canonical = new Set(names);
const identifier = /^[a-z0-9][a-z0-9-]*$/;
const aliases = Object.fromEntries([...languageAliasNames].sort().map((alias) => {
  if (!identifier.test(alias) || canonical.has(alias)) throw new Error(`Unexpected Shiki alias ${alias}`);
  const entry = new URL(import.meta.resolve(`@shikijs/langs/${alias}`));
  const source = readFileSync(entry, "utf8");
  // The installed package's public alias subpaths forward to the canonical module.
  const target = source.match(/export \{ default \} from '\.\/([a-z0-9-]+)\.mjs'/)?.[1];
  if (!target || !canonical.has(target)) throw new Error(`Cannot resolve Shiki alias ${alias}`);
  return [alias, target];
}));
for (const name of names) {
  if (!identifier.test(name)) throw new Error(`Unexpected Shiki language: ${name}`);
  import.meta.resolve(`@shikijs/langs/${name}`);
}

const header = "// Generated from the installed Shiki catalog by scripts/generate-typography-languages.mjs.\n";
const matchers = header +
  `export const languageNames = ${JSON.stringify(names, null, 2)} as const;\n` +
  `export const languageAliases: Readonly<Record<string, string>> = ${JSON.stringify(aliases, null, 2)};\n`;
const loaders = header +
  'import type { LanguageRegistration } from "@shikijs/core";\n\n' +
  'export const grammarLoaders: Readonly<Record<string, () => Promise<{ default: LanguageRegistration[] }>>> = {\n' +
  names.map((name) => `  "${name}": () => import("@shikijs/langs/${name}"),\n`).join("") +
  "};\n";
for (const [file, source] of [[filename, matchers], [loaderFilename, loaders]]) {
  if (process.argv.includes("--check")) {
    if (readFileSync(file, "utf8") !== source) throw new Error(`Outdated Shiki catalog: ${file.pathname}`);
  } else {
    writeFileSync(file, source);
  }
}
