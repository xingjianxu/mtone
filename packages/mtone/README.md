# mtone

Compact, ready-styled React components for knowledge and content applications. Base UI supplies interaction primitives; mtone supplies a cohesive warm-neutral visual system and high-level APIs. Tailwind builds the distributed CSS. Lucide supplies icons.

## Install @bixlab/mtone

```bash
npm install ./bixlab-mtone-0.1.0.tgz
```

```tsx
import { MtoneProvider, Button, Select } from '@bixlab/mtone';
import '@bixlab/mtone/styles.css';

export function App() {
  return <MtoneProvider locale="zh" density="compact">
    <Button variant="solid">新建</Button>
    <Select label="知识库" options={[{value:'notes',label:'研究笔记'}]} />
  </MtoneProvider>;
}
```

One package, no component-copy CLI, no Tailwind setup in the consuming application. React/ReactDOM are peer dependencies. ESM only. The npm package name is `@bixlab/mtone`. Initial npm publication is pending owner setup and license selection; use the local tarball until the first release is available. After publication: `npm install @bixlab/mtone`.

## Develop

```bash
npm ci
npm run build
npm run dev
npm test
npm run typecheck
```

Node 24 recommended. The documentation app lives in `apps/docs`; its static build is `dist/docs`. It consumes the precompiled library stylesheet, so run build after editing library CSS. Components are in `packages/mtone/src`.

## Scope

Buttons, forms, selection controls, navigation, directory tree, tabs, menus, lists, table, status and property displays, dialogs/drawers, feedback and upload. No block editor or backend. See [API](https://github.com/xingjianxu/mtone/blob/master/docs/API.md), [coverage](https://github.com/xingjianxu/mtone/blob/master/docs/COVERAGE.md) and [verification](https://github.com/xingjianxu/mtone/blob/master/docs/VERIFICATION.md).

Default style: text #37352F, muted #787774, border #E9E9E7, subtle surface #F7F7F5, white canvas, 14px text, 28px controls, 4px radius. CSS is precompiled, prefixed and contains no Tailwind Preflight. Dark theme is not included.
