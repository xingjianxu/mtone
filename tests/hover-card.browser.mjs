import {createServer} from 'vite';
import {chromium,firefox,webkit,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const server=await createServer({root:process.cwd(),server:{host:'127.0.0.1',port:5205,strictPort:true},logLevel:'error'});
await server.listen();
try {for(const [name,engine] of [['chromium',chromium],['firefox',firefox],['webkit',webkit]]) {
const browser=await engine.launch({headless:true});
try {
const page=await browser.newPage();
await page.goto('http://127.0.0.1:5205/tests/fixtures/hover-card.html');
const trigger=page.getByRole('button',{name:'Preview'}), popup=page.locator('.mt-hover-card');
await trigger.hover(); await expect(popup).toBeVisible();
const t=await trigger.boundingBox(), p=await popup.boundingBox();
await page.mouse.move(t.x+t.width/2,t.y+t.height+2);
await page.mouse.move(p.x+p.width/2,p.y+15,{steps:8});
await expect(popup).toBeVisible();
await page.getByRole('link',{name:'Details'}).click();
assert(page.url().endsWith('#details'));
await page.getByRole('button',{name:'Outside'}).hover(); await expect(popup).toHaveCount(0);
// Start keyboard checks without the link hash/focus history, after React mounts.
await page.goto('http://127.0.0.1:5205/tests/fixtures/hover-card.html');
await expect(trigger).toBeVisible();
await page.keyboard.press('Tab'); await expect(trigger).toBeFocused(); await expect(popup).toBeVisible();
await page.keyboard.press('Escape'); await expect(popup).toHaveCount(0); await expect(trigger).toBeFocused();
await page.setViewportSize({width:240,height:600}); await page.getByRole('button',{name:'Outside'}).hover(); await trigger.hover(); await expect(popup).toBeVisible();
const box=await popup.boundingBox(); assert(box.x>=0 && box.x+box.width<=240);
console.log(`HoverCard ${name} passed`);
}finally{await browser.close();}
}}finally{await server.close();}
