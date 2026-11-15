# App Showcase

Add an “应用示例 / App Showcase” route alongside, not instead of, Component Gallery and per-component docs. The current site has no separate App Gallery; the new entry disambiguates full-app composition from the component inventory.

Build a coherent Chinese knowledge-workspace scene using existing mtone components. Search, category/favorites filtering, card/list views, creating/editing plain-text documents, favorite toggling, and confirmed deletion operate on in-memory data. Show an explicit notice that changes are lost on refresh or leaving this example. No server claims, persistence, authentication, or previously deferred block editor.

Use a compact, neutral layout responsive from 360px to desktop. Keep semantic labels, keyboard-accessible actions and real empty/error states. Existing component docs and library APIs remain unchanged. Publish source and GitHub Pages only; no npm release.

Approach: add a self-contained showcase view and scoped stylesheet, rather than replacing the existing gallery or adding a new external site. This preserves documentation navigation and demonstrates actual component composition.
