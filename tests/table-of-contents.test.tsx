import React, { createRef } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { expect, test, vi, afterEach } from "vitest";
import {
  TableOfContents,
  type TableOfContentsHandle,
} from "../packages/mtone/src";
afterEach(() => vi.restoreAllMocks());
test("collects scoped headings, excludes own label, retains ids and indents hierarchy", () => {
  render(
    <>
      <article id="article">
        <h2 id="intro">Intro</h2>
        <h3>Details</h3>
      </article>
      <h2>Outside</h2>
      <TableOfContents
        root={() => document.querySelector("#article")}
        title={<h2>Contents</h2>}
      />
    </>,
  );
  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(2);
  expect(links[0]).toHaveAttribute("href", "#intro");
  expect(links[1]).toHaveStyle({ paddingInlineStart: "20px" });
  expect(document.querySelector("h3")?.id).toBeTruthy();
});
test("updates dynamic headings and supports manual refresh when observation disabled", async () => {
  const ref = createRef<TableOfContentsHandle>();
  const { rerender } = render(
    <>
      <article id="article">
        <h2>A</h2>
      </article>
      <TableOfContents
        ref={ref}
        root={() => document.querySelector("#article")}
        observe={false}
      />
    </>,
  );
  document
    .querySelector("#article")!
    .insertAdjacentHTML("beforeend", "<h3>B</h3>");
  expect(screen.queryByRole("link", { name: "B" })).toBeNull();
  act(() => ref.current!.refresh());
  expect(screen.getByRole("link", { name: "B" })).toBeTruthy();
  rerender(
    <>
      <article id="article">
        <h2>A</h2>
      </article>
      <TableOfContents root={() => document.querySelector("#article")} />
    </>,
  );
  document
    .querySelector("#article")!
    .insertAdjacentHTML("beforeend", "<h3>C</h3>");
  await waitFor(() =>
    expect(screen.getByRole("link", { name: "C" })).toBeTruthy(),
  );
});
test("scrolls container with offset without changing hash and focuses heading", () => {
  const scrollTo = vi.fn();
  const onItemClick = vi.fn();
  render(
    <>
      <article id="article">
        <h2 id="a">A</h2>
        <h2 id="b">B</h2>
      </article>
      <TableOfContents
        root={() => document.querySelector("#article")}
        scrollContainer={() => document.querySelector("#article")}
        offset={20}
        behavior="auto"
        onItemClick={onItemClick}
      />
    </>,
  );
  const root = document.querySelector("#article") as HTMLElement;
  root.scrollTo = scrollTo;
  vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
    top: 50,
  } as DOMRect);
  vi.spyOn(
    document.getElementById("b")!,
    "getBoundingClientRect",
  ).mockReturnValue({ top: 250 } as DOMRect);
  fireEvent.click(screen.getByRole("link", { name: "B" }));
  expect(scrollTo).toHaveBeenCalledWith({ top: 180, behavior: "auto" });
  expect(document.activeElement?.id).toBe("b");
  expect(onItemClick).toHaveBeenCalled();
  expect(location.hash).toBe("");
});
test("cancellable navigation does not scroll", () => {
  const spy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  render(
    <>
      <h2 id="a">A</h2>
      <TableOfContents onItemClick={(_, event) => event.preventDefault()} />
    </>,
  );
  fireEvent.click(screen.getByRole("link"));
  expect(spy).not.toHaveBeenCalled();
});
test("tracks active heading on scroll and notifies only when changed", async () => {
  let y = 0;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      return { top: (this.id === "b" ? 200 : 0) - y } as DOMRect;
    },
  );
  const change = vi.fn();
  render(
    <>
      <h2 id="a">A</h2>
      <h2 id="b">B</h2>
      <TableOfContents offset={10} onActiveChange={change} />
    </>,
  );
  expect(screen.getByRole("link", { name: "A" })).toHaveAttribute(
    "aria-current",
    "location",
  );
  y = 250;
  fireEvent.scroll(window);
  await waitFor(() =>
    expect(screen.getByRole("link", { name: "B" })).toHaveAttribute(
      "aria-current",
      "location",
    ),
  );
  expect(change).toHaveBeenLastCalledWith("b");
});
test("custom selector, label and level; empty state and invalid selectors are safe", () => {
  const { rerender } = render(
    <>
      <div data-heading="Title" data-level="3" />
      <TableOfContents
        selector="[data-heading]"
        getLabel={(el) => el.getAttribute("data-heading")!}
        getLevel={(el) => Number(el.getAttribute("data-level"))}
      />
    </>,
  );
  expect(screen.getByRole("link", { name: "Title" })).toBeTruthy();
  rerender(<TableOfContents selector="[" emptyContent="No headings" />);
  expect(screen.getByText("No headings")).toBeTruthy();
});
test("refresh re-resolves a stable getter when the article element is replaced", () => {
  const ref = createRef<TableOfContentsHandle>();
  const getRoot = () => document.querySelector("#article") as HTMLElement;
  document.body.insertAdjacentHTML(
    "beforeend",
    '<article id="article"><h2>A</h2></article>',
  );
  render(<TableOfContents ref={ref} root={getRoot} />);
  document.querySelector("#article")!.outerHTML =
    '<article id="article"><h2>B</h2></article>';
  act(() => ref.current!.refresh());
  expect(screen.getByRole("link", { name: "B" })).toBeTruthy();
  document.querySelector("#article")!.remove();
});
test("observes custom metadata attributes used by label callbacks", async () => {
  render(
    <>
      <h2 data-caption="Original">Text</h2>
      <TableOfContents getLabel={(el) => el.getAttribute("data-caption")!} />
    </>,
  );
  document.querySelector("h2")!.setAttribute("data-caption", "Changed");
  await waitFor(() =>
    expect(screen.getByRole("link", { name: "Changed" })).toBeTruthy(),
  );
});
test("resolves an initially unavailable scope after parent commit with stable getters", () => {
  let target: HTMLElement | null = null;
  const root = () => target;
  const { rerender } = render(
    <>
      {null}
      <TableOfContents root={root} emptyContent="Waiting" />
    </>,
  );
  expect(screen.getByText("Waiting")).toBeTruthy();
  rerender(
    <>
      <article
        ref={(el) => {
          target = el;
        }}
      >
        <h2>Ready</h2>
      </article>
      <TableOfContents root={root} />
    </>,
  );
  expect(screen.getByRole("link", { name: "Ready" })).toBeTruthy();
});
test("skips duplicate ids, blank and hidden headings", () => {
  render(
    <>
      <h2 id="same">One</h2>
      <h3 id="same">Two</h3>
      <h2> </h2>
      <div hidden>
        <h2>Hidden</h2>
      </div>
      <TableOfContents />
    </>,
  );
  expect(screen.getAllByRole("link")).toHaveLength(1);
  expect(screen.getByRole("link", { name: "One" })).toBeTruthy();
});
test("honors reduced motion and preserves authored tabindex", () => {
  const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  render(
    <>
      <h2 id="a" tabIndex={0}>
        A
      </h2>
      <TableOfContents />
    </>,
  );
  fireEvent.click(screen.getByRole("link"));
  expect(scroll).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  fireEvent.blur(document.getElementById("a")!);
  expect(document.getElementById("a")).toHaveAttribute("tabindex", "0");
  vi.unstubAllGlobals();
});
test("modified clicks preserve native links without custom scrolling", () => {
  const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  render(
    <>
      <h2 id="a">A</h2>
      <TableOfContents />
    </>,
  );
  fireEvent.click(screen.getByRole("link"), { ctrlKey: true });
  expect(scroll).not.toHaveBeenCalled();
});
test("observe=false does not recollect a React content update until refresh", () => {
  const ref = createRef<TableOfContentsHandle>();
  const root = () => document.querySelector("#manual") as HTMLElement;
  const view = (extra: boolean) => (
    <>
      <article id="manual">
        <h2>A</h2>
        {extra && <h3>B</h3>}
      </article>
      <TableOfContents root={root} ref={ref} observe={false} />
    </>
  );
  const { rerender } = render(view(false));
  rerender(view(true));
  expect(screen.queryByRole("link", { name: "B" })).toBeNull();
  act(() => ref.current!.refresh());
  expect(screen.getByRole("link", { name: "B" })).toBeTruthy();
});
