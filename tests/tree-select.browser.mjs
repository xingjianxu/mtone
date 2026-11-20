import {createServer} from 'vite';
import {chromium,firefox,webkit,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const server=await createServer({root:process.cwd(),server:{host:'127.0.0.1',port:5234,strictPort:true},logLevel:'error'});await server.listen();
await mkdir('artifacts/tree-select-browser',{recursive:true});
try{for(const [name,engine] of Object.entries({chromium,firefox,webkit})){
 if(process.env.BROWSER && process.env.BROWSER!==name)continue;
 const browser=await engine.launch(name==='chromium' && process.env.CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.CHROMIUM_EXECUTABLE_PATH} : {});try{
 const page=await browser.newPage({viewport:{width:900,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5234/tests/fixtures/tree-select.html');
 const single=page.getByRole('combobox',{name:'Single',exact:true});
 // createRoot commits asynchronously; wait for the keyboard target before Tab.
 await expect(single).toBeVisible();await expect(single).toBeEnabled();await page.keyboard.press('Tab');await expect(single).toBeFocused();
 await expect(page.locator('.mt-tree-select').first()).toHaveCSS('height','34px');await expect(page.locator('.mt-tree-select').first()).toHaveCSS('border-top-color','rgb(147, 180, 220)');
 await single.press('ArrowDown');await expect(page.getByRole('treeitem',{name:'Team',exact:true})).toBeFocused();await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await expect(single).toHaveText('Alice');await expect(single).toBeFocused();
 await page.getByRole('button',{name:'Clear selection',exact:true}).click();await expect(single).toHaveText('Select…');
 const multi=page.getByRole('combobox',{name:'Multiple',exact:true});await multi.click();await page.getByRole('searchbox').fill('Alice');await page.getByRole('checkbox',{name:'Team',exact:true}).click();await expect(multi).toHaveText('1 selected');
 await page.getByRole('searchbox').clear();await expect(page.getByRole('checkbox',{name:'Bob',exact:true})).toBeChecked();await expect(page.getByRole('treeitem',{name:'Disabled',exact:true})).toHaveAttribute('aria-disabled','true');
 await page.keyboard.press('Escape');await expect(multi).toBeFocused();await page.getByRole('button',{name:'Remove Team',exact:true}).click();await expect(multi).toHaveText('Select…');
 const strict=page.getByRole('combobox',{name:'Strict',exact:true});await strict.click();await page.getByRole('checkbox',{name:'Team',exact:true}).click();await expect(page.getByRole('checkbox',{name:'Alice',exact:true})).not.toBeChecked();await page.keyboard.press('Escape');
 await expect(page.getByRole('combobox',{name:'Disabled',exact:true})).toBeDisabled();
 await multi.click();await page.getByRole('searchbox').fill('missing');await expect(page.getByRole('status')).toHaveText('No matching nodes');await page.getByRole('button',{name:'After',exact:true}).click();await expect(multi).toHaveAttribute('aria-expanded','false');
 await page.setViewportSize({width:360,height:740});await single.click();const box=await page.getByRole('dialog').boundingBox();if(box.x<0||box.x+box.width>361)throw new Error('Popup exceeds viewport');
 await page.screenshot({path:`artifacts/tree-select-browser/${name}.png`});if(errors.length)throw new Error(errors.join('\n'));console.log(name,'TreeSelect keyboard, selection, search, focus, disabled and responsive checks passed');
 }finally{await browser.close();}
}}finally{await server.close();}
