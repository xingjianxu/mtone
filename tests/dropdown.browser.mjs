import {createServer} from 'vite';
import {chromium,firefox,webkit,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const server=await createServer({root:process.cwd(),server:{host:'127.0.0.1',port:5199,strictPort:true},logLevel:'error'});
await server.listen();mkdirSync('artifacts/dropdown',{recursive:true});
try{for(const [engineName,engine] of [['chromium',chromium],['firefox',firefox],['webkit',webkit]]){
 if(process.env.DROPDOWN_BROWSER && process.env.DROPDOWN_BROWSER!==engineName)continue;
 const browser=await engine.launch({headless:true,...(engineName==='chromium'&&process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try{const page=await browser.newPage({viewport:{width:800,height:600}});page.setDefaultTimeout(10000);
  for(const kind of ['menu','popover'])for(const rtl of [false,true])for(const align of ['left','right','start','end']){
   await page.goto(`http://127.0.0.1:5199/tests/fixtures/dropdown.html?kind=${kind}&align=${align}${rtl?'&rtl=1':''}`);
   const trigger=page.getByRole('button',{name:'Open',exact:true});await trigger.click();
   const popup=page.getByRole(kind==='menu'?'menu':'dialog');await expect(popup).toBeVisible();
   const anchor=await trigger.boundingBox(), panel=await popup.boundingBox();
   assert(panel.width>=159&&panel.width<anchor.width-30,`${engineName} ${kind} content width independent of wide trigger`);
   const physicalLeft=align==='left'||align==='start'&&!rtl||align==='end'&&rtl;
   assert(Math.abs(physicalLeft?panel.x-anchor.x:panel.x+panel.width-anchor.x-anchor.width)<2,`${engineName} ${kind} ${rtl?'rtl':'ltr'} ${align} edge`);
   if(kind==='menu'){
    await page.getByRole('menuitem',{name:'Parent',exact:true}).click();
    const child=page.getByRole('menuitem',{name:'Child',exact:true});await expect(child).toBeVisible();
    await child.click();await expect(page.getByRole('status')).toHaveText('child');
   }else{await page.getByRole('textbox',{name:'Name'}).fill('Ada');await expect(popup).toBeVisible();await page.keyboard.press('Escape');}
   await expect(popup).toHaveCount(0);await expect(trigger).toBeFocused();
  }
  for(const kind of ['menu','popover'])for(const width of [120,240]){
   await page.goto(`http://127.0.0.1:5199/tests/fixtures/dropdown.html?kind=${kind}&align=right&width=${width}`);
   await page.getByRole('button',{name:'Open',exact:true}).click();const popup=page.getByRole(kind==='menu'?'menu':'dialog');await expect(popup).toBeVisible();
   assert(Math.abs((await popup.boundingBox()).width-width)<2,'explicit border-box width');
  }
  await page.goto('http://127.0.0.1:5199/tests/fixtures/dropdown.html?kind=popover&side=top');
  const topTrigger=page.getByRole('button',{name:'Open',exact:true});
  await topTrigger.click();
  const topPopup=page.getByRole('dialog',{name:'Custom content'});
  await expect(topPopup).toHaveAttribute('data-side','top');
  const topAnchor=await topTrigger.boundingBox(), topBox=await topPopup.boundingBox();
  assert(Math.abs(topAnchor.x+topAnchor.width/2-topBox.x-topBox.width/2)<2,'original Popover centers by default on its chosen side');
  await page.setViewportSize({width:180,height:400});
  for(const kind of ['menu','popover'])for(const explicit of ['', '&width=600']){
   await page.goto(`http://127.0.0.1:5199/tests/fixtures/dropdown.html?kind=${kind}&long=1&align=right${explicit}`);
   await page.getByRole('button',{name:'Open',exact:true}).click();const popup=page.getByRole(kind==='menu'?'menu':'dialog');await expect(popup).toBeVisible();
   const box=await popup.boundingBox();assert(box.x>=-1&&box.x+box.width<=181,`${kind} long text stays in viewport`);
   assert(await popup.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'long content wraps without horizontal scrolling');
   await page.screenshot({path:`artifacts/dropdown/${engineName}-${kind}-${explicit?'fixed':'auto'}-narrow.png`});
   await page.keyboard.press('Escape');await expect(popup).toHaveCount(0);
  }
  const cardPage=await browser.newPage({viewport:{width:180,height:400}});
  try {
   await cardPage.goto('http://127.0.0.1:5199/tests/fixtures/dropdown.html?card&width=600');
   const cardTrigger=cardPage.getByRole('button',{name:'Open card'});
   await cardTrigger.click();
   const cardPanel=cardPage.getByRole('dialog',{name:'Card dialog'});
   await expect(cardPanel).toBeVisible();
   await expect(cardPanel).toHaveCSS('padding','0px');
   await expect(cardPanel).toHaveCSS('border-top-width','0px');
   await expect(cardPanel).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
   await expect(cardPanel).toHaveCSS('box-shadow','none');
   await expect(cardPanel.locator('.mt-card')).toHaveCSS('border-top-width','1px');
   const cardBox=await cardPanel.boundingBox(), triggerBox=await cardTrigger.boundingBox();
   assert(cardBox.x>=-1&&cardBox.x+cardBox.width<=181,'unstyled Card panel constrained at narrow width');
   assert(triggerBox.width<140,'string trigger keeps its content width');
   const field=cardPanel.getByRole('textbox',{name:'Project title'});
   await field.fill('Ada');
   await expect(field).toHaveValue('Ada');
   await cardPage.keyboard.press('Escape');
   await expect(cardPanel).toHaveCount(0);
   await expect(cardTrigger).toBeFocused();
  }finally{await cardPage.close();}
  await page.goto('http://127.0.0.1:5199/tests/fixtures/dropdown.html?kind=context&long=1&width=600');
  await page.getByText('Open context',{exact:true}).click({button:'right',position:{x:100,y:280}});
  const context=page.getByRole('menu');await expect(context).toBeVisible();
  const contextBox=await context.boundingBox();assert(contextBox.x>=-1&&contextBox.x+contextBox.width<=181,'context panel constrained at pointer edge');
  await page.keyboard.press('Escape');await expect(context).toHaveCount(0);
  await page.setViewportSize({width:390,height:540});
  await page.goto('http://127.0.0.1:5199/tests/fixtures/dropdown.html?select');
  const repoTrigger=page.getByRole('button',{name:'Repository',exact:true});
  await repoTrigger.press('Enter');
  const picker=page.getByRole('dialog',{name:'Switch repository'});
  const search=picker.getByRole('combobox');
  const list=picker.getByRole('listbox');
  await expect(search).toBeFocused();
  const listId=await list.getAttribute('id');
  await expect(search).toHaveAttribute('aria-controls',listId);
  await expect(list.getByRole('option',{name:'Repository 0',exact:true,selected:true})).toBeVisible();
  let measurements=await list.evaluate(el=>({
    top:el.getBoundingClientRect().top, scroll:el.scrollHeight, client:el.clientHeight,
    panelScroll:el.closest('[role=dialog]').scrollHeight,
    panelClient:el.closest('[role=dialog]').clientHeight,
  }));
  const searchBox=await search.boundingBox();
  const panelBox=await picker.boundingBox();
  assert(measurements.scroll>measurements.client && measurements.panelScroll<=measurements.panelClient+1,
    `${engineName} only the list scrolls: ${JSON.stringify(measurements)}`);
  assert(searchBox.y+searchBox.height<measurements.top && panelBox.width===320);
  await search.press('ArrowDown');
  const option2=list.getByRole('option',{name:'Repository 2',exact:true});
  await expect(search).toHaveAttribute('aria-activedescendant',await option2.getAttribute('id'));
  for(let i=0;i<15;i++) await search.press('ArrowDown');
  assert(await list.evaluate(el=>el.scrollTop>0));
  assert.equal((await search.boundingBox()).y,searchBox.y,'keyboard scrolling keeps search fixed');
  await search.fill('19');
  await expect(list.getByRole('option')).toHaveCount(1);
  await search.press('Enter');
  await expect(page.getByLabel('Selected repository')).toHaveText('19');
  await expect(picker).toHaveCount(0);
  await expect(repoTrigger).toBeFocused();
  await repoTrigger.click();
  await expect(search).toHaveValue('');
  await expect(list.getByRole('option',{name:'Repository 19',exact:true,selected:true})).toBeVisible();
  await search.fill('not found');
  await expect(picker.getByRole('status')).toBeVisible();
  await search.press('Escape');
  await expect(picker).toHaveCount(0);
  await expect(repoTrigger).toBeFocused();
  const otherTrigger=page.getByRole('button',{name:'Another picker'});
  await otherTrigger.click();
  const other=page.getByRole('dialog',{name:'Other options'});
  await expect(other.getByRole('combobox')).toBeFocused();
  assert.notEqual(await other.getByRole('listbox').getAttribute('id'),listId);
  await other.getByRole('option',{name:'Repository 5',exact:true,selected:true}).click();
  await expect(other).toHaveCount(0);
  await expect(otherTrigger).toBeFocused();
  console.log(`${engineName}: Popover/Menu content sizing, explicit widths, LTR/RTL physical/logical alignment, focus and narrow-screen collision checks passed`);
 }finally{await browser.close();}
}}finally{await server.close();}
