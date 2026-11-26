import { expect, test } from "vitest";
import { getBlockEditorStats } from "../packages/mtone-blockeditor/src";
import type { BlockEditorInput } from "../packages/mtone-blockeditor/src";

test("counts zero for no document, and counts empty or non-text blocks only as blocks", () => {
  const zero = {
    wordCount: 0,
    characterCount: 0,
    nonWhitespaceCharacterCount: 0,
    blockCount: 0,
  };
  expect(getBlockEditorStats([])).toEqual(zero);
  expect(
    getBlockEditorStats([
      { type: "paragraph" },
      {
        type: "image",
        props: { url: "https://example.com/p.png", caption: "not body text" },
      },
      { type: "divider" },
    ]),
  ).toEqual({ ...zero, blockCount: 3 });
});

test("counts mixed languages, punctuation, tabs and visible Unicode graphemes", () => {
  expect(
    getBlockEditorStats([
      { content: "中文 hello-world\t12 don't! 👩‍💻 e\u0301" },
    ]),
  ).toEqual({
    wordCount: 7,
    characterCount: 28,
    nonWhitespaceCharacterCount: 23,
    blockCount: 1,
  });
});

test("joins inline spans, counts table cell text independently and visits nested blocks", () => {
  const input = [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "hel", styles: { bold: true } },
        { type: "link", href: "https://example.com/ignored", content: "lo" },
        " 世界",
      ],
      children: [{ type: "codeBlock", content: "x\ny" }],
    },
    {
      type: "table",
      content: {
        type: "tableContent",
        rows: [
          { cells: ["A", "B"] },
          {
            cells: [
              {
                type: "tableCell",
                content: [{ type: "text", text: "软件", styles: {} }],
              },
            ],
          },
        ],
      },
    },
  ] satisfies BlockEditorInput[];
  const before = structuredClone(input);
  Object.freeze(input);
  expect(getBlockEditorStats(input)).toEqual({
    wordCount: 9,
    characterCount: 15,
    nonWhitespaceCharacterCount: 13,
    blockCount: 3,
  });
  expect(input).toEqual(before);
});
