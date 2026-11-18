import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HoverCard } from "../packages/mtone/src";

describe("HoverCard arrow seam", () => {
  it("uses an open-baseline SVG instead of a rotated bordered square", () => {
    render(
      <HoverCard
        open
        withArrow
        trigger={<button>Arrow</button>}
        content="Preview"
      />,
    );
    const arrow = screen
      .getByText("Preview")
      .closest(".mt-hover-card")!
      .querySelector(".mt-hover-card-arrow")!;
    expect(arrow).toHaveAttribute("aria-hidden", "true");
    expect(arrow.querySelector("svg")).toHaveAttribute("viewBox", "0 0 12 12");
    expect(arrow.querySelector("path")).toHaveAttribute("d", "M0 7 6 1 12 7");
  });
});
