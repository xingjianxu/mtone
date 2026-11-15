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
