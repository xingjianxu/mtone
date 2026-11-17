import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
test("bounds and wraps full-cell renderer content instead of overflowing adjacent cells", () => {
  const css = readFileSync("packages/mtone/src/calendar.css", "utf8");
  const day = css.slice(css.indexOf(".mt-calendar-day {")).split("}")[0];
  expect(day).toContain("overflow-wrap: anywhere");
  expect(day).toContain("min-width: 0");
  const child = css.slice(css.indexOf(".mt-calendar-day > * {")).split("}")[0];
  expect(child).toContain("max-width: 100%");
  expect(child).toContain("min-width: 0");
});
