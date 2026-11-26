import type { BlockEditorInput } from "./block-editor";

export interface BlockEditorStats {
  /** Each Han character and each run of other letters or numbers counts once. */
  wordCount: number;
  /** User-perceived characters, including whitespace and punctuation. */
  characterCount: number;
  nonWhitespaceCharacterCount: number;
  /** All document blocks, including nested, empty and non-text blocks. */
  blockCount: number;
}

function inlineText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(inlineText).join("");
  if (value && typeof value === "object" && "type" in value) {
    if (
      value.type === "text" &&
      "text" in value &&
      typeof value.text === "string"
    )
      return value.text;
    if (
      (value.type === "link" || value.type === "tableCell") &&
      "content" in value
    )
      return inlineText(value.content);
  }
  return "";
}

// Split Han before counting other words; a contraction is one word, while
// punctuation separates runs. This is a count, not a language tokenizer.
const han = /\p{Script=Han}/gu;
const word =
  /[\p{L}\p{N}][\p{L}\p{N}\p{M}]*(?:['’][\p{L}\p{N}][\p{L}\p{N}\p{M}]*)*/gu;

/**
 * Count the text of a BlockEditor document without mounting the editor.
 * Accepts both saved full blocks and partial initial content. Only the
 * document content is counted, not metadata such as captions or link URLs.
 */
export function getBlockEditorStats(
  blocks: readonly BlockEditorInput[],
): BlockEditorStats {
  const stats: BlockEditorStats = {
    wordCount: 0,
    characterCount: 0,
    nonWhitespaceCharacterCount: 0,
    blockCount: 0,
  };
  const segmenter =
    typeof Intl.Segmenter === "function"
      ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
      : undefined;

  const countCharacter = (character: string) => {
    stats.characterCount++;
    if (!/^\s+$/u.test(character)) stats.nonWhitespaceCharacterCount++;
  };
  const countText = (value: unknown) => {
    const text = inlineText(value);
    if (!text) return;
    const withoutHan = text.replace(han, () => {
      stats.wordCount++;
      return " ";
    });
    for (const _ of withoutHan.matchAll(word)) stats.wordCount++;
    if (segmenter) {
      for (const { segment } of segmenter.segment(text))
        countCharacter(segment);
    } else {
      for (const character of text) countCharacter(character);
    }
  };

  const visit = (list: readonly BlockEditorInput[]) => {
    for (const { content, children } of list) {
      stats.blockCount++;
      if (
        content &&
        typeof content === "object" &&
        !Array.isArray(content) &&
        content.type === "tableContent"
      ) {
        for (const { cells } of content.rows) {
          for (const cell of cells) countText(cell);
        }
      } else countText(content);
      if (children?.length) visit(children);
    }
  };
  visit(blocks);
  return stats;
}
