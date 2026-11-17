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
  for(const kind of ['menu','dropdown'])for(const rtl of [false,true])for(const align of ['left','right','start','end']){
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
  for(const kind of ['menu','dropdown'])for(const width of [120,240]){
   await page.goto(`http://127.0.0.1:5199/tests/fixtures/dropdown.html?kind=${kind}&align=right&width=${width}`);
   await page.getByRole('button',{name:'Open',exact:true}).click();const popup=page.getByRole(kind==='menu'?'menu':'dialog');await expect(popup).toBeVisible();
   assert(Math.abs((await popup.boundingBox()).width-width)<2,'explicit border-box width');
  }
  await page.setViewportSize({width:180,height:400});
  for(const kind of ['menu','dropdown'])for(const explicit of ['', '&width=600']){
   await page.goto(`http://127.0.0.1:5199/tests/fixtures/dropdown.html?kind=${kind}&long=1&align=right${explicit}`);
   await page.getByRole('button',{name:'Open',exact:true}).click();const popup=page.getByRole(kind==='menu'?'menu':'dialog');await expect(popup).toBeVisible();
   const box=await popup.boundingBox();assert(box.x>=-1&&box.x+box.width<=181,`${kind} long text stays in viewport`);
   assert(await popup.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'long content wraps without horizontal scrolling');
   await page.screenshot({path:`artifacts/dropdown/${engineName}-${kind}-${explicit?'fixed':'auto'}-narrow.png`});
   await page.keyboard.press('Escape');await expect(popup).toHaveCount(0);
  }
  await page.goto('http://127.0.0.1:5199/tests/fixtures/dropdown.html?kind=context&long=1&width=600');
  await page.getByText('Open context',{exact:true}).click({button:'right',position:{x:130,y:280}});
  const context=page.getByRole('menu');await expect(context).toBeVisible();
  const contextBox=await context.boundingBox();assert(contextBox.x>=-1&&contextBox.x+contextBox.width<=181,'context panel constrained at pointer edge');
  await page.keyboard.press('Escape');await expect(context).toHaveCount(0);
  console.log(`${engineName}: Dropdown/Menu content sizing, explicit widths, LTR/RTL physical/logical alignment, focus and narrow-screen collision checks passed`);
 }finally{await browser.close();}
}}finally{await server.close();}
