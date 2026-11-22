# Single-line control heights

Default input, selection and filter controls use a unified **32 CSS px** baseline.
This is the rendered outer **border-box**, including borders, rather than a child input height.

| Surface | Default |
| --- | --- |
| Button, including inherited ButtonGroup size and icon-only mode | 32px normal |
| Tabs item in every variant, size and placement | 32px |
| Input, Input.Search, DatePicker input | 32px |
| Select, TreeSelect, Cascader and AutoComplete trigger/input | 32px |
| NumberInput complete group | 32px |
| Table column filter input | 32px |
| MultiSelect chips/input container | minimum 32px |
| Tag with `variant="filter"` | 32px |
| TagSelect option, expansion trigger and collapsed viewport | 32px |
| NavItem (including Sidebar, NavGroup and AdminLayout.Sider) and docs sidebar links | 32px |

MultiSelect grows when chips wrap. Do not force a fixed 32px height that hides values,
removal buttons or the search input. Long Select labels and plain-text navigation labels remain single-line with ellipsis.
Navigation row gaps, group headings and the collapsed sidebar controls are unchanged.

## Migration and customization

- Remove `density` from `MtoneProvider`; compact/comfortable modes and their DOM
  attributes are removed. Theme light/dark/system and language remain independent.
- This describes the current source. Updating the website does not publish npm;
  consult the installed declarations for an older release.
- The 32px baseline does not resize typography, icons, Input.TextArea, option lists,
  calendar popups, plain tags, checkbox/radio controls, switches, sliders or layout regions.
  Tabs use the same item height at every size; size changes typography only.
- Independent component size variants remain supported. TreeSelect, Cascader and
  AutoComplete keep 24px small and 34px large variants; their default is now 32px.
- Button and ButtonGroup use `small` / `normal` / `large` (28 / 32 / 36px).
  The aliases `sm` / `md` / `lg` are still accepted. Explicit Button sizes
  override an inherited group size, including for Menu triggers.
- Single-line control text uses a 20px line height without resizing its font.
  For a normal 32px control, each block inset is 6px inclusive of any
  border (5px padding if a 1px border is present). Icon-only Button stays
  square with no padding.
- Focus, errors and disabled states do not increase outer dimensions. Keyboard
  focus and forced-colors indicators remain available.
- `--mt-height` controls the shared baseline. Consult each component's declared
  props before using className/style; Tag in the filter variant has no size prop
  and uses the shared token.

## Verification

Measure `getBoundingClientRect().height` for default controls with pointer and
keyboard focus, errors and disabled states. Include a narrow viewport, chip
wrapping, long labels, and high device scale factor. CSS pixels remain CSS pixels
at high DPI; physical screenshot pixels need not equal 32. Retain separate size
variant, focus and interaction regressions.
