# Single-line control heights

The compact defaults align input, selection and filter controls at **28 CSS px**.
This is the rendered outer **border-box**, including any borders, rather than the
height of a child input or a `min-height` that grows through padding.

| Surface | Compact default | Comfortable density |
| --- | --- | --- |
| Input, SearchInput, DatePicker input | 28px | 36px |
| Select trigger | 28px | 34px |
| NumberInput complete group | 28px | 36px |
| Table column filter input | 28px | 36px |
| MultiSelect chips/input container | minimum 28px | minimum 28px |
| FilterChip | 28px | 28px |

MultiSelect grows when chips wrap onto additional rows. Do not override it with
a fixed 28px height: that can hide selected values, removal buttons or the search
input. Long Select labels remain single-line and use ellipsis. Icons, labels and
numeric step controls are centered within their available height.

## Scope and customization

- The change does not impose 28px on Textarea, option lists, native calendar
  popups, buttons, badges, checkbox/radio controls, switches, sliders or page
  layout regions. Spotlight inherits the shared Input styling where used.
- Focus, validation errors and disabled states do not increase the control's
  outer dimensions. Existing keyboard focus indicators and forced-colors
  fallbacks remain available.
- `MtoneProvider density="comfortable"` retains the existing larger single-line
  variants listed above. This does not introduce a shared `size` prop.
- Input, SearchInput, DatePicker and Table filter input use the existing
  `--mt-height` token. Input also accepts native `style` and `className` props.
  Select, MultiSelect and NumberInput accept `className` for scoped CSS
  customization. FilterChip has no `className`, `style` or `size` prop; use a
  scoped host CSS selector targeting `.mt-filter-chip` if customization is
  required. Consult each component's declared API rather than assuming common
  props across every control.

## Verification

Browser checks should measure `getBoundingClientRect().height` at default compact
settings, with pointer and keyboard focus, errors and disabled states. Include a
narrow viewport and high device scale factor, chip wrapping and long labels.
Check the comfortable variants separately. CSS pixels remain CSS pixels at high
DPI; physical screenshot pixels need not equal 28. Retain the input focus and
interaction regression suites alongside these geometry checks.
