import { createServer } from "vite";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const server=await createServer({root:process.cwd(),server:{host:"127.0.0.1",port:5195,strictPort:true},logLevel:"error"});await server.listen();let browser;
try {browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:500,height:1600}});
await page.goto("http://127.0.0.1:5195/tests/fixtures/field-focus.html");
const specs=[['Input','.mt-input',1],['SearchInput','.mt-search',1],['Textarea','.mt-input',1],['Select','.mt-select',1],['Multiple Select','.mt-select-multiple',1],['NumberInput','.mt-number-group',1],['DatePicker','.mt-input',1],['Table','.mt-table-filter',1]];
const measure=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {size:[r.width,r.height],border:[s.borderTopWidth,s.borderRightWidth,s.borderBottomWidth,s.borderLeftWidth],padding:[s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft],color:s.borderTopColor,outline:s.outlineStyle};};
for(const [name,selector] of specs){
 await page.goto('http://127.0.0.1:5195/tests/fixtures/field-focus.html');
 const section=page.locator(`[data-test-field="${name}"]`),surface=section.locator(selector),before=section.getByRole('button',{name:`Before ${name}`,exact:true});
 const target=name==='Table'?section.getByRole('textbox'):section.getByLabel(name,{exact:true});
 await before.scrollIntoViewIfNeeded();await before.click();const normal=await surface.evaluate(measure);
 // Keyboard entry covers the first child for compound fields (chip/stepper).
 await page.keyboard.press('Tab');const keyboard=await surface.evaluate(measure);
 assert.equal(keyboard.color,'rgb(147, 180, 220)',name+' keyboard');assert.equal(keyboard.outline,'none',name+' outer ring');
 assert.deepEqual(keyboard.size,normal.size,name+' size');assert.deepEqual(keyboard.border,normal.border,name+' widths');assert.deepEqual(keyboard.padding,normal.padding,name+' padding');
 await before.click();await target.click();const mouse=await surface.evaluate(measure);
 assert.equal(mouse.color,'rgb(147, 180, 220)',name+' mouse');assert.equal(mouse.outline,'none');assert.deepEqual(mouse.size,normal.size);assert.deepEqual(mouse.border,normal.border);
 if(name==='Select'){await page.getByRole('option',{name:'One',exact:true}).click();await page.getByRole('listbox').waitFor({state:'hidden'});}
 console.log('FIELD_FOCUS_'+name+'='+(await section.screenshot()).toString('base64')); 
 if(name==='Multiple Select'){if(await target.getAttribute('aria-expanded')==='true'){await target.press('Escape');await page.getByRole('listbox').waitFor({state:'hidden'});}await before.click();await section.getByRole('button',{name:'Show options'}).focus();assert.equal((await surface.evaluate(measure)).color,'rgb(147, 180, 220)');await before.click();}
 if(name==='NumberInput'){await section.getByRole('button',{name:'Increase'}).focus();assert.equal((await surface.evaluate(measure)).color,'rgb(147, 180, 220)');}
 await page.emulateMedia({forcedColors:'active'});await target.focus();assert.equal((await surface.evaluate(measure)).outline,'solid',name+' forced colors');await before.focus();await page.emulateMedia({forcedColors:'none'});
}
await page.goto('http://127.0.0.1:5195/tests/fixtures/field-focus.html');
for(const name of ['Input','Select','Multiple Select']){const control=page.getByLabel(name+' error',{exact:true});await control.focus();const surface=name==='Multiple Select'?page.locator('[data-test-field="errors"] .mt-select-multiple'):control;assert.equal((await surface.evaluate(measure)).color,'rgb(198, 102, 96)');}
for(const name of ['Input','Select','Multiple Select','NumberInput']){const control=page.getByLabel(name+' disabled',{exact:true});assert(await control.isDisabled());await control.focus();assert(!(await control.evaluate(el=>el===document.activeElement)));}
for(const name of ['Checkbox','Regular button']){const control=name==='Checkbox'?page.getByRole('checkbox',{name}):page.getByRole('button',{name});await control.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');assert.equal(await control.evaluate(el=>getComputedStyle(el).outlineStyle),'solid');}
console.log('All eight bordered field surfaces passed mouse/keyboard, unchanged border/size, compound children, error/disabled and forced-colors checks');
}finally{await browser?.close();await server.close();}
