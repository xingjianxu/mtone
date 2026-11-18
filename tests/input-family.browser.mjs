import {createServer} from 'vite';
import {chromium,firefox,webkit,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const server=await createServer({root:process.cwd(),server:{host:'127.0.0.1',port:5245,strictPort:true},logLevel:'error'});await server.listen();
try{for(const[name,engine]of Object.entries({chromium,firefox,webkit})){
 if(process.env.INPUT_BROWSERS && !process.env.INPUT_BROWSERS.split(",").includes(name)) continue;
 const browser=await engine.launch({headless:true,...(name === "chromium" && process.env.CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}: {})});try{const page=await browser.newPage();await page.goto('http://127.0.0.1:5245/tests/fixtures/input-family.html');
 const basic=page.getByRole('textbox',{name:'Basic',exact:true});await basic.focus();await expect(basic).toHaveCSS('height','28px');await expect(basic).toHaveCSS('border-top-color','rgb(147, 180, 220)');
 const decorated=page.getByRole('textbox',{name:'Decorated'});const shell=page.locator('.mt-input-wrap').filter({has:decorated});const before=await shell.boundingBox();await decorated.focus();await expect(shell).toHaveCSS('border-top-width','1px');await expect(shell).toHaveCSS('border-top-color','rgb(147, 180, 220)');assert.equal(before.height,28);assert.deepEqual(await shell.boundingBox(),before);
 await page.getByRole('button',{name:'清除内容'}).click();await expect(decorated).toHaveValue('');await expect(decorated).toBeFocused();
 const search=page.getByRole('textbox',{name:'Search',exact:true});await search.fill('notes');await search.press('Enter');await expect(page.getByLabel('Result')).toHaveText('notes');
 await search.fill('next');await page.getByRole('button',{name:'Find',exact:true}).click();await expect(page.getByLabel('Result')).toHaveText('next');
 const password=page.getByLabel('Password',{exact:true});await page.getByRole('button',{name:'显示密码'}).click();await expect(password).toHaveAttribute('type','text');await expect(password).toBeFocused();
 const notes=page.getByRole('textbox',{name:'Notes'});const initial=(await notes.boundingBox()).height;await notes.fill('one\ntwo\nthree\nfour\nfive\nsix');const tall=(await notes.boundingBox()).height;assert(tall>initial);await expect(notes).toHaveCSS('overflow-y','auto');await notes.fill('one');assert((await notes.boundingBox()).height<tall);
 const cells=page.getByRole('group',{name:'Code',exact:true}).getByRole('textbox');await cells.first().fill('1234');await expect(cells.nth(3)).toHaveValue('4');await cells.nth(3).press('Backspace');await expect(cells.nth(3)).toHaveValue('');await expect(cells.nth(2)).toBeFocused();
 await expect(page.getByRole('textbox',{name:'Disabled search'})).toBeDisabled();await expect(page.getByRole('button',{name:'Disabled find'})).toBeDisabled();
 for(const[label,color]of[['Warning','rgb(182, 139, 70)'],['Error','rgb(198, 102, 96)']]){const control=page.getByRole('textbox',{name:label,exact:true});await control.focus();await expect(page.locator('.mt-input-wrap').filter({has:control})).toHaveCSS('border-top-color',color);}
 const underlined=page.getByRole('textbox',{name:'Underlined'});await underlined.focus();await expect(underlined).toHaveCSS('border-top-color','rgba(0, 0, 0, 0)');await expect(underlined).toHaveCSS('border-bottom-color','rgb(147, 180, 220)');
 const borderless=page.getByRole('textbox',{name:'Borderless'});await borderless.focus();await expect(borderless).toHaveCSS('border-top-color','rgba(0, 0, 0, 0)');
 const warning=page.getByRole('textbox',{name:'Plain warning'});await warning.focus();await expect(warning).toHaveCSS('border-top-color','rgb(182, 139, 70)');
 await page.emulateMedia({forcedColors:'active'});await decorated.focus();await expect(shell).toHaveCSS('outline-style','solid');
 console.log(name+' Input family geometry, focus, clear, search, password, autosize, OTP and disabled passed');
 }finally{await browser.close();}
}}finally{await server.close();}
