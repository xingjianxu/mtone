export type SplitterSize = number | `${number}%` | `${number}px`;
export function validateSplitterSize(
  value: SplitterSize | undefined,
  name: string,
): void {
  if (value === undefined) return;
  const valid =
    typeof value === "number"
      ? Number.isFinite(value) && value >= 0
      : /^(?:\d+(?:\.\d+)?|\.\d+)(?:%|px)$/.test(value) &&
        Number.isFinite(parseFloat(value));
  if (!valid)
    throw new Error(
      `Splitter: ${name} must be a non-negative finite pixel number or an explicit %/px string.`,
    );
}
export function splitterSizeToPixels(
  value: SplitterSize,
  available: number,
): number {
  validateSplitterSize(value, "size");
  return typeof value === "number"
    ? value
    : value.endsWith("%")
      ? (parseFloat(value) * available) / 100
      : parseFloat(value);
}
export function splitterControlledLayout(
  sizes: readonly SplitterSize[],
  ids: readonly string[],
  available: number,
): Record<string, number> {
  if (sizes.length !== ids.length)
    throw new Error("Splitter: sizes must contain one size for every Panel.");
  sizes.forEach((size, i) => validateSplitterSize(size, `sizes[${i}]`));
  const values = sizes.map((size) => splitterSizeToPixels(size, available)),
    total = values.reduce((a, b) => a + b, 0);
  if (!Number.isFinite(total) || total <= 0)
    throw new Error("Splitter: controlled sizes must have a positive total.");
  return Object.fromEntries(
    ids.map((id, i) => [id, (values[i] / total) * 100]),
  );
}
export function splitterLayoutsEqual(
  a: Record<string, number>,
  b: Record<string, number>,
): boolean {
  return (
    Object.keys(a).length === Object.keys(b).length &&
    Object.keys(a).every((key) => Math.abs(a[key] - (b[key] ?? -1000)) < 0.001)
  );
}

export interface SplitterPairConstraint {
  min: number;
  max: number;
  collapsed: number;
  collapsible: boolean;
}
/** Percentages of the group; preserves the pair total and never moves other panes. */
export function splitterPairTarget(
  total: number,
  ratio: number,
  phase: "first" | "initial" | "second",
  a: SplitterPairConstraint,
  b: SplitterPairConstraint,
): [number, number] | null {
  const valid = (value: number, c: SplitterPairConstraint) =>
    (value >= c.min - 0.001 && value <= c.max + 0.001) ||
    (c.collapsible && Math.abs(value - c.collapsed) < 0.001);
  let first: number;
  if (phase === "first") first = a.collapsed;
  else if (phase === "second") first = total - b.collapsed;
  else {
    const desired = total * ratio;
    if (valid(desired, a) && valid(total - desired, b)) first = desired;
    else {
      const lower = Math.max(a.min, total - b.max);
      const upper = Math.min(a.max, total - b.min);
      if (lower > upper) return null;
      first = Math.max(lower, Math.min(upper, desired));
    }
  }
  const second = total - first;
  return Number.isFinite(first) && valid(first, a) && valid(second, b)
    ? [first, second]
    : null;
}
