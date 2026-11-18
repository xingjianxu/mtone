# TreeSelect

Implement a compact hierarchical value picker using mtone Tree and the existing popover foundation. Reuse TreeItem keys, labels, disabled behavior, check conduction and lazy loading rather than introducing another tree implementation. Single selection returns a key or null; multiple selection returns keys. Search retains matching nodes and ancestors. Checkbox conduction must use the full data set, not the filtered view. Parent display compression affects presentation only.

1. Add failing tests for single/controlled/clear, multiple conduction, filtered selections, keyboard, disabled Fieldset and lazy loading.
2. Implement exported TreeSelect with typed props and scoped compact CSS. Preserve 28px input height and thin focus border.
3. Add independent demos/API, catalog export and generated AI reference.
4. Review, run unit/type/build/package checks, add three-browser regressions, push verified tree, merge master, verify Pages and live reference. Do not publish npm.
