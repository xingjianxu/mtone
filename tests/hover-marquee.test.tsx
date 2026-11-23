import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
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
