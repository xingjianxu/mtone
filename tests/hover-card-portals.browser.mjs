import {createServer} from 'vite';
import {chromium,firefox,webkit,expect} from '@playwright/test';
const server=await createServer({root:process.cwd(),server:{host:'127.0.0.1',port:5206,strictPort:true},logLevel:'error'});
await server.listen();
try { for(const [name,engine] of [['chromium',chromium],['firefox',firefox],['webkit',webkit]]) {
 const browser=await engine.launch({headless:true});
 try {
  const page=await browser.newPage();
  await page.goto('http://127.0.0.1:5206/tests/fixtures/hover-card-portals.html');
  const trigger=page.getByRole('button',{name:'Nested preview',exact:true});
  const nested=page.getByRole('button',{name:'Nested portal action'});
  await expect(nested).toBeVisible();
  // Reproduce a delayed trigger blur checking a descendant portal's active element.
  await page.evaluate(() => {
   const buttons=[...document.querySelectorAll('button')];
   buttons.find(button=>button.textContent==='Nested preview').focus();
   buttons.find(button=>button.textContent==='Nested portal action').focus();
  });
  await expect(nested).toBeFocused();
  await expect(page.getByText('Parent preview content')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(nested).toHaveCount(0);
  await expect(page.getByText('Parent preview content')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText('Parent preview content')).toHaveCount(0);
  await trigger.focus();
  await expect(page.getByText('Parent preview content')).toBeVisible();
  await expect(nested).toBeVisible();
  await nested.focus();
  await page.getByRole('button',{name:'Outside nested preview'}).focus();
  await expect(page.getByText('Parent preview content')).toHaveCount(0);
  console.log(`HoverCard nested portals ${name} passed`);
 } finally {await browser.close();}
}} finally {await server.close();}
