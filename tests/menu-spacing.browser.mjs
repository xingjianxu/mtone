import { createServer } from 'vite';
import { chromium, firefox, webkit, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const server = await createServer({ root: process.cwd(), server: { host: '127.0.0.1', port: 5197, strictPort: true }, logLevel: 'error' });
await server.listen();
mkdirSync('artifacts/menu-spacing', { recursive: true });
try {
  for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
    if (process.env.BROWSER && process.env.BROWSER !== name) continue;
    const browser = await engine.launch({ headless: true, ...(name === 'chromium' && process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
    try {
      const page = await browser.newPage({ viewport: { width: 1000, height: 650 } });
      for (const kind of ['menu', 'menubar', 'context']) {
        await page.goto(`http://127.0.0.1:5197/tests/fixtures/menu-spacing.html?kind=${kind}`);
        const row = label => page.getByRole('menuitem', { name: label, exact: true });
        const geometry = async (label, role = 'menuitem') => page.getByRole(role, { name: label, exact: true }).evaluate(el => {
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height, margin: getComputedStyle(el).marginTop };
        });
        const open = async () => {
          const trigger = kind === 'menubar' ? row('Actions') : page.getByRole('button', { name: 'Actions', exact: true });
          await trigger.click(kind === 'context' ? { button: 'right' } : {});
          await expect(row('Before')).toBeVisible();
        };
        for (let iteration = 0; iteration < 2; iteration++) {
          await open();
          const root = await geometry('After');
          assert.equal(root.margin, '3px');
          assert.equal((await geometry('Before')).margin, '0px');
          assert.equal((await geometry('Boundary')).margin, '0px');
          assert.equal((await geometry('Group boundary')).margin, '0px');
          assert.equal((await geometry('Ascending', 'menuitemradio')).margin, '0px');
          assert.equal((await geometry('Descending', 'menuitemradio')).margin, '3px');
          assert.equal((await geometry('Check', 'menuitemcheckbox')).margin, '0px');
          assert.equal((await geometry('Check next', 'menuitemcheckbox')).margin, '3px');
          await row('Parent').hover();
          await expect(row('Nested')).toBeVisible();
          assert.deepEqual(await geometry('After'), root, `${kind}: following root row moved on hover`);
          const nested = await geometry('Nested after');
          await row('Nested').hover();
          await expect(row('Leaf')).toBeVisible();
          assert.deepEqual(await geometry('Nested after'), nested, `${kind}: following nested row moved`);
          assert.deepEqual(await geometry('After'), root);
          await page.screenshot({ path: `artifacts/menu-spacing/${name}-${kind}.png` });
          await page.getByRole('button', { name: 'Outside' }).click();
          await expect(row('Before')).toHaveCount(0);
        }
        await open();
        const root = await geometry('After');
        await row('Parent').focus();
        await page.keyboard.press('ArrowRight');
        await expect(row('Nested')).toBeFocused();
        const nested = await geometry('Nested after');
        assert.deepEqual(await geometry('After'), root);
        await page.keyboard.press('ArrowRight');
        await expect(row('Leaf')).toBeFocused();
        assert.deepEqual(await geometry('Nested after'), nested);
        await page.keyboard.press('ArrowLeft');
        await expect(row('Nested')).toBeFocused();
        await expect(row('Leaf')).toHaveCount(0);
        assert.deepEqual(await geometry('Nested after'), nested);
        await page.keyboard.press('ArrowLeft');
        await expect(row('Parent')).toBeFocused();
        await expect(row('Nested')).toHaveCount(0);
        assert.deepEqual(await geometry('After'), root);
        await page.keyboard.press('Escape');
        await expect(row('Before')).toHaveCount(0);
        console.log(`${name}/${kind}: stable row boxes and 3px gaps across hover, nested menus, keyboard, closing and repeat opens`);
      }
    } finally { await browser.close(); }
  }
} finally { await server.close(); }
