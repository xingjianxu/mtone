import {createServer} from 'vite';
import {chromium,firefox,webkit,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const server=await createServer({root:process.cwd(),server:{host:'127.0.0.1',port:5207,strictPort:true},logLevel:'error'});
await server.listen();
mkdirSync('artifacts/hover-card-arrow',{recursive:true});
try {for(const [name,engine] of [['chromium',chromium],['firefox',firefox],['webkit',webkit]]) {
 if(process.env.HOVER_ARROW_BROWSER && process.env.HOVER_ARROW_BROWSER!==name) continue;
 const browser=await engine.launch({headless:true,...(name==='chromium'&&process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try {for(const scale of [1,2]) {
  const page=await browser.newPage({viewport:{width:1200,height:800},deviceScaleFactor:scale});
  for(const dark of [false,true]) {
   await page.goto(`http://127.0.0.1:5207/tests/fixtures/hover-card-arrow.html${dark?'?dark=1':''}`);
   for(const side of ['top','bottom','left','right']) {
    const popup=page.locator('.mt-hover-card').filter({has:page.getByTestId(`content-${side}`)});
    await expect(popup).toBeVisible();
    const arrow=popup.locator('.mt-hover-card-arrow');
    await expect(arrow).toHaveAttribute('data-side',side);
    const geometry=await arrow.evaluate(el=>{
     const svg=el.querySelector('svg'), matrix=svg.getScreenCTM();
     const base=new DOMPoint(6,7).matrixTransform(matrix);
     const tip=new DOMPoint(6,1).matrixTransform(matrix);
     const box=el.closest('.mt-hover-card').getBoundingClientRect();
     return {base:{x:base.x,y:base.y},tip:{x:tip.x,y:tip.y},box:{left:box.left,right:box.right,top:box.top,bottom:box.bottom},border:getComputedStyle(el.closest('.mt-hover-card')).borderTopWidth,fill:getComputedStyle(svg).fill,bg:getComputedStyle(el.closest('.mt-hover-card')).backgroundColor};
    });
    const {base,tip,box}=geometry;
    const expected=side==='bottom'?box.top+1:side==='top'?box.bottom-1:side==='left'?box.right-1:box.left+1;
    assert(Math.abs((side==='top'||side==='bottom'?base.y:base.x)-expected)<0.25,`${name} ${side}: baseline must cover inner border edge`);
    assert.equal(geometry.fill,geometry.bg,'arrow must match popup surface');
    assert.equal(geometry.border,'1px');
    if(side==='bottom') assert(tip.y<box.top); else if(side==='top') assert(tip.y>box.bottom); else if(side==='left') assert(tip.x>box.right); else assert(tip.x<box.left);
   }
   await page.screenshot({path:`artifacts/hover-card-arrow/${name}-${scale}x-${dark?'dark':'light'}.png`});
  }
  await page.close();
 }
 console.log(`HoverCard arrow ${name} passed`);
 } finally {await browser.close();}
}} finally {await server.close();}
