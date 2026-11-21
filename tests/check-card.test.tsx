import * as React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CardGroup, CheckCard } from "../packages/mtone/src";

const field = (role: "checkbox" | "radio", name: string) =>
  screen.getByRole(role, { name });

describe("CheckCard", () => {
  it("selects a standalone native checkbox from its title or keyboard, with a separate description", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <CheckCard
        title="Daily digest"
        description="Sent at 8 AM"
        onChange={change}
      />,
    );
    const box = field("checkbox", "Daily digest");
    expect(box).toBeInstanceOf(HTMLInputElement);
    expect(box).toHaveAccessibleDescription("Sent at 8 AM");
    await user.click(screen.getByText("Daily digest"));
    expect(box).toBeChecked();
    expect(change.mock.calls).toEqual([[true]]);
    box.focus();
    await user.keyboard("[Space]");
    expect(box).not.toBeChecked();
    expect(change.mock.calls).toEqual([[true], [false]]);
  });

  it("keeps caller-controlled state and passes accessible input attributes", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(
      <CheckCard
        title="Visible"
        aria-label="Override"
        checked={false}
        onChange={change}
      />,
    );
    const box = field("checkbox", "Override");
    await user.click(box);
    expect(change).toHaveBeenCalledExactlyOnceWith(true);
    expect(box).not.toBeChecked();
    rerender(
      <CheckCard
        title="Visible"
        aria-label="Override"
        checked
        onChange={change}
      />,
    );
    expect(box).toBeChecked();
  });

  it("keeps extra actions outside the native label and blocks disabled or loading selection", async () => {
    const user = userEvent.setup();
    const selected = vi.fn();
    const action = vi.fn();
    const submit = vi.fn((e) => e.preventDefault());
    render(
      <form onSubmit={submit}>
        <CheckCard
          title="Standard"
          onChange={selected}
          extra={
            <button type="button" onClick={action}>
              Details
            </button>
          }
        />
        <CheckCard title="Unavailable" disabled onChange={selected} />
        <CheckCard title="Loading" loading onChange={selected} />
      </form>,
    );
    const extra = screen.getByRole("button", { name: "Details" });
    expect(extra.closest("label")).toBeNull();
    await user.click(extra);
    await user.click(screen.getByText("Unavailable"));
    await user.click(screen.getByText("Loading"));
    expect(action).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
    expect(selected).not.toHaveBeenCalled();
    expect(field("checkbox", "Standard")).not.toBeChecked();
    expect(field("checkbox", "Unavailable")).toBeDisabled();
    expect(field("checkbox", "Loading")).toBeDisabled();
  });

  it("uses an independent native radio group through CardGroup and supports generated names and options", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <>
        <CheckCard.Group legend="Plan" defaultValue="a" onChange={change}>
          <CardGroup columns={2}>
            <CardGroup.Item>
              <CheckCard value="a" title="Basic" />
            </CardGroup.Item>
            <CardGroup.Item>
              <CheckCard value="b" title="Pro" />
            </CardGroup.Item>
          </CardGroup>
        </CheckCard.Group>
        <CheckCard.Group
          legend="Period"
          defaultValue="m"
          options={[{ value: "m", title: "Monthly" }]}
        />
      </>,
    );
    const plan = screen.getByRole("radiogroup", { name: "Plan" });
    const basic = within(plan).getByRole("radio", { name: "Basic" });
    const pro = within(plan).getByRole("radio", { name: "Pro" });
    const monthly = field("radio", "Monthly");
    expect(basic).toHaveAttribute("name", pro.getAttribute("name"));
    expect(monthly.getAttribute("name")).not.toBe(pro.getAttribute("name"));
    expect(basic).toBeChecked();
    await user.click(pro);
    expect(change).toHaveBeenCalledExactlyOnceWith("b");
    expect(pro).toBeChecked();
    expect(basic).not.toBeChecked();
    expect(monthly).toBeChecked();
  });

  it("preserves native single value and repeated multiple entries with reset back to defaults", async () => {
    const user = userEvent.setup();
    const groupChange = vi.fn();
    const { container } = render(
      <form>
        <CheckCard
          title="Subscribe"
          name="subscribe"
          value="yes"
          defaultChecked
        />
        <CheckCard.Group
          name="plan"
          defaultValue="a"
          onChange={groupChange}
          options={[
            { value: "a", title: "Basic" },
            { value: "b", title: "Pro" },
          ]}
        />
        <CheckCard.Group
          multiple
          name="topics"
          defaultValue={["one"]}
          options={[
            { value: "one", title: "One" },
            { value: "two", title: "Two" },
            { value: "three", title: "Three", disabled: true },
          ]}
        />
        <button type="reset">Reset</button>
      </form>,
    );
    const form = container.querySelector("form")!;
    expect(Object.fromEntries(new FormData(form))).toEqual({
      subscribe: "yes",
      plan: "a",
      topics: "one",
    });
    await user.click(field("checkbox", "Subscribe"));
    await user.click(field("radio", "Pro"));
    await user.click(field("checkbox", "Two"));
    expect(new FormData(form).get("subscribe")).toBeNull();
    expect(new FormData(form).get("plan")).toBe("b");
    expect(new FormData(form).getAll("topics")).toEqual(["one", "two"]);
    expect(field("checkbox", "Three")).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(field("checkbox", "Subscribe")).toBeChecked();
    expect(field("radio", "Basic")).toBeChecked();
    expect(field("radio", "Pro")).not.toBeChecked();
    expect(field("checkbox", "One")).toBeChecked();
    expect(field("checkbox", "Two")).not.toBeChecked();
    expect(groupChange).toHaveBeenCalledExactlyOnceWith("b");
  });

  it("preserves controlled checkedness after native reset and honors a canceled reset", async () => {
    const user = userEvent.setup();
    const notify = vi.fn();
    const { container, rerender } = render(
      <form>
        <CheckCard title="Controlled" checked={false} onChange={notify} />
      </form>,
    );
    rerender(
      <form>
        <CheckCard title="Controlled" checked onChange={notify} />
      </form>,
    );
    const form = container.querySelector("form")!;
    await act(async () => form.reset());
    await waitFor(() => expect(field("checkbox", "Controlled")).toBeChecked());
    expect(notify).not.toHaveBeenCalled();
    rerender(
      <form onReset={(event) => event.preventDefault()}>
        <CheckCard.Group
          multiple
          defaultValue={[]}
          options={[{ title: "Keep", value: "keep" }]}
        />
      </form>,
    );
    await user.click(field("checkbox", "Keep"));
    await act(async () => form.reset());
    expect(field("checkbox", "Keep")).toBeChecked();
  });

  it("submits controlled multiple changes without updating checked state until the caller supplies the value", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(
      <CheckCard.Group
        multiple
        value={["a"]}
        onChange={change}
        options={[
          { value: "a", title: "Alpha" },
          { value: "b", title: "Beta" },
        ]}
      />,
    );
    await user.click(field("checkbox", "Beta"));
    expect(change).toHaveBeenCalledExactlyOnceWith(["a", "b"]);
    expect(field("checkbox", "Beta")).not.toBeChecked();
  });

  it("inherits loading, group form and name without leaking child overrides", () => {
    const { container } = render(
      <>
        <form id="group-owner" />
        <form id="child-owner" />
        <CheckCard.Group
          loading
          name="group-choice"
          form="group-owner"
          defaultValue="main"
        >
          <CheckCard
            value="main"
            name="child-name"
            form="child-owner"
            title="Main"
          />
        </CheckCard.Group>
      </>,
    );
    const main = field("radio", "Main") as HTMLInputElement;
    expect(main).toBeDisabled();
    expect(main).toHaveAttribute("aria-busy", "true");
    expect(main).toHaveAttribute("name", "group-choice");
    expect(main.form).toBe(container.querySelector("#group-owner"));
  });

  it("preserves the latest controlled radio value after the form reset event updates the caller", async () => {
    function Example() {
      const [value, setValue] = React.useState("x");
      return (
        <form onReset={() => setValue("y")}>
          <CheckCard.Group
            name="plan"
            value={value}
            options={[
              { value: "x", title: "Initial" },
              { value: "y", title: "Latest" },
            ]}
          />
          <button type="reset">Reset choice</button>
        </form>
      );
    }
    const user = userEvent.setup();
    render(<Example />);
    expect(field("radio", "Initial")).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Reset choice" }));
    await waitFor(() => expect(field("radio", "Latest")).toBeChecked());
    expect(field("radio", "Initial")).not.toBeChecked();
  });

  it("validates native required controls, supports an external form, and displays presentation slots", () => {
    const { container } = render(
      <>
        <form id="check-card-external" />
        <CheckCard.Group
          name="requiredPlan"
          form="check-card-external"
          required
          legend="Required plan"
        >
          <CheckCard
            value="yes"
            title="Yes"
            avatar={<span>AV</span>}
            cover={<span>Cover</span>}
            size="lg"
            bordered={false}
          >
            Detail
          </CheckCard>
        </CheckCard.Group>
      </>,
    );
    const yes = field("radio", "Yes") as HTMLInputElement;
    const form = container.querySelector("form")!;
    expect(yes.form).toBe(form);
    expect(form.checkValidity()).toBe(false);
    fireEvent.click(yes);
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).get("requiredPlan")).toBe("yes");
    expect(screen.getByText("AV")).toBeInTheDocument();
    expect(screen.getByText("Cover")).toBeInTheDocument();
    expect(screen.getByText("Detail")).toBeInTheDocument();
  });
});
