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
  const installed = join(dir, "node_modules/@bixlab/mtone");
  const declarations = readFileSync(join(installed, "dist/index.d.ts"), "utf8");
  assert.doesNotMatch(declarations, /\bMultiSelect(?:Props)?\b/, "Removed Select aliases must not appear in the public declarations");
  const main = readFileSync(join(installed, "dist/index.js"), "utf8");
  assert(!main.includes("@shikijs/"), "Shiki cannot be in the package's eager entry");
  const lazyChunk = main.match(/import\("\.\/(typography-highlight-[^"]+\.js)"\)/)?.[1];
  assert(lazyChunk, "Expected a relative lazy typography highlighter import");
  assert(pack.files.some((file) => file.path === `dist/${lazyChunk}`), "Lazy highlighter missing from tarball");
  const { highlightCode } = await import((await import("node:url")).pathToFileURL(join(installed, "dist", lazyChunk)).href);
  const examples = {
    js: "const example = 1;",
    ts: "const example: number = 1;",
    jsx: "const example = <b>text</b>;",
    tsx: "const example = <b>text</b>;",
    json: '{"example":true}',
    html: "<b>text</b>",
    css: "b { color: red; }",
    bash: "if true; then echo example; fi",
    py: "def y(): return 1",
    rust: 'fn main() { println!("example"); }',
    yml: "answer: 42",
  };
  for (const [language, source] of Object.entries(examples)) {
    const exactText = `  ${source}\r\n\r\n`;
    const tokens = await highlightCode(exactText, language);
    assert.equal(tokens.map((token) => token.text).join(""), exactText);
    assert(tokens.some(({ light, dark }) => light && dark && light !== dark), `Missing theme colors for ${language}`);
  }
  assert.deepEqual(await highlightCode("unknown\r\n", "not-a-shiki-language"), [{ text: "unknown\r\n" }]);
  writeFileSync(
    join(dir, "smoke.mjs"),
    `import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MtoneProvider, MtoneScope, Input, TreeSelect, TagSelect, List, ListItem, Progress, LoadingOverlay, HoverCard, Menubar, Popover, Typography, Text, Title, Paragraph, Link, Menu, Transfer, Cascader, CascaderPanel, AutoComplete, Divider, Tabs, TableOfContents, Image, ImageGroup, ImagePreview, Tree, Affix, Result, Button, PageLayout, AdminLayout, Dialog, AiTask, ToastProvider, NumberInput, Select, Spotlight, Form, Card, CardGroup, Splitter, Table, Calendar, Timeline, Rate, Avatar, AvatarGroup, Popconfirm, Mentions, getMentions, Questionnaire, NavSubmenu, NavItem } from '@bixlab/mtone';
import assert from 'node:assert/strict';
assert(!Object.hasOwn(await import('@bixlab/mtone'), 'IconButton'));
assert(!Object.hasOwn(await import('@bixlab/mtone'), 'Dropdown'));
for (const name of ['Toast', 'DirectoryTree', 'AiChainOfThought', 'Modal', 'DropdownMenu', 'Mention', 'SearchInput', 'Textarea', 'FormField', 'MultiSelect']) {
  assert(!Object.hasOwn(await import('@bixlab/mtone'), name), 'Removed export: ' + name);
}
assert.match(renderToStaticMarkup(createElement(Select, {mode:'multiple', options:[{value:'one',label:'Package selection'}], defaultValue:['one']})), /Package selection/);
assert(renderToStaticMarkup(createElement(Input.Search, {'aria-label':'Search package'})).includes('Search package'));
assert(renderToStaticMarkup(createElement(Input.TextArea, {'aria-label':'Notes package'})).includes('<textarea'));
assert.match(renderToStaticMarkup(createElement(List.SortHandle, {'aria-label':'Sort'})), /mt-list-sort-handle/);
assert.match(renderToStaticMarkup(createElement(TagSelect, {options:[{value:'one',label:'Release tag'}],defaultValue:['one'],selectAll:true,expandable:false})), /aria-pressed="true"/);
assert.match(renderToStaticMarkup(createElement(TagSelect, {options:[{value:'one',label:'Release tag'}]})), /Release tag/);
assert.match(renderToStaticMarkup(createElement(MtoneProvider, {theme:'system'},
  createElement(MtoneScope, {theme:'dark'}, 'Theme package check'))),
  /data-mt-theme="system".*data-mt-theme="dark"/);
assert(renderToStaticMarkup(createElement(Input.Password, {'aria-label':'Password package'})).includes('type="password"'));
assert(renderToStaticMarkup(createElement(Input.OTP, {length:4})).includes('mt-input-otp'));
assert(renderToStaticMarkup(createElement(Button, null, 'ready')).includes('ready'));
assert(renderToStaticMarkup(createElement(TreeSelect,{items:[{id:'one',label:'Package node'}],defaultValue:'one'})).includes('Package node'));
assert(renderToStaticMarkup(createElement(Image, {src:'/image.png',alt:'Image package check',preview:false})).includes('Image package check'));
assert(renderToStaticMarkup(createElement(ImageGroup, {items:[{src:'/group.png',alt:'Group package check'}]})).includes('Group package check'));
assert.equal(typeof ImagePreview, 'function');
assert(renderToStaticMarkup(createElement(List,{items:['List package item'],renderItem:item=>item})).includes('List package item'));
assert(renderToStaticMarkup(createElement(List,null,createElement(ListItem,null,'Legacy list'))).includes('Legacy list'));
assert(renderToStaticMarkup(createElement(Progress, {value:60,type:'dashboard',showInfo:true,steps:8,color:{from:'#7d9c84',to:'#5378aa'}})).includes('60%'));
assert(renderToStaticMarkup(createElement(Tabs, {items:[{value:'one',label:'Package tab',content:'Panel'}],variant:'card',placement:'start'})).includes('Package tab'));
assert(renderToStaticMarkup(createElement(Divider, {titlePlacement:'start',variant:'dashed'}, 'Section')).includes('Section'));
assert(renderToStaticMarkup(createElement(TableOfContents, {initialItems:[{id:'intro',label:'SSR contents check',level:2}]})).includes('SSR contents check'));
assert(renderToStaticMarkup(createElement(Popover,{trigger:'Popover trigger',content:'Details',width:240,align:'right'})).includes('Popover trigger'));
assert(renderToStaticMarkup(createElement(LoadingOverlay,{visible:true,label:'Package loading'})).includes('Package loading'));
assert.equal(renderToStaticMarkup(createElement(LoadingOverlay,{})), '');
assert(renderToStaticMarkup(createElement(HoverCard,{trigger:createElement(Button,null,'Hover preview'),content:'Preview'})).includes('Hover preview'));
assert(renderToStaticMarkup(createElement(Menubar,{menus:[{key:'file',label:'File',items:[]}]})).includes('menubar'));
assert(renderToStaticMarkup(createElement(Popover.Menu,{trigger:createElement(Button,null,'Menu trigger'),items:[]})).includes('Menu trigger'));
assert.match(renderToStaticMarkup(createElement(Menu,{label:'Inline menu',items:[{key:'open',label:'Inline command'}]})), /role="menu".*Inline command/);
assert(renderToStaticMarkup(createElement(Transfer,{items:[{key:'a',label:'Transfer item'}]})).includes('Transfer item'));
assert(renderToStaticMarkup(createElement(Cascader,{options:[{value:'a',label:'Alpha'}],defaultValue:['a']})).includes('Alpha'));
assert(renderToStaticMarkup(createElement(CascaderPanel,{options:[{value:'a',label:'Alpha'}]})).includes('Alpha'));
assert(renderToStaticMarkup(createElement(Questionnaire,{items:[{id:'notes',type:'text',title:'Package questionnaire'}],onSubmit:()=>{}})).includes('Package questionnaire'));
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
const directoryHtml = renderToStaticMarkup(createElement(Tree, {directory:true,treeData:[{key:1,title:'Directory package check'}]}));
assert.match(directoryHtml, /mt-tree-directory/);
assert(directoryHtml.includes('Directory package check'));
assert(renderToStaticMarkup(createElement(AiTask, {title:'Activity package check'})).includes('Activity package check'));
assert(renderToStaticMarkup(createElement(Result, {status:"success",title:"Saved"})).includes("Saved"));
assert(renderToStaticMarkup(createElement(Rate, {defaultValue:2.5, allowHalf:true})).includes('aria-valuenow="2.5"'));
assert(renderToStaticMarkup(createElement(Calendar, {defaultValue:"2026-11-16"})).includes("2026-11-16"));
assert(renderToStaticMarkup(createElement(Mentions, {defaultValue:'Hi @alice', options:[{value:'alice'}]})).includes('Hi @alice'));
assert.deepEqual(getMentions('@alice'), [{prefix:'@',value:'alice'}]);
assert(CardGroup.Item);
assert.match(renderToStaticMarkup(createElement(CardGroup, {columns:{xs:1,md:3},divided:true},createElement(CardGroup.Item,{span:2},createElement(Card,{collapsible:true,defaultCollapsed:true},"Mounted")))), /aria-expanded="false"/);
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
assert(!Object.hasOwn(await import('@bixlab/mtone'), 'Layout'));
assert(renderToStaticMarkup(createElement(PageLayout, { title: "Project", headingLevel: 2 })).includes('<h2 class="mt-page-layout-title">Project</h2>'));
assert(TagSelect && AdminLayout.Sider && Dialog && ToastProvider && NumberInput && Select && Spotlight && Form.useForm && Form.Item);
const submenuHtml = renderToStaticMarkup(createElement(NavSubmenu, { label: 'Billing', defaultExpanded: true }, createElement(NavItem, { active: true }, 'Usage')));
assert(submenuHtml.includes('aria-expanded="true"') && submenuHtml.includes('aria-current="page"'));
assert(import.meta.resolve('@bixlab/mtone/styles.css').endsWith('/dist/styles.css'));
`,
  );
  execFileSync(process.execPath, ["smoke.mjs"], { cwd: dir, stdio: "inherit" });
  writeFileSync(
    join(dir, "smoke.tsx"),
    `import { MtoneProvider, MtoneScope, type MtoneTheme, type MtoneProviderProps, type MtoneScopeProps, TagSelect, type TagSelectProps, List, ListItem, type ListHandle, type ListProps, type ListSortHandleProps, Progress, type ProgressProps, LoadingOverlay, type LoadingOverlayProps, Menubar, type MenubarProps, Popover, type PopoverProps, type PopoverMenuProps, Typography, Text, Title, Paragraph, Link, Menu, type MenuProps, type MenuEntry, Transfer, Cascader, CascaderPanel, type CascaderProps, type CascaderPath, type CascaderOption, AutoComplete, Divider, type DividerProps, Tabs, type TabsProps, type TabItem, TableOfContents, type TableOfContentsProps, type TableOfContentsItem, type TableOfContentsHandle, Image, ImageGroup, ImagePreview, type ImageProps, type ImageItem, Tree, type TreeProps, type TreeRef, type TreeKey, Affix, Result, type AffixProps, Button, AdminLayout, type AdminLayoutProps, type AdminLayoutSiderProps, type AdminLayoutHeaderProps, type AdminLayoutContentProps, ToastProvider, useToast, Form, Input, Card, CardGroup, type CardGroupProps, type CardGroupItemProps, Splitter, Table, type TableRef, Calendar, type CalendarProps, Timeline, type TimelineProps, Rate, type RateProps, Avatar, AvatarGroup, type AvatarProps, Popconfirm, type PopconfirmProps, Mentions, type MentionsRef, Questionnaire, type QuestionnaireItem, type QuestionnaireAnswers, PageLayout, type PageLayoutProps, NavSubmenu, NavItem, type NavSubmenuProps } from '@bixlab/mtone';
// @ts-expect-error The former component and its props are no longer exported.
import { Layout, type LayoutProps } from '@bixlab/mtone';
// @ts-expect-error There is no old standalone Dropdown alias or type.
import { Dropdown } from '@bixlab/mtone';
// @ts-expect-error DropdownProps was removed.
import { type DropdownProps } from '@bixlab/mtone';
// @ts-expect-error DropdownAlign was removed.
import { type DropdownAlign } from '@bixlab/mtone';
// @ts-expect-error DropdownLayoutProps was removed.
import { type DropdownLayoutProps } from '@bixlab/mtone';
const tagProps: TagSelectProps = {options:[{value:'one',label:'Release tag'}],selectAll:true,value:['one'],onValueChange: value => { const selected: string[] = value; }};
const tags = <TagSelect {...tagProps} />;
const handleProps: ListSortHandleProps = {title:'Sort',onDragStart: event => event.dataTransfer.setData('text/plain','one')};
const handle = <List.SortHandle {...handleProps} />;
const theme: MtoneTheme = 'system';
const localTheme: MtoneScopeProps = {theme: 'dark'};
const provider: MtoneProviderProps = {theme, children: <MtoneScope {...localTheme}>Themed child</MtoneScope>};
const themed = <MtoneProvider {...provider} />;
const adminLayoutProps: AdminLayoutProps = {hasSider: true};
const adminSiderProps: AdminLayoutSiderProps = {collapsible: true};
const adminHeaderProps: AdminLayoutHeaderProps = {extra: 'Actions'};
const adminContentProps: AdminLayoutContentProps = {as: 'section'};
const progressProps: ProgressProps = {value:40,type:'dashboard',showInfo:true,steps:{count:8,gap:3},success:{value:20},gapPosition:'right'};
const progress = <Progress {...progressProps}/>;
const overlayProps: LoadingOverlayProps = {visible:true,label:'Saving',opacity:0.8,blur:2,radius:4,zIndex:20,loader:null};
const overlay = <LoadingOverlay {...overlayProps}/>;
const menubarProps: MenubarProps = {menus:[{key:'file',label:'File',items:[]}],openKey:null};
const menubar = <Menubar {...menubarProps}/>;
const menuEntries: MenuEntry[] = [{type:'group',key:'g',label:'Group',children:[{key:'s',label:'Sub',children:[{key:'leaf',label:'Leaf'}]}]},{type:'divider',key:'d'}];
const popoverAlign: PopoverProps['align'] = 'right';
const popoverProps: PopoverProps = {trigger:'Details',content:<input/>,width:'15rem',align:popoverAlign,label:'Details',unstyled:true};
const popover = <Popover {...popoverProps}/>;
const menuProps: MenuProps = {items:menuEntries,label:'Inline actions'};
const menu = <Menu {...menuProps}/>;
const popupMenuProps: PopoverMenuProps = {trigger:<button>Actions</button>,items:menuEntries,width:240,align:'left'};
const popupMenu = <Popover.Menu {...popupMenuProps}/>;
import '@bixlab/mtone/styles.css';
const pageLayoutProps: PageLayoutProps = { title: 'Project', headingLevel: 3 };
const submenuProps: NavSubmenuProps = { label: 'Billing', expanded: true, children: <NavItem active>Usage</NavItem> };
export const submenu = <NavSubmenu {...submenuProps} />;
export const pageLayoutDemo = <PageLayout {...pageLayoutProps} />;
export const demo = <AdminLayout {...adminLayoutProps}><AdminLayout.Sider version="v1" {...adminSiderProps} /><AdminLayout><AdminLayout.Header {...adminHeaderProps} /><AdminLayout.Content {...adminContentProps}><ToastProvider><Button variant="blue">OK</Button></ToastProvider></AdminLayout.Content></AdminLayout></AdminLayout>;
export const inputFamily = <><Input prefix="@" allowClear showCount controlSize="sm" variant="filled"/><Input.Search searchButton="Find" onSearch={value=>console.log(value)}/><Input.Password visible={false} onVisibleChange={visible=>console.log(visible)}/><Input.TextArea autoSize={{minRows:2,maxRows:5}}/><Input.OTP length={4} onValueChange={value=>console.log(value)}/></>;
export function FormDemo() { const [form] = Form.useForm(); return <Form form={form} onFinish={values => console.log(values)}><Form.Item name='email' label='Email' rules={[{type:'email',required:true}]}><Input /></Form.Item></Form>; }
const cardGroupProps: CardGroupProps = {columns:{xs:1,md:3},gap:12,divided:true};
const cardGroupItemProps: CardGroupItemProps = {span:{xs:1,md:2}};
export const cardGroupDemo = <CardGroup {...cardGroupProps}><CardGroup.Item {...cardGroupItemProps}><Card collapsible defaultCollapsed onCollapsedChange={collapsed=>Boolean(collapsed)}>Preserved</Card></CardGroup.Item></CardGroup>;
export const cardDemo = <Card title="Title" htmlTitle="Tooltip" size="small" variant="outlined" styles={{body:{padding:12}}} classNames={({props})=>({root:props.size==='small'?'compact':''})} tabList={[{key:'one',label:'One'}]}><Card.Meta title="Metadata" description="Details"/><Card.Grid hoverable={false}>Grid</Card.Grid></Card>;
export const splitterDemo = <Splitter orientation="horizontal" sizes={["40%","60%"]} onResize={sizes=>console.log(sizes)} style={{height:240}}><Splitter.Panel id="a" min="20%" collapsible>A</Splitter.Panel><Splitter.Panel id="b">B</Splitter.Panel></Splitter>;
import {createRef} from 'react';
const listRef=createRef<ListHandle>();
const listProps: ListProps<{id:number;title:string}>={items:[{id:1,title:'One'}],getKey:item=>item.id,renderItem:item=>item.title,height:160,virtual:true};
const list=<List {...listProps} ref={listRef}/>;
listRef.current?.scrollTo({key:1,align:'center'});
const legacyList=<List><ListItem description='Description'>Old content</ListItem></List>;
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
export const directoryDemo = <Tree directory items={[{id:"root",label:"Folder"}]} multiple expandAction="doubleClick"/>;
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
const questionnaireItems: QuestionnaireItem[] = [{id:"topic",type:"single",title:"Topic",required:true,choices:[{value:"docs",label:"Docs"}],other:{label:"Other"}}];
export const questionnaireDemo = <Questionnaire items={questionnaireItems} onSubmit={(answers: QuestionnaireAnswers) => { if (answers.topic?.type === "choice") answers.topic.value.toUpperCase(); }} />;
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
  const css = readFileSync(join(dir, "node_modules/@bixlab/mtone/dist/styles.css"), "utf8");
  for (const token of ['data-mt-theme', 'prefers-color-scheme', '.mt-tag-select', '--mt-bg']) assert(css.includes(token), token);
  console.log(
    `Package smoke passed: ${pack.filename} (${pack.files.length} files)`,
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
