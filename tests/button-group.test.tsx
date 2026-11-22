import { render, screen, fireEvent } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import postcss from "postcss";
import { Button, ButtonGroup } from "../packages/mtone/src/basic";
import { Popover } from "../packages/mtone/src";

it("keeps separated groups as the default and supports connected groups without forwarding the prop", () => {
  const { rerender } = render(<ButtonGroup aria-label="Actions"><Button>Copy</Button></ButtonGroup>);
  expect(screen.getByRole("group")).not.toHaveClass("mt-button-group-connected");
  rerender(<ButtonGroup connected aria-label="Actions" className="custom"><Button>Copy</Button><Button iconOnly aria-label="More">+</Button></ButtonGroup>);
  expect(screen.getByRole("group")).toHaveClass("mt-button-group-connected", "custom");
  expect(screen.getByRole("group")).not.toHaveAttribute("connected");
  expect(screen.getAllByRole("button")).toHaveLength(2);
});
it("preserves button click, loading and disabled semantics in connected groups", () => {
  const click = vi.fn();
  render(<ButtonGroup connected><Button onClick={click}>Copy</Button><Button danger variant="solid" loading onClick={click}>Delete</Button><Button disabled onClick={click}>Disabled</Button></ButtonGroup>);
  for (const button of screen.getAllByRole("button")) fireEvent.click(button);
  expect(click).toHaveBeenCalledOnce();
  expect(screen.getByText("Delete")).toHaveClass("mt-btn-solid", "mt-danger");
  expect(screen.getByText("Delete")).toHaveAttribute("aria-busy", "true");
});
const css = postcss.parse(readFileSync("packages/mtone/src/styles.css", "utf8"));
function declarations(selector: string) {
  const values: Record<string, string> = {};
  css.walkRules(rule => { if (rule.selectors.includes(selector)) rule.walkDecls(d => { values[d.prop] = d.value; }); });
  return values;
}
it("joins direct buttons across non-button siblings and preserves focus and logical corners", () => {
  expect(declarations(".mt-button-group").gap).toBe("4px");
  expect(declarations(".mt-button-group-connected").gap).toBe("0");
  const withPreviousButton = declarations(".mt-button-group-connected > .mt-btn ~ .mt-btn");
  const withNextButton = declarations(".mt-button-group-connected > .mt-btn:has(~ .mt-btn)");
  expect(withPreviousButton["margin-inline-start"]).toBe("-1px");
  expect(withPreviousButton["border-start-start-radius"]).toBe("0");
  expect(withNextButton["border-end-end-radius"]).toBe("0");
  expect(declarations(".mt-button-group-connected > .mt-btn:focus-visible")["z-index"]).toBe("2");
});
it("keeps solid danger hover red rather than neutral", () => {
  expect(declarations(".mt-btn-solid.mt-danger").background).toBe("#b6403b");
  expect(declarations(".mt-btn-solid.mt-danger:hover:not(:disabled)").background).toBe("#9e3632");
});

it("inherits canonical sizes through composed triggers and nested groups; explicit aliases override", () => {
  render(
    <ButtonGroup size="small" aria-label="Outer">
      <Button>Primary</Button>
      <Popover.Menu trigger={<Button iconOnly aria-label="More">+</Button>} items={[{ key: "open", label: "Open" }]} />
      <Button size="lg">Large override</Button>
      <ButtonGroup aria-label="Inner">
        <Button>Nested inherited</Button>
        <Button size="normal">Normal override</Button>
      </ButtonGroup>
    </ButtonGroup>,
  );
  expect(screen.getByRole("group", { name: "Outer" })).not.toHaveAttribute("size");
  expect(screen.getByRole("button", { name: "Primary" })).toHaveClass("mt-size-sm");
  expect(screen.getByRole("button", { name: "More" })).toHaveClass("mt-size-sm");
  expect(screen.getByRole("button", { name: "Large override" })).toHaveClass("mt-size-lg");
  expect(screen.getByRole("button", { name: "Nested inherited" })).toHaveClass("mt-size-sm");
  expect(screen.getByRole("button", { name: "Normal override" })).toHaveClass("mt-size-md");
});
