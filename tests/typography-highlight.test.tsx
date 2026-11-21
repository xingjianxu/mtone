import * as React from "react";
import { render, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { Typography } from "../packages/mtone/src/typography";

const track = vi.hoisted(() => ({ calls: vi.fn() }));
vi.mock(
  "../packages/mtone/src/typography-highlight",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../packages/mtone/src/typography-highlight")
      >();
    return {
      ...actual,
      highlightCode: (
        text: string,
        language: Parameters<typeof actual.highlightCode>[1],
      ) => {
        track.calls(text, language);
        if (text === "failed code")
          return Promise.reject(new Error("load failure"));
        return actual.highlightCode(text, language);
      },
    };
  },
);

const code = "  const x = <Main />;\r\n\r\n\t// hello\n";

it("progressively highlights approved languages while preserving exact code text", async () => {
  const { container } = render(
    <Typography.Code block language="tsx">
      {code}
    </Typography.Code>,
  );
  const rendered = container.querySelector("code")!;
  expect(rendered.textContent).toBe(code);
  await waitFor(() =>
    expect(rendered.querySelector("span.mt-code-token")).toBeInTheDocument(),
  );
  expect(rendered.textContent).toBe(code);
  expect(rendered.querySelector("main")).toBeNull();
  const keyword = [...rendered.querySelectorAll("span")].find(
    (item) => item.textContent === "const",
  )!;
  expect(keyword.style.getPropertyValue("--mt-code-token-light")).toMatch(
    /^#[\da-f]+$/i,
  );
  expect(keyword.style.getPropertyValue("--mt-code-token-dark")).not.toBe(
    keyword.style.getPropertyValue("--mt-code-token-light"),
  );
});

it("leaves inline, non-string, missing and unknown languages on the no-highlight path", async () => {
  track.calls.mockClear();
  const { container } = render(
    <>
      <Typography.Code language="tsx">const foo</Typography.Code>
      <Typography.Code block>const bar</Typography.Code>
      <Typography.Code block language="unknown">
        const baz
      </Typography.Code>
      <Typography.Code block language="tsx">
        <em>child element</em>
      </Typography.Code>
    </>,
  );
  expect(container.querySelector("[language]")).toBeNull();
  expect(container.querySelector("em")).toHaveTextContent("child element");
  expect(container.querySelector(".mt-code-token")).toBeNull();
  expect(track.calls).not.toHaveBeenCalled();
});

it("shows plain content on a lazy-load failure and does not show stale tokens", async () => {
  const { container, rerender } = render(
    <Typography.Code block language="tsx">
      {code}
    </Typography.Code>,
  );
  await waitFor(() =>
    expect(container.querySelector(".mt-code-token")).toBeInTheDocument(),
  );
  rerender(
    <Typography.Code block language="tsx">
      failed code
    </Typography.Code>,
  );
  const rendered = container.querySelector("code")!;
  expect(rendered.textContent).toBe("failed code");
  await waitFor(() =>
    expect(track.calls).toHaveBeenCalledWith("failed code", "tsx"),
  );
  expect(rendered.querySelector(".mt-code-token")).toBeNull();
});

it("renders plain escaped HTML on the server", () => {
  const markup = renderToStaticMarkup(
    <Typography.Code block language="html">
      {'<script>alert("x")</script>'}
    </Typography.Code>,
  );
  expect(markup).toContain("&lt;script&gt;");
  expect(markup).not.toContain("<script>");
  expect(markup).not.toContain("mt-code-token");
});
