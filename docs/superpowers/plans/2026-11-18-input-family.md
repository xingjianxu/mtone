# Input family implementation plan

**Goal:** A coherent native-input family with search as Input.Search and compatible old exports.
**Architecture:** A dedicated input module owns basic, search, password and textarea implementations; OTP is separate. Native element refs and React change events remain stable. Existing SearchInput and Textarea are exact aliases. Default 28px compact height and 1px light blue focus stay unchanged.
**Choices:** Extend the existing native model rather than adding a third-party input package or breaking event/ref semantics. Keep native numeric size and use controlSize for visual sizing. No promise of another library's API compatibility.

- [ ] Add failing tests for composed API, controlled/uncontrolled clear/count, adornment focus stability, search IME/loading and password visibility.
- [ ] Implement stable input shell, variants, statuses, adornments, clear and count; preserve old plain-input DOM where required by consumers.
- [ ] Implement Input.Search, Password, TextArea and OTP; preserve independent aliases and form/reset semantics.
- [ ] Document each subcomponent in the Input page and consolidate search documentation navigation while preserving old routes.
- [ ] Add browser verification of focus, clear, password, autosize, OTP and keyboard handling.
- [ ] Run independent review and tests, typecheck, docs build, tarball smoke, llms equality.
- [ ] Integrate TreeSelect, List and Spotlight latest mainline, revalidate exact tree, push CI then merge/deploy and verify live.

Review focus: clear must notify native handlers; IME Enter must not search; form reset must restore count; dynamic adornments must not remount inputs; disabled/readonly and Fieldset must disable auxiliary controls.
