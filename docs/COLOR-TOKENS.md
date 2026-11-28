# Color roles and palette

mtone distinguishes **an explicit choice of hue** from **the purpose of a component's paint**. The same numerical color is not by itself a reason to share a token. Defaults and old override paths are unchanged. [See both layers in the live documentation](https://xingjianxu.github.io/mtone/#/theme/color-presets).

## Where color comes from

| Family | Rule |
| --- | --- |
| Shared accents | The eight `MtoneAccent` keys and `--mt-accent-*` stay hue-named. Examples: Tabs and Tooltip opt in to preset colors. Passing a CSS color or palette key is still supported where documented. |
| Named color variants | Existing Tag tones, Timeline color keys and `Button variant="blue"` remain public as before. Tag's blue/green/orange/red/purple paint pairs are choices, not Alert or validation states. The fixed paints used to render the blue Button now have action-role keys. |
| Shared UI roles | Text, muted text, surfaces, borders and primary actions already have semantic variables. `--mt-select-surface` is the shared pale-blue surface. `--mt-nav-selected` is a distinct navigation role (pale blue in Azure and neutral in Original). Use `--mt-select-ink` for the optional selected text role; switches, checkboxes and background-mode toggle buttons use `--mt-toggle-on-bg` / `--mt-toggle-on-ink` when configured. Neither replaces `--mt-select-highlight` in the legacy Upload drag state. |
| Feedback and focus | Keep keyboard focus (`--mt-focus`), input validation, Alert, Toast, Result, and other status families separate. Similar shades, including values that are equal only in one theme, are not aliases. Forced-color system names such as `Highlight` and `CanvasText` are still used in their accessibility rules. |
| Component-owned effects | Image preview is deliberately dark independent of page theme; dialog backdrop, marked text, shadows, progress paints, and AI status colors preserve the original values and have separate roles. Transparent/currentColor, CSS fallback literals, brand/media artwork, Shiki syntax-theme output, and user-provided paint are not alternate theme palettes. |
| Documentation | The site shell has its own `--docs-*` roles in `theme-preference.css`. The Gallery uses package variables where it renders package components. Custom demo color/gradient arguments and embedded SVG artwork are deliberate examples rather than library defaults. |

## Role-specific overrides

Set a specific token in CSS or in `MtoneProvider tokens` to change only the listed paint. The variables in this table are optional overrides: the effective default comes from the fallback where the component uses the value. No setting is required on upgrade.

| Role override | Paint | Previous value if unset |
| --- | --- | --- |
| `--mt-nav-current-indicator` | Current navigation item's vertical indicator | `--mt-blue`, then `#2383e2` |
| `--mt-calendar-today-ink` | Calendar current-date text | `--mt-blue`, then `#2383e2` |
| `--mt-panel-current-ink` | Active side-rail tab foreground | `--mt-accent-blue`, then `#2383e2` |
| `--mt-data-query-active-ink` | DataTable's active sort and filter icons | `--mt-indicator`, then `#5378aa` |
| `--mt-drop-target-edge` | Tree and Upload drag-target edges | `--mt-indicator`, then `#5378aa` |
| `--mt-check-card-indicator-ink` | CheckCard control glyph | `--mt-indicator`, then `#5378aa` |
| `--mt-toast-default-icon-ink` | Toast default icon (not success/error) | `--mt-indicator`, then `#5378aa` |
| `--mt-action-emphasis-{bg,ink,hover-bg,pressed-bg}` | Blue Button fill, text, hover fill, pressed fill | `#2783de`, `#f3f9fd`, `#2276c9`, `#185c9f` |
| `--mt-action-danger-filled-{bg,ink,hover-bg,pressed-bg}` | Filled danger Button in those same states | `#b6403b`, white, `#9e3632`, `#872c28` |
| `--mt-action-filled-separator` | Filled blue and danger group separator | `--mt-blue-button-separator`, then white at 30% opacity |
| `--mt-action-danger-ink` | Destructive action foreground in dialog controls | white (its existing fill uses `--mt-action-danger-bg`) |
| `--mt-progress-{fill,failure-fill,success-fill,active-glint}` | Progress fallback fill, exception fill, successful portion, active sheen | `#7d9c84`, `#b6403b`, `#548164`, `#ffffff70`. Explicit color props still take precedence. |
| `--mt-ai-evidence-{failure-ink,success-ink}` | Failed/passed status in AI evidence | `#b6403b`, `#548164` |
| `--mt-dialog-backdrop`, `--mt-switch-off-thumb` | Shared Dialog, ConfirmDialog, and Drawer scrim; unchecked Switch thumb | `#0005`, white |
| `--mt-image-cover-{bg,ink}` | Thumbnail overlay | `#0004`, white |
| `--mt-image-preview-{backdrop,ink,chrome,control-hover}` | Preview scrim, text, bars, and hover fill | `#000b`, `#fff`, `#202020`, `#ffffff24` |
| `--mt-list-drag-outline` | Dragged List item boundary | Existing muted/border mix, with `#a6a6a0` for older browsers |

`--mt-select-surface` and older scoped overrides (such as the Tree, DataTable and Panel override `--mt-selected`) are not renamed. If both a new role override and a legacy override are set, the new role wins for that role only. Keeping fallback resolution at the component also preserves legacy overrides on a descendant of a provider. Stock light and dark palettes still reset at nested theme boundaries; optional new overrides follow normal CSS inheritance and can be reset to `initial` in a child scope. Use Provider `tokens` when a React-scoped override needs to follow a mtone portal as well.

The default CSS, component examples, and generated reference are tied to the current branch; installed npm versions may lag the documentation. New paints remain subject to readable contrast when overridden.
