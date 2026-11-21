import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const exactSha = /^[0-9a-f]{40}$/;
const unitPattern = /^tests\/[a-z0-9-]+\.test\.[cm]?[jt]sx?$/;
const browserPattern = /^tests\/[a-z0-9-]+\.browser\.mjs$/;
const stem = (path) => path.toLowerCase().split("/").at(-1).split(".")[0];
const testName = (path) =>
  path
    .split("/")
    .at(-1)
    .replace(/\.(test|browser)\..*$/, "");
const unique = (items) => [...new Set(items)].sort();

const aliases = {
  "admin-layout": [
    "navigation",
    "nav-submenu",
    "sidebar-navigation",
    "page-layout",
  ],
  "ai-activity": ["ai-elements"],
  "ai-chat": ["ai-elements"],
  "ai-evidence": ["ai-elements"],
  avatar: ["avatar-popconfirm"],
  basic: [
    "button-group",
    "button-sections",
    "divider",
    "progress",
    "typography",
  ],
  "calendar-model": ["calendar"],
  data: ["list", "data-list", "table-advanced"],
  "fieldset-context": ["fieldset", "form"],
  "floating-owner": ["hover-card-portals", "dropdown", "menu", "select-layout"],
  "form-store": ["form"],
  input: ["auto-complete", "field-focus", "control-height"],
  interactive: [
    "menu",
    "menubar",
    "select-layout",
    "select-focus",
    "date-picker",
    "modal-layout",
    "dropdown",
    "button-group",
  ],
  layout: [
    "admin-layout",
    "sidebar-navigation",
    "nav-submenu",
    "page-layout",
    "splitter",
    "showcase",
  ],
  "mentions-model": ["mentions"],
  "nav-submenu": ["navigation", "sidebar-navigation"],
  navigation: [
    "breadcrumb",
    "nav-submenu",
    "sidebar-navigation",
    "admin-layout",
  ],
  popconfirm: ["avatar-popconfirm"],
  "splitter-utils": ["splitter"],
  "table-filter": ["table"],
  "table-model": ["table"],
  "table-pagination": ["table"],
  "table-selection": ["table"],
  "table-types": ["table"],
  theme: ["theme-palette", "theme-docs", "color-theme"],
  "tree-model": ["tree"],
  "tree-types": ["tree", "tree-select"],
};

const sharedUnits = [
  "tests/basic.test.tsx",
  "tests/input-family.test.tsx",
  "tests/navigation.test.tsx",
  "tests/table-advanced.test.tsx",
  "tests/theme-palette.test.ts",
];
const sharedBrowser = [
  "tests/control-height.browser.mjs",
  "tests/theme-palette.browser.mjs",
];
const ciUnits = [
  "tests/docs-regression-proof.test.mjs",
  "tests/merge-verified.test.mjs",
  "tests/release.test.ts",
  "tests/targeted-ci.test.mjs",
];
const appUnits = [
  "tests/docs-categories.test.tsx",
  "tests/secondary-demo-registry.test.tsx",
  "tests/llms.test.ts",
];
const sharedPackage = new Set([
  "packages/mtone/src/index.ts",
  "packages/mtone/src/styles.css",
  "packages/mtone/src/theme.css",
  "packages/mtone/package.json",
  "package.json",
  "package-lock.json",
  ".npmrc",
]);
const prose = (path) =>
  /^(?:docs\/.*|(?:AGENTS|CHANGELOG|LICENSE|README)(?:\.[^/]*)?)\.(?:md|mdx)$/.test(
    path,
  ) || /^(?:LICENSE|NOTICE)(?:\.[^/]*)?$/.test(path);
const ciFiles = (path) =>
  path.startsWith(".github/workflows/") ||
  /^scripts\/(?:check-targeted-changes|merge-verified|verify-docs-regression|check-release)\.mjs$/.test(
    path,
  );
const matches = (name, family) =>
  name === family || name.startsWith(family + "-");

