import {readFileSync} from 'node:fs';import {it,expect} from 'vitest';
it('does not ship preflight or unscoped host element rules',()=>{const css=readFileSync('packages/mtone/dist/styles.css','utf8');expect(css).not.toMatch(/(?:^|})\s*(?:body|h1|button|input|small)\s*[{,]/);expect(css).not.toContain('box-sizing:border-box;border:0 solid');expect(css).toContain('.mt-table');expect(css).toContain('.mt-modal');});

it('uses neutral gray sidebar states while preserving focus indicators', () => {
  const docs = readFileSync('apps/docs/site.css', 'utf8');
  const library = readFileSync('packages/mtone/src/styles.css', 'utf8');
  for (const [css, selector] of [[docs, '.docs-sidebar nav a[aria-current="page"]'], [library, '.mt-nav-item.mt-active']]) {
    const rule = css.slice(css.indexOf(selector)).split('}')[0];
    expect(rule).toContain('background: #e5e5e5');
    expect(rule).toContain('color: #262626');
  }
  expect(library).toContain('.mt-nav-item:focus-visible');
  expect(docs).toContain('a:focus-visible');
});

it('ships the requested blue button palette and transition', () => {
  const css = readFileSync('packages/mtone/src/styles.css', 'utf8');
  const rule = css.slice(css.indexOf('.mt-btn-blue {')).split('}')[0];
  expect(rule).toContain('background: #2783de');
  expect(rule).toContain('color: #f3f9fd');
  expect(rule).toContain('transition: background-color 100ms ease-in-out');
  expect(css).toContain('.mt-btn-blue:hover:not(:disabled)');
  expect(css).toContain('background: #2276c9');
  expect(css).toContain('.mt-btn:focus-visible');
});

it('uses the Input focus token for all focus indicators and compound fields', () => {
  const files = ['styles.css', 'interactive.css', 'data.css'];
  for (const file of files) {
    const css = readFileSync(`packages/mtone/src/${file}`, 'utf8');
    for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (rule[1].includes(':focus') && /outline:.*solid/.test(rule[2])) {
        expect(rule[2]).toContain('var(--mt-focus, #5378aa)');
        expect(rule[2]).not.toContain('--mt-primary');
      }
    }
  }
  const css = readFileSync('packages/mtone/src/styles.css', 'utf8');
  expect(css).toContain('.mt-chip,');
  expect(css).toContain('.mt-number-group:not(:has(input:disabled)):focus-within');
  expect(css).toContain('.mt-multiselect:not(:has(input:disabled)):focus-within');
  expect(css).toContain('.mt-number-group .mt-number-input:focus-visible');
  expect(css).toContain('.mt-multiselect .mt-combobox-input:focus-visible');
  const docs = readFileSync('apps/docs/site.css', 'utf8');
  expect(docs).not.toContain('outline: 2px solid #779482');
  expect(docs).toContain('outline: 2px solid var(--mt-focus, #5378aa)');
});
it('keeps semantic error borders separate from the blue focus ring', () => {
  const css = readFileSync('packages/mtone/src/styles.css', 'utf8');
  const errorRule = css.slice(css.indexOf('.mt-input[aria-invalid="true"]')).split('}')[0];
  expect(errorRule).toContain('border-color: #c66660');
  expect(css).toContain('--mt-focus: #5378aa');
});
it('keeps toast icons centered on the first text row with compact spacing', () => {
  const css = readFileSync('packages/mtone/src/toast.css', 'utf8');
  expect(css).toContain('grid-template-columns: 18px minmax(0, 1fr)');
  expect(css).toContain('align-self: center');
  expect(css).toContain('padding: 10px 36px 10px 12px');
  const title = css.slice(css.indexOf('.mt-toast-title {')).split('}')[0];
  expect(title).toContain('margin: 0');
  expect(title).toContain('font-size: inherit');
});
it('defaults layout topbar and optional main footer to 48px without changing sider footer',()=>{
 const css=readFileSync('packages/mtone/src/layout.css','utf8');
 expect(css).toContain('var(--mt-layout-header-height, 48px)');
 expect(css).not.toContain('var(--mt-layout-header-height, 64px)');
 expect(css).toContain('height: var(--mt-layout-footer-height, 48px)');
 const sider=css.slice(css.indexOf('.mt-layout-sider .mt-sidebar-footer {')).split('}')[0];
 expect(sider).toContain('min-height: 52px');
});
