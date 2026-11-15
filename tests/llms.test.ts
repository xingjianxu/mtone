import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { componentDocs } from "../apps/docs/catalog";
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
  it("includes and exposes the same file in npm", () => {
    const pkg = JSON.parse(readFileSync("packages/mtone/package.json", "utf8"));
    expect(pkg.files).toContain("llms.txt");
    expect(pkg.exports["./llms.txt"]).toBe("./llms.txt");
  });
});
