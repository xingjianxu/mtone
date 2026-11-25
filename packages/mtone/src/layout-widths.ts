export const layoutWidths = { sm: 720, md: 960, lg: 1200, xl: 1440 } as const;
export type LayoutWidthPreset = keyof typeof layoutWidths;

export function isLayoutWidthPreset(value: string): value is LayoutWidthPreset {
  return Object.hasOwn(layoutWidths, value);
}
