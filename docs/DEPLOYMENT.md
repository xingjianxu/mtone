# GitHub Pages deployment

The documentation lives in `apps/docs`, importing real mtone components. It uses hash routes (`#/components/Button`) so direct links and refresh work on GitHub Pages without server rewrites.

## Local preview

```sh
npm ci
npm run build -w @bixlab/mtone
npm run dev
```

## Production

```sh
npm run typecheck
npm test
npm run build:docs
npx vite preview apps/docs --outDir ../../dist/docs --base=/mtone/ --host 127.0.0.1
```

The `/mtone/` base is specific to the repository's Pages project site. The build output is `dist/docs`. For another repository, change this base accordingly.

## First deployment

In the repository's **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source. The Documentation workflow runs targeted validation on `release-candidate/**`. A push to `master` checks the matching candidate proof, then builds and deploys GitHub Pages without rerunning tests. Manual dispatch can validate a candidate, but it does not deploy Pages from `master`. To retry a deployment, rerun the original `master` push run for the same commit; see the [CI guide](CONTRIBUTING-CI.md#pages-与重试). This workflow does not update the ChatGPT Site or publish npm.

Site target: `https://xingjianxu.github.io/mtone/`. This is the configured target, not proof of a successful deployment. Check the workflow's deployment URL and status after enabling Pages.

## Content maintenance

- `catalog.ts`: prose, API summaries and copyable examples, checked against package exports.
- `examples.tsx`: executable previews for all components.
- `docs-app.tsx`: navigation, hash routes, documentation pages and gallery.
- `site.css`: documentation shell styles (not library styles).
- Keep alias entries and native calendar/upload limitations explicit.

Tests verify export coverage, routes, search and mounting all examples. Browser QA must additionally check responsive layouts, overlays and navigation history.
