import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
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

test.each(["multiple", "tags"] as const)("%s labels render a decorative X in the accessible remove button", async (mode) => {
  const user = userEvent.setup();
  const changed = vi.fn();
  render(<MtoneProvider locale="en">
    <Select mode={mode} label="Topics" options={[{ value: "vault", label: "Vault" }]}
      defaultValue={["vault"]} onValueChange={changed} />
  </MtoneProvider>);
  const remove = screen.getByRole("button", { name: "Remove Vault" });
  expect(remove.querySelector("svg.lucide-x")).toHaveAttribute("aria-hidden", "true");
  await user.click(remove);
  expect(changed).toHaveBeenCalledWith([]);
});

test("searchable single uses the only combobox in its surface and keeps grouped rich choices and native values", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  const { container } = render(<MtoneProvider locale="en"><form>
    <Select searchable clearable label="Project" name="project" options={grouped}
      placeholder="Choose a project" searchPlaceholder="Find projects"
      required defaultValue="desk" onValueChange={changed} />
  </form></MtoneProvider>);
  const search = screen.getByRole("combobox", { name: "Project" });
  const form = container.querySelector("form")!;
  expect(search).toBeInstanceOf(HTMLInputElement);
  expect(search).toHaveValue("Help desk");
  expect(search).toHaveAttribute("placeholder", "Choose a project");
  await user.click(search);
  expect(search).toHaveFocus();
  expect(search).toHaveValue("");
  expect(search).toHaveAttribute("placeholder", "Find projects");
  expect(screen.getAllByRole("combobox")).toEqual([search]);
  expect(screen.getByRole("group", { name: "Systems" })).toBeVisible();
  expect(screen.getByRole("group", { name: "Services" })).toBeVisible();
  await user.type(search, "missing");
  expect(screen.getByRole("status")).toHaveTextContent("No results");
  expect(new FormData(form).get("project")).toBe("desk");
  expect(changed).not.toHaveBeenCalled();
  await user.clear(search);
  await user.type(search, "fallback");
  expect(screen.queryByRole("group", { name: "Services" })).not.toBeInTheDocument();
  const option = screen.getByRole("option", { name: "Default workspace" });
  expect(within(option).getByText("Default workspace").tagName).toBe("STRONG");
  await user.click(option);
  expect(changed).toHaveBeenCalledExactlyOnceWith("");
  expect(container.querySelector(".mt-select strong")).toHaveTextContent("Default workspace");
  expect(search).toHaveAccessibleDescription("Default workspace");
  expect(search).toHaveFocus();
  expect(new FormData(form).get("project")).toBe("");
  expect(form.checkValidity()).toBe(true);
  await user.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(changed).toHaveBeenLastCalledWith(null);
  expect(search).toHaveFocus();
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  expect(form.checkValidity()).toBe(false);
  await act(async () => form.reset());
  expect(search).toHaveValue("Help desk");
});

test("searchable single drops a draft on Escape, outside press and blur without changing committed state", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<MtoneProvider locale="en">
    <Select searchable label="Workspace" options={grouped} value="unknown-id" onValueChange={onChange} />
    <button type="button">Outside</button>
  </MtoneProvider>);
  const field = screen.getByRole("combobox", { name: "Workspace" });
  const outside = screen.getByRole("button", { name: "Outside" });
  expect(field).toHaveValue("unknown-id");
  field.focus();
  await user.keyboard("{Backspace}");
  expect(screen.getByRole("listbox")).toBeVisible();
  expect(field).toHaveValue("");
  expect(onChange).not.toHaveBeenCalled();
  await user.keyboard("{Escape}");
  expect(field).toHaveValue("unknown-id");
  await user.keyboard("vault");
  expect(await screen.findByRole("option", { name: "Vault" })).toBeVisible();
  await user.keyboard("{Escape}");
  expect(field).toHaveValue("unknown-id");
  expect(field).toHaveFocus();
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  await user.type(field, "new");
  await user.click(outside);
  expect(field).toHaveValue("unknown-id");
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  await user.click(field);
  await user.type(field, "query");
  await user.tab();
  expect(outside).toHaveFocus();
  expect(field).toHaveValue("unknown-id");
  expect(onChange).not.toHaveBeenCalled();
});

