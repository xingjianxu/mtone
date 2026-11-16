export type MentionMatch = {
  prefix: string;
  query: string;
  start: number;
  end: number;
};
export function mentionPrefixes(prefix: string | string[]) {
  return [...new Set(typeof prefix === "string" ? [prefix] : prefix)]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
}
function boundary(text: string, index: number, split: string) {
  return (
    index === 0 ||
    /\s/.test(text[index - 1]) ||
    (!!split && text.slice(0, index).endsWith(split))
  );
}
export function findMention(
  text: string,
  caret: number,
  prefix: string | string[],
  split: string,
  validate?: (query: string, split: string) => boolean,
): MentionMatch | null {
  const before = text.slice(0, caret);
  for (let start = before.length - 1; start >= 0; start--) {
    if (!boundary(before, start, split)) continue;
    const token = mentionPrefixes(prefix).find((p) =>
      before.startsWith(p, start),
    );
    if (!token) continue;
    const query = before.slice(start + token.length);
    if (
      validate
        ? !validate(query, split)
        : /\s/.test(query) || (!!split && query.includes(split))
    )
      return null;
    return { prefix: token, query, start, end: caret };
  }
  return null;
}
export function insertMention(
  text: string,
  match: MentionMatch,
  value: string,
  split: string,
) {
  const suffix = text.slice(match.end);
  const inserted = match.prefix + value;
  const separator = split && !suffix.startsWith(split) ? split : "";
  const next = text.slice(0, match.start) + inserted + separator + suffix;
  return {
    value: next,
    caret:
      match.start +
      inserted.length +
      (suffix.startsWith(split) ? split.length : separator.length),
  };
}
/** Extract boundary-delimited mentions from plain text; does not validate membership in options. */
export function getMentions(
  value: string,
  config: { prefix?: string | string[]; split?: string } = {},
) {
  const { prefix = "@", split = " " } = config;
  const tokens = mentionPrefixes(prefix),
    result: { prefix: string; value: string }[] = [];
  for (let i = 0; i < value.length; i++) {
    if (!boundary(value, i, split)) continue;
    const token = tokens.find((p) => value.startsWith(p, i));
    if (!token) continue;
    let end = i + token.length;
    while (
      end < value.length &&
      !/\s/.test(value[end]) &&
      !(split && value.startsWith(split, end))
    )
      end++;
    const content = value.slice(i + token.length, end);
    if (content) result.push({ prefix: token, value: content });
    i = end - 1;
  }
  return result;
}
