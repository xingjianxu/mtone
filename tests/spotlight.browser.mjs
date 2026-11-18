import { createServer } from "vite";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const server = await createServer({ root: process.cwd(), server: { host: "127.0.0.1", port: 5191, strictPort: true }, logLevel: "error" });
await server.listen();
let browser;
try {
 browser = await chromium.launch({headless:true});
 const page = await browser.newPage();
 for (const width of [1000, 360]) {
  await page.setViewportSize({width,height:740});
  await page.goto("http://127.0.0.1:5191/tests/fixtures/spotlight.html");
  await page.getByRole("button", {name:"Open spotlight"}).click();
  const search = page.getByRole("combobox");
  await search.waitFor();
  await page.waitForFunction(() => document.activeElement?.getAttribute("role") === "combobox");
  assert.equal(await page.locator(".mt-spotlight-search .mt-search").count(), 1);
  assert.equal(await page.locator(".mt-spotlight-search svg").count(), 1);
  const inputBox = await page.locator(".mt-spotlight-search .mt-search").boundingBox();
  const wrapperBox = await page.locator(".mt-spotlight-search").boundingBox();
  assert.equal(inputBox.height, 28);
  assert(Math.abs(inputBox.width - wrapperBox.width) < 1);
  const geometry = await page.getByRole("dialog").evaluate(el => {
   const r=el.getBoundingClientRect();
   const list=el.querySelector('[role="listbox"]');
   return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,scroll:list.scrollHeight>list.clientHeight};
  });
  assert(geometry.left>=0 && geometry.right<=width && geometry.top>=0 && geometry.bottom<=740 && geometry.scroll);
  await search.press("ArrowDown");
  assert.equal(await page.getByRole("option",{name:"Document 2 Useful document description 2",exact:true}).getAttribute("aria-selected"),"true");
  await search.press("End");
  await search.press("Enter");
  await page.getByRole("dialog").waitFor({state:"detached"});
  assert.equal(await page.locator("output").textContent(),"29");
  await page.getByRole("button", {name:"Open spotlight"}).click();
  await search.fill("keyword3");
  assert.equal(await page.getByRole("option").count(),1);
  await search.fill("notfound");
  assert.equal(await page.getByRole("status").textContent(),"No actions found");
  await search.press("Escape");
  await page.getByRole("dialog").waitFor({state:"detached"});
  assert(await page.getByRole("button",{name:"Open spotlight"}).evaluate(el=>el===document.activeElement));
  await page.keyboard.press("Control+k");
  await search.waitFor();
  assert.equal(await search.inputValue(),"");
  await search.press("Control+k");
  await page.getByRole("dialog").waitFor({state:"detached"});
  await page.keyboard.press("Control+k");
  await search.waitFor();
  for(let i=0;i<5;i++) {
   await page.keyboard.press("Tab");
   await page.waitForFunction(()=>document.querySelector('[role="dialog"]')?.contains(document.activeElement));
  }
  await page.mouse.click(2,2);
  await page.getByRole("dialog").waitFor({state:"detached"});
  await page.getByLabel("Outside editor").focus();
  await page.keyboard.press("Control+k");
  assert.equal(await page.getByRole("dialog").count(),0);
  await page.getByRole("button",{name:"Open spotlight"}).click();
  await search.waitFor();
  const png=await page.getByRole("dialog").screenshot();
  console.log(`SPOTLIGHT_SNAPSHOT_${width}=${png.toString("base64")}`);
 }
 console.log("Spotlight desktop/mobile geometry, filtering, keyboard, focus, dismissal and shortcut checks passed");
} finally { await browser?.close(); await server.close(); }
