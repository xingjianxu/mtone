import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

const css = readFileSync("packages/mtone/src/styles.css", "utf8");
const theme = () => readFileSync("packages/mtone/src/theme.css", "utf8");

test("the stylesheet includes a scoped palette with an explicit light fallback", () => {
  expect(css).toContain('@import "./theme.css";');
  expect(css).toMatch(/--mt-bg:\s*#fff\b/);
  expect(theme()).toMatch(/\[data-mt-theme="light"\][\s\S]*?color-scheme:\s*light/);
  expect(theme()).toMatch(/\[data-mt-theme="dark"\][\s\S]*?color-scheme:\s*dark/);
  expect(theme()).toMatch(/@media \(prefers-color-scheme: dark\)[\s\S]*?\[data-mt-theme="system"\]/);
});

test("inverted buttons and dark surfaces do not use a fixed light foreground", () => {
  expect(css).toMatch(/\.mt-btn-solid\s*\{[^}]*color:\s*var\(--mt-on-primary, white\)/);
  expect(theme()).toContain("--mt-on-primary: light-dark(white, #20201f)");
  expect(theme()).toContain("--mt-bg: light-dark(#fff, #20201f)");
});
