# Calendar design

Add a data-display Calendar inspired by Ant Design's monthly/yearly calendar. Preserve mtone styling and DatePicker's ISO `YYYY-MM-DD` date-only values, without a runtime date dependency. Native date arithmetic is internal only. Ant wrapping would introduce styling/dependency coupling; a native browser date input would not support event cells. These are implementation choices, not a claim of Ant API compatibility.

Support month/day and year/month panels, full and card layouts, controlled/default value and mode, selection/change/panel callbacks, valid range, disabled dates, week numbers, English/Chinese Provider locale with overrides, custom cell and header content, semantic styles/classes. Default header uses mtone Select. Calendar represents dates, not time zones, scheduling persistence, drag/drop events, range selection or a lunar date engine. Custom content can show events or lunar annotations.

Keyboard grid uses roving focus, arrows, Home/End, PageUp/PageDown and explicit Enter/Space selection. Disabled and out-of-range cells cannot select. Respect controlled state refusal, invalid values, leap dates, boundary months and all-disabled grids. Custom renderers retain accessible interaction wrappers. Document that interactive nested controls should not be placed inside cell buttons.

Tests cover these boundaries, Provider locales, custom rendering and SSR/package exports. Browser regression runs across Chromium, Firefox and WebKit, including mobile width and Select interaction. Update catalog, API, llms and docs examples. No npm publishing. Repository push/merge only under owner authorization and platform policy.
