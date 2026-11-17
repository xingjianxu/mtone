/** Calendar arithmetic uses UTC dates solely as date-only containers. */
export function parseCalendarDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000"))
    return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value
    ? date
    : null;
}
export function dateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}
export function addDays(value: string, days: number): string {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return dateKey(date);
}
export function setMonth(value: string, year: number, month: number): string {
  const date = parseCalendarDate(value)!;
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCFullYear(year, month, 1);
  const end = new Date(+date);
  end.setUTCMonth(end.getUTCMonth() + 1, 0);
  date.setUTCDate(Math.min(day, end.getUTCDate()));
  return date < new Date("0001-01-01T12:00:00Z")
    ? "0001-01-01"
    : date > new Date("9999-12-31T12:00:00Z")
      ? "9999-12-31"
      : dateKey(date);
}
export function isoWeek(value: string): number {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const first = new Date(+date);
  first.setUTCMonth(0, 1);
  return Math.ceil(((+date - +first) / 86400000 + 1) / 7);
}
