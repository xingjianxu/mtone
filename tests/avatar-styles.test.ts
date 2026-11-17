import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
const css = readFileSync("packages/mtone/src/avatar.css", "utf8");
test("Avatar colors do not use the scope's muted text token as background", () => {
  const avatar = css.slice(css.indexOf(".mt-avatar {")).split("}")[0];
  expect(avatar).toContain("background: var(--mt-avatar-bg, #eeede9)");
  expect(avatar).toContain("color: var(--mt-avatar-color, #68645d)");
  expect(avatar).not.toContain("var(--mt-muted");
});
test("Avatar overflow popup overrides generic popup dimensions and remains scrollable", () => {
  const popup = css
    .slice(css.indexOf(".mt-popup.mt-avatar-popup {"))
    .split("}")[0];
  expect(popup).toContain("padding: 12px");
  expect(popup).toContain("min-width: 0");
  expect(popup).toContain("max-width: min(320px, calc(100vw - 24px))");
  expect(popup).toContain("max-height: min(320px, calc(100dvh - 24px))");
  expect(popup).toContain("overflow: auto");
  expect(css).toContain("max-height: min(240px, calc(100dvh - 96px))");
});
