import {readFileSync} from 'node:fs';import {it,expect} from 'vitest';
it('does not ship preflight or unscoped host element rules',()=>{const css=readFileSync('packages/mtone/dist/styles.css','utf8');expect(css).not.toMatch(/(?:^|})\s*(?:body|h1|button|input|small)\s*[{,]/);expect(css).not.toContain('box-sizing:border-box;border:0 solid');expect(css).toContain('.mt-table');expect(css).toContain('.mt-modal');});

it('uses neutral gray sidebar states while preserving focus indicators', () => {
  const docs = readFileSync('apps/docs/site.css', 'utf8');
  const library = readFileSync('packages/mtone/src/styles.css', 'utf8');
  const libraryRule = library.slice(library.indexOf('.mt-nav-item.mt-active')).split('}')[0];
  expect(docs).not.toContain('.docs-sidebar nav a[aria-current="page"]');
  expect(library).toContain('.mt-nav-item.mt-active::before');
  expect(libraryRule).toContain('background: var(--mt-nav-selected, #e5e5e5)');
  expect(libraryRule).toContain('color: var(--mt-nav-current-text, #262626)');
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
          expect(rule[2]).toContain('var(--mt-focus, #93b4dc)');
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
  expect(docs).toContain('outline: 1px solid var(--mt-focus, #93b4dc)');
});
it('keeps semantic error borders separate from the blue focus ring', () => {
  const css = readFileSync('packages/mtone/src/styles.css', 'utf8');
  const errorRule = css.slice(css.indexOf('.mt-input[aria-invalid="true"]')).split('}')[0];
  expect(errorRule).toContain('border-color: var(--mt-input-error, #c66660)');
  expect(errorRule).not.toContain('--mt-focus');
  expect(css).toContain('--mt-focus: #93b4dc');
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
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([, selector]) =>
    selector.includes(':is(.mt-input, .mt-select)') &&
    selector.includes(':is(.mt-number-group, .mt-multiselect)') &&
    selector.includes(':focus-within')
  );
  const colorRule = rules.find(([, , declarations]) =>
    declarations.includes('border-color: var(--mt-focus, #93b4dc)')
  );
  expect(colorRule?.[1] ?? '').toContain(':not([aria-invalid="true"])');
  expect(rules.some(([, , declarations]) => declarations.includes('outline: none'))).toBe(true);
  for (const [, , declarations] of rules) {
    expect(declarations).not.toMatch(/border-width|padding|height|box-shadow/);
  }
});

it('uses border-box standard single-line surfaces without fixing multiline chips', () => {
 const css=readFileSync('packages/mtone/src/interactive.css','utf8');
 const select=css.slice(css.indexOf('.mt-select {')).split('}')[0];
 expect(select).toContain('height: var(--mt-height, 32px)');
 const group=css.slice(css.lastIndexOf('.mt-number-group {')).split('}')[0];
 expect(group).toContain('height: var(--mt-height, 32px)');
 expect(css.slice(css.indexOf('.mt-number-input {')).split('}')[0]).toContain('line-height: 20px');
 const step=css.slice(css.indexOf('.mt-number-step {')).split('}')[0];
 expect(step).toContain('height: calc(var(--mt-height, 32px) - 2px)');
 const multi=css.slice(css.indexOf('.mt-multiselect {')).split('}')[0];
 expect(multi).toContain('flex-wrap: wrap');
 expect(multi).toContain('min-height: var(--mt-height, 32px)');
 expect(multi).not.toMatch(/^\s*height:/m);
 const base=readFileSync('packages/mtone/src/styles.css','utf8');
 const filter=base.slice(base.indexOf('.mt-tag-filter {')).split('}')[0];
 expect(filter).toContain('height: var(--mt-height, 32px)');expect(filter).toContain('box-sizing: border-box');
});

