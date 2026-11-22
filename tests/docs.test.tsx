import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import * as M from "../packages/mtone/src";
import { componentDocs } from "../apps/docs/catalog";
import { ComponentExample } from "../apps/docs/examples";
import { parseRoute, searchDocs } from "../apps/docs/docs-app";
describe("documentation", () => {
  it("covers every component export without counting hooks as components", () => {
    const names = Object.keys(M).filter(
      (k) => !["cn", "useMtone", "useToast", "getMentions"].includes(k),
    );
    expect(componentDocs.map((d) => d.name).sort()).toEqual(names.sort());
    expect(new Set(componentDocs.map((d) => d.name)).size).toBe(
      componentDocs.length,
    );
    for (const doc of componentDocs) {
      if (doc.name === "MultiSelect") {
        // Its compatibility page intentionally demonstrates the recommended replacement.
        expect(doc.importNames).toEqual(["Select"]);
        expect(doc.code).toContain('import { Select } from "@bixlab/mtone"');
        expect(doc.code).toContain('<Select mode="multiple"');
      } else {
        expect(doc.code).toContain(doc.name);
      }
      expect(doc.description.length).toBeGreaterThan(4);
    }
  });
  it("handles routes and unknown routes safely", () => {
    expect(parseRoute("#/components/Button")).toEqual({
      kind: "component",
      name: "Button",
    });
    expect(parseRoute("#/components/DropdownMenu")).toEqual({ kind: "not-found" });
    expect(parseRoute("#/components/Modal")).toEqual({ kind: "not-found" });
    expect(parseRoute("#/showcase")).toEqual({ kind: "showcase" });
    expect(parseRoute("#/apps")).toEqual({ kind: "showcase" });
    expect(parseRoute("#/garbage").kind).toBe("not-found");
    expect(parseRoute("").kind).toBe("gallery");
  });
  it("searches names and Chinese descriptions", () => {
    expect(searchDocs("button").some((d) => d.name === "Button")).toBe(true);
    expect(searchDocs("zzzzzz")).toEqual([]);
    expect(searchDocs("")).toHaveLength(componentDocs.length);
  });
  it.each(
    Object.keys(M).filter((k) => !["cn", "useMtone", "useToast", "getMentions"].includes(k)),
  )("renders %s example", (name) => {
    render(
      <M.MtoneProvider>
        <M.ToastProvider>
          <ComponentExample name={name} />
        </M.ToastProvider>
      </M.MtoneProvider>,
    );
    expect(document.body.textContent).not.toContain("暂无示例");
    cleanup();
  });
});

describe("documentation navigation", () => {
  it("shows not found and recovers through hash navigation", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.location.hash = "#/missing";
    const { DocsApp } = await import("../apps/docs/docs-app");
    render(<DocsApp />);
    expect(
      screen.getByRole("heading", { name: "页面未找到" }),
    ).toBeInTheDocument();
    const { act } = await import("@testing-library/react");
    await act(async () => {
      window.location.hash = "#/components/Button";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(
      screen.getByRole("heading", { name: "Button", level: 1 }),
    ).toBeInTheDocument();
    cleanup();
    window.location.hash = "";
  });
});


it("opens the app showcase safely in a new tab", async () => {
  window.location.hash = "#/gallery";
  const { DocsApp } = await import("../apps/docs/docs-app");
  render(<DocsApp />);
  for (const link of screen.getAllByRole("link", { name: /应用示例/ })) {
    expect(link).toHaveAttribute("href", "./showcase.html");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
});
