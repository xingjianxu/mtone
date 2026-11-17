import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Divider } from "../packages/mtone/src";

describe("Divider", () => {
  it("preserves the default horizontal hr", () => {
    render(<Divider />);
    expect(screen.getByRole("separator").tagName).toBe("HR");
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "horizontal",
    );
  });
  it("renders rich titles, zero and placement", () => {
    const { rerender } = render(
      <Divider titlePlacement="start">
        <strong>Details</strong>
      </Divider>,
    );
    expect(screen.getByRole("separator")).toHaveAttribute(
      "data-placement",
      "start",
    );
    expect(screen.getByText("Details")).toBeVisible();
    rerender(<Divider>{0}</Divider>);
    expect(screen.getByText("0")).toBeVisible();
  });
  it("supports vertical lines and deliberately ignores titles", () => {
    render(<Divider orientation="vertical">Ignored</Divider>);
    expect(screen.getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "vertical",
    );
    expect(screen.queryByText("Ignored")).toBeNull();
  });
  it("supports variants, size, plain text and semantic styling", () => {
    render(
      <Divider
        variant="dotted"
        size="large"
        plain
        titleClassName="custom-title"
        titleStyle={{ color: "red" }}
      >
        Title
      </Divider>,
    );
    expect(screen.getByRole("separator")).toHaveAttribute(
      "data-variant",
      "dotted",
    );
    expect(screen.getByRole("separator")).toHaveAttribute("data-size", "large");
    expect(screen.getByRole("separator")).toHaveAttribute("data-plain", "true");
    expect(screen.getByText("Title")).toHaveClass("custom-title");
    expect(screen.getByText("Title")).toHaveStyle({ color: "rgb(255, 0, 0)" });
  });
  it("forwards DOM props, styles and ref", () => {
    const ref = React.createRef<HTMLHRElement | HTMLDivElement>();
    render(
      <Divider
        ref={ref}
        id="divider"
        aria-label="Chapter"
        className="custom"
        style={{ marginTop: 20 }}
      />,
    );
    expect(ref.current).toBe(screen.getByRole("separator"));
    expect(ref.current).toHaveClass("custom");
    expect(ref.current).toHaveAttribute("id", "divider");
    expect(ref.current).toHaveAccessibleName("Chapter");
    expect(ref.current).toHaveStyle({ marginTop: "20px" });
  });
});
