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
  return <MtoneProvider locale="zh" density="compact">
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

Default style: text #37352F, muted #787774, border #E9E9E7, subtle surface #F7F7F5, white canvas, 14px text, 28px controls, 4px radius. CSS is precompiled, prefixed and contains no Tailwind Preflight. Dark theme is not included.

## Documentation website

The documentation includes a searchable component gallery and individual pages for all documented components/providers (aliases share a page). Each page contains a real preview, copyable code, API summary and implementation boundaries.

```bash
npm run build:docs
```

Production assets use the GitHub Pages `/mtone/` base. Component URLs use hash routes, e.g. `#/components/Button`, so refreshing a deep link does not require a server rewrite. See [deployment instructions](docs/DEPLOYMENT.md) for initial Pages setup and [the documentation workflow](.github/workflows/docs.yml). The ChatGPT Site is no longer updated.

The source checkout also includes `Mentions` (`Mention` alias) for plain-text @ / # completion. This feature is not included in npm 0.3.0 yet; see the [API guide](docs/API.md#mentions-unreleased) for current scope and version guidance.

`Calendar` is also available in the source checkout, with month/year panels, custom date content, range restrictions and keyboard navigation. It uses ISO date strings and mtone styling; see [Calendar API](docs/API.md#calendar-unreleased). It is not included in npm 0.3.0 yet.

## npm releases

GitHub Actions uses trusted publishing (OIDC), without a stored npm token. See [release setup and workflow](docs/RELEASING.md). Manual workflow runs validate only; stable GitHub Releases publish after checks and the configured environment approval.

## License

MIT © 2026 Xingjian Xu. See [LICENSE](LICENSE).
