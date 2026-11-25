import {createServer} from 'vite';import {chromium,firefox,webkit,expect} from '@playwright/test';import assert from 'node:assert/strict';
const server=await createServer({root:process.cwd(),server:{host:'127.0.0.1',port:5199,strictPort:true},logLevel:'error'});await server.listen();
const url='http://127.0.0.1:5199/tests/fixtures/splitter.html';

async function assertThreeDotGrip(separator, seam) {
  const grip = await separator.locator(".mt-splitter-grip").evaluate((dot) => {
    const seamRect = dot.parentElement.getBoundingClientRect();
    const dotRect = dot.getBoundingClientRect();
    const parts = [null, "::before", "::after"].map((pseudo) => {
      const style = getComputedStyle(dot, pseudo);
      const translation = new DOMMatrix(style.transform === "none" ? undefined : style.transform);
      return {
        generated: pseudo === null || !["none", "normal"].includes(style.content),
        width: Number.parseFloat(style.width),
        height: Number.parseFloat(style.height),
        radius: style.borderTopLeftRadius,
        background: style.backgroundColor,
        x: translation.m41,
        y: translation.m42,
      };
    });
    return {
      thickness: Math.min(seamRect.width, seamRect.height),
      centerOffsetX: dotRect.left + (dotRect.width - seamRect.width) / 2 - seamRect.left,
      centerOffsetY: dotRect.top + (dotRect.height - seamRect.height) / 2 - seamRect.top,
      parts,
    };
  });
  assert(grip.parts.every(({ generated }) => generated), "grip paints exactly three dots");
  assert(Math.abs(grip.thickness - 6) < 0.1, "the separator hitbox retains its original thickness");
  assert(Math.abs(grip.centerOffsetX) < 0.51 && Math.abs(grip.centerOffsetY) < 0.51,
    "the grip stays centered on the entire hitbox");
  assert(grip.parts.every(({ width, height, radius, background }) =>
    width === 3 && height === 3 && radius === "50%" &&
    background === grip.parts[0].background && background !== "rgba(0, 0, 0, 0)"),
    "all three dots are small circles and use the same visible color");
  const along = seam === "horizontal" ? "x" : "y";
  const across = seam === "horizontal" ? "y" : "x";
  assert.deepEqual(grip.parts.map((dot) => dot[along]).sort((a, b) => a - b), [-5, 0, 5]);
  assert(grip.parts.every((dot) => dot[across] === 0), "the dots follow the seam, not the resizing direction");
}

