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
import { Button, Layout, Toast, NumberInput, MultiSelect, Spotlight, Form, Card, Splitter, Table, Calendar, Mentions, Mention, getMentions } from '@bixlab/mtone';
import assert from 'node:assert/strict';
assert(renderToStaticMarkup(createElement(Button, null, 'ready')).includes('ready'));
assert.equal(Mention, Mentions);
assert(renderToStaticMarkup(createElement(Calendar, {defaultValue:"2026-11-16"})).includes("2026-11-16"));
assert(renderToStaticMarkup(createElement(Mentions, {defaultValue:'Hi @alice', options:[{value:'alice'}]})).includes('Hi @alice'));
assert.deepEqual(getMentions('@alice'), [{prefix:'@',value:'alice'}]);
assert(Card.Meta && Card.Grid && Splitter.Panel && Table.Column && Table.ColumnGroup && Table.Summary);
for (const virtual of [false, true]) {
  const tableHtml = renderToStaticMarkup(createElement(Table, {
    dataSource: [{key:1, name:'release-row'}],
    columns: [{key:'name',dataIndex:'name',title:'Name'}],
    virtual, scroll: {x:500,y:200},
    summary: () => createElement(Table.Summary, {fixed: true}, createElement(Table.Summary.Row, null, createElement(Table.Summary.Cell, {index:0}, 'Summary'))),
  }));
  assert(tableHtml.includes('release-row'));
  assert(tableHtml.includes('Summary'), 'Summary should render for virtual=' + virtual);
}
assert(renderToStaticMarkup(createElement(Card, {title:"Card title",htmlTitle:"Tooltip"}, "Body")).includes("Card title"));
assert(Layout.Sider && Toast && NumberInput && MultiSelect && Spotlight && Form.useForm && Form.Item);
assert(import.meta.resolve('@bixlab/mtone/styles.css').endsWith('/dist/styles.css'));
`,
  );
  execFileSync(process.execPath, ["smoke.mjs"], { cwd: dir, stdio: "inherit" });
  writeFileSync(
    join(dir, "smoke.tsx"),
    `import { Button, Layout, Toast, useToast, Form, Input, Card, Splitter, Table, type TableRef, Calendar, type CalendarProps, Mentions, type MentionsRef } from '@bixlab/mtone';
import '@bixlab/mtone/styles.css';
export const demo = <Layout><Layout.Sider version="v1" collapsible /><Layout><Layout.Header /><Layout.Content><Toast><Button variant="blue">OK</Button></Toast></Layout.Content></Layout></Layout>;
export function FormDemo() { const [form] = Form.useForm(); return <Form form={form} onFinish={values => console.log(values)}><Form.Item name='email' label='Email' rules={[{type:'email',required:true}]}><Input /></Form.Item></Form>; }
export const cardDemo = <Card title="Title" htmlTitle="Tooltip" size="small" variant="outlined" styles={{body:{padding:12}}} classNames={({props})=>({root:props.size==='small'?'compact':''})} tabList={[{key:'one',label:'One'}]}><Card.Meta title="Metadata" description="Details"/><Card.Grid hoverable={false}>Grid</Card.Grid></Card>;
export const splitterDemo = <Splitter orientation="horizontal" sizes={["40%","60%"]} onResize={sizes=>console.log(sizes)} style={{height:240}}><Splitter.Panel id="a" min="20%" collapsible>A</Splitter.Panel><Splitter.Panel id="b">B</Splitter.Panel></Splitter>;
import {createRef} from 'react';
const calendarProps: CalendarProps = { value:"2026-11-16", mode:"month", onChange: date => date.toUpperCase(), validRange:["2026-01-01","2026-12-31"] };
export const calendarDemo = <Calendar {...calendarProps} cellRender={(date, info) => info.type === "date" ? date : null} />;
const mentionsRef = createRef<MentionsRef>();
export const mentionDemo = <Mentions ref={mentionsRef} prefix={["@","#"]} options={[{value:"alice"}]} onChange={value=>value.toUpperCase()} onSelect={(option,prefix)=>console.log(option.value,prefix)} autoSize={{minRows:2,maxRows:5}} />;
mentionsRef.current?.focus();
const tableRef = createRef<TableRef>();
export const tableDemo = <Table<{key:number;name:string}> ref={tableRef} dataSource={[{key:1,name:'Release'}]} columns={[{key:'name',dataIndex:'name',title:'Name',sorter:(a,b)=>a.name.localeCompare(b.name)}]} rowSelection={{onChange:(keys,rows)=>rows.map(row=>row.name)}} pagination={{pageSize:10}} onTableChange={(page,filters,sorter,extra)=>console.log(extra.action)} />;
tableRef.current?.scrollTo({index:0});
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
