# Layout persistence

Opt in with a stable caller-chosen storageKey. Use versioned, component- and field-scoped browser storage; ignore unavailable, invalid, or stale data. Restore client-side, never overwrite controlled fields or persist passive viewport changes.

1. Test round trips for Panel disclosure and selection, standalone Tabs selection, Sidebar, and FloatingWindow geometry. Implement a shared internal storage/state helper and wire commit events. FloatingWindow does not remember open or minimized state.
2. Test Splitter reload, including keyboard resize, topology changes and controlled precedence. Store a snapshot only after a successful gesture or separator activation, with an explicit panel identity signature and pixel widths for pixel-preserving panels. Restore under current size constraints.
3. Test AdminLayout and PageLayout sidebar integration. Sidebar owns collapse; the internal Splitter owns width through sidebarResize.storageKey. Responsive collapse is not a saved preference.
4. Add reload demos and API reference, regenerate llms.txt, verify targeted tests and merge/deploy on the exact validated candidate. No npm publication.
