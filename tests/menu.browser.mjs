import {createServer} from 'vite';
import {chromium,firefox,webkit,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const server=await createServer({root:process.cwd(),server:{host:'127.0.0.1',port:5198,strictPort:true},logLevel:'error'});
await server.listen();
mkdirSync('artifacts/menu',{recursive:true});
try {
  for(const [name,engine] of [['chromium',chromium],['firefox',firefox],['webkit',webkit]]) {
    if(process.env.MENU_BROWSER && process.env.MENU_BROWSER!==name) continue;
    const browser=await engine.launch({headless:true,...(name==='chromium' && process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
    try {
      const page=await browser.newPage({viewport:{width:700,height:500}});
      await page.goto('http://127.0.0.1:5198/tests/fixtures/menu.html');
      const trigger=page.getByRole('button',{name:'Actions',exact:true});
      for(let iteration=0;iteration<2;iteration++){
        await trigger.click();
        await expect(page.getByRole('group',{name:'Files'})).toBeVisible();
        const menu=page.getByRole('menu');
        const rows=await menu.locator('.mt-menu-text').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().left));
        assert(Math.max(...rows)-Math.min(...rows)<1,'icons align across groups');
        const exporter=page.getByRole('menuitem',{name:'Export',exact:true});
        const before=await exporter.boundingBox();
        await exporter.hover();
        await expect(page.getByRole('menuitem',{name:'PDF',exact:true})).toBeVisible();
        const after=await exporter.boundingBox();
        assert.deepEqual(after,before,'hover must not shift menu item geometry');
        const style=await exporter.evaluate(el=>({border:getComputedStyle(el).borderTopColor,width:getComputedStyle(el).borderTopWidth,outlineStyle:getComputedStyle(el).outlineStyle}));
        assert.equal(style.border,'rgb(147, 180, 220)'); assert.equal(style.width,'1px'); assert.equal(style.outlineStyle,'none');
        await page.getByRole('menuitem',{name:'PDF',exact:true}).hover();
        await expect(page.getByRole('menuitem',{name:'PDF',exact:true})).toBeVisible();
        if(iteration===0) await page.screenshot({path:`artifacts/menu/${name}-submenu.png`});
        await page.getByRole('menuitem',{name:'PDF',exact:true}).click();
        await expect(page.getByRole('status')).toHaveText('pdf');
        await expect(page.getByRole('menu')).toHaveCount(0);
      }
      await trigger.focus(); await page.keyboard.press('ArrowDown');
      await expect(page.getByRole('menuitem',{name:'Open',exact:true})).toBeFocused();
      await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowRight');
      await expect(page.getByRole('menuitem',{name:'PDF',exact:true})).toBeFocused();
      await page.keyboard.press('ArrowLeft');
      await expect(page.getByRole('menuitem',{name:'Export',exact:true})).toBeFocused();
      await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
      await trigger.click(); await page.getByRole('menuitem',{name:'Locked',exact:true}).hover();
      await page.waitForTimeout(250); await expect(page.getByRole('menuitem',{name:'Secret',exact:true})).toHaveCount(0);
      await page.mouse.click(600,400); await expect(page.getByRole('menu')).toHaveCount(0);
      const keepFocus = page.getByRole("textbox", { name: "Retained focus" });
      const hoverTrigger = page.getByRole("button", { name: "Hover actions" });
      const hoverMenu = page.getByRole("menu", { name: "Hover actions" });
      await keepFocus.focus();
      await hoverTrigger.hover();
      await expect(hoverMenu).toBeVisible();
      await expect(keepFocus).toBeFocused();
      assert.equal(await hoverMenu.evaluate((node) => document.querySelector("main").contains(node)), false);
      const triggerBox = await hoverTrigger.boundingBox();
      const popupBox = await hoverMenu.boundingBox();
      const gap = popupBox.y - triggerBox.y - triggerBox.height;
      assert(gap > 1, "fixture must include a real portal gap");
      await page.mouse.move(triggerBox.x + triggerBox.width / 2, popupBox.y - gap / 2, { steps: 6 });
      await expect(hoverMenu).toBeVisible();
      await page.getByRole("menuitem", { name: "Hover export" }).hover();
      const hoverLeaf = page.getByRole("menuitem", { name: "Hover PDF" });
      await expect(hoverLeaf).toBeVisible();
      await hoverLeaf.hover();
      await hoverLeaf.click();
      await expect(page.getByRole("status")).toHaveText("hover-pdf");
      await expect(hoverMenu).toHaveCount(0);

      await keepFocus.focus();
      await hoverTrigger.hover();
      await expect(hoverMenu).toBeVisible();
      // Leave upward instead of crossing through the popup's focusable rows.
      await page.mouse.move(650, 24, { steps: 8 });
      await expect(hoverMenu).toHaveCount(0);
      await expect(keepFocus).toBeFocused();

      await hoverTrigger.click();
      await expect(hoverMenu).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(hoverMenu).toHaveCount(0);
      await page.mouse.move(650, 420);
      for (const key of ["Enter", "Space", "ArrowDown"]) {
        await hoverTrigger.focus();
        await page.keyboard.press(key);
        await expect(hoverMenu).toBeVisible();
        await expect(page.getByRole("menuitem", { name: "Hover open" })).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(hoverMenu).toHaveCount(0);
        await expect(hoverTrigger).toBeFocused();
      }
      const disabledHover = page.getByRole("button", { name: "Disabled hover" });
      await disabledHover.hover();
      await expect(disabledHover).toHaveAttribute("aria-expanded", "false");
      await expect(page.getByRole("menuitem", { name: "Disabled item" })).toHaveCount(0);

      const touch = await browser.newContext({ hasTouch: true });
      try {
        const touchPage = await touch.newPage();
        await touchPage.goto('http://127.0.0.1:5198/tests/fixtures/menu.html');
        await touchPage.getByRole("button", { name: "Hover actions" }).tap();
        await expect(touchPage.getByRole("menu", { name: "Hover actions" })).toBeVisible();
        await touchPage.getByRole("menuitem", { name: "Hover open" }).tap();
        await expect(touchPage.getByRole("status")).toHaveText("hover-open");
      } finally {
        await touch.close();
      }
      await page.goto('http://127.0.0.1:5198/tests/fixtures/menu.html?composition');
      const inline = page.getByRole("menu", { name: "Inline commands" });
      const after = page.getByRole("button", { name: "After commands" });
      const before = page.getByRole("button", { name: "Before commands" });
      const archive = inline.getByRole("menuitem", { name: "Archive" });
      assert(await inline.evaluate(el => el.closest("main") !== null), "the inline menu is rendered in normal document order");
      await before.focus();
      await page.keyboard.press("Tab");
      await expect(inline).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await expect(archive).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("status")).toHaveText("archive");
      await page.keyboard.press("Tab");
      await expect(after).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect.poll(() => inline.evaluate(el => el.contains(document.activeElement))).toBe(true);
      await page.keyboard.press("Shift+Tab");
      await expect(before).toBeFocused();
      const details = page.getByRole("button", { name: "Details" });
      await details.click();
      const dialog = page.getByRole("dialog", { name: "Project details" });
      const hosted = dialog.getByRole("menu", { name: "Project commands" });
      const exportItem = hosted.getByRole("menuitem", { name: "Export more" });
      const footer = dialog.getByRole("button", { name: "Footer action" });
      await footer.click();
      await expect(page.getByRole("status")).toHaveText("footer");
      await hosted.getByRole("menuitem", { name: "Archive" }).click();
      await expect(page.getByRole("status")).toHaveText("archive");
      await expect(dialog).toBeVisible();
      await exportItem.hover();
      const file = page.getByRole("menuitem", { name: "JSON" });
      await expect(file).toBeVisible();
      await exportItem.focus();
      await page.keyboard.press("ArrowRight");
      await expect(file).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(file).toHaveCount(0);
      await expect(dialog).toBeVisible();
      await expect(exportItem).toBeFocused();
      await page.keyboard.press("ArrowRight");
      await expect(file).toBeFocused();
      await file.click();
      await expect(page.getByRole("status")).toHaveText("json");
      await expect(file).toHaveCount(0);
      await expect(dialog).toBeVisible();
      await expect(exportItem).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(details).toBeFocused();
      console.log(`${name}: Menu grouped alignment, thin border, pointer crossing, repeat cycles, keyboard and disabled submenu passed`);
    } finally {await browser.close();}
  }
} finally {await server.close();}
