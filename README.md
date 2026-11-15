# mtone

Compact, ready-styled React components for knowledge and content applications. Base UI supplies interaction primitives; mtone supplies a cohesive warm-neutral visual system and high-level APIs. Tailwind builds the distributed CSS. Lucide supplies icons.

## Install the delivered package

```bash
npm install ./mtone-0.1.0.tgz
```

```tsx
import { MtoneProvider, Button, Select } from 'mtone';
import 'mtone/styles.css';

export function App() {
  return <MtoneProvider locale="zh" density="compact">
    <Button variant="solid">新建</Button>
    <Select label="知识库" options={[{value:'notes',label:'研究笔记'}]} />
  </MtoneProvider>;
}
```

One package, no component-copy CLI, no Tailwind setup in the consuming application. React/ReactDOM are peer dependencies. ESM only. Public npm publication is not included; the name's registry availability has not been verified.

## Develop

```bash
npm ci
npm run build
npm run dev
npm test
npm run typecheck
```

Node 20.19+ recommended. The documentation app lives in `apps/docs`; its static build is `dist/docs`. It consumes the precompiled library stylesheet, so run build after editing library CSS. Components are in `packages/mtone/src`.

## Scope

Buttons, forms, selection controls, navigation, directory tree, tabs, menus, lists, table, status and property displays, dialogs/drawers, feedback and upload. No block editor or backend. See [API](docs/API.md), [coverage](docs/COVERAGE.md) and [verification](docs/VERIFICATION.md).

Default style: text #37352F, muted #787774, border #E9E9E7, subtle surface #F7F7F5, white canvas, 14px text, 28px controls, 4px radius. CSS is precompiled, prefixed and contains no Tailwind Preflight. Dark theme is not included.

## Documentation website

The documentation includes a searchable component gallery and individual pages for all 59 component/provider exports (including aliases). Each page contains a real preview, copyable code, API summary and implementation boundaries.

```bash
npm run build:docs
```

Production assets use the GitHub Pages `/mtone/` base. Component URLs use hash routes, e.g. `#/components/Button`, so refreshing a deep link does not require a server rewrite. See [deployment instructions](docs/DEPLOYMENT.md) for initial Pages setup and [the documentation workflow](.github/workflows/docs.yml). The ChatGPT Site is no longer updated.
