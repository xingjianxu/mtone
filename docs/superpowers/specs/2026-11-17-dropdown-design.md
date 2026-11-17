# Dropdown extraction and Menu sizing

Add a standalone trigger/content Dropdown using Base UI Popover's nonmodal dialog semantics. Preserve Menu trigger/items semantics and deprecated aliases. Share an internal portaled panel renderer, not nested roots or nested interactive overlays. Menu, its submenus and ContextMenu retain Base UI menu focus/keyboard behavior.

Dropdown and Menu use content-based width with a 160px minimum rather than trigger width. An optional CSS width accepts a number (pixels) or CSS length; explicit width may be narrower than 160px. Clamp panels to available viewport width and wrap long content. `align` defaults to logical start and accepts start/end plus physical left/right; physical alignment is mapped using Base UI DirectionProvider for RTL. Collision avoidance may shift or flip alignment to remain visible. Menu width applies only to its main popup, not children, which size independently.

Keep Select and existing Popover styling/API unchanged. ContextMenu supports width but not trigger alignment. Dropdown content does not automatically close on click; use controlled open for application-specific close actions. Escape/outside click close and restore focus through Base UI. Generic popup gets a localized accessible name, optionally supplied via label.

Alternatives rejected: wrapping Menu in Popover creates two competing focus/overlay systems; only a CSS rename would not provide a reusable independent component. No API compatibility with another library or arbitrary new trigger modes.
