import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { highlightCode } from "../../packages/mtone/src/typography-highlight";
import { source as syntaxExample } from "./typography-code-sample";
const syntaxSamplePath = fileURLToPath(new URL("./typography-code-sample.ts", import.meta.url));

export default defineConfig({
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
      server.middlewares.use("/llms.txt", (_req, res) => {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.end(readFileSync(new URL("../../packages/mtone/llms.txt", import.meta.url)));
      });
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "llms.txt", source: readFileSync(new URL("../../packages/mtone/llms.txt", import.meta.url), "utf8") });
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
