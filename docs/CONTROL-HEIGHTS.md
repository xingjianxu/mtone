# Single-line control heights

Default input, selection and filter controls use a unified **34 CSS px** baseline.
This is the rendered outer **border-box**, including borders, rather than a child input height.

| Surface | Default |
| --- | --- |
| Input, SearchInput, DatePicker input | 34px |
| Select, TreeSelect, Cascader and AutoComplete trigger/input | 34px |
| NumberInput complete group | 34px |
| Table column filter input | 34px |
| MultiSelect chips/input container | minimum 34px |
| FilterChip | 34px |
| TagSelect option, expansion trigger and collapsed viewport | 34px |
| NavItem (including Sidebar, NavGroup and AdminLayout.Sider) and docs sidebar links | 34px |

MultiSelect grows when chips wrap. Do not force a fixed 34px height that hides values,
removal buttons or the search input. Long Select labels and plain-text navigation labels remain single-line with ellipsis.
Navigation row gaps, group headings and the collapsed sidebar controls are unchanged.

## Migration and customization

- Remove `density` from `MtoneProvider`; compact/comfortable modes and their DOM
  attributes are removed. Theme light/dark/system and language remain independent.
- This describes the current source. Updating the website does not publish npm;
  consult the installed declarations for an older release.
- The 34px baseline does not resize typography, icons, Textarea, option lists,
  calendar popups, badges, checkbox/radio controls, switches, sliders or layout regions.
  Tabs retain their independent 24/28/32px card size contract.
- Independent component size variants remain supported. TreeSelect, Cascader and
  AutoComplete keep 24px small and 34px large variants; their default is now 34px.
- Focus, errors and disabled states do not increase outer dimensions. Keyboard
  focus and forced-colors indicators remain available.
- `--mt-height` controls the shared baseline. Consult each component's declared
  props before using className/style; FilterChip has no size prop and can be
  customized through a scoped `.mt-filter-chip` CSS rule.

## Verification

Measure `getBoundingClientRect().height` for default controls with pointer and
keyboard focus, errors and disabled states. Include a narrow viewport, chip
wrapping, long labels, and high device scale factor. CSS pixels remain CSS pixels
at high DPI; physical screenshot pixels need not equal 34. Retain separate size
variant, focus and interaction regressions.
