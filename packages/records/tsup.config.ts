import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  external: [
    "@cubejs-client/core",
    "@cubejs-client/react",
    "react",
    "react-dom",
  ],
  format: ["cjs", "esm"],
  outDir: "dist",
  sourcemap: true,
  splitting: false,
});
