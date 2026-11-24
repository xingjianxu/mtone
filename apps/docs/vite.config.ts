import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { highlightCode } from "../../packages/mtone/src/typography-highlight";
import { source as syntaxExample } from "./typography-code-sample";
import { componentDocs } from "./catalog";
import { componentDocHref } from "./component-navigation";
import { componentLlmsPath, formatComponentLlms, globalLlmsPath } from "./llms-reference";
import packageInfo from "../../packages/mtone/package.json";
const syntaxSamplePath = fileURLToPath(new URL("./typography-code-sample.ts", import.meta.url));

const docsSite = "https://xingjianxu.github.io/mtone/";
const fullReference = new URL("../../packages/mtone/llms.txt", import.meta.url);
const componentReferences = new Map(componentDocs.map((doc) => [
  componentLlmsPath(doc.name),
  formatComponentLlms(doc, docsSite + componentDocHref(doc.name), packageInfo.version),
]));

export default defineConfig({
  resolve: { alias: [
    { find: /^@bixlab\/mtone$/, replacement: fileURLToPath(new URL("../../packages/mtone/src/index.ts", import.meta.url)) },
    { find: /^mtone-blocknote$/, replacement: fileURLToPath(new URL("../../packages/mtone-blocknote/src/index.ts", import.meta.url)) },
    { find: /^mtone-blocknote\/styles\.css$/, replacement: fileURLToPath(new URL("../../packages/mtone-blocknote/src/styles.css", import.meta.url)) },
  ] },
  plugins: [{
    name: "mtone-typography-syntax-sample",
    async load(id) {
      if (id !== syntaxSamplePath) return;
      const tokens = await highlightCode(syntaxExample, "tsx");
      return `export const source = ${JSON.stringify(syntaxExample)}; export const tokens = ${JSON.stringify(tokens)};`;
    },
  }, {
    name: "mtone-llms",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split("?", 1)[0];
        if (!pathname?.startsWith(server.config.base) || (req.method !== "GET" && req.method !== "HEAD")) return next();
        const filename = pathname.slice(server.config.base.length);
        const reference = filename === globalLlmsPath
          ? readFileSync(fullReference, "utf8")
          : componentReferences.get(filename);
        if (reference === undefined) return next();
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end(req.method === "HEAD" ? undefined : reference);
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: globalLlmsPath, source: readFileSync(fullReference, "utf8") });
      for (const [fileName, source] of componentReferences) {
        this.emitFile({ type: "asset", fileName, source });
      }
    },
  }],
  build: {
    rollupOptions: {
      input: {
        docs: fileURLToPath(new URL("./index.html", import.meta.url)),
        showcase: fileURLToPath(new URL("./showcase.html", import.meta.url)),
      },
    },
  },
});
