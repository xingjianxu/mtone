import { readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";
const root = new URL("../", import.meta.url);
const pkg = JSON.parse(readFileSync(new URL("packages/mtone/package.json", root), "utf8"));
const source = readFileSync(new URL("apps/docs/catalog.ts", root), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { componentDocs } = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
const site = "https://xingjianxu.github.io/mtone/";
const lines = [
"# mtone",
"",
"> Ready-styled React UI library built on Base UI, Tailwind CSS and Lucide icons. Install one package, not individual copied components.",
"",
"This file describes this package checkout, not necessarily the latest published npm release. Package version: " + pkg.version + ". Prefer the llms.txt and dist/index.d.ts bundled with your installed version over the live website, which follows master.",
"",
"## Setup",
"",
"- Package: " + pkg.name + " (ESM; React and ReactDOM " + pkg.peerDependencies.react + ").",
"- Install: npm install @bixlab/mtone",
'- Named imports: import { Button, MtoneProvider } from "@bixlab/mtone";',
'- Import precompiled CSS once: import "@bixlab/mtone/styles.css";',
"- Consumers do not need to install/configure Tailwind or copy component source. Base UI and Lucide are package dependencies.",
'- Optional provider: <MtoneProvider locale="zh"><Button>保存</Button></MtoneProvider>. Locale: zh | en. Default single-line controls use a unified 32px baseline; density is no longer a provider prop. Independent size variants and CSS token customization remain available. Provider tokens are CSS custom properties.',
'- Color theme: <MtoneProvider theme="system">…</MtoneProvider> follows the OS in real time. Use light or dark to override. Without an explicit theme, top-level providers remain light; nested MtoneScope can override and floats inherit their React scope. The library does not store the choice.',
"- Interactive components need a client boundary in React Server Component frameworks.",
"",
"## AI coding guidance",
"",
"- Read the installed dist/index.d.ts for the complete authoritative signatures. This reference lists curated public props, not every inherited HTML/Base UI prop.",
"- Use documented mtone APIs rather than inferring props from other libraries or underlying engines. Do not import private src paths.",
"- Pair controlled values/open state with the documented change callbacks; defaultValue/defaultOpen are for uncontrolled initial state.",
"- Give controls accessible labels and icon-only buttons aria-label. Keep keyboard/focus behavior intact. Focus uses --mt-focus (#93B4DC): existing input borders change color only; other controls use a single 1px inset edge without changing layout. Select/MultiSelect option highlights remain background-only.",
"- Shared theme accents: use --mt-accent-neutral/blue/green/orange/red/purple/teal/coral with CSS var() or override the matching keys via MtoneProvider tokens. Tabs indicatorColor accepts these preset names or a CSS color for the selected line only.",
"- Prefer Dialog. Modal/ModalProps are deprecated aliases. Dialog modal defaults true: outside clicks do not close; false allows outside dismissal. Both retain focus trapping, backdrop and scroll lock. Escape and close button remain available.",
"- Use Badge, not removed Tag. There is no block editor. Upload requires an application service; examples are not backend persistence. DatePicker uses native browser date UI.",
"- Toast notifications need ToastProvider; useToast exposes add, success, error, info, update, promise and close (verify installed declarations before use).",
"- Do not assume the live docs match an older npm package. Type-check generated code and run interaction tests.",
"",
"## Documentation",
"",
"- [Getting started](" + site + "#/start): installation and AI usage",
"- [Theme and styling](" + site + "#/theme): color modes and tokens",
"- [Shared color presets](" + site + "#/theme/color-presets): live palette, CSS reuse, and scoped overrides",
"- [Component gallery](" + site + "#/gallery): independent component examples",
"- [Application showcase](" + site + "showcase.html): interactive in-memory demo, not a backend",
"- [Source repository](https://github.com/xingjianxu/mtone): current code and migration notes",
"",
"## Components",
""
];
for (const doc of componentDocs) {
  lines.push("### " + doc.name, "", "- [" + doc.name + "](" + site + "#/components/" + doc.name + "): " + doc.description,
    "- Import: " + doc.importNames.join(", ") + " from @bixlab/mtone");
  for (const prop of doc.props) lines.push("- " + prop.name + ": " + prop.type + (prop.default === undefined ? "" : " (default: " + prop.default + ")") + ". " + prop.description);
  for (const note of doc.notes) lines.push("- " + note);
  lines.push("", "```tsx", doc.code, "```", "");
}
writeFileSync(new URL("packages/mtone/llms.txt", root), lines.join("\n"));
console.log("Generated llms.txt for " + componentDocs.length + " documented exports");
