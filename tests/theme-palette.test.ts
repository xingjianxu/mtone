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
  expect(theme()).toMatch(/\[data-mt-theme="dark"\]\s*\{[^}]*--mt-on-primary:\s*#20201f/);
  expect(theme()).toMatch(/\[data-mt-theme="system"\]\s*\{[^}]*--mt-bg:\s*#20201f/);
});


test("defines the coral accent in the default, dark and system-dark palettes", () => {
  const css = theme();
  expect(css).toMatch(/:where\(:root, \.mt-scope, \[data-mt-theme\]\)\s*\{[^}]*--mt-accent-coral:\s*#D1634B\b/i);
  expect(css).toMatch(/\[data-mt-theme="dark"\]\s*\{[^}]*--mt-accent-coral:\s*#FD8C73\b/i);
  expect(css).toMatch(/@media \(prefers-color-scheme: dark\)\s*\{\s*\[data-mt-theme="system"\]\s*\{[^}]*--mt-accent-coral:\s*#FD8C73\b/i);
});

test("shares the pale blue selected surface without recoloring alerts or focus borders", () => {
  const styles = (file: string) => readFileSync(`packages/mtone/src/${file}.css`, "utf8");
  const surface = "var(--mt-select-surface, #e9eef4)";
  for (const file of ["check-card", "data", "panel", "settings-dialog"]) {
    expect(styles(file)).toContain(surface);
  }
  expect(styles("data")).toMatch(/--mt-table-selected:\s*var\(--mt-selected,\s*var\(--mt-select-surface, #e9eef4\)\)/);
  expect(styles("settings-dialog")).toMatch(/\[data-mt-settings-highlight\]\s*\{[^}]*outline:\s*1px solid var\(--mt-focus\)/);
  expect(styles("styles")).toContain("var(--mt-badge-blue-bg, #e7f0f9)");
  expect(styles("data")).toContain("var(--mt-select-highlight, #edf3fa)");
  expect(theme().match(/--mt-select-surface:\s*#e9eef4;/g)).toHaveLength(1);
  expect(theme().match(/--mt-select-surface:\s*#293746;/g)).toHaveLength(2);
});
