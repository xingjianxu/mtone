import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  external: [
    /^@blocknote\//,
    "@bixlab/mtone",
    "react",
    "react-dom",
    "lucide-react",
  ],
  banner: { js: '"use client";' },
});
