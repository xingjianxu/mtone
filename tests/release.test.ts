import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
const pkg = JSON.parse(readFileSync("packages/mtone/package.json", "utf8"));
describe("npm release safety", () => {
  it("uses the scoped package and public registry", () => {
    expect(pkg.name).toBe("@bixlab/mtone");
    expect(pkg.publishConfig).toEqual({
      access: "public",
      registry: "https://registry.npmjs.org",
    });
  });
  it("rejects tags that differ from the package version", () => {
    const result = spawnSync(process.execPath, ["scripts/check-release.mjs"], {
      env: { ...process.env, RELEASE_TAG: "v999.0.0" },
      encoding: "utf8",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Release tag must match package version");
  });
  it("accepts the approved MIT license for the matching stable version", () => {
    expect(pkg.license).toBe("MIT");
    const result = spawnSync(process.execPath, ["scripts/check-release.mjs"], {
      env: { ...process.env, RELEASE_TAG: `v${pkg.version}` },
      encoding: "utf8",
    });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Ready to publish @bixlab/mtone");
  });
});

describe("npm publication and on-demand regression", () => {
  const publish = readFileSync(".github/workflows/publish.yml", "utf8");
  const regressionPath = ".github/workflows/full-regression.yml";

  it("keeps a light, safeguarded stable release with no full test run", () => {
    expect(publish).toContain("types: [published]");
    expect(publish).toContain(
      "!github.event.release.prerelease && !github.event.release.draft",
    );
    expect(publish).toContain("needs: verify");
    expect(publish).toContain("environment: npm");
    expect(publish).toContain("id-token: write");
    expect(publish).toContain("node scripts/check-release.mjs");
    expect(publish).toContain("npm run typecheck");
    expect(publish).toContain("npm run test:package");
    expect(publish).toContain(
      "npm publish -w @bixlab/mtone --access public --provenance",
    );
    expect(publish).not.toMatch(
      /workflow_dispatch|npm test|playwright install|\.browser\.mjs/,
    );
  });

  it("runs all browser scenarios only through the standalone read-only workflow", () => {
    const workflow = readFileSync(regressionPath, "utf8");
    expect(workflow).toMatch(/^on:\n  workflow_dispatch:\s*$/m);
    expect(workflow).toContain("contents: read");
    expect(workflow).toContain("npm test");
    expect(workflow).toContain(
      "playwright install --with-deps chromium firefox webkit",
    );
    expect(workflow).not.toMatch(
      /id-token:|environment:\s*npm|npm publish|^  (release|push|pull_request|workflow_run):/m,
    );
    expect(workflow).toContain("ref: ${{ github.sha }}");
    for (const entry of readdirSync("tests").filter((name) =>
      name.endsWith(".browser.mjs"),
    )) {
      expect(workflow, entry).toContain(`tests/${entry}`);
    }
  });
});
