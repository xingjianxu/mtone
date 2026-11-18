import {createServer} from 'vite';
import {chromium,firefox,webkit,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const server=await createServer({root:process.cwd(),server:{host:'127.0.0.1',port:5221,strictPort:true},logLevel:'error'});
await server.listen();
await mkdir('artifacts',{recursive:true});
try {
  for (const [name,engine] of Object.entries({chromium,firefox,webkit})) {
    const browser=await engine.launch({headless:true});
    try {
      const page=await browser.newPage();
      await page.goto('http://127.0.0.1:5221/tests/fixtures/fieldset.html');
      const toggle=page.getByRole('button',{name:'Toggle disabled'});
      const choice=page.getByRole('combobox',{name:'Choice'});
      await choice.click(); await expect(page.getByRole('option',{name:'Beta'})).toBeVisible();
      // Use the external control while the popup is open; disabling must close the portal.
      await toggle.evaluate(button => button.click());
      await expect(page.getByRole('option')).toHaveCount(0);
      await expect(choice).toBeDisabled();
      await expect(page.getByRole('textbox',{name:'Name'})).toBeDisabled();
      await expect(page.getByRole('button',{name:'Legend action'})).toBeEnabled();
      await expect(page.getByRole('button',{name:'Save'})).toBeDisabled();
      await expect(page.getByRole('slider',{name:'Rating'})).toHaveAttribute('tabindex','-1');
      await toggle.focus(); await page.keyboard.press('Tab');
      await expect(page.getByRole('button',{name:'Legend action'})).toBeFocused();
      await toggle.click(); await choice.click();
      await page.getByRole('option',{name:'Beta'}).click();
      await expect(choice).toContainText('Beta');
      await expect(page.getByRole('textbox',{name:'Name'})).toHaveValue('Ada');
      await page.screenshot({path:`artifacts/fieldset-${name}.png`,fullPage:true});
      console.log(`Fieldset ${name} passed`);
    } finally { await browser.close(); }
  }
} finally { await server.close(); }
