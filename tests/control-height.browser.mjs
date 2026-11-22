import {createServer} from 'vite';
import {chromium,firefox,webkit} from '@playwright/test';
import assert from 'node:assert/strict';
const server=await createServer({root:process.cwd(),server:{host:'127.0.0.1',port:5196,strictPort:true},logLevel:'error'});await server.listen();
try {for(const [name,engine,dpi] of [['chromium',chromium,1],['chromium-hidpi',chromium,2],['firefox',firefox,1],['webkit',webkit,1]]){
 if(process.env.BROWSER && !name.startsWith(process.env.BROWSER)) continue;
 const browser=await engine.launch({headless:true, ...(name.startsWith('chromium') && process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});try {const page=await browser.newPage({viewport:{width:360,height:1200},deviceScaleFactor:dpi});page.setDefaultTimeout(10000);await page.goto('http://127.0.0.1:5196/tests/fixtures/control-height.html');
 const selectors=['main > .mt-auto-complete','main > .mt-btn','main > .mt-tree-select-root > .mt-tree-select','main > .mt-cascader','main .mt-tag-select-option','main > .mt-input-wrap:not(.mt-search) .mt-input-control','main > .mt-search','main > .mt-select','main > .mt-select-multiple','main > .mt-number .mt-number-group','main .mt-date-field input','main > .mt-tag-filter','.mt-table-filter'];
 const measure=el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height};};
 for(const selector of selectors){const el=page.locator(selector).first();assert.equal((await el.evaluate(measure)).height,32,name+' '+selector);}
 for(const selector of ['.mt-input-control','.mt-select','.mt-select-multiple .mt-combobox-input','.mt-number-input','.mt-auto-complete-input','.mt-tree-select-value','.mt-cascader-value','.mt-tag-select-option']){
   assert.equal(await page.locator('main '+selector).first().evaluate(el=>getComputedStyle(el).lineHeight),'20px',name+' '+selector+' text line height');
 }
 const scope=page.locator('main').locator('..');
 await scope.evaluate(el=>el.style.setProperty('--mt-height','28px'));
 for(const selector of selectors){
   assert.equal((await page.locator(selector).first().evaluate(measure)).height,28,name+' '+selector+' accepts height token override');
 }
 await scope.evaluate(el=>el.style.removeProperty('--mt-height'));
 // Keyboard and pointer focus must not change geometry; popup behavior is covered separately.
 for(const label of ['Input','SearchInput','NumberInput']){const native=page.getByLabel(label,{exact:true});const el=label==='SearchInput'?page.locator('main > .mt-search'):native;const before=await el.evaluate(measure);await el.click();assert.deepEqual(await el.evaluate(measure),before);await page.getByRole('button',{name:'Before fields'}).focus();await page.keyboard.press('Tab');assert.equal((await page.getByLabel('Input',{exact:true}).evaluate(measure)).height,32);}
 for(const state of ['error','disabled']){for(const el of await page.locator(`[data-case="${state}"] :is(.mt-input:not(.mt-input-decorated > .mt-input),.mt-input-decorated,.mt-select,.mt-select-multiple,.mt-number-group)`).all())assert.equal((await el.evaluate(measure)).height,32,name+' '+state);}
 const tagRoot=page.locator('main > .mt-tag-select');
 const tagViewport=tagRoot.locator('.mt-tag-select-viewport');
 const tagToggle=tagRoot.getByRole('button',{name:'展开',exact:true});
 await tagToggle.waitFor();
 assert.equal((await tagViewport.evaluate(measure)).height,32,name+' collapsed TagSelect');
 assert.equal((await tagToggle.evaluate(measure)).height,32,name+' TagSelect toggle');
 await tagToggle.click();
 assert((await tagViewport.evaluate(measure)).height>32,name+' expanded TagSelect');
 await tagRoot.getByRole('button',{name:'收起',exact:true}).click();
 assert.equal((await tagViewport.evaluate(measure)).height,32,name+' re-collapsed TagSelect');
 const wrap=page.locator('[data-case="wrap"] .mt-select-multiple');assert((await wrap.evaluate(measure)).height>32,name+' wraps');assert((await wrap.evaluate(measure)).width<=180,name+' narrow container');assert.equal(await wrap.locator('.mt-chip').count(),8);
 for(const chip of await wrap.locator('.mt-chip').all()){assert(await chip.evaluate(el=>el.getBoundingClientRect().right<=el.parentElement.getBoundingClientRect().right),name+' chip bounds');}
 const filter=page.locator('[data-case="wrap"] .mt-tag-filter');assert.equal((await filter.evaluate(measure)).height,32);assert((await filter.evaluate(measure)).width<=180);assert(await filter.getByRole('button').isVisible());
 const filterLabel=filter.locator('.mt-tag-filter-label');
 assert(await filterLabel.evaluate(el=>el.scrollWidth>el.clientWidth&&getComputedStyle(el).textOverflow==='ellipsis'),name+' filter label truncates before the visible remove button');
 for(const selector of ['.mt-btn','.mt-input','.mt-select','.mt-number-group']) assert.equal((await page.locator('[data-case="unscoped"] '+selector).evaluate(measure)).height,32,name+' without Provider: '+selector);
 for(const [label,height] of [['Small input',24],['Large input',36]]) assert.equal((await page.getByLabel(label).evaluate(measure)).height,height,name+' '+label);
 for(const step of await page.locator('main > .mt-number .mt-number-step').all()) assert.equal((await step.evaluate(measure)).height,30,name+' number steps fill the inside');
 assert((await page.getByLabel('Textarea').evaluate(measure)).height>=72);
 console.log('CONTROL_HEIGHT_'+name.replaceAll('-','_')+'='+(await page.locator('main').screenshot()).toString('base64'));console.log(name+' passed 32px, wrapping, narrow viewport, error/disabled and focus geometry');
 }finally{await browser.close();}
}}finally{await server.close();}
