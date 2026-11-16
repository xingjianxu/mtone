import { describe, expect, it } from "vitest";
import {
  splitterPairTarget,
  type SplitterPairConstraint,
} from "../packages/mtone/src/splitter-utils";
const pane: SplitterPairConstraint = {
  min: 10,
  max: 100,
  collapsed: 0,
  collapsible: true,
};
describe("Splitter adjacent pair cycle targets", () => {
  it("collapses either neighbor and restores initial ratio inside current pair total", () => {
    expect(splitterPairTarget(60, 0.4, "first", pane, pane)).toEqual([0, 60]);
    expect(splitterPairTarget(60, 0.4, "initial", pane, pane)).toEqual([
      24, 36,
    ]);
    expect(splitterPairTarget(60, 0.4, "second", pane, pane)).toEqual([60, 0]);
  });
  it("respects nonzero collapsed size", () => {
    expect(
      splitterPairTarget(60, 0.4, "first", { ...pane, collapsed: 3 }, pane),
    ).toEqual([3, 57]);
  });
  it("rejects collapse that would need other panes to absorb space", () => {
    expect(
      splitterPairTarget(60, 0.4, "first", pane, { ...pane, max: 50 }),
    ).toBeNull();
  });
  it("clamps restored ratio to feasible expanded interval", () => {
    expect(
      splitterPairTarget(60, 0.1, "initial", { ...pane, min: 20 }, pane),
    ).toEqual([20, 40]);
    expect(splitterPairTarget(15, 0.5, "initial", pane, pane)).toBeNull();
  });
});
