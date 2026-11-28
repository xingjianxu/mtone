# mtone themes: Azure (澄蓝) and Original (原调)

Azure is the built-in default design, exported as `mtoneAzureTheme`. It is
based on Original, retaining the 32px single-line control baseline, 4px
control radius and 3px compact row gap. Its light-mode selection is pale
blue (`#e9f2ff`) with deep-blue ink (`#2561ad`); active switches and toggle
buttons use deep blue. Dark mode uses a blue surface with light blue ink
for contrast. These designs are not color modes. Without a color mode,
mtone starts in light mode. See the [interactive theme example](https://xingjianxu.github.io/mtone/#/theme)
and [semantic color table](https://xingjianxu.github.io/mtone/#/theme/color-presets).

## Apply a named design

```tsx
import { MtoneProvider, type MtoneThemePreset } from "@bixlab/mtone";

const reading: MtoneThemePreset = {
  id: "reading",
  name: "Reading",
  tokens: { "--mt-height": "36px", "--mt-radius": "6px", "--mt-option-row-gap": "4px" },
  light: { "--mt-nav-selected": "#e3eff8", "--mt-nav-current-text": "#244d6d" },
  dark: { "--mt-nav-selected": "#293d4e", "--mt-nav-current-text": "#cee5f7" },
};

<MtoneProvider themePreset={reading} theme="system">
  <App />
</MtoneProvider>
```

The precedence at a scope is: Original base CSS → built-in design CSS (when applicable) → preset `tokens` → preset
`light` or `dark` → Provider `tokens` → explicit Scope `style`. Omitted
`themePreset` inherits the design through React, including mtone portal
surfaces. Use `themePreset={mtoneOriginalTheme}` to keep the previous
palette for the whole app or a nested area. Use `theme` to change the mode independently.
A custom system-mode palette uses its light map for server rendering, then
reads and follows the browser preference. Built-in designs and their modes are CSS-driven.
The library does not persist the user's theme choice.

## Inventory and boundaries

The initial audit covered the CSS in `packages/mtone/src`,
`packages/mtone-blockeditor/src`, and `apps/docs` (including repeated state
rules and component-level fallback usage). Keep distinct uses separate even
where their values match.

| Family | Belongs to the theme? |
| --- | --- |
| Shared semantic palette | Yes: text, surfaces, borders, focus, navigation selection, form feedback, statuses, shadows and overlays. Stock values are defined by mode in `packages/mtone/src/theme.css`. See [COLOR-TOKENS.md](COLOR-TOKENS.md) for optional component-role overrides. |
| Shared accent choices | Yes, but independent of semantic colors: the eight `--mt-accent-*` colors remain selectable hues. |
| Shared control geometry | Yes: `--mt-height`, `--mt-radius` and `--mt-option-row-gap`. The latter also reaches the BlockEditor suggestion list; its local 3px fallback is retained for older host packages. |
| Component size and layout | Keep local: input/button/tab size variants, Tree's configurable row gap and indent, table cell padding, CardGroup gap presets, avatar/icon sizes, editor frame and layout pane constraints. The same numerical value does not make them one design role. |
| BlockEditor and third-party styles | Editor surfaces and controls reuse mtone roles where applicable. BlockNote layout constants, content-authored colors and Shiki syntax palettes are separate. A theme is not a content recoloring filter. |
| Docs shell | The site navigation and layout keep their own `--docs-*` roles. The interactive preview exercises the library rather than recoloring the whole site. |

Consume a role by name, not by reading or duplicating the displayed color
table. Shared role defaults reset at mtone scope boundaries; setting an
explicit named design also resets the compact option gap and the optional
navigation indicator to their inherited Original defaults if the new preset
doesn't override them. Other optional component-specific or consumer-defined
variables follow ordinary CSS inheritance. If a custom preset overrides one
of those differently by mode, define it in both modes or use `initial` in the
mode that should fall back. Keep navigation selected background, navigation
selected text, selection indicator and shared Tree/DataTable selection
background separately configurable. Check foreground contrast in each mode.
