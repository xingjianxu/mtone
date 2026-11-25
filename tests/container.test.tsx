import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import * as M from "../packages/mtone/src";

test.each([
  [undefined, "960px"], ["sm", "720px"], ["md", "960px"], ["lg", "1200px"],
  ["xl", "1440px"], [840, "840px"], ["65ch", "65ch"], ["none", "none"],
] as const)("resolves Container maxWidth %s to %s", (maxWidth, expected) => {
  const ref = React.createRef<HTMLDivElement>();
  render(<M.Container ref={ref} maxWidth={maxWidth} aria-label="Content" className="custom" style={{ color: "red" }}>Example</M.Container>);
  const root = screen.getByLabelText("Content");
  expect(ref.current).toBe(root);
  expect(root).toHaveClass("mt-container", "custom");
  expect(root).toHaveTextContent("Example");
  expect(root).not.toHaveAttribute("maxwidth");
  expect(root.style.getPropertyValue("--mt-container-max-width")).toBe(expected);
  expect(root.style.getPropertyValue("--mt-container-padding-inline")).toBe("16px");
  expect(root.style.color).toBe("red");
});

test("supports custom and zero inline padding and safely defaults invalid numbers", () => {
  const { rerender } = render(<M.Container maxWidth={-20} paddingInline="1rem">Example</M.Container>);
  const root = screen.getByText("Example");
  expect(root.style.getPropertyValue("--mt-container-max-width")).toBe("960px");
  expect(root.style.getPropertyValue("--mt-container-padding-inline")).toBe("1rem");
  rerender(<M.Container paddingInline={0}>Example</M.Container>);
  expect(root.style.getPropertyValue("--mt-container-padding-inline")).toBe("0px");
});

test("PageLayout shares the xl preset but stays full width by default", () => {
  const { rerender } = render(<M.PageLayout title="Projects" maxWidth="xl" aria-label="Layout" />);
  const layout = screen.getByLabelText("Layout");
  expect(layout.style.getPropertyValue("--mt-page-layout-max-width")).toBe("1440px");
  rerender(<M.PageLayout title="Projects" aria-label="Layout" />);
  expect(layout).not.toHaveClass("mt-page-layout-constrained");
});
