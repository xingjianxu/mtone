import { createServer } from 'vite';
import { chromium, firefox, webkit, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const server = await createServer({root:process.cwd(),server:{host:'127.0.0.1',port:5198,strictPort:true},logLevel:'error'});
await server.listen();
await mkdir('artifacts/select-focus', {recursive:true});
try {
  for (const [name, engine] of [['chromium',chromium],['firefox',firefox],['webkit',webkit]]) {
    const browser = await engine.launch({headless:true});
    try {
      const page = await browser.newPage({viewport:{width:800,height:700}});
      const errors=[]; page.on('pageerror', e=>errors.push(e.message));
      for (const dark of [false,true]) for (const control of ['Select','MultiSelect']) {
        await page.goto('http://127.0.0.1:5198/tests/fixtures/select-focus.html');
        await page.evaluate(dark=>document.body.classList.toggle('dark',dark),dark);
        await page.getByLabel('Reference input').focus();
        const reference = await page.getByLabel('Reference input').evaluate(el=>({color:getComputedStyle(el).borderTopColor,width:getComputedStyle(el).borderTopWidth}));
        const trigger=page.getByRole('combobox',{name:control,exact:true});
        if(control==='Select') await trigger.click();
        else await page.getByRole('button',{name:'Show options'}).click();
        const list=page.getByRole('listbox');
        await expect(list).toBeVisible();
        const one=list.getByRole('option',{name:'One',exact:true});
        const two=list.getByRole('option',{name:'Two',exact:true});
        const disabled=list.getByRole('option',{name:'Disabled',exact:true});
        await expect(one).toHaveAttribute('aria-selected','true');
        const size=await two.boundingBox();
        const check=async option=>{
          await expect(option).toHaveAttribute('data-highlighted','');
          await expect(option).toHaveCSS('outline-width',reference.width);
          await expect(option).toHaveCSS('outline-color',reference.color);
          await expect(option).toHaveCSS('outline-style','solid');
          await expect(option).toHaveCSS('outline-offset','-1px');
        };
        await two.hover(); await check(two);
        const after=await two.boundingBox();
        assert.equal(after.width,size.width); assert.equal(after.height,size.height);
        await disabled.hover(); await expect(disabled).not.toHaveAttribute('data-highlighted','');
        await two.hover(); await check(two);
        await page.keyboard.press('ArrowUp'); await check(one);
        await page.keyboard.press('ArrowDown'); await check(two);
        await page.screenshot({path:`artifacts/select-focus/${name}-${control}-${dark?'dark':'light'}.png`});
        // System highlight survives forced-colors; the active descendant remains visible.
        await page.emulateMedia({forcedColors:'active'});
        // WebKit does not expose forced-colors emulation on every platform.
        if (await page.evaluate(()=>matchMedia('(forced-colors: active)').matches)) {
          const systemHighlight = await page.evaluate(()=>{
            const probe=document.createElement('span'); probe.style.outline='1px solid Highlight';
            document.body.append(probe); const color=getComputedStyle(probe).outlineColor; probe.remove(); return color;
          });
          await expect(two).toHaveCSS('outline-color',systemHighlight);
        }
        await expect(two).toHaveCSS('outline-width','1px');
        await expect(two).toHaveCSS('outline-style','solid');
        await page.emulateMedia({forcedColors:'none'});
        await page.keyboard.press('Enter');
        if(control==='Select') {
          await expect(list).toBeHidden(); await expect(trigger).toHaveText('Two');
          await trigger.click(); await expect(list).toBeVisible();
        } else await expect(page.getByRole('button',{name:'Remove Two',exact:true})).toBeVisible();
        await expect(list.getByRole('option',{name:'Two',exact:true})).toHaveAttribute('aria-selected','true');
        await page.keyboard.press('Escape'); await expect(list).toBeHidden();
      }
      assert.deepEqual(errors,[]); console.log(`${name}: Select/MultiSelect thin Input-colored highlight, pointer/keyboard/selection, disabled, light/dark and forced colors passed`);
    } finally { await browser.close(); }
  }
} finally { await server.close(); }
