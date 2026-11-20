import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  MtoneProvider,
  Questionnaire,
  type QuestionnaireItem,
} from "../packages/mtone/src";

beforeEach(() => {
  if (!window.PointerEvent) vi.stubGlobal("PointerEvent", MouseEvent);
});
afterEach(() => vi.unstubAllGlobals());
const items: QuestionnaireItem[] = [
  {
    id: "goal",
    type: "single",
    title: "Goal",
    required: true,
    choices: [
      { value: "learn", label: "Learn" },
      { value: "disabled", label: "Locked", disabled: true },
    ],
    other: { label: "Another goal" },
  },
  {
    id: "skills",
    type: "multiple",
    title: "Skills",
    choices: [
      { value: "code", label: "Coding" },
      { value: "design", label: "Design" },
    ],
  },
  { id: "notes", type: "text", title: "Notes", required: true },
];
const survey = (onSubmit = vi.fn()) => (
  <MtoneProvider locale="en">
    <Questionnaire items={items} onSubmit={onSubmit} />
  </MtoneProvider>
);
const button = (name: string) => screen.getByRole("button", { name });
test("validates required steps, preserves choices, clears an explicitly skipped answer, submits once", async () => {
  const user = userEvent.setup(),
    submit = vi.fn();
  render(survey(submit));
  expect(button("Previous")).toBeDisabled();
  expect(
    screen.queryByRole("button", { name: "Skip" }),
  ).not.toBeInTheDocument();
  await user.click(button("Next"));
  expect(screen.getByRole("alert")).toBeVisible();
  expect(screen.getByRole("radio", { name: "Locked" })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await user.click(screen.getByRole("radio", { name: "Learn" }));
  await user.click(button("Next"));
  expect(screen.getByRole("heading", { name: "Skills" })).toHaveFocus();
  await user.click(screen.getByRole("checkbox", { name: "Coding" }));
  await user.click(button("Next"));
  await user.click(button("Previous"));
  expect(screen.getByRole("checkbox", { name: "Coding" })).toBeChecked();
  await user.click(button("Previous"));
  expect(screen.getByRole("radio", { name: "Learn" })).toBeChecked();
  await user.click(button("Next"));
  await user.click(button("Skip"));
  await user.click(button("Previous"));
  expect(screen.getByRole("checkbox", { name: "Coding" })).not.toBeChecked();
  await user.click(button("Next"));
  await user.type(screen.getByRole("textbox", { name: "Notes" }), "   ");
  await user.click(button("Submit"));
  expect(submit).not.toHaveBeenCalled();
  await user.clear(screen.getByRole("textbox", { name: "Notes" }));
  await user.type(screen.getByRole("textbox", { name: "Notes" }), " Done ");
  await user.dblClick(button("Submit"));
  expect(submit).toHaveBeenCalledExactlyOnceWith({
    goal: { type: "choice", value: "learn" },
    notes: { type: "text", value: "Done" },
  });
  expect(screen.getByText("Responses submitted")).toBeVisible();
});
test("custom text is exclusive, multiple choices are ordered; parent form does not submit", async () => {
  const user = userEvent.setup(),
    submit = vi.fn(),
    outer = vi.fn((event) => event.preventDefault());
  render(<form onSubmit={outer}>{survey(submit)}</form>);
  await user.click(screen.getByRole("radio", { name: "Another goal" }));
  await user.click(button("Next"));
  expect(screen.getByRole("alert")).toBeVisible();
  await user.type(
    screen.getByRole("textbox", { name: "Another goal" }),
    " custom {Enter}",
  );
  expect(outer).not.toHaveBeenCalled();
  await user.click(button("Next"));
  await user.click(screen.getByRole("checkbox", { name: "Design" }));
  await user.click(screen.getByRole("checkbox", { name: "Coding" }));
  await user.click(button("Next"));
  await user.type(screen.getByRole("textbox", { name: "Notes" }), "text");
  await user.click(button("Submit"));
  expect(outer).not.toHaveBeenCalled();
  expect(submit).toHaveBeenCalledExactlyOnceWith({
    goal: { type: "text", value: "custom" },
    skills: { type: "choices", values: ["code", "design"] },
    notes: { type: "text", value: "text" },
  });
});
test("controlled answers report changes; final skip uses the cleared snapshot", async () => {
  const user = userEvent.setup(),
    submit = vi.fn(),
    change = vi.fn();
  render(
    <MtoneProvider locale="en">
      <Questionnaire
        items={[items[1]]}
        answers={{ skills: { type: "choices", values: ["code"] } }}
        onAnswersChange={change}
        onSubmit={submit}
      />
    </MtoneProvider>,
  );
  expect(screen.getByRole("checkbox", { name: "Coding" })).toBeChecked();
  await user.click(button("Skip"));
  expect(change).toHaveBeenCalledWith({});
  expect(submit).toHaveBeenCalledWith({});
});
test("retries rejected submission, preventing duplicates while pending", async () => {
  const user = userEvent.setup();
  let reject!: () => void;
  const submit = vi.fn().mockImplementationOnce(
    () =>
      new Promise<void>((_, r) => {
        reject = () => r(new Error("failure"));
      }),
  );
  render(
    <MtoneProvider locale="en">
      <Questionnaire
        items={[items[2]]}
        defaultAnswers={{ notes: { type: "text", value: "Draft" } }}
        onSubmit={submit}
      />
    </MtoneProvider>,
  );
  await user.click(button("Submit"));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(
    screen.getAllByRole("button").every((el) => el.hasAttribute("disabled")),
  ).toBe(true);
  reject();
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Could not submit",
  );
  await user.click(button("Submit"));
  expect(submit).toHaveBeenCalledTimes(2);
});

test("rejects ambiguous question ids and choice values", () => {
  expect(() =>
    render(<Questionnaire items={[items[0], items[0]]} onSubmit={() => {}} />),
  ).toThrow("duplicate item id");
  expect(() =>
    render(
      <Questionnaire
        items={[
          {
            id: "x",
            type: "multiple",
            title: "X",
            choices: [
              { value: "same", label: "A" },
              { value: "same", label: "B" },
            ],
          },
        ]}
        onSubmit={() => {}}
      />,
    ),
  ).toThrow("duplicate choice value");
});
