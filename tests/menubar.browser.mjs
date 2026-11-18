import {createServer} from 'vite';
import {chromium,firefox,webkit,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const server=await createServer({root:process.cwd(),server:{host:'127.0.0.1',port:5198,strictPort:true},logLevel:'error'});
await server.listen();
try { for(const [name,engine] of [['chromium',chromium],['firefox',firefox],['webkit',webkit]]) {
 if(process.env.MENUBAR_BROWSER && process.env.MENUBAR_BROWSER!==name) continue;
 const browser=await engine.launch({headless:true,...(name==='chromium'&&process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try {const page=await browser.newPage();
 await page.addInitScript(() => {
  const label = (node) => node instanceof Element ? `${node.tagName}[${node.getAttribute('role') || ''}]#${node.id}:${node.textContent?.slice(0,80)}` : String(node);
  for (const type of ['focusin','focusout','mouseover','keydown']) document.addEventListener(type, event => console.log('MT_EVENT', performance.now(), type, label(event.target), 'related', label(event.relatedTarget), 'active', label(document.activeElement), event.key || ''), true);
 });
 page.on('console', message => { if (message.text().startsWith('MT_')) console.log(message.text()); });
 for(const rtl of [false,true]) { console.log(`Menubar ${name} ${rtl?'rtl':'ltr'}`);
  await page.goto(`http://127.0.0.1:5198/tests/fixtures/menubar.html?debugFocus=1${rtl?'&rtl=1':''}`);
  const file=page.getByRole('menuitem',{name:'File',exact:true}), edit=page.getByRole('menuitem',{name:'Edit',exact:true});
  await expect(file).toBeVisible();
  await page.keyboard.press('Tab'); await expect(file).toBeFocused();
  await page.keyboard.press(rtl?'ArrowLeft':'ArrowRight'); await expect(edit).toBeFocused();
  await page.keyboard.press('ArrowDown'); await expect(page.getByRole('menuitem',{name:'Copy',exact:true})).toBeFocused();
  await page.keyboard.press('Escape'); await expect(edit).toBeFocused();
  await file.click(); await expect(page.getByRole('menuitem',{name:'New',exact:true})).toBeVisible();
  await edit.hover(); await expect(page.getByRole('menuitem',{name:'Copy',exact:true})).toBeVisible();
  await expect(page.getByRole('menuitem',{name:'New',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Outside'}).click(); await expect(page.getByRole('menu')).toHaveCount(0);
  await file.focus(); await expect(file).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem',{name:'New',exact:true})).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem',{name:'Recent',exact:true})).toBeFocused();
  await page.keyboard.press(rtl?'ArrowLeft':'ArrowRight');
  await expect(page.getByRole('menuitem',{name:'Project',exact:true})).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page.getByRole('status')).toHaveText('project');
  await page.getByRole('menuitem',{name:'View',exact:true}).click();
  await page.getByRole('menuitemcheckbox',{name:'Sidebar'}).click(); await expect(page.getByRole('menuitemcheckbox')).toBeChecked();
  await page.keyboard.press('Escape');
  await page.setViewportSize({width:320,height:600});
  const bar=page.getByRole('menubar'); const box=await bar.boundingBox(); assert(box.width<=280);
  await file.click(); const popup=await page.getByRole('menu').boundingBox(); assert(popup.x>=0 && popup.x+popup.width<=320);
 }
 await page.goto('http://127.0.0.1:5198/tests/fixtures/menubar.html?hover=1');
 const hoverFile=page.getByRole('menuitem',{name:'File',exact:true});
 await hoverFile.hover(); await expect(page.getByRole('menu')).toBeVisible();
 const hb=await hoverFile.boundingBox(), pb=await page.getByRole('menu').boundingBox();
 await page.mouse.move(hb.x+hb.width/2,hb.y+hb.height+2);
 await page.mouse.move(pb.x+20,pb.y+15,{steps:5});
 await expect(page.getByRole('menu')).toBeVisible();
 await page.getByRole('button',{name:'Outside'}).hover(); await expect(page.getByRole('menu')).toHaveCount(0);
 }finally{await browser.close();}
}}finally{await server.close();}
