import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { componentDocs } from "../apps/docs/catalog";
import { componentDocHref } from "../apps/docs/component-navigation";
import { componentLlmsPath, formatComponentLlms } from "../apps/docs/llms-reference";
describe("AI reference", () => {
  it("covers every documented export and its exact code example", () => {
    const text = readFileSync("packages/mtone/llms.txt", "utf8");
    for (const doc of componentDocs) {
      expect(text).toContain("### " + doc.name + "\n");
      expect(text).toContain(doc.code);
      for (const prop of doc.props) expect(text).toContain("- " + prop.name + ": " + prop.type);
    }
    expect(text).toContain("dist/index.d.ts");
    expect(text).toContain("not necessarily the latest published npm release");
    expect(text).not.toContain("useToast exposes add, success, error, info, loading");
  });
  it("formats a unique component-only plain text file for every catalog entry", () => {
    const paths = new Set<string>();
    for (const doc of componentDocs) {
      const filename = componentLlmsPath(doc.name);
      expect(filename).toBe(`components/${doc.name}/llms.txt`);
      expect(paths.has(filename)).toBe(false);
      paths.add(filename);
      const docUrl = "https://xingjianxu.github.io/mtone/" + componentDocHref(doc.name);
      const text = formatComponentLlms(doc, docUrl, "0.13.0");
      expect(text).toMatch(new RegExp(`^# ${doc.name}\n`));
      expect(text).toContain(`- [${doc.name}](${docUrl})`);
      expect(text).toContain(doc.code);
      for (const prop of doc.props) expect(text).toContain("- " + prop.name + ": " + prop.type);
      expect(text).not.toMatch(/^## (Setup|AI coding guidance|Components)$/m);
      expect(text).not.toMatch(/^### [A-Za-z]/m);
    }
  });
  it("documents Tree's 32px default row height in the API table and full reference", () => {
    const tree = componentDocs.find(({ name }) => name === "Tree");
    expect(tree?.props.find(({ name }) => name === "height / itemHeight / virtual")?.default)
      .toBe("— / 32 / true");
    expect(readFileSync("packages/mtone/llms.txt", "utf8"))
      .toContain("- height / itemHeight / virtual: number / number / boolean (default: — / 32 / true).");
  });
  it("links PropertyItem to its PropertyList section without dropping its reference", () => {
    expect(readFileSync("packages/mtone/llms.txt", "utf8"))
      .toContain("[PropertyItem](https://xingjianxu.github.io/mtone/#/components/PropertyList?section=property-item)");
    expect(componentDocs.find(({ name }) => name === "PropertyItem")?.props.map(({ name }) => name))
      .toEqual(["label", "children"]);
  });
  it("includes and exposes the same file in npm", () => {
    const pkg = JSON.parse(readFileSync("packages/mtone/package.json", "utf8"));
    expect(pkg.files).toContain("llms.txt");
    expect(pkg.exports["./llms.txt"]).toBe("./llms.txt");
  });
});
