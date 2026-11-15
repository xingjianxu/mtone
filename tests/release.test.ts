import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
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
  it("blocks publishing while license remains undecided", () => {
    if (pkg.license !== "UNLICENSED") return;
    const result = spawnSync(process.execPath, ["scripts/check-release.mjs"], {
      env: { ...process.env, RELEASE_TAG: `v${pkg.version}` },
      encoding: "utf8",
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Owner must choose a license");
  });
});
