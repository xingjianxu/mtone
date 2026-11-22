import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { ThemeSelect, useThemePreference } from "../apps/docs/theme-preference";

afterEach(() => {
  delete document.documentElement.dataset.mtTheme;
  localStorage.clear();
});

test("docs and showcase resolve the saved mode in the head before mounting React", async () => {
  for (const file of ["index.html", "showcase.html"]) {
    const html = await readFile(`apps/docs/${file}`, "utf8");
    const bootstrap = html.split("</head>")[0].match(/<script>([\s\S]*?)<\/script>/)?.[1];
    expect(bootstrap).toBeDefined();
    for (const [saved, expected] of [[null, "system"], ["dark", "dark"], ["light", "light"], ["invalid", "system"]]) {
      const dataset: Record<string, string> = {};
      runInNewContext(bootstrap!, {
        document: { documentElement: { dataset } },
        localStorage: { getItem: () => saved },
      });
      expect(dataset.mtTheme).toBe(expected);
    }
    const dataset: Record<string, string> = {};
    runInNewContext(bootstrap!, {
      document: { documentElement: { dataset } },
      localStorage: { getItem: () => { throw new Error("blocked"); } },
    });
    expect(dataset.mtTheme).toBe("system");
  }
});

test("manual theme persists and follows a switch made in another tab", () => {
  function App() {
    return <ThemeSelect {...useThemePreference()} />;
  }
  document.documentElement.dataset.mtTheme = "system";
  render(<App />);
  const button = (name: string) => screen.getByRole("button", { name });
  expect(button("跟随系统")).toHaveAttribute("aria-pressed", "true");

  fireEvent.click(button("深色"));
  expect(button("深色")).toHaveAttribute("aria-pressed", "true");
  expect(document.documentElement).toHaveAttribute("data-mt-theme", "dark");
  expect(localStorage.getItem("mtone-docs-theme")).toBe("dark");

  fireEvent(window, new StorageEvent("storage", { key: "mtone-docs-theme", newValue: "light" }));
  expect(button("浅色")).toHaveAttribute("aria-pressed", "true");
  expect(document.documentElement).toHaveAttribute("data-mt-theme", "light");

  fireEvent.click(button("跟随系统"));
  expect(button("跟随系统")).toHaveAttribute("aria-pressed", "true");
  expect(document.documentElement).toHaveAttribute("data-mt-theme", "system");
  expect(localStorage.getItem("mtone-docs-theme")).toBeNull();
});

test("docs expose one 32px control baseline without density API or switches", async () => {
  const { componentDocs: docs } = await import("../apps/docs/catalog");
  const provider = docs.find((entry) => entry.name === "MtoneProvider")!;
  expect(provider.props.some((prop) => prop.name === "density")).toBe(false);
  for (const file of ["apps/docs/docs-app.tsx", "apps/docs/menubar-example.tsx", "apps/docs/inline-demos/mtone-provider-usage.tsx", "scripts/generate-llms.mjs"]) {
    const source = await readFile(file, "utf8");
    expect(source).not.toMatch(/density=|setDensity|docs-density-toggle|density: compact/);
  }
  for (const name of ["Input", "Select", "MultiSelect", "NumberInput", "DatePicker", "FilterChip"]) {
    expect(docs.find((entry) => entry.name === name)?.notes?.join(" ")).toContain("32px");
  }
});
