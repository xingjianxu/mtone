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
      for (const dark of [false,true]) for (const control of ['Select','Multiple Select']) {
        await page.goto('http://127.0.0.1:5198/tests/fixtures/select-focus.html');
        await page.getByLabel('Reference input').waitFor();
        await page.evaluate(dark=>document.body.classList.toggle('dark',dark),dark);
        await page.getByLabel('Reference input').focus();
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
          await expect(option).toHaveCSS('outline-style','none');
          await expect(option).toHaveCSS('box-shadow','none');
          await expect(option).toHaveCSS('background-color',dark?'rgb(56, 56, 56)':'rgb(241, 241, 239)');
        };
        await two.hover(); await check(two);
        const after=await two.boundingBox();
        assert.equal(after.width,size.width); assert.equal(after.height,size.height);
        // Base UI permits highlighting disabled options; they must not get an enabled focus border.
        await disabled.hover();
        await expect(disabled).toHaveAttribute('aria-disabled','true');
        await expect(disabled).toHaveCSS('outline-style','none');
        await two.hover(); await check(two);
        await page.keyboard.press('ArrowUp'); await check(one);
        await page.keyboard.press('ArrowDown'); await check(two);
        await page.screenshot({path:`artifacts/select-focus/${name}-${control}-${dark?'dark':'light'}.png`});
        // System highlight survives forced-colors; the active descendant remains visible.
        await page.emulateMedia({forcedColors:'active'});
        // WebKit does not expose forced-colors emulation on every platform.
        if (await page.evaluate(()=>matchMedia('(forced-colors: active)').matches)) {
          const systemHighlight = await page.evaluate(()=>{
            const probe=document.createElement('span'); probe.style.cssText='background:Highlight;color:HighlightText';
            document.body.append(probe); const style=getComputedStyle(probe); const colors={background:style.backgroundColor,text:style.color}; probe.remove(); return colors;
          });
          await expect(two).toHaveCSS('background-color',systemHighlight.background);
          await expect(two).toHaveCSS('color',systemHighlight.text);
          assert.notEqual(systemHighlight.background,systemHighlight.text);
        }
        await expect(two).toHaveCSS('outline-style','none');
        await page.emulateMedia({forcedColors:'none'});
        await page.keyboard.press('Enter');
        if(control==='Select') {
          await expect(list).toBeHidden(); await expect(trigger).toHaveText('Two');
          await trigger.click(); await expect(list).toBeVisible();
        } else await expect(page.getByRole('button',{name:'Remove Two',exact:true})).toBeVisible();
        await expect(list.getByRole('option',{name:'Two',exact:true})).toHaveAttribute('aria-selected','true');
        await page.keyboard.press('Escape'); await expect(list).toBeHidden();
      }
      assert.deepEqual(errors,[]); console.log(`${name}: Single/multiple Select background-only highlight, pointer/keyboard/selection, disabled and light/dark passed; forced colors verified where supported`);
    } finally { await browser.close(); }
  }
} finally { await server.close(); }
