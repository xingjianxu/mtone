import { createServer } from 'vite';
import { chromium, firefox, webkit } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const server=await createServer({root:'apps/docs',server:{host:'127.0.0.1',port:5223,strictPort:true},logLevel:'error'});
await server.listen();let browser;
try {
 browser=await ({chromium,firefox,webkit}[process.env.BROWSER||'chromium']).launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
 const page=await browser.newPage({viewport:{width:1280,height:900}});
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
   const boundary = group.offsetTop + group.offsetHeight;
   el.scrollTop = boundary - section.offsetHeight * 2;
   await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
   el.scrollTop = boundary - 8;
   const viewportTop = el.getBoundingClientRect().top;
   const next = group.nextElementSibling?.matches('.mt-list-group-boundary')
     ? group.nextElementSibling.firstElementChild
     : [...el.querySelectorAll('[data-list-group]')].find(h => h !== section && h.parentElement.offsetTop === boundary);
   return {
     oldBottom: section.getBoundingClientRect().bottom - viewportTop,
     nextTop: next?.getBoundingClientRect().top - viewportTop,
   };
 });
 assert(Math.abs(boundary.oldBottom - 8) < 2, 'next group pushes current header off');
 assert(Math.abs(boundary.nextTop - 8) < 2, 'next group enters without overlap');
 const horizontal=page.getByRole('list',{name:'横向列表',exact:true});
 assert(await horizontal.evaluate(el=>el.scrollWidth>el.clientWidth));
 await horizontal.evaluate(el=>{el.scrollLeft=100;});
 assert(await horizontal.evaluate(el=>el.scrollLeft>0));
 const loading=page.getByRole('list',{name:'增量列表',exact:true});
 await loading.evaluate(el=>{el.scrollTop=el.scrollHeight;el.dispatchEvent(new Event('scroll'));});
 await page.getByText('已加载 60 条',{exact:true}).waitFor();
 const sorting=page.getByRole('list',{name:'排序列表',exact:true});
 await sorting.getByRole('button',{name:'研究笔记上移'}).click();
 assert((await sorting.locator('[data-list-key]').first().textContent()).startsWith('研究笔记'));
 const handles = sorting.locator('[draggable=true]');
 assert.equal(await handles.count(), 3);
 assert(await handles.first().evaluate(el => el.parentElement.firstElementChild === el && !!el.querySelector('svg.lucide-grip-vertical')));
 await handles.first().dragTo(sorting.locator('[data-list-key]').last());
 assert((await sorting.locator('[data-list-key]').last().textContent()).startsWith('研究笔记'));
 await page.setViewportSize({width:360,height:800});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await mkdir('artifacts/list',{recursive:true});
 await virtual.scrollIntoViewIfNeeded();
 await page.screenshot({path:`artifacts/list/${process.env.BROWSER||'chromium'}.png`});
 assert.deepEqual(errors,[]);
 console.log('List virtual, grouped sticky, horizontal, load more, sorting and responsive checks passed');
} finally {await browser?.close();await server.close();}