test("searchable single never implicitly submits a form on Enter and respects IME confirmation", async () => {
  const user = userEvent.setup();
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
  const changed = vi.fn();
  render(<MtoneProvider locale="en"><form onSubmit={submit}>
    <Select searchable label="Workspace" options={[{ value: "im", label: "内蒙古" }, { value: "disabled", label: "Restricted", disabled: true }]}
      onValueChange={changed} />
    <button type="submit">Submit</button>
  </form></MtoneProvider>);
  const field = screen.getByRole("combobox", { name: "Workspace" });
  await user.tab();
  expect(field).toHaveFocus();
  await user.keyboard("{Enter}");
  expect(screen.getByRole("listbox")).toBeVisible();
  await user.type(field, "not found");
  await user.keyboard("{Enter}");
  expect(submit).not.toHaveBeenCalled();
  expect(changed).not.toHaveBeenCalled();
  await user.click(field);
  await user.type(field, "Restricted{Enter}");
  expect(changed).not.toHaveBeenCalled();
  await user.keyboard("{Escape}");
  await user.click(field);
  fireEvent.compositionStart(field);
  fireEvent.input(field, { target: { value: "内蒙古" }, inputType: "insertCompositionText", isComposing: true });
  fireEvent.keyDown(field, { key: "Enter", isComposing: true, keyCode: 229 });
  expect(changed).not.toHaveBeenCalled();
  fireEvent.compositionEnd(field, { data: "内蒙古" });
  expect(await screen.findByRole("option", { name: "内蒙古" })).toBeVisible();
  fireEvent.keyDown(field, { key: "Enter", keyCode: 229 });
  expect(changed).not.toHaveBeenCalled();
  await user.keyboard("{Enter}");
  expect(changed).toHaveBeenCalledExactlyOnceWith("im");
  expect(field).toHaveValue("内蒙古");
  expect(submit).not.toHaveBeenCalled();
});

test("Form.Item normalizes empty unified multiple and single values by component mode", async () => {
  const user = userEvent.setup();
  const finish = vi.fn();
  let form!: ReturnType<typeof Form.useForm>[0];
  function Example() {
    [form] = Form.useForm();
    return <Form form={form} onFinish={finish}>
      <Form.Item name="single" label="Single"><Select searchable clearable options={grouped} /></Form.Item>
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

test("multiple clear and dropdown share a trailing slot without taking away either keyboard action", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const openChange = vi.fn();
  render(<MtoneProvider locale="en">
    <Select mode="multiple" label="Shared actions" clearable
      options={grouped} defaultValue={["vault", "locked"]} onValueChange={change} onOpenChange={openChange} />
  </MtoneProvider>);

  const input = screen.getByRole("combobox", { name: "Shared actions" });
  const open = screen.getByRole("button", { name: "Show options" });
  const clear = screen.getByRole("button", { name: "Clear selection" });
  const slot = clear.parentElement;
  expect(slot).toHaveClass("mt-select-action-slot");
  expect(open.parentElement).toBe(slot);
  expect(clear).toHaveAttribute("tabindex", "0");

  await user.click(input);
  expect(await screen.findByRole("listbox")).toBeVisible();
  await user.keyboard("{Escape}");
  openChange.mockClear();
  clear.focus();
  await user.keyboard("{Enter}");
  expect(change).toHaveBeenCalledExactlyOnceWith(["locked"]);
  expect(openChange).not.toHaveBeenCalled();
  expect(input).toHaveFocus();
  expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Clear selection" })).not.toBeInTheDocument();
});

test("tags select existing choices and commit trimmed custom strings by Enter or option click without mutating options", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const options = [...grouped, { value: "saved-roadmaps", label: "roadmaps" }];
  const { container } = render(<MtoneProvider locale="en"><form>
    <Select mode="tags" label="Topic tags" name="topics" required clearable
      options={options} defaultValue={["older tag"]} onValueChange={change} />
  </form></MtoneProvider>);
  const field = screen.getByRole("combobox", { name: "Topic tags" });
  const form = container.querySelector("form")!;
  expect(screen.getByText("older tag")).toBeVisible();
  await user.type(field, "  roadmap  ");
  expect(await screen.findByRole("option", { name: "Create “roadmap”" })).toBeVisible();
  expect(screen.getByRole("option", { name: "roadmaps" })).toBeVisible();
  await user.keyboard("{Enter}");
  expect(change).toHaveBeenLastCalledWith(["older tag", "roadmap"]);
  expect(field).toHaveValue("");

  await user.type(field, "Help desk");
  expect(screen.queryByRole("option", { name: "Create “Help desk”" })).not.toBeInTheDocument();
  await user.click(screen.getByRole("option", { name: "Help desk" }));
  expect(change).toHaveBeenLastCalledWith(["older tag", "roadmap", "desk"]);
  await user.type(field, "green, blue");
  await user.click(await screen.findByRole("option", { name: "Create “green, blue”" }));
  expect(new FormData(form).getAll("topics")).toEqual(["older tag", "roadmap", "desk", "green, blue"]);
  expect(options.map((option) => "options" in option ? option.options.map((entry) => entry.value) : option.value))
    .toEqual([["", "vault", "locked"], ["desk"], "saved-roadmaps"]);

  await user.type(field, "uncommitted");
  await act(async () => form.reset());
  expect(field).toHaveValue("");
  expect(new FormData(form).getAll("topics")).toEqual(["older tag"]);
});

test("tags do not create empty, selected, known-id, or disabled plain-label duplicates, or on blur", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<MtoneProvider locale="en">
    <Select mode="tags" label="Tags" defaultValue={["custom", "FIRST"]} onValueChange={change}
      options={[{ value: "LOCK", label: "Restricted", disabled: true }, { value: "ID-2", label: "Second" }, { value: "FIRST", label: "First" }]} />
    <button type="button">Outside</button>
  </MtoneProvider>);
  const field = screen.getByRole("combobox", { name: "Tags" });
  const outside = screen.getByRole("button", { name: "Outside" });
  for (const draft of ["  ", "custom", "LOCK", "Restricted", "FIRST", "First"]) {
    await user.clear(field);
    await user.type(field, draft);
    expect(screen.queryByRole("option", { name: /^Create/ })).not.toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(change).not.toHaveBeenCalled();
  }
  await user.clear(field);
  await user.type(field, "ID-2");
  expect(screen.getByRole("option", { name: "Second" })).toBeVisible();
  expect(screen.queryByRole("option", { name: /^Create/ })).not.toBeInTheDocument();
  await user.clear(field);
  await user.type(field, "just a draft");
  await user.click(outside);
  expect(change).not.toHaveBeenCalled();
});

