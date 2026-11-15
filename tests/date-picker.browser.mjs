import assert from "node:assert/strict";
import { createServer } from "vite";
import { chromium, firefox, webkit } from "@playwright/test";
const server = await createServer({root:process.cwd(),server:{host:"127.0.0.1",port:5190,strictPort:true},logLevel:"error"});
await server.listen();
try {
  for (const [name, engine, mobile] of [["chromium",chromium,false],["firefox",firefox,false],["webkit",webkit,false],["chromium-mobile",chromium,true],["webkit-mobile",webkit,true]]) {
    const browser = await engine.launch({headless:true});
    try {
      const page = await browser.newPage({viewport:{width:mobile?390:900,height:800},deviceScaleFactor:2,...(mobile?{isMobile:true,hasTouch:true}:{})});
      await page.goto("http://127.0.0.1:5190/tests/fixtures/date-visual.html");
      const input=page.getByLabel("Native date",{exact:true});
      await input.waitFor();
      await input.focus();
      console.log("DATE_ENGINE",name,await input.evaluate(el=>({supports:CSS.supports("selector(input::-webkit-calendar-picker-indicator)"),type:el.type,customIcons:document.querySelectorAll(".mt-date-icon").length,appearance:getComputedStyle(el).appearance})));
      assert.equal(await page.locator(".mt-date-icon, .mt-date-field svg").count(), 0);
      assert.equal(await input.getAttribute("type"), "date");
      await input.fill("2026-07-01");
      assert.equal(await input.inputValue(), "2026-07-01");
      await input.fill("");
      assert.equal(await input.inputValue(), "");
      await input.fill("2026-02-01");
      await input.focus();
      const png=await page.locator("#capture").screenshot();
      console.log(`DATE_SNAPSHOT_${name}=${png.toString("base64")}`);
    } finally { await browser.close(); }
  }
} finally { await server.close(); }
