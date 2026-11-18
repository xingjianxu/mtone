import {createServer} from 'vite';
import {chromium, firefox, webkit, expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const server = await createServer({root:process.cwd(),server:{host:'127.0.0.1',port:5202,strictPort:true},logLevel:'error'});
await server.listen();
mkdirSync('artifacts/loading-overlay',{recursive:true});
try {
 for (const [name,engine] of [['chromium',chromium],['firefox',firefox],['webkit',webkit]]) {
  if(process.env.LOADING_OVERLAY_BROWSER && process.env.LOADING_OVERLAY_BROWSER!==name) continue;
  const browser=await engine.launch({headless:true,...(name==='chromium'&&process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
  try {
   const page=await browser.newPage({viewport:{width:800,height:600}});
   await page.goto('http://127.0.0.1:5202/tests/fixtures/loading-overlay.html');
   const toggle=page.getByRole('button',{name:'Toggle',exact:true});
   await expect(toggle).toBeVisible();
   const region=page.getByTestId('region');
   const underlying=page.getByRole('button',{name:'Underlying',exact:true});
   const output=page.getByLabel('Clicks');
   await underlying.click(); await expect(output).toHaveText('1');
   for(let i=0;i<3;i++) {
    await toggle.click();
    await expect(page.getByRole('status',{name:'Saving'})).toBeVisible();
    const panel=page.locator('.mt-loading-overlay');
    const a=await region.boundingBox(),b=await panel.boundingBox();
    for(const key of ['x','y','width','height']) assert(Math.abs(a[key]-b[key])<1,`local ${key}`);
    const content=await page.locator('.mt-loading-overlay-content').boundingBox();
    assert(Math.abs(content.x+content.width/2-b.x-b.width/2)<1,'horizontally centered');
    assert(Math.abs(content.y+content.height/2-b.y-b.height/2)<1,'vertically centered');
    assert.equal(await panel.evaluate(el=>getComputedStyle(el).borderRadius),'8px');
    const clickTarget=await underlying.boundingBox();
    await page.mouse.click(clickTarget.x+clickTarget.width/2,clickTarget.y+clickTarget.height/2);
    await expect(output).toHaveText(String(1+i*2));
    // The contract explicitly does not disable lower keyboard targets.
    await underlying.focus(); await page.keyboard.press('Enter');
    await expect(output).toHaveText(String(2+i*2));
    await toggle.click(); await expect(panel).toHaveCount(0);
    await underlying.click(); await expect(output).toHaveText(String(3+i*2));
   }
   await toggle.click();
   await page.getByRole('button',{name:'Outside',exact:true}).click();
   await expect(output).toHaveText('8');
   await page.emulateMedia({reducedMotion:'reduce'});
   assert.equal(await page.locator('.mt-spin').evaluate(el=>getComputedStyle(el).animationName),'none');
   await page.setViewportSize({width:240,height:400});
   const small=await page.locator('.mt-loading-overlay').boundingBox();
   assert(small.x>=0&&small.x+small.width<=240,'fits narrow parent');
   await page.screenshot({path:`artifacts/loading-overlay/${name}.png`});
   console.log(`${name}: local bounds, radius, pointer blocking, keyboard contract, repeated toggles, reduced motion and narrow layout passed`);
  } finally {await browser.close();}
 }
} finally {await server.close();}
