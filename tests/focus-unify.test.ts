import { readFileSync, readdirSync } from 'node:fs';
import { expect, it } from 'vitest';

it('uses the Input light-blue token and a single-pixel edge for every focus outline', () => {
  const roots = ['packages/mtone/src', 'apps/docs'];
  let count = 0;
  for (const root of roots) for (const file of readdirSync(root).filter(name => name.endsWith('.css'))) {
    const css = readFileSync(`${root}/${file}`, 'utf8');
    for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!selector.includes(':focus') || !/outline:\s*\d/.test(body)) continue;
      if (!body.includes('solid')) continue;
      count++;
      expect(body, `${file}: ${selector}`).toMatch(/outline: 1px solid (?:var\(--mt-focus, #93b4dc\)|Highlight)/);
    }
  }
  expect(count).toBeGreaterThan(20);
  expect(readFileSync('packages/mtone/src/styles.css', 'utf8')).toContain('--mt-focus: #93b4dc');
});
