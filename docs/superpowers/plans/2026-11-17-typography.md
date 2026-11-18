# Typography Implementation Plan

**Goal:** Add mtone-native text, title, paragraph and link components, retaining existing Text/muted behavior.
**Architecture:** Shared text content/actions component; semantic wrapper components; token-based CSS. No new dependencies.

- [ ] Test existing Text semantics, title levels, decorations and links.
- [ ] Implement Text, Title, Paragraph, Link and Typography exports.
- [ ] Test and implement clipboard success/failure, accessible editing (IME/Enter/Escape/blur), controlled state, disabled behavior.
- [ ] Test and implement CSS single/multiple line clamp and controlled expansion; actions remain outside clipped content.
- [ ] Add interactive documentation, accurate catalog/llms reference and browser regression coverage.
- [ ] Run typecheck, unit tests, docs build, real tarball smoke and diff checks; obtain independent review.

Boundaries: no shimmer or rich-content middle/suffix truncation. CSS clamp does not measure overflow; explicit expandable control remains available. Editing rich content requires explicit text. Secure-context clipboard failures are surfaced, never reported as success.
