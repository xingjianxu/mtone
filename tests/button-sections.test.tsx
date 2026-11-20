import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../packages/mtone/src/basic";

const decoration = (id: string) => <span data-testid={id} aria-hidden="true" />;

describe("Button sections", () => {
  it("renders both decorations in reading order around the label", () => {
    render(
      <Button
        icon={decoration("legacy")}
        leftSection={decoration("start")}
        rightSection={decoration("end")}
      >
        <span data-testid="label">Download</span>
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Download" });
    const start = screen.getByTestId("start");
    const label = screen.getByTestId("label");
    const end = screen.getByTestId("end");

    expect(button).toContainElement(start);
    expect(button).toContainElement(end);
    expect(
      start.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      label.compareDocumentPosition(end) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.queryByTestId("legacy")).not.toBeInTheDocument();
    expect(button).not.toHaveAttribute("leftSection");
    expect(button).not.toHaveAttribute("rightSection");
  });

  it("keeps the legacy icon when leftSection is omitted and renders numeric decorations", () => {
    render(
      <Button icon={decoration("legacy")} rightSection={0}>
        Inbox
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Inbox 0" });
    expect(screen.getByTestId("legacy").parentElement).toBe(button);
  });

  it("uses the leading loading indicator without removing the trailing decoration", () => {
    const click = vi.fn();
    render(
      <Button
        loading
        leftSection={decoration("start")}
        rightSection={decoration("end")}
        onClick={click}
      >
        Upload
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Upload" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button.querySelector(".mt-spin")).not.toBeNull();
    expect(screen.queryByTestId("start")).not.toBeInTheDocument();
    expect(button).toContainElement(screen.getByTestId("end"));
    fireEvent.click(button);
    expect(click).not.toHaveBeenCalled();
  });

  it("does not render empty React nodes as sections or change the plain button structure", () => {
    const { rerender } = render(<Button>Choose</Button>);
    const button = screen.getByRole("button", { name: "Choose" });
    expect(button.children).toHaveLength(0);
    rerender(
      <Button leftSection={false} rightSection={null}>
        Choose
      </Button>,
    );
    expect(button.children).toHaveLength(0);
  });
});
