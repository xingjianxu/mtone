import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, test, expect, vi } from "vitest";
import {
  Alert,
  Button,
  Input,
  SearchInput,
  Textarea,
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
  it("invokes Tag removal", () => {
    const fn = vi.fn();
    render(<Tag onRemove={fn}>Work</Tag>);
    fireEvent.click(screen.getByRole("button"));
    expect(fn).toHaveBeenCalledOnce();
  });
  it("applies tokens without a density mode", () => {
    render(
      <MtoneProvider tokens={{ "--mt-fg": "red" }}>
        <Button>Go</Button>
      </MtoneProvider>,
    );
    const scope = screen.getByRole("button").closest(".mt-scope");
    expect(scope).toHaveStyle({ "--mt-fg": "red" });
    expect(scope).not.toHaveAttribute("data-density");
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


it("exports Tag without a Badge compatibility alias", async () => {
  const api = await import("../packages/mtone/src");
  expect(api).toHaveProperty("Tag");
  expect(api).not.toHaveProperty("Badge");
});
it.each(["neutral", "blue", "green", "orange", "red", "purple"] as const)("preserves Tag %s tone and native attributes", (tone) => {
  render(<Tag tone={tone} title="label" className="custom" data-testid="tag">Work</Tag>);
  expect(screen.getByTestId("tag")).toHaveClass("mt-tag", `mt-tone-${tone}`, "custom");
  expect(screen.getByTestId("tag")).toHaveAttribute("title", "label");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

test("Input and Input.Search share single-line styling while Textarea remains multiline", () => {
  const { container } = render(<><Input aria-label="plain" /><SearchInput aria-label="search" /><Textarea aria-label="multiline" /></>);
  expect(container.querySelector('[aria-label="plain"]')).toHaveClass("mt-input-control");
  expect(container.querySelector('[aria-label="search"]')).toHaveClass("mt-input-control");
  expect(container.querySelector('[aria-label="multiline"]')).not.toHaveClass("mt-input-control");
});

it("keeps Alert close accessible, icon-only, and non-submitting", () => {
  const close = vi.fn();
  const submit = vi.fn((event) => event.preventDefault());
  render(<form onSubmit={submit}><Alert title="Notice" onClose={close}>Details</Alert></form>);
  const button = screen.getByRole("button", { name: "Close" });
  expect(button).toHaveClass("mt-icon-btn");
  fireEvent.click(button);
  expect(close).toHaveBeenCalledOnce();
  expect(submit).not.toHaveBeenCalled();
});
