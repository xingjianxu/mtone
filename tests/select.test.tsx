import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Form, Input, MtoneProvider, Select } from "../packages/mtone/src";

const grouped = [
  { label: "Systems", options: [
    { value: "", label: <strong>Default workspace</strong>, searchText: "Fallback original" },
    { value: "vault", label: "Vault" },
    { value: "locked", label: "Locked", disabled: true },
  ] },
  { label: "Services", options: [{ value: "desk", label: "Help desk" }] },
];

test("unifies multiple mode without stringifying rich labels or removing disabled selections", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  const { container } = render(<MtoneProvider locale="en"><form>
    <Select mode="multiple" label="Projects" name="projects" clearable
      options={grouped} defaultValue={["", "locked"]} onValueChange={changed} />
  </form></MtoneProvider>);
  const field = screen.getByRole("combobox", { name: "Projects" });
  expect(screen.getByText("Default workspace").tagName).toBe("STRONG");
  expect(screen.queryByRole("button", { name: "Remove Locked" })).not.toBeInTheDocument();
  await user.type(field, "{Backspace}");
  expect(changed).not.toHaveBeenCalled();
  await user.keyboard("{Escape}");
  await user.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(changed).toHaveBeenCalledWith(["locked"]);
  const form = container.querySelector("form")!;
  expect(new FormData(form).getAll("projects")).toEqual(["locked"]);
  await act(async () => form.reset());
  expect(new FormData(form).getAll("projects")).toEqual(["", "locked"]);
  expect(screen.getByText("Default workspace")).toBeVisible();
});

test("searchable single renders named groups and rich options, clears, and preserves committed form values", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  const { container } = render(<MtoneProvider locale="en"><form>
    <Select searchable clearable label="Project" name="project" options={grouped}
      required defaultValue="desk" onValueChange={changed} />
  </form></MtoneProvider>);
  const trigger = screen.getByRole("combobox", { name: "Project" });
  const form = container.querySelector("form")!;
  await user.click(trigger);
  const search = await screen.findByRole("combobox", { name: "Search options" });
  expect(screen.getByRole("group", { name: "Systems" })).toBeVisible();
  expect(screen.getByRole("group", { name: "Services" })).toBeVisible();
  await user.type(search, "missing");
  expect(screen.getByRole("status")).toHaveTextContent("No results");
  expect(new FormData(form).get("project")).toBe("desk");
  await user.clear(search);
  await user.type(search, "fallback");
  expect(screen.queryByRole("group", { name: "Services" })).not.toBeInTheDocument();
  const option = screen.getByRole("option", { name: "Default workspace" });
  expect(within(option).getByText("Default workspace").tagName).toBe("STRONG");
  await user.click(option);
  expect(changed).toHaveBeenLastCalledWith("");
  expect(within(trigger).getByText("Default workspace").tagName).toBe("STRONG");
  expect(new FormData(form).get("project")).toBe("");
  expect(form.checkValidity()).toBe(true);
  await user.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(changed).toHaveBeenLastCalledWith(null);
  expect(form.checkValidity()).toBe(false);
  await act(async () => form.reset());
  expect(trigger).toHaveTextContent("Help desk");
});

test("Form.Item normalizes empty unified multiple and single values by component mode", async () => {
  const user = userEvent.setup();
  const finish = vi.fn();
  let form!: ReturnType<typeof Form.useForm>[0];
  function Example() {
    [form] = Form.useForm();
    return <Form form={form} onFinish={finish}>
      <Form.Item name="single" label="Single"><Select clearable options={grouped} /></Form.Item>
      <Form.Item name="multiple" label="Multiple"><Select mode="multiple" clearable options={grouped} /></Form.Item>
      <button type="submit">Submit</button>
    </Form>;
  }
  render(<Example />);
  await user.click(screen.getByRole("combobox", { name: "Single" }));
  await user.click(await screen.findByRole("option", { name: "Vault" }));
  await user.type(screen.getByRole("combobox", { name: "Multiple" }), "desk");
  await user.click(await screen.findByRole("option", { name: "Help desk" }));
  expect(form.getFieldsValue()).toEqual({ single: "vault", multiple: ["desk"] });
  await user.click(screen.getByRole("button", { name: "Submit" }));
  expect(finish).toHaveBeenCalledWith({ single: "vault", multiple: ["desk"] });
});

test.each(["inferred required", "explicit rule"])("managed Select treats an empty-string choice as present (%s)", async (mode) => {
  const ruleProps = mode === "inferred required"
    ? { required: true }
    : { rules: [{ required: true, message: "Choose a workspace" }] };
  const user = userEvent.setup();
  const finish = vi.fn(), failed = vi.fn();
  render(
    <MtoneProvider locale="en">
      <Form onFinish={finish} onFinishFailed={failed} validateTrigger={false}>
        <Form.Item name="workspace" label="Workspace" {...ruleProps}>
          <Select clearable options={grouped} />
        </Form.Item>
        <Form.Item name="text" label="Text" required><Input /></Form.Item>
        <button type="submit">Submit</button>
      </Form>
    </MtoneProvider>,
  );
  await user.click(screen.getByRole("combobox", { name: "Workspace" }));
  await user.click(await screen.findByRole("option", { name: "Default workspace" }));
  const submit = screen.getByRole("button", { name: "Submit" });
  await user.click(submit);
  expect(failed).toHaveBeenCalledOnce();
  expect(failed.mock.calls[0][0].errorFields.map((field: { name: string }) => field.name)).toEqual(["text"]);

  await user.type(screen.getByRole("textbox", { name: "Text" }), "example");
  await user.click(submit);
  expect(finish).toHaveBeenCalledExactlyOnceWith({ workspace: "", text: "example" });

  await user.click(screen.getByRole("button", { name: "Clear selection" }));
  await user.click(submit);
  expect(failed).toHaveBeenCalledTimes(2);
  expect(failed.mock.calls[1][0]).toMatchObject({
    values: { workspace: null, text: "example" },
    errorFields: [{ name: "workspace", errors: [expect.any(String)] }],
  });
});
