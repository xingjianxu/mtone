const accentNames = ["neutral", "blue", "green", "orange", "red", "purple", "teal"] as const;

/** Shared theme accent keys, backed by the matching --mt-accent-* properties. */
export type MtoneAccent = (typeof accentNames)[number];

export function resolveAccentColor(color: string): string {
  return (accentNames as readonly string[]).includes(color)
    ? `var(--mt-accent-${color})`
    : color;
}
