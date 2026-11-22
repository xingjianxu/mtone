import { createServer } from "vite";
import { chromium, firefox, webkit, expect } from "@playwright/test";
import assert from "node:assert/strict";

const server = await createServer({
  root: process.cwd(),
  server: { host: "127.0.0.1", port: 5237, strictPort: true },
  logLevel: "error",
});
await server.listen();
try {
  for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
    if (process.env.BROWSER && name !== process.env.BROWSER) continue;
    const browser = await engine.launch({
      headless: true,
      executablePath:
        name === "chromium" ? process.env.CHROMIUM_PATH : undefined,
    });
    try {
      const page = await browser.newPage({ reducedMotion: "reduce" });
      await page.goto(
        "http://127.0.0.1:5237/tests/fixtures/button-toggle.html",
      );
      await expect(page.getByRole("group", { name: "dark" })).toBeVisible();
      // Do not measure in-flight transitions after pointer or keyboard input.
      await page.addStyleTag({
        content: ".mt-btn { transition: none !important }",
      });
      for (const theme of ["light", "dark"]) {
        const group = page.getByRole("group", { name: theme });
        const gallery = (label) =>
          group.getByRole("button", { name: label, exact: true });
        const background = (button) =>
          button.evaluate((node) => getComputedStyle(node).backgroundColor);
        const viewGallery = gallery("View gallery");
        const idleColor = await background(viewGallery);
        await viewGallery.hover();
        assert.notEqual(
          await background(viewGallery),
          idleColor,
          `${theme}: soft Button should visibly change background on hover`,
        );
        await page.mouse.move(0, 0);
        assert.equal(await background(viewGallery), idleColor);

        for (const label of [
          "Disabled gallery",
          "Loading gallery",
          "Focusable gallery",
          "Composed gallery",
          "Pressed gallery",
        ]) {
          const button = gallery(label);
          if (label === "Pressed gallery") {
            await expect(button).toHaveAttribute("aria-pressed", "true");
          } else {
            await expect(button).toBeDisabled();
            if (label === "Focusable gallery" || label === "Composed gallery") {
              await expect(button).toHaveAttribute("aria-disabled", "true");
              assert.equal(
                await button.evaluate((node) => node.matches(":disabled")),
                false,
              );
            }
          }
          const before = await background(button);
          // Pointer coordinates also work for native disabled buttons.
          const bounds = await button.boundingBox();
          await page.mouse.move(
            bounds.x + bounds.width / 2,
            bounds.y + bounds.height / 2,
          );
          assert.equal(
            await background(button),
            before,
            `${theme}: ${label} should keep its background`,
          );
          await page.mouse.move(0, 0);
        }

        for (const label of [
          "Filter",
          "Solid filter",
          "Danger filter",
          "Star",
          "Pin",
        ]) {
          const button = group.getByRole("button", {
            name: label,
            exact: true,
          });
          const colors = () =>
            button.evaluate((node) => getComputedStyle(node).backgroundColor);
          const icon = button.locator("svg");
          const isIcon = label === "Star" || label === "Pin";
          await expect(button).toHaveAttribute("aria-pressed", "false");
          if (isIcon) await expect(icon).toHaveAttribute("fill", "none");
          const before = {
            color: await colors(),
            bounds: await button.boundingBox(),
          };
          await button.focus();
          await page.keyboard.press("Space");
          await expect(button).toHaveAttribute("aria-pressed", "true");
          await expect(button).toBeFocused();
          await expect(button).toHaveCSS("outline-style", "solid");
          const after = {
            color: await colors(),
            bounds: await button.boundingBox(),
          };
          if (isIcon) {
            assert.equal(after.color, before.color);
            await expect(icon).toHaveAttribute("fill", "currentColor");
            await expect(icon).toHaveCSS("width", "14px");
          } else {
            assert.notEqual(
              after.color,
              before.color,
              `${theme} ${label}: pressed background should change`,
            );
          }
          assert.equal(after.bounds.width, before.bounds.width);
          assert.equal(after.bounds.height, before.bounds.height);
        }
      }
      if (name === "chromium") {
        await page.emulateMedia({ forcedColors: "active" });
        const button = page
          .getByRole("group", { name: "light" })
          .getByRole("button", { name: "Filter", exact: true });
        await button.focus();
        assert.notEqual(
          await button.evaluate((node) => getComputedStyle(node).outlineColor),
          await button.evaluate(
            (node) => getComputedStyle(node).backgroundColor,
          ),
        );
      }
      console.log(
        `${name}: Button toggle preserves color in icon mode, size, keyboard and focus across themes`,
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}
