# Menu rename, groups and submenus

Keep mtone's data-driven `trigger` / `items` API and compact neutral styling. Export `Menu` and `MenuProps`; preserve `DropdownMenu` and `DropdownMenuProps` as deprecated aliases. Internal Base UI Menu becomes BMenu, so no public name conflicts exist.

Extend items with recursive `children` for submenu actions and explicit `type: 'group'` (label + children) / `type: 'divider'` entries. Groups are accessible, non-selectable sections; submenu parents open children without firing leaf selection callbacks. Use Base UI's pointer, keyboard, focus restoration and collision management rather than a custom overlay system. ContextMenu shares items and behavior. Keep icons aligned within each panel, including groups. Hover/focus highlight uses neutral gray and a thin pale-blue border without changing dimensions; Select stays unchanged.

Alternatives: replacing the old API would unnecessarily break consumers; adding a second compound API adds complexity without requested benefit. Selected approach retains compatibility while adding the requested features. Do not add checkbox/radio actions or API compatibility with Mantine.

Update catalog, examples, old-route compatibility, README if applicable and generated llms. Verify disabled parents, callbacks only once, groups not keyboard stops, keyboard submenu navigation, repeated open/close and old alias.
