import { createServer } from 'vite';
import { chromium, firefox, webkit, expect } from '@playwright/test';
import assert from 'node:assert/strict';
const server=await createServer({root:process.cwd(),server:{host:'127.0.0.1',port:5232,strictPort:true},logLevel:'error'});
await server.listen();
try {for(const [name,engine] of Object.entries({chromium,firefox,webkit})) {
 if (process.env.FOCUS_BROWSERS && !process.env.FOCUS_BROWSERS.split(',').includes(name)) continue;
 const browser=await engine.launch({headless:true,...(name==='chromium' && process.env.CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.CHROMIUM_EXECUTABLE_PATH} : {})});
 try {const page=await browser.newPage();await page.goto('http://127.0.0.1:5232/tests/fixtures/focus-unify.html');
 const input=page.getByRole('textbox',{name:'Input',exact:true});await input.focus();
 const blue=await input.evaluate(el=>getComputedStyle(el).borderTopColor);
 assert.equal(blue,'rgb(147, 180, 220)');await expect(input).toHaveCSS('outline-style','none');
 for(const control of [page.getByRole('button',{name:'Button',exact:true}),page.getByRole('checkbox',{name:'Check'}),page.getByRole('slider',{name:'Rating'}),page.getByRole('link',{name:'Link'})]) {
  const before=await control.boundingBox();await control.focus();
  await expect(control).toHaveCSS('outline-width','1px');await expect(control).toHaveCSS('outline-color',blue);await expect(control).toHaveCSS('outline-offset','-1px');
  assert.deepEqual(await control.boundingBox(),before);await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await expect(control).toBeFocused();
 }
 const error=page.getByRole('textbox',{name:'Error'});await error.focus();await expect(error).toHaveCSS('border-top-color','rgb(198, 102, 96)');
 const select=page.getByRole('combobox',{name:'Select'});await select.focus();await select.press('ArrowDown');
 const option=page.getByRole('option').first();await expect(option).toHaveCSS('outline-style','none');await page.keyboard.press('Escape');
 const cascader=page.locator('.mt-cascader-trigger');await cascader.focus();
 await expect(page.locator('.mt-cascader')).toHaveCSS('border-top-color',blue);await expect(cascader).toHaveCSS('outline-style','none');
 await expect(page.getByRole('button',{name:'Disabled'})).toBeDisabled();
 await page.emulateMedia({forcedColors:'active'});await input.focus();await expect(input).toHaveCSS('outline-style','solid');
 await cascader.focus();await expect(page.locator('.mt-cascader')).toHaveCSS('outline-style','solid');
 console.log(name,'focus colors, widths, geometry, keyboard, disabled/error and option regressions passed');
 }finally{await browser.close();}
}}finally{await server.close();}
