import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
test("narrow Rate wraps whole character hit areas instead of shrinking only their hit boxes", () => {
  const css = readFileSync("packages/mtone/src/rate.css", "utf8");
  const root = css.slice(css.indexOf(".mt-rate {")).split("}")[0];
  const character = css.slice(css.indexOf(".mt-rate-character {")).split("}")[0];
  expect(root).toContain("flex-wrap: wrap");
  expect(character).toContain("flex: 0 0 var(--mt-rate-character-size)");
});