it('reserves menu icon columns for all grouped rows of popup and inline menus with rendered icons', () => {
  const css = readFileSync('packages/mtone/src/interactive.css', 'utf8');
  const icon = css.slice(css.indexOf('.mt-menu-icon {')).split('}')[0];
  expect(icon).toContain('display: none');
  expect(icon).toContain('flex: 0 0 16px');
  const selector = ':is(.mt-menu-popup, .mt-inline-menu):has(.mt-menu-icon:not(:empty)) .mt-menu-icon';
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  expect(rules.find(([, rule]) => rule.trim().endsWith(selector))?.[2] ?? '').toContain('display: inline-flex');
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

it('keeps breadcrumb hover neutral and underline-free without removing keyboard focus', () => {
  const css = readFileSync('packages/mtone/src/styles.css', 'utf8');
  const rule = css.slice(css.indexOf('.mt-breadcrumb a:hover {')).split('}')[0];
  expect(rule).toContain('text-decoration: none');
  expect(rule).toContain('color: var(--mt-fg, #37352f)');
  expect(rule).toContain('background: var(--mt-hover, #f1f1ef)');
  expect(css).toContain('.mt-breadcrumb a:focus-visible');
});

it('spaces consecutive NavGroup items like sidebar menus without widening group boundaries', () => {
  const css = readFileSync('packages/mtone/src/styles.css', 'utf8');
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const spacing = rules.find((rule) => rule[1].includes('.mt-nav-item-row') &&
    rule[1].includes('.mt-nav-group') && rule[2].trim() === 'margin-top: 3px;');
  expect(spacing).toBeDefined();
  const nav = document.createElement('div');
  nav.innerHTML = ['mt-nav-group', 'mt-sidebar-content'].map((parent) =>
    `<div class="${parent}"><button class="mt-nav-item">First</button><button class="mt-nav-item">Plain sibling</button><div class="mt-nav-item-row">Action row</div><div class="mt-nav-submenu">Submenu</div></div>`
  ).join('');
  expect([...nav.querySelectorAll(spacing![1].trim())].map((row) => row.textContent)).toEqual([
    'Plain sibling', 'Action row', 'Submenu', 'Plain sibling', 'Action row', 'Submenu',
  ]);
  const showcase = readFileSync('apps/docs/app-showcase.css', 'utf8');
  const item = showcase.slice(showcase.indexOf('.showcase .showcase-sidebar .mt-nav-item {')).split('}')[0];
  expect(item).not.toContain('margin-bottom');
  expect(showcase).toMatch(/\.showcase \.showcase-sidebar \.mt-nav-item \+ \.mt-nav-item\s*\{\s*margin-top: 3px;\s*\}/);
});

it("paints a single themed adjacent NavGroup divider without layout or pointer effects", () => {
  const css = readFileSync("packages/mtone/src/styles.css", "utf8");
  const boundary = ".mt-nav-group + .mt-nav-group:not([data-no-divider])::before";
  const rule = css.split(boundary + " {")[1]?.split("}")[0] ?? "";
  expect(rule).toContain("position: absolute");
  expect(rule).toContain("1px solid var(--mt-border, #e9e9e7)");
  expect(rule).toContain("pointer-events: none");
  expect(css).toContain("@media (forced-colors: active) {\n  " + boundary);
  const rail = css.split(".mt-nav-group-collapsed + .mt-nav-group-collapsed {")[1]?.split("}")[0];
  expect(rail).toContain("padding-top: 9px");
  expect(rail).not.toContain("border-top");
});

it.each([
  ['interactive.css', '.mt-option + .mt-option'],
  ['interactive.css', '.mt-menu-item + .mt-menu-item'],
  ['mentions.css', '.mt-mentions-option + .mt-mentions-option'],
  ['cascader.css', '.mt-cascader-option + .mt-cascader-option'],
  ['spotlight.css', '.mt-spotlight-option + .mt-spotlight-option'],
  ['table-of-contents.css', '.mt-toc-item + .mt-toc-item'],
])('separates adjacent rounded list rows without padding the first row: %s %s', (file, selector) => {
  const css = readFileSync(`packages/mtone/src/${file}`, 'utf8');
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const rule = rules.find((entry) => entry[1].trim().split(/,\s*/).includes(selector));
  expect(rule, selector).toBeDefined();
  expect(rule?.[2].trim()).toBe('margin-top: 3px;');
});
