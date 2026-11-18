import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, test, expect, vi } from "vitest";
import {
  Button,
  Input,
  SearchInput,
  Textarea,
  FormField,
  Badge,
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
  it("removes badge", () => {
    const fn = vi.fn();
    render(<Badge onRemove={fn}>Work</Badge>);
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

it('renders blue buttons and preserves disabled/loading behavior', () => {
  const fn = vi.fn();
  const { rerender } = render(<Button variant="blue" onClick={fn}>启用两步验证</Button>);
  expect(screen.getByRole('button')).toHaveClass('mt-btn-blue');
  fireEvent.click(screen.getByRole('button'));
  expect(fn).toHaveBeenCalledOnce();
  rerender(<Button variant="blue" disabled onClick={fn}>启用两步验证</Button>);
  expect(screen.getByRole('button')).toBeDisabled();
  fireEvent.click(screen.getByRole('button'));
  rerender(<Button variant="blue" loading onClick={fn}>启用两步验证</Button>);
  expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  fireEvent.click(screen.getByRole('button'));
  expect(fn).toHaveBeenCalledOnce();
});


it("exports Badge without the removed Tag alias", async () => {
  const api = await import("../packages/mtone/src");
  expect(api).toHaveProperty("Badge");
  expect(api).not.toHaveProperty("Tag");
});
it.each(["neutral", "blue", "green", "orange", "red", "purple"] as const)("preserves Badge %s tone and native attributes", (tone) => {
  render(<Badge tone={tone} title="label" className="custom" data-testid="badge">Work</Badge>);
  expect(screen.getByTestId("badge")).toHaveClass("mt-badge", `mt-tone-${tone}`, "custom");
  expect(screen.getByTestId("badge")).toHaveAttribute("title", "label");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

test("Input and Input.Search share single-line styling while Textarea remains multiline", () => {
  const { container } = render(<><Input aria-label="plain" /><SearchInput aria-label="search" /><Textarea aria-label="multiline" /></>);
  expect(container.querySelector('[aria-label="plain"]')).toHaveClass("mt-input-control");
  expect(container.querySelector('[aria-label="search"]')).toHaveClass("mt-input-control");
  expect(container.querySelector('[aria-label="multiline"]')).not.toHaveClass("mt-input-control");
});
