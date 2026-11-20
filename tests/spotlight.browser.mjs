import { createServer } from "vite";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const server = await createServer({ root: process.cwd(), server: { host: "127.0.0.1", port: 5191, strictPort: true }, logLevel: "error" });
await server.listen();
let browser;
try {
 browser = await chromium.launch({headless:true});
 const page = await browser.newPage();
 for (const {width,height} of [{width:1000,height:740}, {width:360,height:420}]) {
  await page.setViewportSize({width,height});
  await page.goto("http://127.0.0.1:5191/tests/fixtures/spotlight.html");
  await page.getByRole("button", {name:"Open spotlight"}).click();
  const search = page.getByRole("combobox");
  await search.waitFor();
  await page.waitForFunction(() => document.activeElement?.getAttribute("role") === "combobox");
  assert.equal(await page.locator(".mt-spotlight-search .mt-search").count(), 1);
  assert.equal(await page.locator(".mt-spotlight-search svg").count(), 1);
  const inputBox = await page.locator(".mt-spotlight-search .mt-search").boundingBox();
  const wrapperBox = await page.locator(".mt-spotlight-search").boundingBox();
  assert.equal(inputBox.height, 34);
  assert(Math.abs(inputBox.width - wrapperBox.width) < 1);
  const measure = () => page.getByRole("dialog").evaluate(el => {
   const r=el.getBoundingClientRect();
   const list=el.querySelector('[role="listbox"]');
   return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,scroll:list.scrollHeight>list.clientHeight};
  });
  const geometry = await measure();
  assert(geometry.left>=0 && geometry.right<=width && geometry.bottom<=height && geometry.scroll);
  await search.fill("keyword3");
  assert.equal(await page.getByRole("option").count(),1);
  const few = await measure();
  await search.fill("notfound");
  const empty = await measure();
  assert(Math.abs(geometry.top - few.top) < 1 && Math.abs(few.top - empty.top) < 1,
    `Spotlight top shifted with results: ${geometry.top}, ${few.top}, ${empty.top}`);
  assert(geometry.top >= height * 0.1 && geometry.top <= height * 0.25);
  assert(few.bottom - few.top < geometry.bottom - geometry.top);
  await search.fill("");
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
