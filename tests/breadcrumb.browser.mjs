import { createServer } from 'vite';
import { chromium, firefox, webkit, expect } from '@playwright/test';
import assert from 'node:assert/strict';
const server=await createServer({root:process.cwd(),server:{host:'127.0.0.1',port:5209,strictPort:true},logLevel:'error'});
await server.listen();
try {for(const [name,engine] of [['chromium',chromium],['firefox',firefox],['webkit',webkit]]) {
 if(process.env.BREADCRUMB_BROWSER && process.env.BREADCRUMB_BROWSER!==name) continue;
 const browser=await engine.launch({headless:true});
 try {const page=await browser.newPage();
 await page.goto('http://127.0.0.1:5209/tests/fixtures/breadcrumb.html');
 const trigger=page.getByRole('button',{name:'Projects',exact:true});
 await trigger.focus(); await page.keyboard.press('ArrowDown');
 await expect(page.getByRole('menuitem',{name:'One',exact:true})).toBeFocused();
 await page.keyboard.press('ArrowDown'); await expect(page.getByRole('menuitem',{name:'Nested',exact:true})).toBeFocused();
 await page.keyboard.press('ArrowRight'); await expect(page.getByRole('menuitem',{name:'Child',exact:true})).toBeFocused();
 await page.keyboard.press('Enter'); await expect(page.getByRole('status')).toHaveText('child');
 for(let i=0;i<3;i++) {await trigger.click(); await expect(page.getByRole('menu')).toBeVisible(); await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();}
 await trigger.click(); await page.getByRole('button',{name:'Outside'}).click(); await expect(page.getByRole('menu')).toHaveCount(0);
 const link=page.getByRole('link',{name:'Projects'}); await link.hover(); assert.deepEqual(await link.evaluate(el=>{const s=getComputedStyle(el);return {color:s.color,background:s.backgroundColor,decoration:s.textDecorationLine};}),{color:'rgb(55, 53, 47)',background:'rgb(241, 241, 239)',decoration:'none'});
 await page.mouse.move(800,500); await link.focus(); assert.equal(await link.evaluate(el=>getComputedStyle(el).outlineStyle),'solid');
 await expect(page.getByText('Current',{exact:true})).toHaveAttribute('aria-current','page');
 await link.click(); assert.equal(new URL(page.url()).hash,'#projects'); await expect(page.getByRole('menu')).toHaveCount(0);
 const icon=page.getByRole('link',{name:'Home'}).locator('svg'); const ib=await icon.boundingBox(), lb=await page.getByRole('link',{name:'Home'}).boundingBox(); assert(Math.abs((ib.y+ib.height/2)-(lb.y+lb.height/2))<1);
 await page.setViewportSize({width:320,height:600}); assert(await page.evaluate(()=>document.documentElement.scrollWidth<=320));
 await page.getByRole('navigation',{name:'Long'}).getByRole('button').click(); const popup=await page.getByRole('menu').boundingBox(); assert(popup.x>=0 && popup.x+popup.width<=320);
 console.log(`${name}: Breadcrumb keyboard, nested menus, repeated dismissal, links, icons and narrow layout passed`);
 }finally{await browser.close();}
}}finally{await server.close();}
