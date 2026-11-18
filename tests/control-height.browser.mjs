import {createServer} from 'vite';
import {chromium,firefox,webkit} from '@playwright/test';
import assert from 'node:assert/strict';
const server=await createServer({root:process.cwd(),server:{host:'127.0.0.1',port:5196,strictPort:true},logLevel:'error'});await server.listen();
try {for(const [name,engine,dpi] of [['chromium',chromium,1],['chromium-hidpi',chromium,2],['firefox',firefox,1],['webkit',webkit,1]]){
 const browser=await engine.launch({headless:true});try {const page=await browser.newPage({viewport:{width:360,height:1200},deviceScaleFactor:dpi});page.setDefaultTimeout(10000);await page.goto('http://127.0.0.1:5196/tests/fixtures/control-height.html');
 const selectors=['main > .mt-input-wrap:not(.mt-search) .mt-input-control','main > .mt-search','main > .mt-select','main > .mt-multiselect','main > .mt-number .mt-number-group','main .mt-date-field input','main > .mt-filter-chip','.mt-table-filter'];
 const measure=el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height};};
 for(const selector of selectors){const el=page.locator(selector).first();assert.equal((await el.evaluate(measure)).height,28,name+' '+selector);}
 // Keyboard and pointer focus must not change geometry; popup behavior is covered separately.
 for(const label of ['Input','SearchInput','NumberInput']){const native=page.getByLabel(label,{exact:true});const el=label==='SearchInput'?page.locator('main > .mt-search'):native;const before=await el.evaluate(measure);await el.click();assert.deepEqual(await el.evaluate(measure),before);await page.getByRole('button',{name:'Before fields'}).focus();await page.keyboard.press('Tab');assert.equal((await page.getByLabel('Input',{exact:true}).evaluate(measure)).height,28);}
 for(const state of ['error','disabled']){for(const el of await page.locator(`[data-case="${state}"] :is(.mt-input:not(.mt-input-decorated > .mt-input),.mt-input-decorated,.mt-select,.mt-multiselect,.mt-number-group)`).all())assert.equal((await el.evaluate(measure)).height,28,name+' '+state);}
 const wrap=page.locator('[data-case="wrap"] .mt-multiselect');assert((await wrap.evaluate(measure)).height>28,name+' wraps');assert((await wrap.evaluate(measure)).width<=180,name+' narrow container');assert.equal(await wrap.locator('.mt-chip').count(),8);
 for(const chip of await wrap.locator('.mt-chip').all()){assert(await chip.evaluate(el=>el.getBoundingClientRect().right<=el.parentElement.getBoundingClientRect().right),name+' chip bounds');}
 const filter=page.locator('[data-case="wrap"] .mt-filter-chip');assert.equal((await filter.evaluate(measure)).height,28);assert((await filter.evaluate(measure)).width<=180);assert(await filter.getByRole('button').isVisible());
 for(const [selector,height] of [['.mt-input',36],['.mt-select',34],['.mt-number-group',36]])assert.equal((await page.locator('[data-case="comfortable"] '+selector).evaluate(measure)).height,height,name+' comfortable');
 assert((await page.getByLabel('Textarea').evaluate(measure)).height>=72);
 console.log('CONTROL_HEIGHT_'+name.replaceAll('-','_')+'='+(await page.locator('main').screenshot()).toString('base64'));console.log(name+' passed 28px, wrapping, narrow viewport, density, error/disabled and focus geometry');
 }finally{await browser.close();}
}}finally{await server.close();}