export function makePlan(changes, testFiles) {
  const inventory = unique(testFiles).filter(
    (path) => unitPattern.test(path) || browserPattern.test(path),
  );
  const known = new Set(inventory);
  const plan = {
    changes: unique(changes),
    unmatched: [],
    needsNpm: false,
    typecheck: false,
    docsBuild: false,
    packageSmoke: false,
    unit: new Set(),
    browser: new Set(),
  };
  function add(paths) {
    for (const path of paths) {
      if (known.has(path))
        plan[unitPattern.test(path) ? "unit" : "browser"].add(path);
    }
  }
  function nearestFamily(name) {
    return unique([...Object.keys(aliases), ...inventory.map(testName)])
      .filter((family) => matches(name, family))
      .sort((a, b) => b.length - a.length)[0];
  }
  function component(family, { withBrowsers = true } = {}) {
    const namespaces = [family, ...(aliases[family] ?? [])];
    const hits = inventory.filter(
      (path) =>
        (withBrowsers || unitPattern.test(path)) &&
        namespaces.some((name) => matches(testName(path), name)),
    );
    add(hits);
    return hits.length > 0;
  }
  function build({ typecheck = true, packageSmoke = false } = {}) {
    plan.docsBuild = true;
    plan.typecheck ||= typecheck;
    plan.packageSmoke ||= packageSmoke;
  }
  function shared(path) {
    build({ packageSmoke: true });
    add([...sharedUnits, ...sharedBrowser]);
    if (path === "packages/mtone/src/theme.css") component("theme");
  }
  function unknown(path) {
    plan.unmatched.push(path);
    shared(path);
  }
  for (const path of plan.changes) {
    if (prose(path)) continue;

    if (
      path === "packages/mtone/llms.txt" ||
      path === "scripts/generate-llms.mjs"
    ) {
      build({ typecheck: false });
      add(["tests/llms.test.ts"]);
    } else if (ciFiles(path)) {
      add(ciUnits);
    } else if (
      sharedPackage.has(path) ||
      path === "scripts/package-smoke.mjs" ||
      /^(?:tsconfig[^/]*\.json|(?:vite|vitest)\.config\.[^/]+|tests\/setup\.ts)$/.test(
        path,
      )
    ) {
      shared(path);
      add(ciUnits);
    } else if (path.startsWith("apps/docs/")) {
      build();
      add(appUnits);
      if (
        /^apps\/docs\/(?:docs-app|docs-router|main|catalog|app-shell|app-layout|theme|index\.html)/.test(
          path,
        )
      )
        add(["tests/docs-search.browser.mjs"]);
      if (/^apps\/docs\/.*(?:css|layout|showcase)/.test(path))
        add([
          "tests/component-layout.browser.mjs",
          "tests/showcase.browser.mjs",
        ]);
      // Match the longest supported component prefix for a renamed/edited demo.
      const name = stem(path).replace(/examples?(?:-|$)/, "-");
      const family = nearestFamily(name);
      if (family) component(family, { withBrowsers: false });
    } else if (path.startsWith("packages/mtone/src/")) {
      build({ packageSmoke: true });
      if (!component(stem(path))) unknown(path);
    } else if (unitPattern.test(path) || browserPattern.test(path)) {
      if (known.has(path)) add([path]);
      else {
        const family = nearestFamily(testName(path));
        if (!family || !component(family)) unknown(path);
      }
    } else if (path.startsWith("tests/fixtures/")) {
      if (!component(stem(path))) unknown(path);
    } else {
      // Unknown files deliberately get a bounded, visible smoke, not a no-op or full suite.
      unknown(path);
    }
  }
  if (plan.browser.size) build({ typecheck: false });
  plan.needsNpm =
    plan.typecheck ||
    plan.docsBuild ||
    plan.packageSmoke ||
    plan.unit.size > 0 ||
    plan.browser.size > 0;
  return { ...plan, unit: unique(plan.unit), browser: unique(plan.browser) };
}

export function planFromGit({ cwd = process.cwd(), base, head }) {
  if (
    !exactSha.test(base) ||
    !exactSha.test(head) ||
    /^0+$/.test(base) ||
    base === head
  ) {
    throw new Error(
      "Distinct exact candidate and master baseline SHA values are required.",
    );
  }
  const git = (...args) =>
    execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, GIT_NO_REPLACE_OBJECTS: "1" },
      maxBuffer: 16 * 1024 * 1024,
    });
  try {
    if (
      git("rev-parse", "--verify", base + "^{commit}").trim() !== base ||
      git("rev-parse", "--verify", head + "^{commit}").trim() !== head
    ) {
      throw new Error();
    }
    git("merge-base", "--is-ancestor", base, head);
  } catch {
    throw new Error(
      "Master baseline must be an exact ancestor of the candidate.",
    );
  }
  const split = (raw) => raw.split("\0").filter(Boolean);
  // Turning rename detection off ensures both prior and new paths participate.
  const paths = split(
    git("diff", "--name-only", "--no-renames", "-z", base, head, "--"),
  );
  const tests = split(
    git("ls-tree", "-r", "--name-only", "-z", head, "--", "tests"),
  );
  return makePlan(paths, tests);
}

function runPlan(plan) {
  const run = (file, args, env = process.env) =>
    execFileSync(file, args, {
      stdio: "inherit",
      env,
    });
  if (plan.typecheck) run("npm", ["run", "typecheck"]);
  if (plan.docsBuild) {
    run("npm", ["run", "build:docs"]);
    run("cmp", ["packages/mtone/llms.txt", "dist/docs/llms.txt"]);
  }
  if (plan.unit.length) {
    // Passing at least one concrete test filename is an invariant of this branch.
    run("npm", ["exec", "--", "vitest", "run", ...plan.unit]);
  }
  if (plan.packageSmoke) run("npm", ["run", "test:package"]);
  if (plan.browser.length) {
    // Some existing fixture runners require all engines internally. Run only
    // the selected fixtures; those accepting BROWSER use one Chromium run here.
    run("npm", [
      "exec",
      "--",
      "playwright",
      "install",
      "--with-deps",
      "chromium",
      "firefox",
      "webkit",
    ]);
    for (const path of plan.browser) {
      run(process.execPath, [path], { ...process.env, BROWSER: "chromium" });
    }
  }
  // Prose-only plans cannot change reference inputs and use no dependencies.
  if (plan.needsNpm) run(process.execPath, ["scripts/generate-llms.mjs"]);
}

function main() {
  const [base, head, mode, ...extra] = process.argv.slice(2);
  if (
    extra.length ||
    (mode !== undefined && !["--run", "--plan"].includes(mode))
  ) {
    throw new Error(
      "Usage: node scripts/check-targeted-changes.mjs <master-base-SHA> <candidate-SHA> [--plan|--run]",
    );
  }
  const plan = planFromGit({ base, head });
  console.log(JSON.stringify(plan, null, 2));
  if (mode === "--plan" && process.env.GITHUB_OUTPUT)
    appendFileSync(process.env.GITHUB_OUTPUT, `needs_npm=${plan.needsNpm}\n`);
  if (mode === "--run") runPlan(plan);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
