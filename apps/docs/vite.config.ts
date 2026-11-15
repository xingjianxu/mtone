import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
export default defineConfig({
  plugins: [{
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
