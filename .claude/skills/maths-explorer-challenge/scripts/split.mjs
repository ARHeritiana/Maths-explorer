#!/usr/bin/env node
// Write the source blocks of a standalone challenge page (made by preview.mjs, or edited from assets/standalone/) back
// into the repository: each <script type="text/plain" data-path="js/..."> block is one file under site/.
// Blocks of the challenge's own folder are written (new or changed); blocks of shared files (common/, math.js) are
// only compared and reported, never overwritten, unless --shared is given (then new shared files are created and
// changed ones are written too, to be reviewed in the diff).
// Usage: node .claude/skills/maths-explorer-challenge/scripts/split.mjs <page.html> [--site <site dir>] [--shared] [--dry]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const page = args.find((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1] === "--site"));
if (!page) { console.error("usage: split.mjs <page.html> [--site dir] [--shared] [--dry]"); process.exit(2); }
const site = path.resolve(opt("--site", path.join(here, "../../../../site"))), dry = args.includes("--dry"), shared = args.includes("--shared");
const html = readFileSync(page, "utf8");
const blocks = [...html.matchAll(/<script type="text\/plain" data-path="([^"]+)">\n?([\s\S]*?)<\/script>/g)].map((m) => [m[1], m[2].replace(/<\\\/script/gi, "</script")]);
if (!blocks.length) { console.error("no source blocks found: is this a page made by preview.mjs?"); process.exit(1); }
const own = blocks.map(([p]) => p.match(/^js\/challenges\/([^/]+)\/index\.js$/)?.[1]).filter((x) => x && x !== "common");
const id = own[0];
if (!id) { console.error("no js/challenges/<id>/index.js block"); process.exit(1); }
for (const [rel, src] of blocks) {
  if (rel.includes("..") || !/^js\/[\w./-]+\.js$/.test(rel)) { console.error(`refused path ${rel}`); process.exit(1); }
  const file = path.join(site, rel), mine = rel.startsWith(`js/challenges/${id}/`), before = existsSync(file) ? readFileSync(file, "utf8") : null;
  const state = before === null ? "new" : before === src ? "same" : "changed";
  if (state === "same") continue;
  if (!mine && !shared) { console.log(`${state.padEnd(7)} ${rel}  (shared file: not written; rerun with --shared to write it)`); continue; }
  console.log(`${state.padEnd(7)} ${rel}${dry ? "  (dry run)" : ""}`);
  if (!dry) { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, src); }
}
console.log(`challenge "${id}": next, the registration edits of references/integration.md, then check.mjs ${id}`);
