// esbuild build script for the client-side TypeScript bundle.
// Bundles src/client/main.ts -> public/js/main.js (ESM, minified in production).
import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");
const isProd = process.env.NODE_ENV === "production" || !watch;

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: ["src/client/main.ts"],
  bundle: true,
  outfile: "public/js/main.js",
  format: "esm",
  target: ["es2020"],
  minify: isProd,
  sourcemap: !isProd,
  logLevel: "info"
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log("esbuild: watching src/client for changes...");
} else {
  await esbuild.build(options);
}
