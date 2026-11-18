import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import * as mtone from "../packages/mtone/src";

// These assertions fail if visibility is ignored, status naming is lost,
// custom content is appended rather than replaced, or defaults are changed.
describe("LoadingOverlay", () => {
  it("is publicly exported", () => {
    expect(mtone.LoadingOverlay).toBeDefined();
  });
  it("unmounts while hidden and restores one named status on repeated toggles", () => {
    const { container, rerender } = render(<mtone.LoadingOverlay />);
    expect(container).toBeEmptyDOMElement();
    for (let i = 0; i < 3; i++) {
      rerender(<mtone.LoadingOverlay visible />);
      expect(screen.getAllByRole("status")).toHaveLength(1);
      expect(screen.getByRole("status", { name: "Loading" })).toBeVisible();
      expect(container.querySelector(".mt-spinner")).not.toBeNull();
      rerender(<mtone.LoadingOverlay visible={false} />);
      expect(container).toBeEmptyDOMElement();
    }
  });
  it("shows an optional label and names the status once", () => {
    render(<mtone.LoadingOverlay visible label="正在保存" />);
    expect(screen.getByText("正在保存")).toBeVisible();
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveAccessibleName("正在保存");
  });
  it("replaces the spinner with custom content, including explicit null", () => {
    const { container, rerender } = render(
      <mtone.LoadingOverlay
        visible
        loader={<strong>处理中</strong>}
        label="保存"
      />,
    );
    expect(screen.getByText("处理中")).toBeVisible();
    expect(container.querySelector(".mt-spinner")).toBeNull();
    expect(screen.getByRole("status")).toHaveAccessibleName("保存");
    rerender(<mtone.LoadingOverlay visible loader={null} label="保存" />);
    expect(container.querySelector(".mt-spinner")).toBeNull();
    expect(screen.getByText("保存")).toBeVisible();
  });
  it("forwards a div ref, attributes, className and style", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <mtone.LoadingOverlay
        visible
        ref={ref}
        id="busy"
        className="custom"
        data-testid="overlay"
        style={{ color: "red" }}
      />,
    );
    expect(ref.current).toBe(screen.getByTestId("overlay"));
    expect(ref.current).toHaveClass("mt-loading-overlay", "custom");
    expect(ref.current).toHaveAttribute("id", "busy");
    expect(ref.current).toHaveStyle({ color: "rgb(255, 0, 0)" });
  });
  it("configures the surface independently of loader opacity", () => {
    const { container } = render(
      <mtone.LoadingOverlay
        visible
        opacity={0.4}
        blur={2}
        radius={6}
        zIndex={23}
        overlayColor="black"
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.zIndex).toBe("23");
    expect(root.style.borderRadius).toBe("6px");
    expect(root.style.getPropertyValue("--mt-loading-overlay-opacity")).toBe(
      "0.4",
    );
    expect(root.style.getPropertyValue("--mt-loading-overlay-blur")).toBe(
      "2px",
    );
    expect(root.style.getPropertyValue("--mt-loading-overlay-color")).toBe(
      "black",
    );
    expect(root.style.opacity).toBe("");
  });
  it("clamps invalid opacity/blur values and uses safe defaults", () => {
    const { container, rerender } = render(
      <mtone.LoadingOverlay visible opacity={2} blur={-2} />,
    );
    const root = () => container.firstElementChild as HTMLElement;
    expect(root().style.getPropertyValue("--mt-loading-overlay-opacity")).toBe(
      "1",
    );
    expect(root().style.getPropertyValue("--mt-loading-overlay-blur")).toBe(
      "0px",
    );
    rerender(<mtone.LoadingOverlay visible opacity={NaN} blur={Infinity} />);
    expect(root().style.getPropertyValue("--mt-loading-overlay-opacity")).toBe(
      "0.75",
    );
    expect(root().style.getPropertyValue("--mt-loading-overlay-blur")).toBe(
      "0px",
    );
    expect(root().style.zIndex).toBe("10");
    expect(root().style.borderRadius).toBe("inherit");
  });
  it("does not mutate or reset the covered content or move focus", () => {
    const Content = ({ visible }: { visible: boolean }) => (
      <div data-testid="parent">
        <input aria-label="Name" defaultValue="Ada" />
        <mtone.LoadingOverlay visible={visible} />
      </div>
    );
    const { rerender } = render(<Content visible={false} />);
    const input = screen.getByRole("textbox");
    input.focus();
    rerender(<Content visible />);
    expect(input).toHaveFocus();
    expect(input).not.toBeDisabled();
    expect(screen.getByTestId("parent")).not.toHaveAttribute("inert");
    rerender(<Content visible={false} />);
    expect(input).toHaveValue("Ada");
    expect(input).toHaveFocus();
  });
});
