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

it('keeps shared focus tokens and allows the Input forced-colors fallback', () => {
  const files = ['styles.css', 'interactive.css', 'data.css'];
  for (const file of files) {
    const css = readFileSync(`packages/mtone/src/${file}`, 'utf8');
    for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (rule[1].includes(':focus') && /outline:.*solid/.test(rule[2])) {
        if (rule[2].includes('Highlight')) {
          expect(rule[2]).toContain('outline: 1px solid Highlight');
        } else {
          expect(rule[2]).toContain('var(--mt-focus, #5378aa)');
        }
        expect(rule[2]).not.toContain('--mt-primary');
      }
    }
  }
  const css = readFileSync('packages/mtone/src/styles.css', 'utf8');
  expect(css).toContain('.mt-chip,');
  expect(css).toContain(':is(.mt-number-group, .mt-multiselect):not(:has(input:disabled)):focus-within');
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
it('keeps the topbar at 48px and both layout footers at 42px',()=>{
 const css=readFileSync('packages/mtone/src/layout.css','utf8');
 expect(css).toContain('var(--mt-layout-header-height, 48px)');
 expect(css).not.toContain('var(--mt-layout-header-height, 64px)');
 expect(css).toContain('height: var(--mt-layout-footer-height, 42px)');
 const sider=css.slice(css.indexOf('.mt-layout-sider .mt-sidebar-footer {')).split('}')[0];
 expect(sider).toContain('height: var(--mt-layout-footer-height, 42px)');
 expect(sider).toContain('padding: 6px 12px');
});

it('uses border color only for all bordered input focus surfaces', () => {
  const css = readFileSync('packages/mtone/src/styles.css', 'utf8');
  const rules = css.slice(css.indexOf('/* Bordered input surfaces:'));
  expect(rules).toContain('border-color: #93b4dc');
  expect(rules).toContain('outline: none');
  expect(rules).not.toMatch(/border-width|padding|height|box-shadow/);
  expect(rules).toContain(':not([aria-invalid="true"])');
});

it('uses border-box 28px single-line surfaces without fixing multiline chips', () => {
 const css=readFileSync('packages/mtone/src/interactive.css','utf8');
 const select=css.slice(css.indexOf('.mt-select {')).split('}')[0];
 expect(select).toContain('height: 28px');
 const group=css.slice(css.indexOf('.mt-number-group {')).split('}')[0];
 expect(group).toContain('height: 28px');
 const step=css.slice(css.indexOf('.mt-number-step {')).split('}')[0];
 expect(step).toContain('height: 26px');
 const multi=css.slice(css.indexOf('.mt-multiselect {')).split('}')[0];
 expect(multi).toContain('flex-wrap: wrap');expect(multi).not.toContain('height:');
 const base=readFileSync('packages/mtone/src/styles.css','utf8');
 const filter=base.slice(base.indexOf('.mt-filter-chip {')).split('}')[0];
 expect(filter).toContain('height: 28px');expect(filter).toContain('box-sizing: border-box');
});

it('reserves menu icon columns only for direct rows of a panel with rendered icons',()=>{
 const css=readFileSync('packages/mtone/src/interactive.css','utf8');
 expect(css).toContain('.mt-popup:has(> .mt-menu-item > .mt-menu-label > .mt-menu-icon:not(:empty)) > .mt-menu-item');
 const icon=css.slice(css.indexOf('.mt-menu-icon {')).split('}')[0];expect(icon).toContain('display: none');expect(icon).toContain('flex: 0 0 16px');
});

it('keeps Select and MultiSelect highlights background-only, including forced colors', () => {
  const css = readFileSync('packages/mtone/src/styles.css', 'utf8');
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const optionRules = rules.filter((rule) => rule[1].includes('.mt-option[data-highlighted]'));
  expect(optionRules).toHaveLength(1);
  expect(optionRules[0][2]).not.toMatch(/outline|border|box-shadow/);
  expect(optionRules[0][2]).toContain('background: Highlight');
  expect(optionRules[0][2]).toContain('color: HighlightText');
  const interactive = readFileSync('packages/mtone/src/interactive.css', 'utf8');
  expect(interactive).toContain('background: var(--mt-hover, #f1f1ef)');
});

it('keeps Splitter forced-color rules inside a valid top-level media query', () => {
  const css = readFileSync('packages/mtone/src/splitter.css', 'utf8');
  expect(css).not.toMatch(/>\s*@media/);
  expect(css).toMatch(/@media \(forced-colors: active\)\s*\{\s*\.mt-splitter\s*>\s*\.mt-splitter-separator\s*\{\s*border: 1px solid ButtonText;/);
  expect(css).toMatch(/\.mt-splitter\s*>\s*\.mt-splitter-separator\s*>\s*\.mt-splitter-grip\s*\{\s*background: ButtonText;/);
});
