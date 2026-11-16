// Test the real distributable in an isolated consumer, never workspace source.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
const root = resolve(import.meta.dirname, "..");
const dir = mkdtempSync(join(tmpdir(), "mtone-consumer-"));
const npm = (args, cwd = root) =>
  execFileSync("npm", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
try {
  const [pack] = JSON.parse(
    npm(["pack", "-w", "@bixlab/mtone", "--json", "--pack-destination", dir]),
  );
  assert.equal(pack.name, "@bixlab/mtone");
  for (const path of [
    "dist/index.js",
    "dist/index.d.ts",
    "dist/styles.css",
    "README.md",
    "LICENSE",
    "llms.txt",
  ]) {
    assert(
      pack.files.some((f) => f.path === path),
      `Missing ${path}`,
    );
  }
  assert(
    pack.files.every((f) =>
      /^(dist\/|package.json$|README.md$|llms.txt$|LICENSE)/.test(f.path),
    ),
    "Unexpected tarball contents",
  );
  writeFileSync(
    join(dir, "package.json"),
    JSON.stringify({ private: true, type: "module" }),
  );
  npm(
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      join(dir, pack.filename),
      "react@^19.2.0",
      "react-dom@^19.2.0",
      "@types/react@^19.2.0",
      "@types/react-dom@^19.2.0",
    ],
    dir,
  );
  assert.equal(readFileSync(join(dir, "node_modules/@bixlab/mtone/llms.txt"), "utf8"), readFileSync(join(root, "packages/mtone/llms.txt"), "utf8"));
  writeFileSync(
    join(dir, "smoke.mjs"),
    `import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, Layout, Toast, NumberInput, MultiSelect, Spotlight, Form } from '@bixlab/mtone';
import assert from 'node:assert/strict';
assert(renderToStaticMarkup(createElement(Button, null, 'ready')).includes('ready'));
assert(Layout.Sider && Toast && NumberInput && MultiSelect && Spotlight && Form.useForm && Form.Item);
assert(import.meta.resolve('@bixlab/mtone/styles.css').endsWith('/dist/styles.css'));
`,
  );
  execFileSync(process.execPath, ["smoke.mjs"], { cwd: dir, stdio: "inherit" });
  writeFileSync(
    join(dir, "smoke.tsx"),
    `import { Button, Layout, Toast, useToast, Form, Input } from '@bixlab/mtone';
import '@bixlab/mtone/styles.css';
export const demo = <Layout><Layout.Sider version="v1" collapsible /><Layout><Layout.Header /><Layout.Content><Toast><Button variant="blue">OK</Button></Toast></Layout.Content></Layout></Layout>;
export function FormDemo() { const [form] = Form.useForm(); return <Form form={form} onFinish={values => console.log(values)}><Form.Item name='email' label='Email' rules={[{type:'email',required:true}]}><Input /></Form.Item></Form>; }
export const action = () => useToast().success({title:'Saved', body:'Ready', position:'top-right'});
`,
  );
  execFileSync(
    process.execPath,
    [
      join(root, "node_modules/typescript/bin/tsc"),
      "--noEmit",
      "--strict",
      "--skipLibCheck",
      "--jsx",
      "react-jsx",
      "--module",
      "NodeNext",
      "--moduleResolution",
      "NodeNext",
      "--target",
      "ES2022",
      "smoke.tsx",
    ],
    { cwd: dir, stdio: "inherit" },
  );
  assert(
    readFileSync(
      join(dir, "node_modules/@bixlab/mtone/dist/styles.css"),
      "utf8",
    ).includes(".mt-"),
  );
  console.log(
    `Package smoke passed: ${pack.filename} (${pack.files.length} files)`,
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
