import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import HoverMarqueeDemo from "../apps/docs/inline-demos/hover-marquee-usage";
import { HoverMarquee } from "../packages/mtone/src";

it("keeps one accessible copy of the original text and forwards native attributes", () => {
  const ref = React.createRef<HTMLSpanElement>();
  render(<HoverMarquee ref={ref} data-testid="marquee" id="label" tabIndex={-1}>Project notes</HoverMarquee>);
  const element = screen.getByTestId("marquee");
  expect(ref.current).toBe(element);
  expect(element).toHaveAttribute("id", "label");
  expect(element).toHaveAttribute("tabindex", "-1");
  expect(screen.getAllByText("Project notes")).toHaveLength(1);
  expect(screen.getByText("Project notes")).not.toHaveAttribute("aria-hidden");
  expect(renderToStaticMarkup(<HoverMarquee>Server content</HoverMarquee>)).toContain("Server content");
});

it("puts the demonstrably long label first in the shared docs and gallery example", () => {
  const { container } = render(<HoverMarqueeDemo />);
  const labels = container.querySelectorAll(".mt-hover-marquee");
  expect(labels).toHaveLength(1);
  expect(labels[0].textContent?.length).toBeGreaterThan(36);
  expect(labels[0].parentElement).toHaveStyle({ inlineSize: "100%", maxInlineSize: "15rem" });
});

it("never copies overflowing single-track content", () => {
  const { container } = render(
    <HoverMarquee mode="single" data-testid="marquee">
      <span id="label-marker">Release notes</span> <a href="#guide">Guide</a>
    </HoverMarquee>,
  );
  const frame = screen.getByTestId("marquee");
  const track = container.querySelector(".mt-hover-marquee-original")!;
  Object.defineProperty(frame, "clientWidth", { value: 60 });
  Object.defineProperty(track, "scrollWidth", { value: 180 });
  fireEvent(window, new Event("resize"));
  expect(frame).toHaveAttribute("data-overflow");
  expect(frame).toHaveAttribute("data-motion", "single");
  expect(container.querySelector(".mt-hover-marquee-copy")).not.toBeInTheDocument();
  expect(container.querySelectorAll("#label-marker")).toHaveLength(1);
  expect(screen.getAllByRole("link", { name: "Guide" })).toHaveLength(1);
});
