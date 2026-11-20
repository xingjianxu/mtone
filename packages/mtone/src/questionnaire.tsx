import * as React from "react";
import { Button, cn, useMtone } from "./basic";
import { Input, Textarea } from "./input";
import { Checkbox, RadioGroup } from "./interactive";
import { Progress } from "./progress";

export type QuestionnaireChoice = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
};
type Question = {
  id: string;
  title: string;
  description?: React.ReactNode;
  required?: boolean;
};
type TextField = { placeholder?: string; label?: string };
export type QuestionnaireItem = Question &
  (
    | {
        type: "single";
        choices: readonly QuestionnaireChoice[];
        other?: TextField;
      }
    | { type: "multiple"; choices: readonly QuestionnaireChoice[] }
    | ({ type: "text" } & TextField)
  );
export type QuestionnaireAnswer =
  | { type: "choice"; value: string }
  | { type: "choices"; values: readonly string[] }
  | { type: "text"; value: string };
export type QuestionnaireAnswers = Readonly<
  Partial<Record<string, QuestionnaireAnswer>>
>;
export interface QuestionnaireProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children" | "onSubmit"
> {
  items: readonly QuestionnaireItem[];
  answers?: QuestionnaireAnswers;
  defaultAnswers?: QuestionnaireAnswers;
  onAnswersChange?: (answers: QuestionnaireAnswers) => void;
  onSubmit: (answers: QuestionnaireAnswers) => void | Promise<void>;
  submitLabel?: React.ReactNode;
}
function validateItems(items: readonly QuestionnaireItem[]) {
  const ids = new Set<string>();
  for (const item of items) {
    if (ids.has(item.id))
      throw new Error(`Questionnaire duplicate item id: ${item.id}`);
    ids.add(item.id);
    if (
      item.type !== "text" &&
      new Set(item.choices.map(({ value }) => value)).size !==
        item.choices.length
    )
      throw new Error(
        `Questionnaire duplicate choice value in item: ${item.id}`,
      );
  }
}
const EMPTY: QuestionnaireAnswers = {};
function normalize(
  item: QuestionnaireItem,
  answer: QuestionnaireAnswer | undefined,
): QuestionnaireAnswer | undefined {
  if (
    answer?.type === "text" &&
    (item.type === "text" || (item.type === "single" && item.other))
  ) {
    const value = answer.value.trim();
    return value ? { type: "text", value } : undefined;
  }
  if (
    item.type === "single" &&
    answer?.type === "choice" &&
    item.choices.some(
      (choice) => !choice.disabled && choice.value === answer.value,
    )
  )
    return { ...answer };
  if (item.type === "multiple" && answer?.type === "choices") {
    const values = item.choices
      .filter(
        (choice) => !choice.disabled && answer.values.includes(choice.value),
      )
      .map((choice) => choice.value);
    return values.length ? { type: "choices", values } : undefined;
  }
  return undefined;
}

