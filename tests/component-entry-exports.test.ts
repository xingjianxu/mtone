import { expect, test } from "vitest";
import * as mtone from "../packages/mtone/src";

test.each([
  ["Toast", mtone.ToastProvider],
  ["DirectoryTree", mtone.Tree],
  ["AiChainOfThought", mtone.AiTask],
  ["Modal", mtone.Dialog],
  ["DropdownMenu", mtone.Menu],
  ["Mention", mtone.Mentions],
  ["SearchInput", mtone.Input.Search],
  ["Textarea", mtone.Input.TextArea],
  ["FormField", mtone.Form.Item],
  ["MultiSelect", mtone.Select],
] as const)("keeps the canonical component without exporting %s", (removed, replacement) => {
  expect(replacement).toBeTruthy();
  expect(mtone).not.toHaveProperty(removed);
});

test("keeps the toast provider hook available", () => {
  expect(mtone.useToast).toBeTypeOf("function");
});
