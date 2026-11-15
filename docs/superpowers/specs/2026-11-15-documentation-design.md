# mtone documentation website design

Status: approved; owner selected Vite implementation.

## Purpose
Extend the existing mtone documentation into a usable developer reference with a component gallery and individual component pages inspired by Mantine's information architecture. Preserve mtone's compact, warm-gray identity; do not clone Mantine branding. Publish to GitHub Pages and stop updating the ChatGPT Site.

## Approaches
1. Extend existing Vite/React static application (recommended): reuse the actual library and gallery, add a typed content registry, routing and navigation. Low dependency overhead and straightforward Pages deployment.
2. Introduce a documentation framework: useful for large editorial sites, but requires migration and framework integration for the live React components. Not necessary for this release.

## Proposed experience
- Desktop category sidebar, content panel and on-page outline; responsive mobile navigation.
- Search component names and Chinese descriptions locally, without a backend.
- Gallery of all non-editor components linking to their own reference pages.
- Every component page includes purpose, import, interactive example, copyable source, public props, accessibility advice and actual implementation limits.
- Separate getting-started and styling/provider pages, including React 19.2 requirement, package installation from GitHub and one CSS import.
- Alias components explicitly link to their implementation; no misleading component counts.
- Links are addressable and survive refresh/back/forward. Hash routing avoids GitHub Pages deep-link 404s.

## Architecture
Retain Vite and React. Split reusable shell, document registry and live examples into separate modules. The component package remains unchanged unless tests expose a defect. Test document completeness against public exports, navigation/search and representative interactions.

## Deployment
Build assets with /mtone/ base path; GitHub Actions runs npm ci, typecheck, tests and build, uploads dist/docs and deploys with official Pages actions. Do not publish npm packages. Deployment permission is limited to this documentation site. Enable repository Pages if available through authorized controls; otherwise report the one required setup step, with complete code and workflow already committed.

## Constraints and non-goals
No BlockNote/editor, backend, copied Mantine assets, external analytics or new ChatGPT Site deployment. Upload examples are local simulations clearly labeled. Native DatePicker limitations remain explicit. No false claims about all browsers or accessibility certification.

## Acceptance
All public components have distinct documentation entries and runnable examples; no broken internal routes. Desktop/mobile layouts usable; code blocks scroll without overflowing page. Existing library tests pass; docs tests and production build pass. Source is on xingjianxu/mtone. Report deployment only after verified success and distinguish any pending Pages setup.
