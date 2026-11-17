// Test the real distributable in an isolated consumer, never workspace source.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
const root = resolve(import.meta.dirname, "..");
// Keep the consumer's type dependency on the repository-verified release.
// A floating @types/react range can resolve a just-published, unavailable tarball.
const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
const csstypeVersion = lock.packages["node_modules/csstype"].version;
assert.match(csstypeVersion, /^\d+\.\d+\.\d+$/);
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
    JSON.stringify({ private: true, type: "module", overrides: { csstype: csstypeVersion } }),
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
  assert.equal(
    JSON.parse(readFileSync(join(dir, "node_modules/csstype/package.json"), "utf8")).version,
    csstypeVersion,
  );
  assert.equal(
    readFileSync(join(dir, "node_modules/@bixlab/mtone/llms.txt"), "utf8"),
    readFileSync(join(root, "packages/mtone/llms.txt"), "utf8"),
  );
  writeFileSync(
    join(dir, "smoke.mjs"),
    `import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Typography, Text, Title, Paragraph, Link, Menu, DropdownMenu, Transfer, Cascader, CascaderPanel, AutoComplete, Divider, Tabs, TableOfContents, Image, ImageGroup, ImagePreview, Tree, DirectoryTree, Affix, Result, Button, Layout, Toast, NumberInput, MultiSelect, Spotlight, Form, Card, Splitter, Table, Calendar, Timeline, Rate, Avatar, AvatarGroup, Popconfirm, Mentions, Mention, getMentions } from '@bixlab/mtone';
import assert from 'node:assert/strict';
assert(renderToStaticMarkup(createElement(Button, null, 'ready')).includes('ready'));
assert(renderToStaticMarkup(createElement(Image, {src:'/image.png',alt:'Image package check',preview:false})).includes('Image package check'));
assert(renderToStaticMarkup(createElement(ImageGroup, {items:[{src:'/group.png',alt:'Group package check'}]})).includes('Group package check'));
assert.equal(typeof ImagePreview, 'function');
assert(renderToStaticMarkup(createElement(Tabs, {items:[{value:'one',label:'Package tab',content:'Panel'}],variant:'card',placement:'start'})).includes('Package tab'));
assert(renderToStaticMarkup(createElement(Divider, {titlePlacement:'start',variant:'dashed'}, 'Section')).includes('Section'));
assert(renderToStaticMarkup(createElement(TableOfContents, {initialItems:[{id:'intro',label:'SSR contents check',level:2}]})).includes('SSR contents check'));
assert.equal(Menu, DropdownMenu);
assert(renderToStaticMarkup(createElement(Menu,{trigger:createElement(Button,null,'Menu trigger'),items:[]})).includes('Menu trigger'));
assert.equal(Mention, Mentions);
assert(renderToStaticMarkup(createElement(Transfer,{items:[{key:'a',label:'Transfer item'}]})).includes('Transfer item'));
assert(renderToStaticMarkup(createElement(Cascader,{options:[{value:'a',label:'Alpha'}],defaultValue:['a']})).includes('Alpha'));
assert(renderToStaticMarkup(createElement(CascaderPanel,{options:[{value:'a',label:'Alpha'}]})).includes('Alpha'));
assert(renderToStaticMarkup(createElement(AutoComplete,{defaultValue:'free',options:[{value:'suggestion'}]})).includes('free'));
assert.equal(Typography.Text, Text);
assert(renderToStaticMarkup(createElement(Title,{level:2},'Title')).includes('<h2'));
assert(renderToStaticMarkup(createElement(Paragraph,{copyable:true},'Copy')).includes('Copy'));
assert(renderToStaticMarkup(createElement(Link,{href:'/docs'},'Docs')).includes('href="/docs"'));
assert.equal(Avatar.Group, AvatarGroup);
assert(renderToStaticMarkup(createElement(Avatar, {name:"Alice",shape:"square"})).includes("AL"));
assert(renderToStaticMarkup(createElement(Popconfirm, {title:"Confirm?",trigger:createElement(Button,null,"Delete")})).includes("Delete"));
assert(renderToStaticMarkup(createElement(Timeline, {items:[{content:'Timeline check'}]})).includes('Timeline check'));
assert(renderToStaticMarkup(createElement(Affix, {}, 'fixed')).includes('fixed'));
assert(renderToStaticMarkup(createElement(Tree, {items:[{id:'root',label:'Tree package check'}]})).includes('Tree package check'));
assert(renderToStaticMarkup(createElement(DirectoryTree, {treeData:[{key:1,title:'Directory package check'}]})).includes('Directory package check'));
assert(renderToStaticMarkup(createElement(Result, {status:"success",title:"Saved"})).includes("Saved"));
assert(renderToStaticMarkup(createElement(Rate, {defaultValue:2.5, allowHalf:true})).includes('aria-valuenow="2.5"'));
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
    `import { Typography, Text, Title, Paragraph, Link, Menu, DropdownMenu, type MenuProps, type DropdownMenuProps, type MenuEntry, Transfer, Cascader, CascaderPanel, type CascaderProps, type CascaderPath, type CascaderOption, AutoComplete, Divider, type DividerProps, Tabs, type TabsProps, type TabItem, TableOfContents, type TableOfContentsProps, type TableOfContentsItem, type TableOfContentsHandle, Image, ImageGroup, ImagePreview, type ImageProps, type ImageItem, Tree, DirectoryTree, type TreeProps, type TreeRef, type TreeKey, Affix, Result, type AffixProps, Button, Layout, Toast, useToast, Form, Input, Card, Splitter, Table, type TableRef, Calendar, type CalendarProps, Timeline, type TimelineProps, Rate, type RateProps, Avatar, AvatarGroup, type AvatarProps, Popconfirm, type PopconfirmProps, Mentions, type MentionsRef } from '@bixlab/mtone';
const menuEntries: MenuEntry[] = [{type:'group',key:'g',label:'Group',children:[{key:'s',label:'Sub',children:[{key:'leaf',label:'Leaf'}]}]},{type:'divider',key:'d'}];
const menuProps: MenuProps = {trigger:<button>Actions</button>,items:menuEntries};
const legacyMenuProps: DropdownMenuProps = menuProps;
const menu = <><Menu {...menuProps}/><DropdownMenu {...legacyMenuProps}/></>;
import '@bixlab/mtone/styles.css';
export const demo = <Layout><Layout.Sider version="v1" collapsible /><Layout><Layout.Header /><Layout.Content><Toast><Button variant="blue">OK</Button></Toast></Layout.Content></Layout></Layout>;
export function FormDemo() { const [form] = Form.useForm(); return <Form form={form} onFinish={values => console.log(values)}><Form.Item name='email' label='Email' rules={[{type:'email',required:true}]}><Input /></Form.Item></Form>; }
export const cardDemo = <Card title="Title" htmlTitle="Tooltip" size="small" variant="outlined" styles={{body:{padding:12}}} classNames={({props})=>({root:props.size==='small'?'compact':''})} tabList={[{key:'one',label:'One'}]}><Card.Meta title="Metadata" description="Details"/><Card.Grid hoverable={false}>Grid</Card.Grid></Card>;
export const splitterDemo = <Splitter orientation="horizontal" sizes={["40%","60%"]} onResize={sizes=>console.log(sizes)} style={{height:240}}><Splitter.Panel id="a" min="20%" collapsible>A</Splitter.Panel><Splitter.Panel id="b">B</Splitter.Panel></Splitter>;
import {createRef} from 'react';
const tabsProps: TabsProps = {items:[{value:'one',label:'One',content:'Panel',icon:'x',forceRender:true}],placement:'end',variant:'editable-card',onEdit:(action,key)=>console.log(action,key),reorderable:true,onOrderChange:keys=>console.log(keys)};
export const tabsDemo = <Tabs {...tabsProps}/>;
const dividerProps: DividerProps = {orientation:"horizontal",variant:"dotted",size:"small",titlePlacement:"end",plain:true};
export const dividerDemo = <Divider {...dividerProps}>Section</Divider>;
const tocRef = createRef<TableOfContentsHandle>();
const tocItems: TableOfContentsItem[] = [{id:'intro',label:'Introduction',level:2}];
const tocProps: TableOfContentsProps = {initialItems:tocItems,root:()=>document.querySelector('article'),scrollContainer:()=>document.querySelector('main'),selector:'h2,h3',offset:48,observe:false,variant:'subtle',onActiveChange:id=>console.log(id),getLabel:node=>node.textContent || '',getLevel:node=>Number(node.tagName.slice(1)),renderLabel:(item,active)=><span data-active={active}>{item.label}</span>};
export const tocDemo = <TableOfContents {...tocProps} ref={tocRef}/>;
tocRef.current?.refresh();
const imageProps: ImageProps = {src:"/image.png",alt:"Image",previewSrc:"/large.png",fit:"contain",fallback:"/fallback.png",onOpenChange:open=>Boolean(open)};
const imageItems: ImageItem[] = [{src:"/image.png",alt:"Gallery image"}];
export const imageDemo = <Image {...imageProps} />;
export const imageGroupDemo = <ImageGroup items={imageItems} current={0} onCurrentChange={index=>index.toFixed()} />;
export const imagePreviewDemo = <ImagePreview items={imageItems} open={false} onOpenChange={open=>Boolean(open)} />;
const treeRef = createRef<TreeRef>();
const treeProps: TreeProps = { treeData:[{key:1,title:"Root",children:[{key:2,title:"Leaf"}]}], checkable:true, defaultExpandedKeys:[1], onCheck:keys=>console.log(keys), onSelect:(keys:TreeKey[])=>console.log(keys), height:150 };
export const treeDemo = <Tree {...treeProps} ref={treeRef}/>;
export const directoryDemo = <DirectoryTree items={[{id:"root",label:"Folder"}]} multiple expandAction="doubleClick"/>;
treeRef.current?.scrollTo({key:2,autoExpand:true,align:"top"});
const affixProps: AffixProps = { offsetTop: 10, target: () => window, onChange: fixed => Boolean(fixed) };
export const affixDemo = <Affix {...affixProps}>Action</Affix>;
const calendarProps: CalendarProps = { value:"2026-11-16", mode:"month", onChange: date => date.toUpperCase(), validRange:["2026-01-01","2026-12-31"] };
export const calendarDemo = <Calendar {...calendarProps} cellRender={(date, info) => info.type === "date" ? date : null} />;
const rateRef = createRef<HTMLSpanElement>();
const avatarProps: AvatarProps = {size:{xs:24,md:40},name:"Alice",gap:4};
export const avatarDemo = <Avatar.Group max={{count:2}}><Avatar {...avatarProps}/></Avatar.Group>;
export const resultDemo = <Result status="404" title="Not found" styles={({props})=>({root:{opacity:props.status === "404" ? 1 : .5}})} />;
const popconfirmProps: PopconfirmProps = {title:"Confirm?",trigger:<Button>Delete</Button>,onConfirm:async()=>true};
export const popconfirmDemo = <Popconfirm {...popconfirmProps}/>;
const timelineProps: TimelineProps = { items:[{title:"Today",content:"Done",placement:"end"}], orientation:"horizontal" };
export const timelineDemo = <Timeline {...timelineProps} />;
const rateProps: RateProps = { value:2.5, allowHalf:true, onChange: value => value.toFixed(1) };
export const rateDemo = <Rate {...rateProps} ref={rateRef} character={({index}) => index + 1} />;
rateRef.current?.focus();
export const transferDemo = <Transfer items={[{key:"a",label:"A"}]} onChange={keys=>keys.join(",")} />;
const cascaderOptions: CascaderOption[] = [{value:"a",label:"Alpha"}];
const cascaderPath: CascaderPath = ["a"];
export const cascaderDemo = <Cascader options={cascaderOptions} value={cascaderPath} onValueChange={path=>path.map(String)} />;
export const cascaderMultiple = <CascaderPanel options={cascaderOptions} multiple value={[cascaderPath]} onValueChange={paths=>paths.map(path=>path.map(String))} />;
export const autoCompleteDemo = <AutoComplete options={[{value:"a"}]} onChange={v=>v.toUpperCase()} />;
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
