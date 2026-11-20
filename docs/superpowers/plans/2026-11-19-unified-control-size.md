# Single-density controls

- [x] Change browser geometry tests to require 34px default controls with and without a provider; keep separate explicit size variants and wrapped MultiSelect. Check theme, tokens, and portal scope after removing density.
- [x] Remove the Provider density option, DOM attributes, and density overrides. Use the standard height token for standard controls; keep unrelated row, icon, spacing, and component-specific sizes.
- [x] Remove density controls and examples from the docs; document the default height and migration; regenerate the AI reference.
- [x] Run type checking, unit tests, package and docs builds, package smoke, browser geometry regression, and verify reference parity.

Chromium standard and HiDPI cases run locally. Firefox and WebKit remain CI checks
when the local runner cannot launch them.
