import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  Button,
  Input,
  FormField,
  Tag,
  MtoneProvider,
} from "../packages/mtone/src/basic";
describe("foundation", () => {
  it("blocks loading button action", () => {
    const fn = vi.fn();
    render(
      <Button loading onClick={fn}>
        Save
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(fn).not.toHaveBeenCalled();
  });
  it("connects label and error to input", () => {
    render(
      <FormField label="Name" error="Required">
        <Input />
      </FormField>,
    );
    expect(screen.getByLabelText("Name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByLabelText("Name")).toHaveAccessibleDescription(
      "Required",
    );
  });
  it("removes tag", () => {
    const fn = vi.fn();
    render(<Tag onRemove={fn}>Work</Tag>);
    fireEvent.click(screen.getByRole("button"));
    expect(fn).toHaveBeenCalledOnce();
  });
  it("applies density and tokens", () => {
    render(
      <MtoneProvider density="comfortable" tokens={{ "--mt-fg": "red" }}>
        <Button>Go</Button>
      </MtoneProvider>,
    );
    expect(
      screen.getByRole("button").closest("[data-density]"),
    ).toHaveAttribute("data-density", "comfortable");
  });
});
