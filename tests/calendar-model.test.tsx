import { expect, test } from "vitest";
import {
  addDays,
  parseCalendarDate,
  setMonth,
  isoWeek,
} from "../packages/mtone/src/calendar-model";
test("validates dates strictly and preserves small years", () => {
  expect(parseCalendarDate("0001-01-01")?.getUTCFullYear()).toBe(1);
  expect(parseCalendarDate("0000-01-01")).toBeNull();
  expect(parseCalendarDate("2023-02-29")).toBeNull();
  expect(parseCalendarDate("2024-02-29")).not.toBeNull();
});
test("date arithmetic clamps month-end without timezone shifts", () => {
  expect(setMonth("2024-01-31", 2024, 1)).toBe("2024-02-29");
  expect(setMonth("2024-02-29", 2025, 1)).toBe("2025-02-28");
  expect(addDays("2024-03-10", 1)).toBe("2024-03-11");
  expect(setMonth("0099-01-31", 99, 1)).toBe("0099-02-28");
});
test("ISO weeks cross years and handle internal out-of-range padding", () => {
  expect(isoWeek("2021-01-01")).toBe(53);
  expect(isoWeek("2024-12-30")).toBe(1);
  expect(Number.isFinite(isoWeek("+010000-01-06"))).toBe(true);
});
