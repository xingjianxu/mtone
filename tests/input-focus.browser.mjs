import { createServer } from "vite";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const server=await createServer({root:process.cwd(),server:{host:"127.0.0.1",port:5192,strictPort:true},logLevel:"error"});
await server.listen();
let browser;
try {
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:700,height:700}});
 await page.goto("http://127.0.0.1:5192/tests/fixtures/input-focus.html");
 const input=page.getByRole("textbox",{name:"Input",exact:true});
 const measure=()=>input.evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {box:[r.x,r.y,r.width,r.height],border:s.borderTopWidth,color:s.borderTopColor,outline:s.outlineStyle,shadow:s.boxShadow};});
 const normal=await measure();
 assert.equal(normal.border,"1px");
 await input.click();
 const mouse=await measure();
 assert.deepEqual(mouse.box,normal.box);assert.equal(mouse.border,"1px");assert.equal(mouse.color,"rgb(147, 180, 220)");assert.equal(mouse.outline,"none");assert.equal(mouse.shadow,normal.shadow);
 await page.getByRole("button",{name:"Start"}).focus();await page.keyboard.press("Tab");
 assert(await input.evaluate(el=>el===document.activeElement));
 assert.deepEqual(await measure(),mouse);
 console.log("INPUT_FOCUS_SNAPSHOT="+(await page.locator("#root").screenshot()).toString("base64"));
 await page.getByLabel("Invalid",{exact:true}).focus();
 assert.equal(await page.getByLabel("Invalid",{exact:true}).evaluate(el=>getComputedStyle(el).borderTopColor),"rgb(198, 102, 96)");
 for(const name of ["Search","Textarea","Date"]) {
  const el=page.getByLabel(name,{exact:true});await el.focus();
  assert.equal(await el.evaluate(el=>getComputedStyle(el).outlineStyle),"none");
  assert.equal(await el.evaluate(el=>getComputedStyle(el).borderTopColor),"rgb(147, 180, 220)");
 }
 await page.getByLabel("Disabled",{exact:true}).focus();
 assert(!(await page.getByLabel("Disabled",{exact:true}).evaluate(el=>el===document.activeElement)));
 await page.emulateMedia({forcedColors:"active"});await input.focus();
 assert.equal((await measure()).outline,"solid");assert.deepEqual((await measure()).box,normal.box);
 console.log("Input mouse/keyboard focus, unchanged geometry, errors, disabled, sibling isolation and forced-colors passed");
} finally {await browser?.close();await server.close();}
