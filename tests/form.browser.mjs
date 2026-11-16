import { createServer, preview } from "vite";
import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const server=await createServer({root:process.cwd(),server:{host:"127.0.0.1",port:5193,strictPort:true},logLevel:"error"});await server.listen();
let docs; let browser;
try {browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:390,height:850}});
page.on("pageerror", error => console.error("BROWSER_ERROR", error.message));
await page.goto("http://127.0.0.1:5193/tests/fixtures/form.html");
await page.getByRole("button",{name:"Save",exact:true}).click();
await page.waitForFunction(()=>document.querySelector("output")?.textContent==="Invalid");
for(const [role,name] of [["textbox","Email"],["combobox","Team"],["combobox","Roles"]]) {
 const field=page.getByRole(role,{name,exact:true});assert.equal(await field.getAttribute("aria-invalid"),"true");
 assert(await field.evaluate(el=>document.getElementById(el.getAttribute("aria-describedby"))?.textContent.includes("required")));
}
console.log("FORM_ERROR_SNAPSHOT="+(await page.locator("#root").screenshot()).toString("base64"));
await page.getByRole("textbox",{name:"Email",exact:true}).fill("person@example.com");
await page.getByRole("combobox",{name:"Team",exact:true}).click();await page.getByRole("option",{name:"Design",exact:true}).click();
await page.getByRole("combobox",{name:"Roles",exact:true}).fill("Read");await page.getByRole("option",{name:"Read",exact:true}).click();
await page.getByRole("button",{name:"Save",exact:true}).click();await page.waitForFunction(()=>document.querySelector("output")?.textContent==="Saved");
await page.getByRole("button",{name:"Reset",exact:true}).click();assert.equal(await page.getByRole("textbox",{name:"Email",exact:true}).inputValue(),"");
assert.equal(await page.getByRole("combobox",{name:"Roles",exact:true}).getAttribute("aria-invalid"),"false");
await page.getByRole("button",{name:"Validate",exact:true}).click();await page.waitForFunction(()=>document.querySelector("output")?.textContent==="Invalid");
await server.close();
docs=await preview({root:process.cwd()+"/apps/docs",base:"/mtone/",build:{outDir:"../../dist/docs"},preview:{host:"127.0.0.1",port:5194,strictPort:true},logLevel:"error"});
await page.goto("http://127.0.0.1:5194/mtone/#/components/Form");
await page.getByRole("textbox",{name:"用户名",exact:true}).fill("admin");
await page.getByRole("textbox",{name:"邮箱",exact:true}).click();
await page.getByText("此用户名已被占用，请换一个",{exact:true}).waitFor();
await page.getByRole("textbox",{name:"用户名",exact:true}).fill("xiaoming");
await page.getByRole("textbox",{name:"邮箱",exact:true}).fill("person@example.com");
await page.getByRole("combobox",{name:"角色",exact:true}).click();await page.getByRole("option",{name:"编辑者",exact:true}).click();
await page.getByRole("combobox",{name:"关注主题",exact:true}).fill("设计");await page.getByRole("option",{name:"设计",exact:true}).click();
await page.getByRole("button",{name:"提交示例表单",exact:true}).click();await page.getByRole("status").filter({hasText:"本地提交成功："}).waitFor();
await page.getByRole("button",{name:"重置示例表单",exact:true}).click();assert.equal(await page.getByRole("textbox",{name:"用户名",exact:true}).inputValue(),"");
console.log("Form native/compound binding, accessible errors, submit, reset and manual validate passed");
}finally{await browser?.close();await server.close();if(docs) await new Promise(resolve=>docs.httpServer.close(resolve));}