const engines = Object.entries({ chromium, firefox, webkit });
const selectedBrowser = process.env.MTONE_SPLITTER_BROWSER;
if (selectedBrowser && !engines.some(([name]) => name === selectedBrowser)) {
  await server.close();
  throw new Error(`Unknown Splitter browser: ${selectedBrowser}`);
}
try{for(const [name,engine] of engines){if (selectedBrowser && selectedBrowser !== name) continue; const browser=await engine.launch({headless:true, executablePath:name==='chromium'?process.env.CHROMIUM_PATH:undefined});try{const page=await browser.newPage({viewport:{width:900,height:800},hasTouch:true});page.setDefaultTimeout(10000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
 const panel=key=>page.locator(`[data-content="${key}"]`);const size=async(key,vertical=false)=>panel(key).evaluate((el,v)=>{const r=el.closest('[data-panel]').getBoundingClientRect();return v?r.height:r.width;},vertical);const ratio=async(v=false)=>(await size('left',v))/((await size('left',v))+(await size('right',v)));
 const events=async()=>JSON.parse(await page.getByTestId('events').textContent());
 const drag=async(delta,vertical=false)=>{const handle=page.getByRole('separator').first();await handle.scrollIntoViewIfNeeded();const b=await handle.boundingBox();const x=b.x+b.width/2,y=b.y+b.height/2;await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(Math.max(1,Math.min(899,x+(vertical?0:delta))),Math.max(1,Math.min(799,y+(vertical?delta:0))),{steps:8});await page.mouse.up();await page.waitForTimeout(100);};

 const workspace=page.getByLabel('Test workspace',{exact:true});
 const borderStyle=element=>element.evaluate(el=>{
   const css=getComputedStyle(el);
   return [css.borderTopWidth,css.borderRightWidth,css.borderBottomWidth,css.borderLeftWidth,css.borderTopStyle,css.borderTopColor];
 });
 const outerWidth=(await workspace.boundingBox()).width;
 const originalSeam=await borderStyle(page.getByRole('separator').first());
 await expect(workspace).toHaveCSS('border-top-width','0px');
 await page.getByRole('button',{name:'Border',exact:true}).click();
 await expect(workspace).toHaveCSS('border-top-width','1px');
 const themeBorder=await workspace.evaluate(el=>{
   const probe=el.ownerDocument.createElement('span');
   probe.style.color='var(--mt-border)';
   el.append(probe);
   const color=getComputedStyle(probe).color;
   probe.remove();
   return color;
 });
 assert.deepEqual(await borderStyle(workspace),['1px','1px','1px','1px','solid',themeBorder]);
 assert.deepEqual(await borderStyle(page.getByRole('separator').first()),originalSeam);
 assert.equal((await workspace.boundingBox()).width,outerWidth,'border remains inside the sized workspace');
 await page.getByRole('button',{name:'Orientation',exact:true}).click();
 await expect(workspace).toHaveCSS('border-top-width','1px');
 await assertThreeDotGrip(page.getByRole('separator').first(),'horizontal');
 await page.goto(url);
 await expect.poll(()=>ratio()).toBeCloseTo(.4,1);await assertThreeDotGrip(page.getByRole('separator').first(), 'vertical');let start=await size('left');await drag(60);assert((await size('left'))>start+30,name+' pointer resize');assert((await events()).starts>0);assert((await events()).ends>0);
 const separator=page.getByRole('separator').first();await separator.focus();assert.equal(await separator.getAttribute('aria-orientation'),'vertical');assert(await separator.getAttribute('aria-controls'));start=await size('left');await page.keyboard.press('ArrowRight');await expect.poll(()=>size('left')).toBeGreaterThan(start);await drag(1000);assert((await ratio())<=.705,name+' max');
 await page.getByRole('separator').first().press('Enter');await expect.poll(()=>size('left')).toBeLessThan(1);const content=panel('left');assert(await content.evaluate(el=>!!el.closest('[inert]')),name+' collapsed content inert');await page.getByRole('separator').first().press('Enter');await expect.poll(()=>size('left')).toBeGreaterThan(50);
 await page.getByRole('button',{name:'Orientation',exact:true}).click();console.log(name+' orientation diagnostic',JSON.stringify({events:await events(),root:await page.getByLabel('Test workspace',{exact:true}).getAttribute('data-orientation'),focus:await page.evaluate(()=>document.activeElement?.outerHTML),errors}));await expect(separator).toHaveAttribute('aria-orientation','horizontal');await assertThreeDotGrip(separator, 'horizontal');start=await size('left',true);await drag(-30,true);assert((await size('left',true))<start-10,name+' vertical');const endValues=(await events()).latest;assert(Math.abs(endValues.reduce((a,b)=>a+b,0)-((await size('left',true))+(await size('right',true))))<2,name+' vertical px callbacks');
 // Controlled parent accepts changes, then rejects the next user proposal.
 await page.goto(url);await page.getByRole('button',{name:'Controlled',exact:true}).click();await expect.poll(()=>ratio()).toBeCloseTo(.4,1);start=await size('left');await drag(35);assert((await size('left'))>start+10,name+' accepted controlled change');await page.getByRole('separator').first().press('Enter');await expect.poll(()=>size('left')).toBeLessThan(1);await page.getByRole('separator').first().press('Enter');await expect.poll(()=>size('left')).toBeGreaterThan(50);await page.getByRole('button',{name:'Accept',exact:true}).click();start=await size('left');await drag(-40);await expect.poll(()=>size('left')).toBeCloseTo(start,0);
 await page.getByRole('button',{name:'Narrow',exact:true}).click();await expect.poll(async()=>((await size('left'))+(await size('right')))).toBeLessThan(321);assert((await ratio())>=.195);
 // Dynamic panels and unmount during interaction must release global handlers.
 await page.goto(url);await page.getByRole('button',{name:'Third',exact:true}).click();await expect(page.getByRole('separator')).toHaveCount(2);assert((await size('third'))>0);await page.getByRole('button',{name:'Third',exact:true}).click();await expect(page.getByRole('separator')).toHaveCount(1);
 const h=page.getByRole('separator');const b=await h.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+35,b.y+b.height/2);await h.dispatchEvent('pointercancel',{pointerId:1,pointerType:'mouse',bubbles:true});await page.mouse.up();await page.waitForTimeout(100);const cancelled=await size('left');await page.mouse.move(b.x+100,b.y+b.height/2);assert(Math.abs((await size('left'))-cancelled)<1,name+' cancel cleanup');
 const unmountBox=await h.boundingBox();await page.mouse.move(unmountBox.x+3,unmountBox.y+100);await page.mouse.down();await page.mouse.move(unmountBox.x+25,unmountBox.y+100);await page.keyboard.press('u');await page.mouse.up();await expect(page.getByRole('separator')).toHaveCount(0);await page.getByRole('button',{name:'Mount',exact:true}).click();await expect(page.getByRole('separator')).toHaveCount(1);await drag(20);
 await page.getByRole('button',{name:'Disable',exact:true}).click();start=await size('left');await drag(40);assert(Math.abs((await size('left'))-start)<1,name+' disabled');
 await page.goto(url);await page.getByRole('button',{name:'RTL',exact:true}).click();start=await size('left');await drag(40);assert((await size('left'))<start-15,name+' RTL pointer direction');
 await page.goto(url);await page.getByRole('button',{name:'Padding',exact:true}).click();await drag(25);const paddedValues=(await events()).latest;assert(Math.abs(paddedValues.reduce((a,b)=>a+b,0)-((await size('left'))+(await size('right'))))<2,name+' padded px callbacks');
 await page.goto(url);await page.getByRole('button',{name:'Nested',exact:true}).click();const outerStarts=(await events()).starts;const inner=page.getByLabel('Nested workspace').getByRole('separator');const nestedFirst=page.getByLabel('Nested workspace').locator('[data-panel]').first();const outerBeforeNested=await size('right');await inner.press('Enter');await expect.poll(()=>nestedFirst.evaluate(el=>el.getBoundingClientRect().height)).toBeLessThan(1);await expect.poll(()=>size('right')).toBeCloseTo(outerBeforeNested,0);await inner.press('Enter');await expect.poll(()=>nestedFirst.evaluate(el=>el.getBoundingClientRect().height)).toBeGreaterThan(30);await inner.focus();await page.keyboard.press('ArrowDown');await page.waitForTimeout(80);assert.equal((await events()).starts,outerStarts,name+' nested keyboard isolation');
 await page.goto(url);await page.getByRole('button',{name:'Lazy',exact:true}).click();const lazyHandle=page.getByRole('separator');const lb=await lazyHandle.boundingBox();start=await size('left');await page.mouse.move(lb.x+3,lb.y+150);await page.mouse.down();await page.mouse.move(lb.x+60,lb.y+150,{steps:6});assert(Math.abs((await size('left'))-start)<1,name+' deferred preview');await page.mouse.up();await expect.poll(()=>size('left')).toBeGreaterThan(start+20);
 if(name==='chromium'){
  await page.goto(url);const forcedHandle=page.getByRole('separator').first();await expect(forcedHandle).toBeVisible();
  const normalBorder=await forcedHandle.evaluate(el=>getComputedStyle(el).borderTopWidth);
  await page.emulateMedia({forcedColors:'active'});
  await expect(forcedHandle).toHaveCSS('border-top-width','1px');
  await expect(forcedHandle).toHaveCSS('border-top-style','solid');
  const forced=await forcedHandle.evaluate(el=>{const probe=document.createElement('span');probe.style.color='ButtonText';document.body.append(probe);const expected=getComputedStyle(probe).color;probe.remove();return {expected,border:getComputedStyle(el).borderTopColor,grip:getComputedStyle(el.querySelector('.mt-splitter-grip')).backgroundColor};});
  assert.equal(forced.border,forced.expected);assert.equal(forced.grip,forced.expected);
  await page.emulateMedia({forcedColors:'none'});await expect(forcedHandle).toHaveCSS('border-top-width',normalBorder);
 }
 if(name==='chromium'){await page.goto(url);const rect=await page.getByRole('separator').boundingBox();const cdp=await page.context().newCDPSession(page);const x=rect.x+rect.width/2,y=rect.y+rect.height/2;start=await size('left');await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+50,y,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect.poll(()=>size('left')).toBeGreaterThan(start+20);console.log('SPLITTER_DESKTOP='+(await page.screenshot()).toString('base64'));await page.setViewportSize({width:360,height:700});const overflowBefore=await page.locator('body').evaluate(el=>el.scrollWidth);await page.getByTestId('events').evaluate(el=>{el.style.display='block';el.style.overflowWrap='anywhere';});const overflowAfter=await page.locator('body').evaluate(el=>el.scrollWidth);console.log('Splitter narrow diagnostic',JSON.stringify({overflowBefore,overflowAfter,viewport:360}));assert(overflowAfter<=360,'narrow Splitter without unbroken test telemetry');console.log('SPLITTER_MOBILE='+(await page.screenshot()).toString('base64'));}
 assert.deepEqual(errors,[],name+' page errors');console.log(name+' Splitter pointer/keyboard, constraints, collapse, control, resize, dynamic, cancellation and RTL passed');
}finally{await browser.close();}}}finally{await server.close();}
