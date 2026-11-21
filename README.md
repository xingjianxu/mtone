# mtone

Compact, ready-styled React components for knowledge and content applications. Base UI supplies interaction primitives; mtone supplies a cohesive warm-neutral visual system and high-level APIs. Tailwind builds the distributed CSS. Lucide supplies icons.

## Install @bixlab/mtone

```bash
npm install @bixlab/mtone
```

```tsx
import { MtoneProvider, Button, Select } from '@bixlab/mtone';
import '@bixlab/mtone/styles.css';

export function App() {
  return <MtoneProvider locale="zh">
    <Button variant="solid">新建</Button>
    <Select label="知识库" options={[{value:'notes',label:'研究笔记'}]} />
  </MtoneProvider>;
}
```

One package, no component-copy CLI, no Tailwind setup in the consuming application. React/ReactDOM ^19.2.0 are peer dependencies. ESM only. The install command above uses published npm releases. To try an unreleased checkout, build and pack it locally with `npm ci`, `npm run build -w @bixlab/mtone`, and `npm pack -w @bixlab/mtone`, then install the generated `.tgz` in your application.

## Explore

- [Component Gallery](https://xingjianxu.github.io/mtone/#/gallery): individual component previews and API documentation.
- [App Showcase](https://xingjianxu.github.io/mtone/showcase.html): a standalone interactive knowledge workspace built from mtone components. Search, filter, switch views, edit documents, favorite and delete items. Changes are held only in page memory and reset when leaving or refreshing; no backend or block editor is included.

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

Buttons, forms, plain-text mentions, selection controls, navigation, directory tree, tabs, menus, lists, table, status and property displays, dialogs/drawers, feedback and upload. No block editor or backend. See [API](docs/API.md), [coverage](docs/COVERAGE.md) and [verification](docs/VERIFICATION.md).

The current source removes the `density` prop from `MtoneProvider`; remove it when migrating. Controls share a 32px baseline, while independent size variants and token customization remain available. This source change is not a statement that a new npm version has been published.

Default style: text #37352F, muted #787774, border #E9E9E7, subtle surface #F7F7F5, white canvas, 14px text, 32px default controls, 4px radius. CSS is precompiled, prefixed and contains no Tailwind Preflight. Existing applications remain light by default. Since 0.7.0, set `theme="dark"` or `theme="system"` on `MtoneProvider`; system mode follows the operating system without reloading. `MtoneScope` can override the mode locally and mtone popups follow their trigger context. The library leaves preference storage to the application.

## Documentation website

The documentation includes a searchable component gallery and individual pages for all documented components/providers (aliases share a page). Each page contains a real preview, copyable code, API summary and implementation boundaries.

```bash
npm run build:docs
```

Production assets use the GitHub Pages `/mtone/` base. Component URLs use hash routes, e.g. `#/components/Button`, so refreshing a deep link does not require a server rewrite. See [deployment instructions](docs/DEPLOYMENT.md) for initial Pages setup and [the documentation workflow](.github/workflows/docs.yml). The ChatGPT Site is no longer updated.

The source checkout also includes `Mentions` (`Mention` alias) for plain-text @ / # completion. Available starting in 0.4.0; see the [API guide](docs/API.md#mentions) for current scope and version guidance.

`Calendar` is also available in the source checkout, with month/year panels, custom date content, range restrictions and keyboard navigation. It uses ISO date strings and mtone styling; see [Calendar API](docs/API.md#calendar). Available starting in 0.4.0.

## npm releases

GitHub Actions uses trusted publishing (OIDC), without a stored npm token. See [release setup and workflow](docs/RELEASING.md). Manual workflow runs validate only; stable GitHub Releases publish after checks and the configured environment approval.

## License

MIT © 2026 Xingjian Xu. See [LICENSE](LICENSE).
