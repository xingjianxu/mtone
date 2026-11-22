import { languageAliases, languageNames } from "./typography-languages.generated";

const canonical: ReadonlySet<string> = new Set(languageNames);

export function resolveCodeLanguage(language: string) {
  const id = language.trim().toLowerCase();
  if (canonical.has(id)) return id;
  return Object.hasOwn(languageAliases, id) ? languageAliases[id] : undefined;
}