test("tags wait for explicit Enter after the IME confirms text", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<MtoneProvider locale="en"><Select mode="tags" label="Tags" options={[]} onValueChange={change} /></MtoneProvider>);
  const field = screen.getByRole("combobox", { name: "Tags" });
  await user.click(field);
  fireEvent.compositionStart(field);
  fireEvent.input(field, { target: { value: "内蒙古" }, inputType: "insertCompositionText", isComposing: true });
  fireEvent.keyDown(field, { key: "Enter", isComposing: true, keyCode: 229 });
  expect(change).not.toHaveBeenCalled();
  fireEvent.compositionEnd(field, { data: "内蒙古" });
  expect(await screen.findByRole("option", { name: "Create “内蒙古”" })).toBeVisible();
  fireEvent.keyDown(field, { key: "Enter", keyCode: 229 });
  expect(change).not.toHaveBeenCalled();
  await user.keyboard("{Enter}");
  expect(change).toHaveBeenCalledExactlyOnceWith(["内蒙古"]);
});

test("Form.Item collects tags as string arrays and treats an empty array as required", async () => {
  const user = userEvent.setup();
  const finish = vi.fn(), failed = vi.fn();
  render(<MtoneProvider locale="en"><Form onFinish={finish} onFinishFailed={failed}>
    <Form.Item name="topics" label="Tags" required>
      <Select mode="tags" options={[]} clearable />
    </Form.Item>
    <button type="submit">Submit</button>
  </Form></MtoneProvider>);
  const field = screen.getByRole("combobox", { name: "Tags" });
  await user.click(screen.getByRole("button", { name: "Submit" }));
  expect(failed).toHaveBeenCalledOnce();
  await user.type(field, "paper{Enter}");
  await user.click(screen.getByRole("button", { name: "Submit" }));
  expect(finish).toHaveBeenCalledExactlyOnceWith({ topics: ["paper"] });
});

test("ordinary multiple Select does not offer a custom option", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  render(<MtoneProvider locale="en">
    <Select mode="multiple" label="Fixed choices" options={[]} onValueChange={changed} />
  </MtoneProvider>);
  await user.type(screen.getByRole("combobox", { name: "Fixed choices" }), "new choice{Enter}");
  expect(screen.queryByRole("option", { name: /^Create/ })).not.toBeInTheDocument();
  expect(changed).not.toHaveBeenCalled();
});

test("only ordinary single Select measures placeholder and every option label independently of the current value", async () => {
  const user = userEvent.setup();
  const { container } = render(
    <MtoneProvider locale="en">
      <Select label="Plain" clearable placeholder="Choose" options={grouped} defaultValue="vault" />
      <Select label="Inline search" searchable options={grouped} />
      <Select label="Popup search" searchable="popup" options={grouped} />
      <Select label="Multiple" mode="multiple" options={grouped} />
      <Select label="Tags" mode="tags" options={grouped} />
    </MtoneProvider>,
  );
  const select = screen.getByRole("combobox", { name: "Plain" });
  const measure = select.querySelector(".mt-select-measure");
  expect(container.querySelectorAll(".mt-select-measure")).toHaveLength(1);
  expect(measure).toHaveAttribute("aria-hidden", "true");
  const candidates = "Choose\nDefault workspace\nVault\nLocked\nHelp desk";
  expect(measure).toHaveAttribute("data-labels", candidates);
  expect(screen.queryByText("Help desk")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(select).toHaveTextContent("Choose");
  expect(measure).toHaveAttribute("data-labels", candidates);
});
