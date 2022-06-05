/* eslint-disable no-console */
/* eslint-env node */
import esbuild from "esbuild";
import { htmlPlugin } from "@craftamap/esbuild-plugin-html";
import { copy } from "esbuild-plugin-copy";
import { readFileSync } from "fs";

const isDev = process.env.NODE_ENV === "development";
const isWatch = process.argv.includes("--watch");

await esbuild.build({
  entryPoints: ["src/index.ts"],
  outdir: "dist",
  sourcemap: isDev,
  bundle: true,
  metafile: true,
  plugins: [
    htmlPlugin({
      files: [
        {
          entryPoints: ["src/index.ts"],
          filename: "index.html",
          htmlTemplate: readFileSync("src/index.html", "utf8"),
        },
      ],
    }),
    copy({
      resolveFrom: "cwd",
      assets: {
        from: ["./node_modules/normalize.css/normalize.css"],
        to: ["./dist/normalize.css"],
      },
    }),
  ],
  watch: isWatch && {
    onRebuild(error, result) {
      if (error) console.error("watch build failed:", error);
      else
        console.log(
          "watch build succeeded:\n",
          Object.keys(result.metafile.outputs).join("\n")
        );
    },
  },
});
