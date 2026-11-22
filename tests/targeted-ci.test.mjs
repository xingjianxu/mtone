import { describe, expect, it } from "vitest";
import { browserRuns, makePlan, planFromGit } from "../scripts/check-targeted-changes.mjs";
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const tests = [
  "tests/basic.test.tsx",
  "tests/control-height.browser.mjs",
  "tests/component-layout.test.tsx",
  "tests/docs-categories.test.tsx",
  "tests/docs-search.browser.mjs",
  "tests/docs-regression-proof.test.mjs",
  "tests/input-family.test.tsx",
  "tests/llms.test.ts",
  "tests/merge-verified.test.mjs",
  "tests/nav-submenu.browser.mjs",
  "tests/nav-submenu.test.tsx",
  "tests/navigation.test.tsx",
  "tests/page-layout.test.tsx",
  "tests/secondary-demo-registry.test.tsx",
  "tests/targeted-ci.test.mjs",
  "tests/typography-languages.test.ts",
  "tests/typography-code.browser.mjs",
  "tests/tree-model.test.ts",
  "tests/tree.browser.mjs",
  "tests/tree.test.tsx",
];

describe("Targeted CI selection", () => {
  it("keeps ordinary prose outside npm, unit and browser checks", () => {
    const plan = makePlan(["README.md", "docs/CONTRIBUTING-CI.md"], tests);
    expect(plan).toMatchObject({
      needsNpm: false,
      typecheck: false,
      docsBuild: false,
      packageSmoke: false,
      unit: [],
      browser: [],
    });
  });

  it("validates generated reference separately from prose", () => {
    const plan = makePlan(["packages/mtone/llms.txt"], tests);
    expect(plan).toMatchObject({
      docsBuild: true,
      unit: ["tests/llms.test.ts"],
      browser: [],
    });
  });

  it.each([
    "scripts/generate-typography-languages.mjs",
    "packages/mtone/src/typography-languages.generated.ts",
    "packages/mtone/src/typography-language-loaders.generated.ts",
  ])("covers catalog consistency and built asset loading for %s", (path) => {
    const plan = makePlan([path], tests);
    expect(plan).toMatchObject({
      unmatched: [],
      docsBuild: true,
      packageSmoke: true,
      unit: ["tests/typography-languages.test.ts"],
      browser: ["tests/typography-code.browser.mjs"],
    });
  });

  it("uses docs checks and a build for a docs app change", () => {
    const plan = makePlan(["apps/docs/docs-app.tsx"], tests);
    expect(plan).toMatchObject({
      needsNpm: true,
      typecheck: true,
      docsBuild: true,
      packageSmoke: false,
    });
    expect(plan.unit).toContain("tests/docs-categories.test.tsx");
    expect(plan.browser).toContain("tests/docs-search.browser.mjs");
    expect(plan.unit).not.toContain("tests/tree.test.tsx");
  });

  it("runs only the directly changed docs search fixture on all release engines", () => {
    const docsSearch = "tests/docs-search.browser.mjs";
    const tree = "tests/tree.browser.mjs";
    expect(browserRuns(makePlan([docsSearch, tree], tests))).toEqual([
      { path: docsSearch, browser: "chromium" },
      { path: docsSearch, browser: "firefox" },
      { path: docsSearch, browser: "webkit" },
      { path: tree, browser: "chromium" },
    ]);
    expect(browserRuns(makePlan(["apps/docs/docs-app.tsx"], tests))).toEqual([
      { path: docsSearch, browser: "chromium" },
    ]);
  });

  it.each(["apps/docs/catalog.ts", "apps/docs/docs-app.tsx"])(
    "validates canonical component documentation routes when %s changes",
    (path) => {
      expect(makePlan([path], tests).unit).toContain("tests/component-layout.test.tsx");
    },
  );

  it("maps navigation and fixtures to their actual component/browser tests, not unrelated checks", () => {
    const plan = makePlan(
      ["packages/mtone/src/navigation.tsx", "tests/fixtures/nav-submenu.html"],
      tests,
    );
    expect(plan.unit).toContain("tests/nav-submenu.test.tsx");
    expect(plan.unit).toContain("tests/navigation.test.tsx");
    expect(plan.browser).toContain("tests/nav-submenu.browser.mjs");
    expect(plan.unit).not.toContain("tests/tree.test.tsx");
  });

  it("recognizes component model/test names without silently dropping them", () => {
    const plan = makePlan(["packages/mtone/src/tree-model.ts"], tests);
    expect(plan.unit).toContain("tests/tree-model.test.ts");
    expect(plan.browser).toContain("tests/tree.browser.mjs");
  });

  it("checks consumers when shared pagination or confirmation internals change", () => {
    const inventory = [
      "tests/pagination.test.tsx",
      "tests/table-advanced.test.tsx",
      "tests/confirm-transaction.test.tsx",
      "tests/interactive.test.tsx",
      "tests/popconfirm.test.tsx",
    ];
    const pagination = makePlan(["packages/mtone/src/pagination-controls.tsx"], inventory);
    expect(pagination.unit).toEqual(inventory.slice(0, 2).sort());
    const confirm = makePlan(["packages/mtone/src/confirm-transaction.ts"], inventory);
    expect(confirm.unit).toEqual(inventory.slice(2).sort());
  });

  it("runs changed tests directly and deduplicates checks across paths", () => {
    const plan = makePlan(
      [
        "tests/tree.test.tsx",
        "tests/tree.browser.mjs",
        "packages/mtone/src/tree.tsx",
      ],
      tests,
    );
    expect(plan.unit.filter((p) => p === "tests/tree.test.tsx")).toHaveLength(
      1,
    );
    expect(
      plan.browser.filter((p) => p === "tests/tree.browser.mjs"),
    ).toHaveLength(1);
  });

  it("uses bounded representative smoke for unknown source and shared configuration", () => {
    const a = makePlan(["packages/mtone/src/new-widget.tsx"], tests);
    expect(a).toMatchObject({
      typecheck: true,
      docsBuild: true,
      packageSmoke: true,
    });
    expect(a.unit).toContain("tests/basic.test.tsx");
    expect(a.browser).toContain("tests/control-height.browser.mjs");
    expect(a.unmatched).toContain("packages/mtone/src/new-widget.tsx");
    const b = makePlan(
      ["package-lock.json", ".github/workflows/docs.yml"],
      tests,
    );
    expect(b.unit).toContain("tests/targeted-ci.test.mjs");
    expect(b.unit).not.toContain("tests/tree.test.tsx");
    expect(b.browser).not.toContain("tests/tree.browser.mjs");
  });

  it("selects a surviving check of the same family when a unit file is removed", () => {
    const plan = makePlan(["tests/tree-extra.test.tsx"], tests);
    expect(plan.unit).toContain("tests/tree.test.tsx");
    expect(plan.unit).not.toContain("tests/tree-extra.test.tsx");
  });

  it("takes both sides of a real rename from the exact ancestry diff without trusting cwd contents", () => {
    const dir = mkdtempSync(join(tmpdir(), "mtone-diff-"));
    const git = (...args) =>
      execFileSync("git", args, {
        cwd: dir,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim();
    try {
      git("init");
      mkdirSync(join(dir, "tests"));
      mkdirSync(join(dir, "packages/mtone/src"), { recursive: true });
      writeFileSync(
        join(dir, "packages/mtone/src/tree.tsx"),
        "export default 1;\n",
      );
      for (const file of ["tree.test.tsx", "navigation.test.tsx"])
        writeFileSync(join(dir, "tests", file), "// fixture\n");
      const commit = () => {
        git("add", ".");
        git(
          "-c",
          "user.name=test",
          "-c",
          "user.email=test@example.com",
          "commit",
          "--no-gpg-sign",
          "-m",
          "test",
        );
        return git("rev-parse", "HEAD");
      };
      const base = commit();
      git(
        "mv",
        "packages/mtone/src/tree.tsx",
        "packages/mtone/src/navigation.tsx",
      );
      const sha = commit();
      writeFileSync(
        join(dir, "tests", "ignore-untracked.test.tsx"),
        "// fixture\n",
      );
      expect(planFromGit({ cwd: dir, base, head: sha })).toMatchObject({
        changes: [
          "packages/mtone/src/navigation.tsx",
          "packages/mtone/src/tree.tsx",
        ],
        unit: ["tests/navigation.test.tsx", "tests/tree.test.tsx"],
      });
      expect(() => planFromGit({ cwd: dir, base: sha, head: base })).toThrow(
        /ancestor/i,
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("Targeted CI command in a fresh checkout", () => {
  it("certifies a prose-only diff without node_modules or importing the generator", () => {
    const dir = mkdtempSync(join(tmpdir(), "mtone-prose-"));
    const git = (...args) =>
      execFileSync("git", args, {
        cwd: dir,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim();
    try {
      git("init");
      mkdirSync(join(dir, "scripts"));
      const selector = join(dir, "scripts/check-targeted-changes.mjs");
      copyFileSync(
        join(process.cwd(), "scripts/check-targeted-changes.mjs"),
        selector,
      );
      writeFileSync(join(dir, "README.md"), "before\n");
      const commit = () => {
        git("add", ".");
        git(
          "-c",
          "user.name=test",
          "-c",
          "user.email=test@example.com",
          "commit",
          "--no-gpg-sign",
          "-m",
          "test",
        );
        return git("rev-parse", "HEAD");
      };
      const base = commit();
      writeFileSync(join(dir, "README.md"), "after\n");
      const sha = commit();
      const plan = JSON.parse(
        execFileSync(process.execPath, [selector, base, sha, "--run"], {
          cwd: dir,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        }),
      );
      expect(plan).toMatchObject({
        changes: ["README.md"],
        needsNpm: false,
        unit: [],
        browser: [],
      });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
