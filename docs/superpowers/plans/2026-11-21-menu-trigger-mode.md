# Menu click or hover trigger

- Add `triggerMode?: "click" | "hover"` to Menu; leave default trigger element, root state, placement and selection untouched. Delegate mouse intent, safe pointer passage and dismissal to Base UI, and preserve existing click, keyboard and touch activation.
- Use targeted tests for default click, controlled hover, disabled triggers and real-browser movement from trigger through the portal gap and nested menu without taking focus.
- Add one side-by-side click/hover doc demo, update API and regenerate the bundled reference. Do not run full regression or write remote refs.
