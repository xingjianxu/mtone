import { createServer } from "vite";
import { chromium, firefox, webkit } from "@playwright/test";
import assert from "node:assert/strict";
const server = await createServer({ root: process.cwd(), server: { host: "127.0.0.1", port: 5199, strictPort: true }, logLevel: "error" });
await server.listen();
try {
  for (const [name, engine] of Object.entries({chromium, firefox, webkit})) {
    const browser = await engine.launch();
    try {
      const page = await browser.newPage({viewport:{width:375,height:600}});
      await page.goto("http://127.0.0.1:5199/tests/fixtures/breadcrumb.html");
      const link = page.getByRole("link",{name:"Home",exact:true});
      await link.hover();
      const style = await link.evaluate(el => { const s=getComputedStyle(el); return {color:s.color, background:s.backgroundColor, decoration:s.textDecorationLine}; });
      assert.deepEqual(style,{color:"rgb(55, 53, 47)",background:"rgb(241, 241, 239)",decoration:"none"});
      await page.mouse.move(374,599);
      await page.keyboard.press("Tab");
      await link.waitFor();
      assert(await link.evaluate(el=>el===document.activeElement));
      assert.equal(await link.evaluate(el=>getComputedStyle(el).outlineStyle),"solid");
      assert.equal(await page.getByText("Current",{exact:true}).getAttribute("aria-current"),"page");
      console.log(name + " breadcrumb hover/focus passed");
    } finally { await browser.close(); }
  }
} finally { await server.close(); }
