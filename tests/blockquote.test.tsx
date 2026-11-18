import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Blockquote, Typography } from "../packages/mtone/src/typography";

describe("Typography.Blockquote", () => {
  it("renders a semantic quote with a separate attribution and source URL", () => {
    const ref = React.createRef<HTMLQuoteElement>();
    const { container } = render(
      <Typography.Blockquote
        ref={ref}
        cite={<a href="/author">作者</a>}
        citeUrl="https://example.com/source"
        className="custom"
      >
        引用正文
      </Typography.Blockquote>,
    );
    expect(Typography.Blockquote).toBe(Blockquote);
    expect(ref.current).toBe(container.querySelector("blockquote"));
    expect(ref.current).toHaveAttribute("cite", "https://example.com/source");
    expect(ref.current).toHaveClass("mt-blockquote", "custom");
    expect(
      screen.getByRole("link", { name: "作者" }).closest("footer"),
    ).not.toBeNull();
    expect(screen.getByText("引用正文")).toBeVisible();
  });
  it("omits unused attribution and icon without leaving empty spaces", () => {
    const { container } = render(<Blockquote>正文</Blockquote>);
    expect(container.querySelector("footer")).toBeNull();
    expect(container.querySelector(".mt-blockquote-icon")).toBeNull();
  });
  it("supports a decorative icon and custom presentation while preserving style overrides", () => {
    const { container } = render(
      <Blockquote
        icon={<svg data-testid="quote-icon" />}
        iconSize={30}
        color="#448361"
        radius={6}
        textWrap="balance"
        style={{ marginTop: 10 }}
        aria-label="引用"
      >
        正文
      </Blockquote>,
    );
    const quote = container.querySelector("blockquote")!;
    expect(quote).toHaveStyle({
      borderRadius: "6px",
      textWrap: "balance",
      marginTop: "10px",
    });
    expect(quote.style.getPropertyValue("--mt-blockquote-color")).toBe(
      "#448361",
    );
    expect(quote.style.getPropertyValue("--mt-blockquote-icon-size")).toBe(
      "30px",
    );
    expect(screen.getByTestId("quote-icon").parentElement).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(quote).toHaveAttribute("aria-label", "引用");
  });
});
