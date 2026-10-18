// `npm run check`: syntax-check every script the site serves (dist/js and dist/slides, subfolders included), so a new module is never missed.
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const dirs = ["dist/js", "dist/slides"];
const files = dirs.flatMap((dir) => readdirSync(dir, { recursive: true }).filter((f) => f.endsWith(".js")).sort().map((f) => `${dir}/${f}`));
const failed = files.filter((file) => spawnSync(process.execPath, ["--check", file], { stdio: "inherit" }).status !== 0);
console.log(`check: ${files.length} scripts, ${failed.length} with syntax errors`);
if (failed.length) process.exit(1);
