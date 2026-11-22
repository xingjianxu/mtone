import { createServer } from 'vite';
import { chromium, firefox, webkit, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const server=await createServer({root:'apps/docs',server:{host:'127.0.0.1',port:5223,strictPort:true},logLevel:'error'});
await server.listen();let browser;
try {
 browser=await ({chromium,firefox,webkit}[process.env.BROWSER||'chromium']).launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
 const page=await browser.newPage({viewport:{width:1280,height:900},colorScheme:"light"});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5223/#/components/List');
 const virtual=page.getByRole('list',{name:'虚拟列表',exact:true});
 await virtual.waitFor();
 assert((await virtual.locator('[data-list-key]').count())<40);
 await page.getByRole('button',{name:'跳至第 5000 条'}).click();
 await virtual.getByText('记录 5000',{exact:true}).waitFor();
 await page.getByRole('button',{name:'回到顶部'}).click();
 await virtual.getByText('记录 1',{exact:true}).waitFor();
 const dynamic=page.getByRole('list',{name:'可变行高列表',exact:true});
 await dynamic.evaluate(el=>{el.scrollTop=70;el.dispatchEvent(new Event('scroll'));});
 await page.waitForTimeout(100);
 const anchorBefore=await dynamic.locator('[data-list-key="2"]').evaluate(el=>el.getBoundingClientRect().top-el.closest('ul').getBoundingClientRect().top);
 await page.getByRole('button',{name:'切换首行高度'}).click();
 await page.waitForTimeout(100);
 const anchorAfter=await dynamic.locator('[data-list-key="2"]').evaluate(el=>el.getBoundingClientRect().top-el.closest('ul').getBoundingClientRect().top);
 assert(Math.abs(anchorAfter-anchorBefore)<2,'growing overscan row preserves visible anchor');
 await dynamic.evaluate(el=>{el.scrollTop=el.scrollHeight;el.dispatchEvent(new Event('scroll'));});
 await page.waitForTimeout(150);
 const bottomBefore=await dynamic.locator('[data-list-key="99"]').evaluate(el=>el.getBoundingClientRect().top-el.closest('ul').getBoundingClientRect().top);
 await dynamic.evaluate(el=>{const row=[...el.querySelectorAll('[data-list-key]')].find(row=>row.getBoundingClientRect().bottom<=el.getBoundingClientRect().top); if(!row)throw new Error('missing overscan row'); row.firstElementChild.style.minHeight='100px';});
 await page.waitForTimeout(150);
 const bottomAfter=await dynamic.locator('[data-list-key="99"]').evaluate(el=>el.getBoundingClientRect().top-el.closest('ul').getBoundingClientRect().top);
 assert(Math.abs(bottomAfter-bottomBefore)<2,'bottom anchor waits for expanded spacer');
 const grouped=page.getByRole('list',{name:'分组列表',exact:true});
 await grouped.evaluate(el=>{el.scrollTop=3700;el.dispatchEvent(new Event('scroll'));});
 await page.waitForTimeout(200);
 const sticky=await grouped.evaluate(el=>[...el.querySelectorAll('[data-list-group]')].some(h=>Math.abs(h.getBoundingClientRect().top-el.getBoundingClientRect().top)<2));
 assert(sticky,'group heading pins at viewport top');
 const samples = await grouped.evaluate(async el => {
   const active = [...el.querySelectorAll('[data-list-group]')]
     .find(h => Math.abs(h.getBoundingClientRect().top - el.getBoundingClientRect().top) < 2);
   const offsets = [];
   for (let i = 0; i < 12; i++) {
     await new Promise(resolve => requestAnimationFrame(() => {
       el.scrollTop += 13;
       // Read before the scroll event/React commit, not after settling.
       offsets.push(active.getBoundingClientRect().top - el.getBoundingClientRect().top);
       resolve();
     }));
   }
   return offsets;
 });
 assert(samples.every(top => Math.abs(top) < 2), 'heading stays pinned on each scroll frame: ' + samples);
 const boundary = await grouped.evaluate(async el => {
   const section = [...el.querySelectorAll('[data-list-group]')]
     .find(h => Math.abs(h.getBoundingClientRect().top - el.getBoundingClientRect().top) < 2);
   const group = section.parentElement;
   const viewportTop = el.getBoundingClientRect().top + el.clientTop;
   el.scrollTop += group.getBoundingClientRect().bottom - viewportTop - section.offsetHeight * 2;
   // Mount and measure the next group before sampling the transition. That
   // measurement can change the earlier estimated boundary.
   await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
   const edge = group.getBoundingClientRect().bottom;
   const next = [...el.querySelectorAll('[data-list-group]')].find(h =>
     h !== section && Math.abs(h.parentElement.getBoundingClientRect().top - edge) < 1
   );
   el.scrollTop += edge - viewportTop - 8;
   return {
     oldBottom: section.getBoundingClientRect().bottom - viewportTop,
     nextTop: next?.getBoundingClientRect().top - viewportTop,
   };
 });
 assert(Math.abs(boundary.oldBottom - 8) < 2, 'next group pushes current header off: ' + JSON.stringify(boundary));
 assert(Math.abs(boundary.nextTop - 8) < 2, 'next group enters without overlap: ' + JSON.stringify(boundary));
 const horizontal=page.getByRole('list',{name:'横向列表',exact:true});
 assert(await horizontal.evaluate(el=>el.scrollWidth>el.clientWidth));
 await horizontal.evaluate(el=>{el.scrollLeft=100;});
 assert(await horizontal.evaluate(el=>el.scrollLeft>0));
 const loading=page.getByRole('list',{name:'增量列表',exact:true});
 await loading.evaluate(el=>{el.scrollTop=el.scrollHeight;el.dispatchEvent(new Event('scroll'));});
 await page.getByText('已加载 60 条',{exact:true}).waitFor();
 const sorting=page.getByRole('list',{name:'排序列表',exact:true});
 const rows=sorting.getByRole('listitem');
 const order=() => rows.evaluateAll(items => items.map(item => item.getAttribute('data-list-key')));
 await sorting.getByRole('button',{name:'研究笔记上移'}).press('Enter');
 assert.deepEqual(await order(), ['研究笔记', '设计规范', '项目归档']);
 const handles = sorting.locator('[draggable=true]');
 assert.equal(await handles.count(), 3);
 assert(await handles.first().evaluate(el => el.parentElement.firstElementChild === el && !!el.querySelector('svg.lucide-grip-vertical')));
 assert(await rows.evaluateAll(items => items.every(item => !item.hasAttribute('draggable'))));
 assert.equal(await virtual.locator('[draggable]').count(), 0);

 // Real pointer drags change visual geometry before committing data order.
 const originalOrder = ['研究笔记', '设计规范', '项目归档'];
 const source = handles.first();
 const sourceRow = sorting.locator('[data-list-key="研究笔记"]');
 const neighbor = sorting.locator('[data-list-key="设计规范"]');
 const last = sorting.locator('[data-list-key="项目归档"]');
 const description = sorting.locator('xpath=preceding-sibling::p');
 await description.scrollIntoViewIfNeeded();
 const begin = async () => {
   const grip = await source.boundingBox();
   const first = await sourceRow.boundingBox();
   const middle = await neighbor.boundingBox();
   const end = await last.boundingBox();
   const x = grip.x + 6;
   const y = grip.y + 10;
   const overX = end.x + end.width / 2;
   const overY = end.y + end.height * 0.75;
   await page.mouse.move(x, y);
   await page.mouse.down();
   await page.mouse.move(x + 8, y + 8, {steps: 4});
   await page.mouse.move(overX, overY, {steps: 8});
   // Some engines dispatch dragover only after a second move into the target.
   await page.mouse.move(overX + 1, overY);
   return {first, middle, end, dy: overY - y};
 };
 const assertPreview = async ({first, middle, dy}) => {
   await expect.poll(async () => Math.abs((await sourceRow.boundingBox()).y - first.y - dy),
       {message:'the actual source row follows the pointer before drop'}).toBeLessThan(3);
   const current = await sourceRow.boundingBox();
   assert(Math.abs(current.x - first.x) < 1 && Math.abs(current.width - first.width) < 1,
     'the moving row stays full width within the vertical lane');
   await expect(sourceRow.getByText('研究笔记', {exact:true})).toBeVisible();
   await expect(sourceRow.getByRole('button', {name:'研究笔记下移'})).toBeVisible();
   await expect.poll(async () => Math.abs((await neighbor.boundingBox()).y - middle.y + first.height),
       {message:'neighbor shifts one row into the vacated position'}).toBeLessThan(2);
   assert.deepEqual(await order(), originalOrder, 'preview never mutates DOM order');
 };
 const assertLiftedPaint = async ({forced = false} = {}) => {
   const lift = await sourceRow.evaluate(el => {
     const style = getComputedStyle(el);
     const context = document.createElement('canvas').getContext('2d');
     const luminance = color => {
       context.fillStyle = color;
       context.fillRect(0, 0, 1, 1);
       const channels = [...context.getImageData(0, 0, 1, 1).data].slice(0, 3).map(channel => {
         const value = channel / 255;
         return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
       });
       return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
     };
     const tones = [luminance(style.outlineColor), luminance(style.backgroundColor)];
     return {
       outline: [style.outlineStyle, style.outlineWidth, style.outlineOffset],
       radius: style.borderTopLeftRadius,
       shadow: style.boxShadow,
       background: tones[1],
       contrast: (Math.max(...tones) + 0.05) / (Math.min(...tones) + 0.05),
     };
   });
   assert.deepEqual(lift.outline, ['solid', '1px', '-1px'], 'the actual dragged row has a crisp inset outline');
   assert.equal(lift.radius, '4px');
   assert(lift.contrast > 2.2, 'the moving edge is visible against its fill');
   if (forced) {
     assert.equal(lift.shadow, 'none', 'the system outline replaces decorative elevation');
   } else {
     assert(lift.shadow.includes('0px 1px 2px') && lift.shadow.includes('0px 2px 3px'),
       'compact shadow layers lift the moving row without a diffuse halo');
   }
   await expect(neighbor).toHaveCSS('outline-style', 'none');
   await expect(neighbor).toHaveCSS('box-shadow', 'none');
   return lift.background;
 };
 const first = await begin();
 await assertPreview(first);
 const lightBackground = await assertLiftedPaint();
 await mkdir('artifacts/list',{recursive:true});
 await page.screenshot({path:`artifacts/list/${process.env.BROWSER||'chromium'}-drag.png`});
 if (!process.env.BROWSER || process.env.BROWSER === 'chromium') {
   await page.emulateMedia({forcedColors:'active'});
   await assertLiftedPaint({forced:true});
   await page.emulateMedia({forcedColors:'none'});
 }
 assert(await neighbor.evaluate(el => getComputedStyle(el).transitionDuration.split(',').some(t => parseFloat(t) > 0)),
   'neighbor transition is enabled normally');
 const outside = await description.boundingBox();
 await page.mouse.move(outside.x + 20, outside.y + outside.height / 2, {steps: 5});
 await page.mouse.move(outside.x + 21, outside.y + outside.height / 2);
 await expect.poll(async () => Math.abs((await sourceRow.boundingBox()).y - first.first.y)).toBeLessThan(2);
 await expect.poll(async () => Math.abs((await neighbor.boundingBox()).y - first.middle.y)).toBeLessThan(2);
 await page.mouse.up();
 assert.deepEqual(await order(), originalOrder, 'drop outside does not reorder');
 await expect(sourceRow).toHaveCSS('outline-style', 'none');
 await expect(sourceRow).toHaveCSS('box-shadow', 'none');

 await page.emulateMedia({reducedMotion:'reduce',colorScheme:'dark'});
 const reduced = await begin();
 await assertPreview(reduced);
 const darkBackground = await assertLiftedPaint();
 assert(darkBackground + 0.5 < lightBackground, 'the outline remains visible under actual dark theme tokens');
 assert(await neighbor.evaluate(el => getComputedStyle(el).transitionDuration.split(',').every(t => parseFloat(t) === 0)),
   'reduced motion removes neighbor animation without removing the preview');
 await page.keyboard.press('Escape');
 await page.mouse.up();
 assert.deepEqual(await order(), originalOrder, 'Escape does not reorder');
 await expect.poll(async () => Math.abs((await sourceRow.boundingBox()).y - reduced.first.y)).toBeLessThan(2);

 const good = await begin();
 await assertPreview(good);
 await page.mouse.up();
 await expect.poll(order).toEqual(['设计规范', '项目归档', '研究笔记']);
 await page.setViewportSize({width:360,height:800});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await virtual.scrollIntoViewIfNeeded();
 await page.screenshot({path:`artifacts/list/${process.env.BROWSER||'chromium'}.png`});
 assert.deepEqual(errors,[]);
 console.log('List virtual, grouped sticky, horizontal, load more, sorting and responsive checks passed');
} finally {await browser?.close();await server.close();}
