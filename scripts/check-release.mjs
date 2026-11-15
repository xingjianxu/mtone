import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const pkg = JSON.parse(
  readFileSync(new URL("../packages/mtone/package.json", import.meta.url)),
);
assert.equal(pkg.name, "@bixlab/mtone");
assert.equal(pkg.repository.url, "git+https://github.com/xingjianxu/mtone.git");
assert.equal(
  process.env.RELEASE_TAG,
  `v${pkg.version}`,
  "Release tag must match package version",
);
assert(
  /^\d+\.\d+\.\d+$/.test(pkg.version),
  "Only stable versions are published to latest",
);
assert(
  pkg.license && pkg.license !== "UNLICENSED",
  "Owner must choose a license before public publishing; see docs/RELEASING.md",
);
console.log(`Ready to publish ${pkg.name}@${pkg.version}`);
