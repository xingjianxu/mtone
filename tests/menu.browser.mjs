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
      const trigger=page.getByRole('button',{name:'Actions'});
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
        const style=await exporter.evaluate(el=>({border:getComputedStyle(el).borderTopColor,width:getComputedStyle(el).borderTopWidth,outline:getComputedStyle(el).outlineWidth}));
        assert.equal(style.border,'rgb(147, 180, 220)'); assert.equal(style.width,'1px'); assert.equal(style.outline,'0px');
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
      console.log(`${name}: Menu grouped alignment, thin border, pointer crossing, repeat cycles, keyboard and disabled submenu passed`);
    } finally {await browser.close();}
  }
} finally {await server.close();}
