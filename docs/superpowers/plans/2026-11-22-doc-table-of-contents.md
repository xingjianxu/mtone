# Use TableOfContents for component documentation

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Replace the documentation site's ComponentOutline with one reusable TableOfContents per page without changing its URLs, responsive behavior, or navigation.

**Architecture:** Preserve existing automatic TOC discovery and manual scrolling. Opt into authored IDs and levels, nested lists, custom native hrefs, scroll-spy options, and responsive native disclosure. Keep URL and focus translation for the documentation router outside the library.

**Issue:** [#27](https://github.com/xingjianxu/mtone/issues/27).

- Cover nested authored headings, native/modified links, same-hash focus, mobile disclosure, and bottom-of-page highlight with focused regression tests.
- Implement the reusable options, remove the duplicate docs outline, and preserve the existing defaults and the legacy Typography anchors.
- Update the TOC API/reference, regenerate llms.txt, and verify the affected area. Do not run the full suite or publish npm.