export function Questionnaire({
  items,
  answers,
  defaultAnswers = EMPTY,
  onAnswersChange,
  onSubmit,
  submitLabel,
  className,
  ...props
}: QuestionnaireProps) {
  const zh = useMtone().locale === "zh";
  const id = React.useId();
  validateItems(items);
  const [draft, setDraft] = React.useState(defaultAnswers);
  const [step, setStep] = React.useState(0);
  const [error, setError] = React.useState<"required" | "submit">();
  const [phase, setPhase] = React.useState<"editing" | "submitting" | "done">(
    "editing",
  );
  const submitting = React.useRef(false);
  const heading = React.useRef<HTMLHeadingElement>(null);
  const shouldFocus = React.useRef(false);
  const index = Math.min(step, Math.max(items.length - 1, 0));
  const item = items[index];
  const current = answers ?? draft;
  React.useEffect(() => {
    if (shouldFocus.current) {
      heading.current?.focus();
      shouldFocus.current = false;
    }
  }, [index, phase, error]);
  const go = (next: number) => {
    shouldFocus.current = true;
    setError(undefined);
    setStep(next);
  };
  const update = (next: QuestionnaireAnswers) => {
    if (answers === undefined) setDraft(next);
    onAnswersChange?.(next);
  };
  const answer =
    item && Object.hasOwn(current, item.id) ? current[item.id] : undefined;
  const change = (next: QuestionnaireAnswer) => {
    if (submitting.current) return;
    setError(undefined);
    update({ ...current, [item.id]: next });
  };
  const finish = async (values: QuestionnaireAnswers) => {
    const snapshot: [string, QuestionnaireAnswer][] = [];
    for (const [position, question] of items.entries()) {
      const valid = normalize(
        question,
        Object.hasOwn(values, question.id) ? values[question.id] : undefined,
      );
      if (!valid && question.required) {
        shouldFocus.current = true;
        setStep(position);
        setError("required");
        heading.current?.focus();
        return;
      }
      if (valid) snapshot.push([question.id, valid]);
    }
    submitting.current = true;
    setError(undefined);
    setPhase("submitting");
    try {
      await onSubmit(Object.fromEntries(snapshot));
      shouldFocus.current = true;
      setPhase("done");
    } catch {
      submitting.current = false;
      shouldFocus.current = true;
      setPhase("editing");
      setError("submit");
    }
  };
  const advance = (skip = false) => {
    if (submitting.current || (skip && item.required)) return;
    let values = current;
    if (skip) {
      const { [item.id]: _discarded, ...rest } = current;
      values = rest;
      if (Object.hasOwn(current, item.id)) update(values);
    } else if (item.required && !normalize(item, answer)) {
      setError("required");
      heading.current?.focus();
      return;
    }
    if (index === items.length - 1) void finish(values);
    else go(index + 1);
  };
  const titleId = `${id}-title`,
    descriptionId = `${id}-description`,
    errorId = `${id}-error`;
  const described =
    [
      item?.description != null && descriptionId,
      error === "required" && errorId,
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  const disabled = phase === "submitting";
  let otherValue = "__other";
  let noneValue = "__none";
  if (item?.type === "single") {
    const values = new Set(item.choices.map((choice) => choice.value));
    while (values.has(otherValue)) otherValue += "_";
    while (values.has(noneValue)) noneValue += "_";
  }
  let content: React.ReactNode;
  if (phase === "done")
    content = (
      <h3 ref={heading} tabIndex={-1}>
        {zh ? "已提交答卷" : "Responses submitted"}
      </h3>
    );
  else if (!item) content = <p>{zh ? "暂无问题" : "No questions"}</p>;
  else {
    const text = answer?.type === "text" ? answer.value : "";
    const selected = answer?.type === "choices" ? answer.values : [];
    const progress = zh
      ? `第 ${index + 1} 题，共 ${items.length} 题`
      : `Question ${index + 1} of ${items.length}`;
    content = (
      <>
        <div className="mt-questionnaire-progress">
          <span>{progress}</span>
          <Progress
            value={(100 * (index + 1)) / items.length}
            label={progress}
          />
        </div>
        <div
          className="mt-questionnaire-main"
          key={item.id}
          role={item.type === "single" ? undefined : "group"}
          aria-labelledby={titleId}
          aria-describedby={described}
        >
          <h3 id={titleId} ref={heading} tabIndex={-1}>
            {item.title}
          </h3>
          {item.description != null && (
            <div id={descriptionId} className="mt-questionnaire-description">
              {item.description}
            </div>
          )}
          {item.type === "single" && (
            <>
              <RadioGroup
                aria-labelledby={titleId}
                aria-describedby={described}
                aria-required={item.required}
                aria-invalid={error === "required" || undefined}
                options={[
                  ...item.choices,
                  ...(item.other
                    ? [
                        {
                          value: otherValue,
                          label: item.other.label ?? (zh ? "其他" : "Other"),
                        },
                      ]
                    : []),
                ]}
                value={
                  answer?.type === "choice"
                    ? answer.value
                    : answer?.type === "text" && item.other
                      ? otherValue
                      : noneValue
                }
                onValueChange={(value) =>
                  change(
                    value === otherValue
                      ? { type: "text", value: "" }
                      : { type: "choice", value },
                  )
                }
                disabled={disabled}
              />
              {item.other && answer?.type === "text" && (
                <Input
                  aria-label={
                    item.other.label ?? (zh ? "其他答案" : "Other answer")
                  }
                  aria-describedby={described}
                  aria-invalid={error === "required" || undefined}
                  placeholder={item.other.placeholder}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing)
                      e.preventDefault();
                  }}
                  value={text}
                  disabled={disabled}
                  onChange={(e) =>
                    change({ type: "text", value: e.currentTarget.value })
                  }
                />
              )}
            </>
          )}
          {item.type === "multiple" && (
            <div className="mt-questionnaire-checks">
              {item.choices.map((choice) => (
                <Checkbox
                  key={choice.value}
                  checked={selected.includes(choice.value)}
                  disabled={disabled || choice.disabled}
                  onCheckedChange={(checked) => {
                    const next = new Set(selected);
                    if (checked) next.add(choice.value);
                    else next.delete(choice.value);
                    change({
                      type: "choices",
                      values: item.choices
                        .filter(
                          (option) =>
                            !option.disabled && next.has(option.value),
                        )
                        .map((option) => option.value),
                    });
                  }}
                >
                  {choice.label}
                </Checkbox>
              ))}
            </div>
          )}
          {item.type === "text" && (
            <Textarea
              rows={3}
              aria-label={item.label ?? item.title}
              aria-describedby={described}
              aria-invalid={error === "required" || undefined}
              aria-required={item.required}
              placeholder={item.placeholder}
              value={text}
              disabled={disabled}
              onChange={(e) =>
                change({ type: "text", value: e.currentTarget.value })
              }
            />
          )}
          {error && (
            <div id={errorId} role="alert" className="mt-questionnaire-error">
              {error === "required"
                ? zh
                  ? "请先回答本题。"
                  : "Answer this question to continue."
                : zh
                  ? "提交失败，请重试。"
                  : "Could not submit. Try again."}
            </div>
          )}
        </div>
        <div className="mt-questionnaire-actions">
          <Button
            type="button"
            variant="ghost"
            disabled={disabled || index === 0}
            onClick={() => go(index - 1)}
          >
            {zh ? "上一题" : "Previous"}
          </Button>
          <div className="mt-questionnaire-forward">
            {!item.required && (
              <Button
                type="button"
                variant="ghost"
                disabled={disabled}
                onClick={() => advance(true)}
              >
                {zh ? "跳过" : "Skip"}
              </Button>
            )}
            <Button
              type="button"
              loading={disabled}
              disabled={disabled}
              onClick={() => advance()}
            >
              {index === items.length - 1
                ? (submitLabel ?? (zh ? "提交" : "Submit"))
                : zh
                  ? "下一题"
                  : "Next"}
            </Button>
          </div>
        </div>
      </>
    );
  }
  return (
    <div
      {...props}
      className={cn("mt-questionnaire", className)}
      aria-busy={disabled || props["aria-busy"]}
    >
      {content}
    </div>
  );
}
